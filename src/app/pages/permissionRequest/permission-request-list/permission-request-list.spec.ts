import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionRequestList } from './permission-request-list';

describe('PermissionRequestList', () => {
  let component: PermissionRequestList;
  let fixture: ComponentFixture<PermissionRequestList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionRequestList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionRequestList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
