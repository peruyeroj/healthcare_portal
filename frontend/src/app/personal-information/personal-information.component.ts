import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class PersonalInformationComponent {
  personalInfoForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.personalInfoForm = this.fb.group({
      fullName: ['', Validators.required],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      genderIdentity: [''],
      address: ['', Validators.required],
      primaryPhone: ['', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]],
      alternatePhone: ['', Validators.pattern(/^\+?\d{10,15}$/)],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.personalInfoForm.valid) {
      console.log('Personal Information:', this.personalInfoForm.value);
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
} 