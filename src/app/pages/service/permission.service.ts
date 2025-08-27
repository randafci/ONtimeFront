
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private getPermissions(): string[] {
    const data = localStorage.getItem('permissions');
    return data ? JSON.parse(data) : [];
  }

  hasPermission(permission: string): boolean {
    return this.getPermissions().includes(permission);
  }
}
