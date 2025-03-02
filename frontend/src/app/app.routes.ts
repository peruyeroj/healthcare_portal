import { Routes } from '@angular/router';
import { BillingComponent } from './billing/billing.component';
import { AppointmentSchedulingComponent } from './appointment-scheduling/appointment-scheduling.component';
import { MessagingComponent } from './messaging/messaging.component';
import { MedicationsComponent } from './medications/medications.component';
import { HomepageComponent } from './homepage/homepage.component';
import { HealthBotComponent } from './health-bot/health-bot.component';
<<<<<<< HEAD
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'home', component: HomepageComponent, canActivate: [authGuard] },
  { path: 'billing', component: BillingComponent, canActivate: [authGuard] },
  { path: 'appointments', component: AppointmentSchedulingComponent, canActivate: [authGuard] },
  { path: 'messaging', component: MessagingComponent, canActivate: [authGuard] },
  { path: 'medications', component: MedicationsComponent, canActivate: [authGuard] },
  { path: 'health-bot', component: HealthBotComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: '/register', pathMatch: 'full' }
=======
import { InsuranceComponent } from './insurance/insurance.component';

export const routes: Routes = [
    { path: 'home', component: HomepageComponent },
  { path: 'billing', component: BillingComponent },
  { path: 'appointments', component: AppointmentSchedulingComponent },
  { path: 'messaging', component: MessagingComponent },
  { path: 'medications', component: MedicationsComponent },
  { path: 'health-bot', component: HealthBotComponent },
  { path: 'insurance', component: InsuranceComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
>>>>>>> a9e1b45c84191f7a448ea0e0f2edbc122a523166
];
