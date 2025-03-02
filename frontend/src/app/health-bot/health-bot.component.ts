import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule} from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HealthBotService } from '../services/health-bot.service';

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-health-bot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './health-bot.component.html',
  styleUrl: './health-bot.component.css'
})
export class HealthBotComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessagesContainer') private chatMessagesContainer!: ElementRef;
  
  userMessage: string = '';
  chatMessages: Array<ChatMessage> = [];
  isLoading: boolean = false;
  selectedFile: File | null = null;
  private shouldScrollToBottom: boolean = false;

  constructor(private healthBotService: HealthBotService) {
    // Initialize with an empty array to ensure it's always an array
    this.chatMessages = [];
  }

  ngOnInit(): void {
    // Add a welcome message on initialization
    this.addMessage('Hello! I am your healthcare assistant. How can I help you today?', false);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private scrollToBottom(): void {
    try {
      const element = this.chatMessagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  sendMessage(): void {
    if (!this.userMessage.trim()) return;
    
    // Add user message to chat
    this.addMessage(this.userMessage, true);
    
    this.isLoading = true;
    
    if (this.selectedFile) {
      this.sendMessageWithImage();
    } else {
      this.sendTextMessage();
    }
  }

  private addMessage(content: string, isUser: boolean): void {
    this.chatMessages.push({
      content,
      isUser,
      timestamp: new Date()
    });
    this.shouldScrollToBottom = true;
  }

  private sendTextMessage(): void {
    this.healthBotService.sendHealthQuery(this.userMessage).subscribe(
      response => {
        this.handleResponse(response);
      },
      error => {
        this.handleError(error);
      }
    );
  }

  private sendMessageWithImage(): void {
    if (!this.selectedFile) return;
    
    this.healthBotService.sendHealthQueryWithImage(this.userMessage, this.selectedFile).subscribe(
      response => {
        this.handleResponse(response);
        this.selectedFile = null; // Clear the selected file after sending
      },
      error => {
        this.handleError(error);
        this.selectedFile = null; // Clear the selected file after error
      }
    );
  }

  private handleResponse(response: any): void {
    this.isLoading = false;
    
    // Add bot response to chat
    this.addMessage(response, false);
    
    // Clear user input
    this.userMessage = '';
  }

  private handleError(error: any): void {
    this.isLoading = false;
    console.error('Error sending message:', error);
    
    // Add error message to chat
    this.addMessage('Sorry, I encountered an error processing your request. Please try again.', false);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  clearFile(): void {
    this.selectedFile = null;
  }
}
