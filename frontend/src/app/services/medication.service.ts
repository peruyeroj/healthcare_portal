import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Medication {
  id: number;
  name: string;
  dateRequested: Date;
  requestedBy: string;
  dose: string;
  frequency: string;
  status: 'pending' | 'approved' | 'rejected';
  approvalDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MedicationService {
  private pendingMedications = new BehaviorSubject<Medication[]>([
    { 
      id: 1, 
      name: 'Lisinopril', 
      dateRequested: new Date('2023-03-01'), 
      requestedBy: 'Dr. Smith', 
      dose: '10mg', 
      frequency: 'Once daily', 
      status: 'pending' 
    },
    { 
      id: 2, 
      name: 'Metformin', 
      dateRequested: new Date('2023-03-02'), 
      requestedBy: 'Dr. Jones', 
      dose: '500mg', 
      frequency: 'Twice daily', 
      status: 'pending' 
    },
    { 
      id: 3, 
      name: 'Atorvastatin', 
      dateRequested: new Date('2023-03-01'), 
      requestedBy: 'Dr. Smith', 
      dose: '20mg', 
      frequency: 'Once daily at bedtime', 
      status: 'pending' 
    }
  ]);

  constructor() {}

  getPendingMedications(): Observable<Medication[]> {
    return this.pendingMedications.asObservable();
  }

  approveMedication(id: number): Observable<boolean> {
    const currentMedications = this.pendingMedications.value;
    const updatedMedications = currentMedications.map(med => {
      if (med.id === id) {
        return { ...med, status: 'approved' as const, approvalDate: new Date() };
      }
      return med;
    });
    
    this.pendingMedications.next(updatedMedications);
    return of(true).pipe(delay(500)); // Simulate API delay
  }

  rejectMedication(id: number): Observable<boolean> {
    const currentMedications = this.pendingMedications.value;
    const updatedMedications = currentMedications.map(med => {
      if (med.id === id) {
        return { ...med, status: 'rejected' as const };
      }
      return med;
    });
    
    this.pendingMedications.next(updatedMedications);
    return of(true).pipe(delay(500)); // Simulate API delay
  }
}