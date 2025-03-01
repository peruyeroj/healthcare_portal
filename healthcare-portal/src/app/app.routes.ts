import { Routes } from '@angular/router';
import { BillingComponent } from './billing/billing.component';
import { AppointmentSchedulingComponent } from './appointment-scheduling/appointment-scheduling.component';
import { MessagingComponent } from './messaging/messaging.component';
import { MedicationsComponent } from './medications/medications.component';
import { HomepageComponent } from './homepage/homepage.component';

export const routes: Routes = [
    { path: 'home', component: HomepageComponent },
  { path: 'billing', component: BillingComponent },
  { path: 'appointments', component: AppointmentSchedulingComponent },
  { path: 'messaging', component: MessagingComponent },
  { path: 'medications', component: MedicationsComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
