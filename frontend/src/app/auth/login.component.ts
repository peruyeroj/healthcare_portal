import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Login</h2>
        
        <div class="alert alert-danger" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>
        
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              [(ngModel)]="email" 
              required 
              email
              #emailInput="ngModel"
              class="form-control"
              [class.is-invalid]="emailInput.invalid && emailInput.touched"
            >
            <div class="invalid-feedback" *ngIf="emailInput.invalid && emailInput.touched">
              <span *ngIf="emailInput.errors?.['required']">Email is required</span>
              <span *ngIf="emailInput.errors?.['email']">Please enter a valid email</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              [(ngModel)]="password" 
              required
              #passwordInput="ngModel"
              class="form-control"
              [class.is-invalid]="passwordInput.invalid && passwordInput.touched"
            >
            <div class="invalid-feedback" *ngIf="passwordInput.invalid && passwordInput.touched">
              Password is required
            </div>
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary" 
              [disabled]="loginForm.invalid || isLoading"
            >
              {{ isLoading ? 'Logging in...' : 'Login' }}
            </button>
          </div>
        </form>
        
        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register">Register</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f8fa;
      padding: 20px;
    }
    
    .auth-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 30px;
      width: 100%;
      max-width: 400px;
    }
    
    h2 {
      color: #2c3e50;
      margin-bottom: 24px;
      text-align: center;
    }
    
    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #4a5568;
    }
    
    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      transition: border-color 0.2s;
    }
    
    .form-control:focus {
      border-color: #3498db;
      outline: none;
    }
    
    .form-control.is-invalid {
      border-color: #e74c3c;
    }
    
    .invalid-feedback {
      color: #e74c3c;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .btn {
      display: inline-block;
      font-weight: 500;
      text-align: center;
      padding: 12px 24px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;
      font-size: 16px;
    }
    
    .btn-primary {
      background-color: #4CAF50;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: #4CAF50;
    }
    
    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .form-actions {
      margin-top: 24px;
      text-align: center;
    }
    
    .alert {
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    
    .alert-danger {
      background-color: #fdecea;
      color: #e74c3c;
      border: 1px solid #fadbd8;
    }
    
    .auth-footer {
      margin-top: 24px;
      text-align: center;
      color: #7f8c8d;
    }
    
    .auth-footer a {
      color: #3498db;
      text-decoration: none;
    }
    
    .auth-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        // Navigate to home page after successful login
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password';
        } else {
          this.errorMessage = 'An error occurred during login. Please try again.';
        }
        console.error('Login error:', error);
      }
    });
  }
} 