import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrEditOverTime } from './add-or-edit-over-time';

describe('AddOrEditOverTime', () => {
  let component: AddOrEditOverTime;
  let fixture: ComponentFixture<AddOrEditOverTime>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOrEditOverTime]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOrEditOverTime);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
