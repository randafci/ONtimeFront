import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePassowrd } from './change-passowrd';

describe('ChangePassowrd', () => {
  let component: ChangePassowrd;
  let fixture: ComponentFixture<ChangePassowrd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePassowrd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangePassowrd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
