import { Routes } from '@angular/router';
import { BillingComponent } from './billing/billing.component';
import { AppointmentSchedulingComponent } from './appointment-scheduling/appointment-scheduling.component';
import { MessagingComponent } from './messaging/messaging.component';
import { MedicationsComponent } from './medications/medications.component';
import { HomepageComponent } from './homepage/homepage.component';
import { HealthBotComponent } from './health-bot/health-bot.component';

import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { authGuard } from './guards/auth.guard';
import { InsuranceComponent } from './insurance/insurance.component';
import { PersonalInformationComponent } from './personal-information/personal-information.component';

export const routes: Routes = [
  { path: 'home', component: HomepageComponent, canActivate: [authGuard] },
  { path: 'billing', component: BillingComponent, canActivate: [authGuard] },
  { path: 'appointments', component: AppointmentSchedulingComponent, canActivate: [authGuard] },
  { path: 'messaging', component: MessagingComponent, canActivate: [authGuard] },
  { path: 'medications', component: MedicationsComponent, canActivate: [authGuard] },
  { path: 'health-bot', component: HealthBotComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'insurance', component: InsuranceComponent },
  { path: 'personal-information', component: PersonalInformationComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
  { path: '', redirectTo: '/register', pathMatch: 'full' }
];
