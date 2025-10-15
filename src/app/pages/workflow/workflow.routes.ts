import { Routes } from '@angular/router';
import { WorkflowList } from './workflow-list/workflow-list';
import { AddOrEditWorkflowComponent } from './add-or-edit-workflow/add-or-edit-workflow';


export const WORKFLOW_ROUTES: Routes = [
    { 
        path: '',
        children: [
              { path: 'list', component: WorkflowList },

              { path: 'add', component: AddOrEditWorkflowComponent },
              { path: 'edit/:id', component: AddOrEditWorkflowComponent },
              { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
