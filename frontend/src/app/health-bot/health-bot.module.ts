import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthBotComponent } from './health-bot.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [HealthBotComponent],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class HealthBotModule {} 