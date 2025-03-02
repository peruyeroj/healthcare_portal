import { Routes } from '@angular/router';
import { BillingComponent } from './billing/billing.component';
import { AppointmentSchedulingComponent } from './appointment-scheduling/appointment-scheduling.component';
import { MessagingComponent } from './messaging/messaging.component';
import { MedicationsComponent } from './medications/medications.component';
import { HomepageComponent } from './homepage/homepage.component';
import { HealthBotComponent } from './health-bot/health-bot.component';
import { InsuranceComponent } from './insurance/insurance.component';
import { PersonalInformationComponent } from './personal-information/personal-information.component';

export const routes: Routes = [
    { path: 'home', component: HomepageComponent },
  { path: 'billing', component: BillingComponent },
  { path: 'appointments', component: AppointmentSchedulingComponent },
  { path: 'messaging', component: MessagingComponent },
  { path: 'medications', component: MedicationsComponent },
  { path: 'health-bot', component: HealthBotComponent },
  { path: 'insurance', component: InsuranceComponent },
  { path: 'personal-information', component: PersonalInformationComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
