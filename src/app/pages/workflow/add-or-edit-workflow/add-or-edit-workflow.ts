import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { Toast, ToastModule } from 'primeng/toast';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { ApiResponse } from '@/core/models/api-response.model';
import { Organization } from '@/interfaces/organization.interface';
import { Company } from '@/interfaces/company.interface';
import { Department } from '@/interfaces/department.interface';
import { WorkflowType, RequesterType, ApproverType } from '@/interfaces/workflow.interface';
import { WorkflowService } from '../workflow.service';
import { CompanyService } from '@/pages/company/CompanyService';
import { DepartmentService } from '@/pages/department/DepartmentService';
import { LookupService } from '@/pages/organization/OrganizationService';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { TableModule } from "primeng/table";

@Component({
  selector: 'app-add-or-edit-workflow',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToggleButtonModule,
    TranslatePipe,
    PasswordModule,
    Toast,
    CheckboxModule,
    SelectButtonModule,
    TableModule
],
  providers: [MessageService],
  templateUrl: './add-or-edit-workflow.html',
  styleUrls: ['./add-or-edit-workflow.scss']
})
export class AddOrEditWorkflowComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;
  isEditMode = false;
  workflowId?: number;

  // Enums
  workflowTypes = Object.entries(WorkflowType)
    .filter(([_, value]) => typeof value === 'number')
    .map(([key, value]) => ({ name: key, value }));

  requesterTypes = Object.entries(RequesterType)
    .filter(([_, value]) => typeof value === 'number')
    .map(([key, value]) => ({ name: key, value }));

  approverTypes = Object.entries(ApproverType)
    .filter(([_, value]) => typeof value === 'number')
    .map(([key, value]) => ({ name: key, value }));

  // Lookups
  organizations: Organization[] = [];
  companies: Company[] = [];
  departments: Department[] = [];

  constructor(
    private fb: FormBuilder,
    private workflowService: WorkflowService,
    private departmentService: DepartmentService,
    private companyService: CompanyService,
    private lookupService: LookupService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadDropdowns();

    // Detect if we are editing an existing workflow
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.workflowId = +id;
        this.loadWorkflow(+id);
      }
    });
  }

  buildForm(): void {
    this.form = this.fb.group({
      id: [0], // ✅ Include workflow id in the form
      workflowName: ['', Validators.required],
      workflowType: [null, Validators.required],
      requesterType: [null, Validators.required],
      organizationId: [null, Validators.required],
      companyId: [null, Validators.required],
      departementId: [null, Validators.required],
      isActive: [true],
      workflowSteps: this.fb.array([])
    });
  }

  get steps(): FormArray {
    return this.form.get('workflowSteps') as FormArray;
  }

  addStep(stepData?: any): void {
    const step = this.fb.group({
      id: [stepData?.id || 0],
      workflowId: [stepData?.workflowId || 0],
      stepOrder: [stepData?.stepOrder || this.steps.length + 1],
      approverType: [stepData?.approverType || 1],
      approverEmployeeId: [stepData?.approverEmployeeId || 0],
      mustApprove: [stepData?.mustApprove ?? true]
    });
    this.steps.push(step);
  }

  removeStep(index: number): void {
    this.steps.removeAt(index);
  }

  loadDropdowns(): void {
    this.lookupService.getAllOrganizations().subscribe({
      next: (res: ApiResponse<Organization[]>) => {
        if (res.succeeded && res.data) this.organizations = res.data;
      },
      error: (err) => console.error('Error loading organizations:', err)
    });

    this.companyService.getAllCompanies().subscribe({
      next: (res: ApiResponse<Company[]>) => {
        if (res.succeeded && res.data) this.companies = res.data;
      },
      error: (err) => console.error('Error loading companies:', err)
    });

    this.departmentService.getAllDepartments().subscribe({
      next: (res: ApiResponse<Department[]>) => {
        if (res.succeeded && res.data) this.departments = res.data;
      },
      error: (err) => console.error('Error loading departments:', err)
    });
  }

  /** ✅ Load workflow by ID for edit mode */
  loadWorkflow(id: number): void {
    this.loading = true;
    this.workflowService.getById(id).subscribe({
      next: (res: ApiResponse<any>) => {
        this.loading = false;
        if (res.succeeded && res.data) {
          const wf = res.data;

          this.form.patchValue({
            id: wf.id, // ✅ include id in form value
            workflowName: wf.workflowName,
            workflowType: wf.workflowType,
            requesterType: wf.requesterType,
            organizationId: wf.organizationId,
            companyId: wf.companyId,
            departementId: wf.departementId,
            isActive: wf.isActive
          });

          this.steps.clear();
          if (wf.workflowSteps?.length) {
            wf.workflowSteps.forEach((step: any) => this.addStep(step));
          }
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading workflow:', err);
      }
    });
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please fill all required fields.'
      });
      return;
    }

    this.loading = true;

    // ✅ Ensure id is set before sending
    if (this.isEditMode && this.workflowId) {
      this.form.patchValue({ id: this.workflowId });
    }

    const request = this.isEditMode
      ? this.workflowService.update(this.workflowId!, this.form.value)
      : this.workflowService.create(this.form.value);

    request.subscribe({
      next: (res) => {
        this.loading = false;
        if (res.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.isEditMode
              ? 'Workflow updated successfully!'
              : 'Workflow created successfully!'
          });
          this.router.navigate(['/workflow/list']);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: res.message || 'Operation failed.'
          });
        }
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to save workflow.'
        });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/workflow/list']);
  }
}
