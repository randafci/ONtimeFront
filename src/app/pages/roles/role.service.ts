import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Use the same interface from your list component
export interface IRole {
  id: number;
  name: string;
  isDefaultRole: boolean;
  isHRRole: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  // Move the mock data here to be the single source of truth
  private roles: IRole[] = [
    { id: 1, name: 'Integration', isDefaultRole: true, isHRRole: false },
    { id: 2, name: 'Administrator', isDefaultRole: true, isHRRole: false },
    { id: 3, name: 'Test', isDefaultRole: true, isHRRole: false },
    { id: 4, name: 'Support', isDefaultRole: false, isHRRole: true }
  ];

  constructor() { }

  getRoles(): Observable<IRole[]> {
    // Return a copy to prevent direct mutation
    return of([...this.roles]).pipe(delay(1000));
  }

  /**
   * Simulates adding a new role to the database.
   * @param roleData The data from the form { name: string, isHRRole: boolean }
   */
  addRole(roleData: { name: string, isHRRole: boolean }): Observable<{ success: boolean }> {
    console.log('SERVICE: Adding role...', roleData);

    // Find the highest current ID and add 1
    const newId = Math.max(...this.roles.map(r => r.id)) + 1;

    const newRole: IRole = {
      id: newId,
      name: roleData.name,
      isHRRole: roleData.isHRRole,
      isDefaultRole: false // New roles are not default
    };

    this.roles.push(newRole);

    return of({ success: true }).pipe(delay(1500)); // Simulate network latency
  }
}