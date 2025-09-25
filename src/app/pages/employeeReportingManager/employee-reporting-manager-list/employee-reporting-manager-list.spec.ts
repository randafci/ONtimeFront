import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeReportingManagerList } from './employee-reporting-manager-list';

describe('EmployeeReportingManagerList', () => {
  let component: EmployeeReportingManagerList;
  let fixture: ComponentFixture<EmployeeReportingManagerList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeReportingManagerList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeReportingManagerList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
