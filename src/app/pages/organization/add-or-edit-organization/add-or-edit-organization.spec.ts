import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrEditOrganization } from './add-or-edit-organization';

describe('AddOrEditOrganization', () => {
  let component: AddOrEditOrganization;
  let fixture: ComponentFixture<AddOrEditOrganization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOrEditOrganization]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOrEditOrganization);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
