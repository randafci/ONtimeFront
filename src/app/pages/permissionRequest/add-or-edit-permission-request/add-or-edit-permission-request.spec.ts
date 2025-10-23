import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrEditPermissionRequest } from './add-or-edit-permission-request';

describe('AddOrEditPermissionRequest', () => {
  let component: AddOrEditPermissionRequest;
  let fixture: ComponentFixture<AddOrEditPermissionRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOrEditPermissionRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOrEditPermissionRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
