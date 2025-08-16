import { Routes } from "@angular/router";
import { AddOrEditOrganization } from "./add-or-edit-organization/add-or-edit-organization";
import { OrganizationList } from "./organization-list/organization-list";

export default [
    { path: 'addeditOrganization',  component: AddOrEditOrganization },
    { path: 'Organizationlits',  component: OrganizationList },

    
    { path: '**', redirectTo: '/notfound' }
] as Routes;
