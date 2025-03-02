import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <a routerLink="/home" class="navbar-logo">Healthcare Portal</a>
      </div>
      <div class="navbar-menu">
        <div class="navbar-end">
          <button *ngIf="isAuthenticated" 
                  class="logout-button" 
                  (click)="logout()">
            Logout
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 1rem;
      background-color: #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .navbar-brand {
      display: flex;
      align-items: center;
    }
    
    .navbar-logo {
      font-size: 1.25rem;
      font-weight: 600;
      color: #4CAF50;
      text-decoration: none;
    }
    
    .navbar-menu {
      display: flex;
      align-items: center;
    }
    
    .navbar-end {
      margin-left: auto;
    }
    
    .logout-button {
      background-color: #e74c3c;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.5rem 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .logout-button:hover {
      background-color: #c0392b;
    }
  `]
})
export class NavBarComponent {
  isAuthenticated = false;
  private isBrowser: boolean;
  
  constructor(
    public authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Only check authentication status in browser environment
    if (this.isBrowser) {
      this.isAuthenticated = this.authService.isAuthenticated();
      
      // Subscribe to auth changes
      this.authService.currentUser$.subscribe(() => {
        this.isAuthenticated = this.authService.isAuthenticated();
      });
    }
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 