import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface PaymentCard {
  nameOnCard: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  billingAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

interface State {
  name: string;
  abbreviation: string;
}

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css'
})
export class BillingComponent implements OnInit {
  cardForm: FormGroup;
  savedCards: PaymentCard[] = [];
  showAddCardForm = false;
  showEditCardForm = false;
  editingCardIndex: number | null = null;
  
  months: string[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  years: string[] = [];
  
  states: State[] = [
    { name: 'Alabama', abbreviation: 'AL' },
    { name: 'Alaska', abbreviation: 'AK' },
    { name: 'Arizona', abbreviation: 'AZ' },
    { name: 'Arkansas', abbreviation: 'AR' },
    { name: 'California', abbreviation: 'CA' },
    { name: 'Colorado', abbreviation: 'CO' },
    { name: 'Connecticut', abbreviation: 'CT' },
    { name: 'Delaware', abbreviation: 'DE' },
    { name: 'Florida', abbreviation: 'FL' },
    { name: 'Georgia', abbreviation: 'GA' },
    { name: 'Hawaii', abbreviation: 'HI' },
    { name: 'Idaho', abbreviation: 'ID' },
    { name: 'Illinois', abbreviation: 'IL' },
    { name: 'Indiana', abbreviation: 'IN' },
    { name: 'Iowa', abbreviation: 'IA' },
    { name: 'Kansas', abbreviation: 'KS' },
    { name: 'Kentucky', abbreviation: 'KY' },
    { name: 'Louisiana', abbreviation: 'LA' },
    { name: 'Maine', abbreviation: 'ME' },
    { name: 'Maryland', abbreviation: 'MD' },
    { name: 'Massachusetts', abbreviation: 'MA' },
    { name: 'Michigan', abbreviation: 'MI' },
    { name: 'Minnesota', abbreviation: 'MN' },
    { name: 'Mississippi', abbreviation: 'MS' },
    { name: 'Missouri', abbreviation: 'MO' },
    { name: 'Montana', abbreviation: 'MT' },
    { name: 'Nebraska', abbreviation: 'NE' },
    { name: 'Nevada', abbreviation: 'NV' },
    { name: 'New Hampshire', abbreviation: 'NH' },
    { name: 'New Jersey', abbreviation: 'NJ' },
    { name: 'New Mexico', abbreviation: 'NM' },
    { name: 'New York', abbreviation: 'NY' },
    { name: 'North Carolina', abbreviation: 'NC' },
    { name: 'North Dakota', abbreviation: 'ND' },
    { name: 'Ohio', abbreviation: 'OH' },
    { name: 'Oklahoma', abbreviation: 'OK' },
    { name: 'Oregon', abbreviation: 'OR' },
    { name: 'Pennsylvania', abbreviation: 'PA' },
    { name: 'Rhode Island', abbreviation: 'RI' },
    { name: 'South Carolina', abbreviation: 'SC' },
    { name: 'South Dakota', abbreviation: 'SD' },
    { name: 'Tennessee', abbreviation: 'TN' },
    { name: 'Texas', abbreviation: 'TX' },
    { name: 'Utah', abbreviation: 'UT' },
    { name: 'Vermont', abbreviation: 'VT' },
    { name: 'Virginia', abbreviation: 'VA' },
    { name: 'Washington', abbreviation: 'WA' },
    { name: 'West Virginia', abbreviation: 'WV' },
    { name: 'Wisconsin', abbreviation: 'WI' },
    { name: 'Wyoming', abbreviation: 'WY' }
  ];
  
  constructor(private fb: FormBuilder) {
    this.cardForm = this.fb.group({
      nameOnCard: ['', [Validators.required]],
      cardNumber: ['', [
        Validators.required, 
        Validators.pattern(/^[\d\s-]{13,19}$/),
        this.validateCardNumber
      ]],
      expiryMonth: ['', [Validators.required]],
      expiryYear: ['', [Validators.required]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
      billingAddress: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]]
    });
  }
  
  ngOnInit(): void {
    this.generateYears();
    this.loadSavedCards();
  }
  
  generateYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
      this.years.push((currentYear + i).toString().slice(-2));
    }
  }
  
  loadSavedCards(): void {
    const savedCards = localStorage.getItem('savedPaymentCards');
    if (savedCards) {
      this.savedCards = JSON.parse(savedCards);
    }
  }
  
  saveSavedCards(): void {
    localStorage.setItem('savedPaymentCards', JSON.stringify(this.savedCards));
  }
  
  toggleAddCardForm(): void {
    this.showAddCardForm = !this.showAddCardForm;
    if (!this.showAddCardForm) {
      this.cardForm.reset();
    }
  }
  
  onSubmit(): void {
    if (this.cardForm.valid) {
      // Format card number to remove spaces for storage
      const formattedCardNumber = this.cardForm.value.cardNumber.replace(/\s/g, '');
      
      const newCard: PaymentCard = {
        ...this.cardForm.value,
        cardNumber: formattedCardNumber
      };
      
      this.savedCards.push(newCard);
      this.saveSavedCards();
      this.toggleAddCardForm();
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.cardForm.controls).forEach(key => {
        const control = this.cardForm.get(key);
        control?.markAsTouched();
      });
    }
  }
  
  deleteCard(index: number): void {
    if (confirm('Are you sure you want to remove this payment method?')) {
      this.savedCards.splice(index, 1);
      this.saveSavedCards();
    }
  }
  
  getCardType(cardNumber: string): string {
    // More comprehensive card type detection based on card number patterns
    if (!cardNumber) return 'Card';
    
    // Remove any spaces or dashes
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');
    
    // Visa: Starts with 4, length 13, 16, or 19
    if (/^4/.test(cleanNumber)) {
      return 'Visa';
    }
    
    // Mastercard: Starts with 51-55 or 2221-2720, length 16
    if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d\d|27[0-1]\d|2720)/.test(cleanNumber)) {
      return 'Mastercard';
    }
    
    // American Express: Starts with 34 or 37, length 15
    if (/^3[47]/.test(cleanNumber)) {
      return 'American Express';
    }
    
    // Discover: Starts with 6011, 622126-622925, 644-649, 65, length 16-19
    if (/^(6011|65|64[4-9]|622(12[6-9]|1[3-9]\d|[2-8]\d\d|9[01]\d|92[0-5]))/.test(cleanNumber)) {
      return 'Discover';
    }
    
    // Diners Club: Starts with 300-305, 36, 38-39, length 14-19
    if (/^(3(0[0-5]|[68]\d)\d)/.test(cleanNumber)) {
      return 'Diners Club';
    }
    
    // JCB: Starts with 2131, 1800, 35, length 16-19
    if (/^(35|2131|1800)/.test(cleanNumber)) {
      return 'JCB';
    }
    
    // UnionPay: Starts with 62, length 16-19
    if (/^62/.test(cleanNumber)) {
      return 'UnionPay';
    }
    
    // Default fallback
    return 'Card';
  }
  
  getCardTypeClass(cardNumber: string): string {
    const cardType = this.getCardType(cardNumber);
    
    // Convert to lowercase and handle multi-word card types
    if (cardType === 'American Express') {
      return 'american';
    } else if (cardType === 'Diners Club') {
      return 'diners';
    } else {
      return cardType.toLowerCase();
    }
  }
  
  // Custom validator for card numbers
  validateCardNumber(control: any) {
    if (!control.value) return null;
    
    // Remove spaces and dashes for validation
    const value = control.value.replace(/[\s-]/g, '');
    
    // Check if it contains only digits after removing spaces/dashes
    if (!/^\d+$/.test(value)) {
      return { invalidCardNumber: true };
    }
    
    // Check length based on card type
    if (value.length < 13 || value.length > 19) {
      return { invalidCardNumber: true };
    }
    
    // Luhn algorithm for card number validation
    let sum = 0;
    let shouldDouble = false;
    
    // Loop through values starting from the rightmost digit
    for (let i = value.length - 1; i >= 0; i--) {
      let digit = parseInt(value.charAt(i));
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    // If the sum is divisible by 10, the card number is valid
    return (sum % 10 === 0) ? null : { invalidCardNumber: true };
  }
  
  formatCardNumber(event: any): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    let formattedValue = '';
    
    // Format based on card type
    const cardType = this.getCardType(value);
    
    if (cardType === 'American Express') {
      // Format: XXXX XXXXXX XXXXX
      for (let i = 0; i < value.length; i++) {
        if (i === 4 || i === 10) {
          formattedValue += ' ';
        }
        formattedValue += value[i];
      }
    } else {
      // Format: XXXX XXXX XXXX XXXX
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += ' ';
        }
        formattedValue += value[i];
      }
    }
    
    // Update the input value without triggering another input event
    input.value = formattedValue;
    
    // Update the form control value
    this.cardForm.get('cardNumber')?.setValue(formattedValue, { emitEvent: false });
  }
  
  getCardImagePath(cardNumber: string): string {
    const cardType = this.getCardType(cardNumber);
    const baseUrl = 'app/assets/images/card-logos/';
    
    switch (cardType) {
      case 'Visa':
        return `${baseUrl}visa.png`;
      case 'Mastercard':
        return `${baseUrl}mastercard.png`;
      case 'American Express':
        return `${baseUrl}amex.png`;
      case 'Discover':
        return `${baseUrl}discover.png`;
      case 'Diners Club':
        return `${baseUrl}diners.png`;
      case 'JCB':
        return `${baseUrl}jcb.png`;
      case 'UnionPay':
        return `${baseUrl}unionpay.png`;
      default:
        return `${baseUrl}visa.png`;
    }
  }

  editCard(index: number): void {
    this.editingCardIndex = index;
    const cardToEdit = this.savedCards[index];
    this.cardForm.patchValue(cardToEdit);
    this.showEditCardForm = true;
  }

  updateCard(): void {
    if (this.cardForm.valid && this.editingCardIndex !== null) {
      this.savedCards[this.editingCardIndex] = this.cardForm.value;
      this.saveSavedCards();
      this.showEditCardForm = false;
      this.editingCardIndex = null;
    }
  }

  cancelEdit(): void {
    this.showEditCardForm = false;
    this.editingCardIndex = null;
  }
}
