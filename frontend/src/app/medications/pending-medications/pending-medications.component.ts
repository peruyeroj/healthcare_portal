import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MedicationService, Medication } from '../../services/medication.service';
import { Subscription, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-pending-medications',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, SafeUrlPipe],
  template: `
    <div class="container">
      <h1>Pending Medication Approvals</h1>
      
      <div class="content">
        <div *ngIf="pendingMedications.length === 0" class="no-medications">
          <p>There are no medications pending approval.</p>
        </div>
        
        <div *ngIf="pendingMedications.length > 0">
          <div class="medication-list">
            <div *ngFor="let medication of pendingMedications" class="medication-item" [ngClass]="{'approved': medication.status === 'approved', 'selected': selectedMedicationId === medication.id}">
              <div class="medication-header">
                <h2>{{ medication.name }}</h2>
                <span class="status-badge" [ngClass]="medication.status">{{ medication.status | titlecase }}</span>
              </div>
              
              <div class="medication-details">
                <div class="detail-row">
                  <span class="detail-label">Requested By:</span>
                  <span class="detail-value">{{ medication.requestedBy }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date Requested:</span>
                  <span class="detail-value">{{ medication.dateRequested | date:'mediumDate' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Dose:</span>
                  <span class="detail-value">{{ medication.dose }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Frequency:</span>
                  <span class="detail-value">{{ medication.frequency }}</span>
                </div>
                <div *ngIf="medication.status === 'approved'" class="detail-row approval-date">
                  <span class="detail-label">Approved On:</span>
                  <span class="detail-value">{{ medication.approvalDate | date:'medium' }}</span>
                </div>
                
                <div *ngIf="medication.status === 'pending' && selectedMedicationId === medication.id" class="approval-timer">
                  <div class="timer-bar" [style.width.%]="getTimerPercentage(medication.id)"></div>
                  <span class="timer-text">Auto-approving in {{ getRemainingTime(medication.id) }} seconds</span>
                </div>
              </div>
              
              <div class="action-buttons" *ngIf="medication.status === 'pending'">
                <button class="select-btn" (click)="selectMedication(medication.id)" *ngIf="selectedMedicationId !== medication.id">Select for Approval</button>
                <button class="approve-btn" (click)="approveMedication(medication.id)" *ngIf="selectedMedicationId === medication.id">Approve Now</button>
                <button class="reject-btn" (click)="rejectMedication(medication.id)" *ngIf="selectedMedicationId === medication.id">Reject</button>
                <button class="cancel-btn" (click)="cancelSelection()" *ngIf="selectedMedicationId === medication.id">Cancel</button>
              </div>
              
              <div *ngIf="medication.status === 'approved'" class="delivery-section">
                <button class="delivery-btn" (click)="showDeliveryMap(medication)">Track Delivery</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Delivery Map Modal -->
        <div class="modal-overlay" *ngIf="showDeliveryModal">
          <div class="modal-container delivery-modal">
            <div class="modal-header">
              <h3>Medication out for Delivery</h3>
              <button class="close-btn" (click)="closeDeliveryModal()">×</button>
            </div>
            <div class="modal-body">
              <div class="delivery-status">
                <div class="status-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div class="status-text">
                  <h4>Delivery in Progress</h4>
                  <p>Your medication is on its way to you!</p>
                </div>
              </div>
              
              <div class="delivery-info">
                <div class="info-row">
                  <span class="info-label">Medication:</span>
                  <span class="info-value">{{ selectedMedication?.name }} ({{ selectedMedication?.dose }})</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Delivery Address:</span>
                  <span class="info-value">{{ patientAddress }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Estimated Arrival:</span>
                  <span class="info-value">Today by 5:00 PM</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Tracking Number:</span>
                  <span class="info-value">MED-{{ selectedMedication?.id }}-{{ today | date:'yyyyMMdd' }}</span>
                </div>
              </div>
              
              <div class="map-container">
                <h4>Delivery Location</h4>
                <div class="map-wrapper">
                  <iframe
                    width="100%"
                    height="300"
                    frameborder="0"
                    style="border:0"
                    [src]="mapUrl | safeUrl"
                    allowfullscreen>
                  </iframe>
                </div>
              </div>
              
              <div class="delivery-instructions">
                <h4>Delivery Instructions</h4>
                <p>Please have your ID ready for verification. The delivery person will call you when they arrive.</p>
              </div>
            </div>
            <div class="modal-footer">
              <button class="modal-button" (click)="closeDeliveryModal()">Close</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bottom-actions">
        <button class="back-button" routerLink="/medications">Back to Medications</button>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    
    h1 {
      color: #2c3e50;
      margin-bottom: 30px;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }
    
    .no-medications {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 5px;
      text-align: center;
      color: #6c757d;
    }
    
    .medication-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .medication-item {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 20px;
      transition: all 0.3s ease;
    }
    
    .medication-item.approved {
      background-color: #e6f7e6;
      border-left: 5px solid #28a745;
    }
    
    .medication-item.selected {
      border-left: 5px solid #3498db;
      background-color: #f0f7fd;
    }
    
    .medication-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    
    .medication-header h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
    }
    
    .status-badge {
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .status-badge.pending {
      background-color: #ffeeba;
      color: #856404;
    }
    
    .status-badge.approved {
      background-color: #d4edda;
      color: #155724;
    }
    
    .status-badge.rejected {
      background-color: #f8d7da;
      color: #721c24;
    }
    
    .medication-details {
      margin-bottom: 20px;
    }
    
    .detail-row {
      display: flex;
      margin-bottom: 8px;
    }
    
    .detail-label {
      width: 150px;
      font-weight: bold;
      color: #6c757d;
    }
    
    .detail-value {
      flex: 1;
      color: #2c3e50;
    }
    
    .approval-date {
      margin-top: 10px;
      font-weight: bold;
    }
    
    .approval-timer {
      margin-top: 15px;
      background-color: #f8f9fa;
      border-radius: 5px;
      height: 30px;
      position: relative;
      overflow: hidden;
    }
    
    .timer-bar {
      height: 100%;
      background-color: #3498db;
      transition: width 1s linear;
    }
    
    .timer-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #2c3e50;
      font-weight: bold;
      text-shadow: 0 0 2px #fff;
    }
    
    .action-buttons {
      display: flex;
      gap: 10px;
    }
    
    button {
      padding: 10px 15px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s ease;
    }
    
    .select-btn {
      background-color: #3498db;
      color: white;
    }
    
    .select-btn:hover {
      background-color: #2980b9;
    }
    
    .approve-btn {
      background-color: #28a745;
      color: white;
    }
    
    .approve-btn:hover {
      background-color: #218838;
    }
    
    .reject-btn {
      background-color: #dc3545;
      color: white;
    }
    
    .reject-btn:hover {
      background-color: #c82333;
    }
    
    .cancel-btn {
      background-color: #6c757d;
      color: white;
    }
    
    .cancel-btn:hover {
      background-color: #5a6268;
    }
    
    .delivery-section {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px dashed #ccc;
    }
    
    .delivery-btn {
      background-color: #17a2b8;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .delivery-btn:hover {
      background-color: #138496;
    }
    
    .delivery-btn::before {
      content: "📍";
    }
    
    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-container {
      background-color: white;
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }
    
    .delivery-modal {
      border-top: 5px solid #17a2b8;
    }
    
    .modal-header {
      padding: 15px 20px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .modal-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 20px;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      color: #6c757d;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }
    
    .modal-body {
      padding: 20px;
    }
    
    .delivery-status {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background-color: #e3f2fd;
      border-radius: 8px;
    }
    
    .status-icon {
      margin-right: 15px;
      color: #17a2b8;
    }
    
    .status-text h4 {
      margin: 0 0 5px 0;
      color: #17a2b8;
      font-size: 18px;
    }
    
    .status-text p {
      margin: 0;
      color: #6c757d;
    }
    
    .delivery-info {
      margin-bottom: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
    }
    
    .info-row {
      display: flex;
      margin-bottom: 10px;
    }
    
    .info-row:last-child {
      margin-bottom: 0;
    }
    
    .info-label {
      width: 150px;
      font-weight: bold;
      color: #6c757d;
    }
    
    .info-value {
      flex: 1;
      color: #2c3e50;
    }
    
    .map-container {
      margin-bottom: 20px;
    }
    
    .map-container h4 {
      margin-top: 0;
      margin-bottom: 10px;
      color: #2c3e50;
    }
    
    .map-wrapper {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    .delivery-instructions {
      background-color: #fff3cd;
      border-radius: 8px;
      padding: 15px;
    }
    
    .delivery-instructions h4 {
      margin-top: 0;
      margin-bottom: 10px;
      color: #856404;
    }
    
    .delivery-instructions p {
      margin: 0;
      color: #856404;
    }
    
    .modal-footer {
      padding: 15px 20px;
      background-color: #f8f9fa;
      border-top: 1px solid #e9ecef;
      text-align: right;
    }
    
    .modal-button {
      background-color: #17a2b8;
      color: white;
      padding: 8px 20px;
    }
    
    .modal-button:hover {
      background-color: #138496;
    }
    
    .bottom-actions {
      display: flex;
      gap: 20px;
      margin-top: 30px;
      justify-content: center;
      align-items: center;
      width: 100%;
    }
    
    .bottom-actions button {
      padding: 12px 20px;
      border-radius: 5px;
      font-weight: bold;
      font-size: 14px;
      min-width: 200px;
      text-align: center;
      flex: 0 0 auto;
      margin: 0;
      height: 45px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    
    .bottom-actions button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    .back-button {
      background-color: #7f8c8d;
      color: white;
    }
    
    .back-button:hover {
      background-color: #6c7a7d;
    }
  `]
})
export class PendingMedicationsComponent implements OnInit, OnDestroy {
  pendingMedications: Medication[] = [];
  selectedMedicationId: number | null = null;
  private subscription: Subscription = new Subscription();
  private timers: Map<number, { startTime: number, subscription: Subscription }> = new Map();
  private readonly APPROVAL_TIME = 10; // 10 seconds for auto-approval
  
  // Delivery map properties
  showDeliveryModal = false;
  selectedMedication: Medication | null = null;
  patientAddress = "103 South Main St, Newark, DE 19711";
  mapUrl: string = "";
  today = new Date();

  constructor(private medicationService: MedicationService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.medicationService.getPendingMedications().subscribe(medications => {
        this.pendingMedications = medications;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    // Clean up all timers
    this.timers.forEach(timer => timer.subscription.unsubscribe());
  }

  selectMedication(medicationId: number): void {
    // Clear any existing timers
    this.cancelSelection();
    
    // Set the selected medication
    this.selectedMedicationId = medicationId;
    
    // Start the approval timer for this medication
    this.setupApprovalTimer(medicationId);
  }

  cancelSelection(): void {
    // Clean up timer if it exists
    if (this.selectedMedicationId && this.timers.has(this.selectedMedicationId)) {
      const timer = this.timers.get(this.selectedMedicationId);
      if (timer) {
        timer.subscription.unsubscribe();
      }
      this.timers.delete(this.selectedMedicationId);
    }
    
    this.selectedMedicationId = null;
  }

  setupApprovalTimer(medicationId: number): void {
    const startTime = Date.now();
    const timerSub = timer(0, 1000).subscribe(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      
      if (elapsedSeconds >= this.APPROVAL_TIME) {
        this.approveMedication(medicationId);
        timerSub.unsubscribe();
      }
    });
    
    this.timers.set(medicationId, { startTime, subscription: timerSub });
  }

  getTimerPercentage(medicationId: number): number {
    const timer = this.timers.get(medicationId);
    if (!timer) return 0;
    
    const elapsedSeconds = Math.floor((Date.now() - timer.startTime) / 1000);
    return Math.min((elapsedSeconds / this.APPROVAL_TIME) * 100, 100);
  }

  getRemainingTime(medicationId: number): number {
    const timer = this.timers.get(medicationId);
    if (!timer) return this.APPROVAL_TIME;
    
    const elapsedSeconds = Math.floor((Date.now() - timer.startTime) / 1000);
    return Math.max(this.APPROVAL_TIME - elapsedSeconds, 0);
  }

  approveMedication(id: number): void {
    // Clean up timer if it exists
    if (this.timers.has(id)) {
      const timer = this.timers.get(id);
      if (timer) {
        timer.subscription.unsubscribe();
      }
      this.timers.delete(id);
    }
    
    this.medicationService.approveMedication(id).pipe(take(1)).subscribe();
    this.selectedMedicationId = null;
  }

  rejectMedication(id: number): void {
    // Clean up timer if it exists
    if (this.timers.has(id)) {
      const timer = this.timers.get(id);
      if (timer) {
        timer.subscription.unsubscribe();
      }
      this.timers.delete(id);
    }
    
    this.medicationService.rejectMedication(id).pipe(take(1)).subscribe();
    this.selectedMedicationId = null;
  }
  
  showDeliveryMap(medication: Medication): void {
    this.selectedMedication = medication;
    
    // Create Google Maps Embed API URL with the patient's address
    const encodedAddress = encodeURIComponent(this.patientAddress);
    const apiKey = environment.googleMapsApiKey;
    this.mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}&zoom=15`;
    
    this.showDeliveryModal = true;
  }
  
  closeDeliveryModal(): void {
    this.showDeliveryModal = false;
    this.selectedMedication = null;
  }
}