import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverTimeList } from './over-time-list';

describe('OverTimeList', () => {
  let component: OverTimeList;
  let fixture: ComponentFixture<OverTimeList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverTimeList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverTimeList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
