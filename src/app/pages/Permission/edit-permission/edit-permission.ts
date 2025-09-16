import { EntityBaseInfo, IOption, LeaveTypeDetails, PermissionGroup, PermissionTypeDetails } from '@/interfaces/permition.interface';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Checkbox, CheckboxModule } from "primeng/checkbox";
import { PermissionService } from '../permition.service';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TranslatePipe } from "../../../core/pipes/translate.pipe";
import { TableModule } from "primeng/table";

@Component({
  selector: 'app-edit-permission',
  imports: [Checkbox, CommonModule,
    FormsModule,
    ToggleButtonModule,
    ToggleSwitchModule,
    CheckboxModule,
    ButtonModule, TranslatePipe, TableModule],
  templateUrl: './edit-permission.html',
  styleUrl: './edit-permission.scss'
})
export class EditPermission implements OnInit {
  selectAll: boolean = false;
  roleId!: string;
  roleName: string = 'role';
  permissionGroups: PermissionGroup[] = [];
  crudPermissionGroups: PermissionGroup[] = [];

   // Advanced permission properties from old project
  entityType: number | null = null;
  entitiesList: any[] = [];
  selectedEntities: any[] = [];
  isBasedOnEntityViewVisible: boolean = false;
  
  isExtraEmployeesViewVisible: boolean = false;
  extraEmployeesViewList: IOption[] = [];
  selectedExtraEmployeesView: number[] = [];
  
  isLeaveTypesViewVisible: boolean = false;
  leaveTypesList: LeaveTypeDetails[] = [];
  selectedLeaveTypes: number[] = [];
  
  isPermissionTypesViewVisible: boolean = false;
  permissionTypesList: PermissionTypeDetails[] = [];
  selectedPermissionTypes: number[] = [];
  
  entitiesInfoList: IOption<EntityBaseInfo>[] = [
    { id: EntityBaseInfo.Company, name: 'companies.fields.company' },
    { id: EntityBaseInfo.Department, name: 'departments.fields.department' },
    { id: EntityBaseInfo.Designation, name: 'designations.fields.designation' }
    // Add more entities as needed based on your settings
  ];

  private newEntity: any = { id: 0, name: 'permissions.basedOnEmployee' };
  private newTreeEntity: any = { data: 0, label: 'permissions.basedOnEmployee' };
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id') as string;
    this.loadPermissions();
    this.loadCrudPermissions();
    this.loadRoleName();
    this.loadAdvancedPermissions();
  }

 loadRoleName(): void {
    this.permissionService.getRoleName(this.roleId).subscribe({
      next: (res) => {
        if (res.succeeded) {
          this.roleName = res.data.name;
        }
      },
      error: (err) => {
        console.error('Error loading role name:', err);
      }
    });
  }

  loadPermissions(): void {
    this.permissionService.getPermissionsByRoleId(this.roleId).subscribe({
      next: (res) => {
        if (res.succeeded) {
          this.permissionGroups = res.data;
          this.permissionGroups.forEach(group => {
            group.isSelected = group.permissionsList.every(perm => 
              perm.displayValue ? perm.isSelected : true
            );
          });
          this.updateSelectAllState();
        }
      },
      error: (err) => {
        console.error('Error loading permissions:', err);
      }
    });
  }

  loadCrudPermissions(): void {
    this.permissionService.GetCrudPermissionsForRole(this.roleId).subscribe({
      next: (res) => {
        if (res.succeeded) {
          this.crudPermissionGroups = res.data;
          this.crudPermissionGroups.forEach(group => {
            group.isSelected = group.permissionsList.every(perm => 
              perm.displayValue ? perm.isSelected : true
            );
          });
        }
      },
      error: (err) => {
        console.error('Error loading Crud permissions:', err);
      }
    });
  }

  
  loadAdvancedPermissions(): void {
    // Load extra employees view
    this.permissionService.getExtraEmployeesViewForRole(this.roleId).subscribe({
      next: (res) => {
        if (res.succeeded) {
          this.selectedExtraEmployeesView = res.data;
          this.isExtraEmployeesViewVisible = true;
        }
      },
      error: (err) => {
        console.error('Error loading extra employees view:', err);
      }
    });

    // Load leave types
    this.permissionService.getAllowedLeaveClausesForRole(this.roleId).subscribe({
      next: (res) => {
        if (res.succeeded) {
          this.selectedLeaveTypes = res.data;
          this.isLeaveTypesViewVisible = true;
        }
      },
      error: (err) => {
        console.error('Error loading leave types:', err);
      }
    });

    // Load permission types
    this.permissionService.getAllowedPermissionClausesForRole(this.roleId).subscribe({
      next: (res) => {
        if (res.succeeded) {
          this.selectedPermissionTypes = res.data;
          this.isPermissionTypesViewVisible = true;
        }
      },
      error: (err) => {
        console.error('Error loading permission types:', err);
      }
    });

    // Load entity permissions
    this.permissionService.getEntityPermissionForRole(this.roleId).subscribe({
      next: (res) => {
        if (res.succeeded && res.data) {
          const entityList = res.data.split(',').map((item: string) => parseInt(item, 10));
          this.entityType = entityList[0];
          entityList.splice(0, 1);
          this.initializeDropdownList(null, this.entityType, 0).then(entitiesList => {
            this.entitiesList = entitiesList;
            if (this.entityType === EntityBaseInfo.Department) {
              this.entitiesList.unshift(this.newTreeEntity);
              // You'll need to implement findDeep function from old project
              this.selectedEntities = this.findDeep(entityList, this.entitiesList);
            } else {
              this.entitiesList.unshift(this.newEntity);
              this.selectedEntities = entityList;
            }
            this.isBasedOnEntityViewVisible = true;
          });
        }
      },
      error: (err) => {
        console.error('Error loading entity permissions:', err);
      }
    });
  }
   async onEntityTypeValueChange(event: any) {
    this.entitiesList = [];
    this.selectedEntities = [];
    this.entitiesList = await this.initializeDropdownList(null, event.value, 1);
    if (this.entityType === EntityBaseInfo.Department) {
      this.entitiesList.unshift(this.newTreeEntity);
    } else {
      this.entitiesList.unshift(this.newEntity);
    }
  }
   onFilterEmployees(filterText: string) {
    // Implement employee filtering logic
  }

  onChangeEmployees() {
    // Implement employee change logic
  }
    private async initializeDropdownList(filterText: string | null, selectedEntityType: number | null, pageNumber: number): Promise<any[]> {
    // Implement based on your old project's initializeDropdownList method
    // This will depend on your API clients
    return [];
  }

  private findDeep(ids: number[], list: any[]): any[] {
    // Implement the findDeep function from your old project
    return [];
  }

  onGroupToggle(group: PermissionGroup): void {
    group.permissionsList.forEach(perm => {
      if (perm.displayValue) {
        perm.isSelected = group.isSelected;
      }
    });
    this.updateSelectAllState();
  }

  onPermissionChange(group: PermissionGroup): void {
    group.isSelected = group.permissionsList.every(perm => 
      perm.displayValue ? perm.isSelected : true
    );
    this.updateSelectAllState();
  }

  onCrudGroupToggle(group: PermissionGroup): void {
    group.permissionsList.forEach(perm => {
      if (perm.displayValue) {
        perm.isSelected = group.isSelected;
      }
    });
  }

  onCrudPermissionChange(group: PermissionGroup, index: number): void {
    // Handle CRUD permission changes
    group.isSelected = group.permissionsList.every(perm => 
      perm.displayValue ? perm.isSelected : true
    );
    
    // Special handling for CRUD operations
    if (index === 0 && !group.permissionsList[0].isSelected) {
      // If Page is unchecked, uncheck all other operations
      for (let i = 1; i < group.permissionsList.length; i++) {
        if (group.permissionsList[i].displayValue) {
          group.permissionsList[i].isSelected = false;
        }
      }
    } else if (index > 0 && group.permissionsList[index].isSelected) {
      // If any CRUD operation is checked, ensure Page is checked
      if (group.permissionsList[0].displayValue) {
        group.permissionsList[0].isSelected = true;
      }
    }
  }

  updateSelectAllState(): void {
    this.selectAll = this.permissionGroups.every(group => 
      group.permissionsList.every(perm => 
        perm.displayValue ? perm.isSelected : true
      )
    );
  }

  toggleAllPermissions(): void {
    this.permissionGroups.forEach(group => {
      group.isSelected = this.selectAll;
      group.permissionsList.forEach(perm => {
        if (perm.displayValue) {
          perm.isSelected = this.selectAll;
        }
      });
    });
    
    this.crudPermissionGroups.forEach(group => {
      group.isSelected = this.selectAll;
      group.permissionsList.forEach(perm => {
        if (perm.displayValue) {
          perm.isSelected = this.selectAll;
        }
      });
    });
  }

  formatDisplayName(displayValue: string): string {
    if (!displayValue) return '';
    
    // Extract the last part after the last dot for permissions
    if (displayValue.includes('.')) {
      const parts = displayValue.split('.');
      return parts[parts.length - 1];
    }
    
    // Convert camelCase to readable text for entity names
    return displayValue
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

 savePermissions(): void {
    // Prepare permissions list similar to the old onSubmit method
    let permissionsList: string[] = [];
    let selectedEntities = [...this.selectedEntities];
    
    // Collect permissions from both plain and CRUD permission groups
    permissionsList = permissionsList.concat(
        ...this.permissionGroups.map(group =>
            group.permissionsList
                .filter(perm => perm.isSelected && perm.displayValue)
                .map(perm => perm.displayValue)
        ),
        ...this.crudPermissionGroups.map(group =>
            group.permissionsList
                .filter(perm => perm.isSelected && perm.displayValue)
                .map(perm => perm.displayValue)
        )
    );

    // Handle department entities (flatten tree structure)
    if (this.entityType === EntityBaseInfo.Department) {
        selectedEntities = this.flattenEntitiesTree(selectedEntities);
    }

    // Filter out entity IDs from permissions list
    let permissionsListWithEntity = permissionsList.filter(
        (el) => !selectedEntities.includes(parseInt(el, 10))
    );

    // Add extra employees view if any
    if ((this.selectedExtraEmployeesView?.length ?? 0) > 0) {
        permissionsListWithEntity.push(
            "ExtraEmployeesViewList-" + this.selectedExtraEmployeesView.join(",")
        );
    }

    // Add leave types if any
    if ((this.selectedLeaveTypes?.length ?? 0) > 0) {
        permissionsListWithEntity.push(
            "AllowedLeaveClauseList-" + this.selectedLeaveTypes.join(",")
        );
    }

    // Add permission types if any
    if ((this.selectedPermissionTypes?.length ?? 0) > 0) {
        permissionsListWithEntity.push(
            "AllowedPermissionClauseList-" + this.selectedPermissionTypes.join(",")
        );
    }

    // Add entity-based permissions if any
    if (selectedEntities.length !== 0 && this.entityType !== null) {
        permissionsListWithEntity.push(
            "BasedOnEntityList-" + this.entityType + "," + selectedEntities.join(",")
        );
    } else {
        permissionsListWithEntity = permissionsListWithEntity.filter(
            (item) => item !== "BasedOnEntity"
        );
    }

    // Filter out any unwanted items
    permissionsListWithEntity = permissionsListWithEntity.filter(
        (item) => item !== "entity" && item !== "employeeOrEntityId"
    );

    // Call the service to assign permissions
    this.permissionService.assignPermissionsToRole({
        entityId: this.roleId,
        permissionsList: permissionsListWithEntity
    }).subscribe({
        next: (res) => {
            if (res.succeeded) {
                // Show success message and navigate back
                this.navigateToRoleList();
            } else {
                console.error('Failed to assign permissions:', res.message);
            }
        },
        error: (err) => {
            console.error('Error assigning permissions:', err);
        }
    });
}

private flattenEntitiesTree(entities: any[]): any[] {
    const flattened: any[] = [];
    
    const flatten = (items: any[]) => {
        items.forEach(item => {
            if (item.data !== undefined) {
                flattened.push(item.data);
            } else if (item.id !== undefined) {
                flattened.push(item.id);
            }
            
            if (item.children && item.children.length > 0) {
                flatten(item.children);
            }
        });
    };
    
    flatten(entities);
    return flattened;
}

  private preparePermissionsForSave(): string[] {
    let permissionsList: string[] = [];

    // Add plain permissions
    permissionsList = permissionsList.concat(
      ...this.permissionGroups.map(group =>
        group.permissionsList
          .filter(perm => perm.isSelected && perm.displayValue)
          .map(perm => perm.displayValue)
      )
    );

    // Add CRUD permissions
    permissionsList = permissionsList.concat(
      ...this.crudPermissionGroups.map(group =>
        group.permissionsList
          .filter(perm => perm.isSelected && perm.displayValue)
          .map(perm => perm.displayValue)
      )
    );

    // Add advanced permissions
    if (this.selectedExtraEmployeesView.length > 0) {
      permissionsList.push(`ExtraEmployeesViewList-${this.selectedExtraEmployeesView.join(',')}`);
    }

    if (this.selectedLeaveTypes.length > 0) {
      permissionsList.push(`AllowedLeaveClauseList-${this.selectedLeaveTypes.join(',')}`);
    }

    if (this.selectedPermissionTypes.length > 0) {
      permissionsList.push(`AllowedPermissionClauseList-${this.selectedPermissionTypes.join(',')}`);
    }

    if (this.selectedEntities.length > 0 && this.entityType !== null) {
      let entityIds = this.selectedEntities;
      if (this.entityType === EntityBaseInfo.Department) {
        // Flatten tree structure if needed
        entityIds = this.flattenEntities(this.selectedEntities);
      }
      permissionsList.push(`BasedOnEntityList-${this.entityType},${entityIds.join(',')}`);
    }

    return permissionsList;
  }
   private flattenEntities(entities: any[]): number[] {
    // Implement entity flattening logic for tree structures
    return entities.map(e => e.data || e.id);
  }

  navigateToRoleList(): void {
    this.router.navigate(['/roles']);
  }
}