import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { EmployeePolicyService } from '../EmployeePolicyService';
import { EmployeeEmploymentService } from '../EmployeeEmploymentService';
import { 
    EmployeePolicy, 
    CreateEmployeePolicy, 
    EditEmployeePolicy,
    PolicyType,
    GeneralPolicy
    // PermissionPolicy  // Not implemented in backend
} from '../../../interfaces/employee-policy.interface';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';

@Component({
    selector: 'app-add-or-edit-employee-policy',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        DatePickerModule,
        ToastModule,
        CardModule,
        FileUploadModule,
        TranslatePipe
    ],
    providers: [MessageService],
    templateUrl: './add-or-edit-employee-policy.html',
    styleUrl: './add-or-edit-employee-policy.scss'
})
export class AddOrEditEmployeePolicyComponent implements OnInit {
    policyForm: FormGroup;
    isEditMode: boolean = false;
    loading: boolean = false;
    policyId?: number;
    private translations: any = {};

    // Dropdown options
    employeeEmployments: any[] = [];
    policyTypes: any[] = [];
    generalPolicies: GeneralPolicy[] = [];
    filteredPolicies: any[] = [];
    selectedEmploymentId: number | null = null;

    constructor(
        private fb: FormBuilder,
        private employeePolicyService: EmployeePolicyService,
        private employeeEmploymentService: EmployeeEmploymentService,
        private route: ActivatedRoute,
        private router: Router,
        private messageService: MessageService,
        private translationService: TranslationService
    ) {
        this.policyForm = this.createForm();
    }

    ngOnInit() {
        this.translationService.translations$.subscribe(trans => {
            this.translations = trans;
            this.initializePolicyTypes();
        });

        // Check if we're in edit mode
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.policyId = +params['id'];
                this.loadPolicyData(this.policyId);
            }
        });

        // Check for query parameters (employeeId or employmentId)
        this.route.queryParams.subscribe(params => {
            if (params['employmentId']) {
                this.selectedEmploymentId = +params['employmentId'];
                this.policyForm.patchValue({ employeeEmploymentId: +params['employmentId'] });
            } else if (params['employeeId']) {
                // Load employments for the employee and auto-select current
                this.loadEmployeeEmployments(+params['employeeId']);
            }
        });

        this.loadDropdownData();
    }

    createForm(): FormGroup {
        return this.fb.group({
            employeeEmploymentId: [null, Validators.required],
            policyType: [PolicyType.General, Validators.required],
            policyId: [null, Validators.required],
            startDateTime: [new Date(), Validators.required],
            endDateTime: [null, Validators.required],
            attachmentURL: [null]
        });
    }

    initializePolicyTypes() {
        const trans = this.translations.employeePolicies?.formPage?.policyTypes || {};
        this.policyTypes = [
            { label: trans.general || 'General Policy', value: PolicyType.General }
        ];
    }

    loadDropdownData() {
        this.loading = true;

        // Only load general policies if no specific employee/employment context
        if (!this.selectedEmploymentId) {
            this.loadGeneralPolicies();
        }
    }

    loadEmployeeEmployments(employeeId: number) {
        this.employeeEmploymentService.getEmployeeEmploymentsByEmployeeId(employeeId).subscribe({
            next: (response: ApiResponse<any[]>) => {
                if (response.succeeded) {
                    const employments = response.data || [];
                    this.employeeEmployments = employments.map((e: any) => ({
                        label: `${e.employeeName || 'Employee'} - ${e.companyName || 'Company'}`,
                        value: e.id,
                        isCurrent: e.isCurrent === 1 || e.isCurrent === true
                    }));

                    const current = this.employeeEmployments.find((x: any) => x.isCurrent) || this.employeeEmployments[0];
                    if (current) {
                        this.selectedEmploymentId = current.value;
                        this.policyForm.patchValue({ employeeEmploymentId: current.value });
                    }
                }
            },
            error: (error: unknown) => {
                console.error('Error loading employee employments:', error);
            }
        });
    }

    loadGeneralPolicies() {

        // Load general policies
        this.employeePolicyService.getActiveGeneralPolicies().subscribe({
            next: (response: ApiResponse<GeneralPolicy[]>) => {
                if (response.succeeded) {
                    this.generalPolicies = response.data;
                    this.updateFilteredPolicies();
                }
                this.loading = false;
            },
            error: (error: unknown) => {
                console.error('Error loading general policies:', error);
                this.loading = false;
            }
        });

        // Permission policies not implemented in backend yet
        /*
        this.employeePolicyService.getActivePermissionPolicies().subscribe({
            next: (response: ApiResponse<PermissionPolicy[]>) => {
                if (response.succeeded) {
                    this.permissionPolicies = response.data;
                    this.updateFilteredPolicies();
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading permission policies:', error);
                this.loading = false;
            }
        });
        */
    }

    onPolicyTypeChange() {
        this.policyForm.patchValue({ policyId: null });
        this.updateFilteredPolicies();
    }

    updateFilteredPolicies() {
        const policyType = this.policyForm.get('policyType')?.value;
        
        if (policyType === PolicyType.General) {
            this.filteredPolicies = this.generalPolicies.map(policy => ({
                label: policy.nameEn || policy.nameAr || 'N/A',
                value: policy.id
            }));
        }
    }

    loadPolicyData(id: number) {
        this.loading = true;
        this.employeePolicyService.getEmployeePolicyById(id).subscribe({
            next: (response: ApiResponse<EmployeePolicy>) => {
                if (response.succeeded) {
                    const policy = response.data;
                    this.policyForm.patchValue({
                        employeeEmploymentId: policy.employeeEmploymentId,
                        policyType: policy.policyType,
                        policyId: policy.policyId,
                        startDateTime: new Date(policy.startDateTime),
                        endDateTime: new Date(policy.endDateTime),
                        attachmentURL: policy.attachmentURL
                    });
                    this.updateFilteredPolicies();
                }
                this.loading = false;
            },
            error: (error) => {
                this.showToast('error', 'Error', 'Failed to load policy data');
                this.loading = false;
            }
        });
    }

    onSubmit() {
        if (this.policyForm.invalid) {
            this.markFormGroupTouched(this.policyForm);
            this.showToast('warn', 'Warning', 'Please fill all required fields');
            return;
        }

        this.loading = true;
        const formData = this.policyForm.value;

        if (this.isEditMode && this.policyId) {
            const editData: EditEmployeePolicy = {
                id: this.policyId,
                ...formData
            };
            this.updatePolicy(editData);
        } else {
            const createData: CreateEmployeePolicy = formData;
            this.createPolicy(createData);
        }
    }

    createPolicy(data: CreateEmployeePolicy) {
        this.employeePolicyService.createEmployeePolicy(data).subscribe({
            next: (response: ApiResponse<EmployeePolicy>) => {
                if (response.succeeded) {
                    this.showToast('success', 'Success', 'Employee policy created successfully');
                    this.navigateBack();
                } else {
                    this.showToast('error', 'Error', response.message || 'Failed to create policy');
                }
                this.loading = false;
            },
            error: (error) => {
                this.showToast('error', 'Error', 'Failed to create policy');
                this.loading = false;
            }
        });
    }

    updatePolicy(data: EditEmployeePolicy) {
        this.employeePolicyService.updateEmployeePolicy(data.id, data).subscribe({
            next: (response: ApiResponse<EmployeePolicy>) => {
                if (response.succeeded) {
                    this.showToast('success', 'Success', 'Employee policy updated successfully');
                    this.navigateBack();
                } else {
                    this.showToast('error', 'Error', response.message || 'Failed to update policy');
                }
                this.loading = false;
            },
            error: (error) => {
                this.showToast('error', 'Error', 'Failed to update policy');
                this.loading = false;
            }
        });
    }

    onCancel() {
        this.navigateBack();
    }

    navigateBack() {
        this.router.navigate(['/employees']);
    }

    private markFormGroupTouched(formGroup: FormGroup) {
        Object.values(formGroup.controls).forEach(control => {
            control.markAsTouched();
            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }

    private showToast(severity: string, summary: string, detail: string): void {
        this.messageService.add({ severity, summary, detail });
    }

    getSelectedEmploymentLabel(): string {
        if (!this.selectedEmploymentId || !this.employeeEmployments.length) {
            return 'Loading employment...';
        }
        
        const selected = this.employeeEmployments.find(emp => emp.value === this.selectedEmploymentId);
        return selected ? selected.label : 'Current Employment';
    }
}

