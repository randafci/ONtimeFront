import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPermission } from './edit-permission';

describe('EditPermission', () => {
  let component: EditPermission;
  let fixture: ComponentFixture<EditPermission>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPermission]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPermission);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
