import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrEditWorkflow } from './add-or-edit-workflow';

describe('AddOrEditWorkflow', () => {
  let component: AddOrEditWorkflow;
  let fixture: ComponentFixture<AddOrEditWorkflow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOrEditWorkflow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOrEditWorkflow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
