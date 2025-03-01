import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentSchedulingComponent } from './appointment-scheduling.component';

describe('AppointmentSchedulingComponent', () => {
  let component: AppointmentSchedulingComponent;
  let fixture: ComponentFixture<AppointmentSchedulingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentSchedulingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentSchedulingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
