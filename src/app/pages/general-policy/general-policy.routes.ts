import { Route } from '@angular/router';
import { GeneralPolicyListComponent } from './general-policy-list/general-policy-list.component';
import { AddEditGeneralPolicyComponent } from './add-edit-general-policy/add-edit-general-policy.component';
// TODO: Create or import the AddEditGeneralPolicyComponent
// import { AddEditGeneralPolicyComponent } from './add-edit-general-policy/add-edit-general-policy.component';

export const GENERAL_POLICY_ROUTES: Route[] = [
  { 
    path: 'list', 
    component: GeneralPolicyListComponent,
    title: 'policies.listPage.title' // Optional: for browser tab title
  },
  {
    path: 'add',
    component: AddEditGeneralPolicyComponent, // Uncomment when ready
    // redirectTo: 'list' // Placeholder until the 'add' component is created
  },
  {
    path: 'edit/:id',
    component: AddEditGeneralPolicyComponent, // Uncomment when ready
  },
  { 
    path: '', 
    redirectTo: 'list', 
    pathMatch: 'full' 
  }
];