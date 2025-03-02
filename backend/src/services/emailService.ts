import nodemailer from 'nodemailer';

// Define the email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  }
}

// Define the appointment data interface
interface AppointmentData {
  type: string;
  typeName: string;
  date: string;
  time: string;
  userEmail: string;
  userName: string;
}

// Define the message confirmation data interface
interface MessageConfirmationData {
  userEmail: string;
  userName: string;
  doctorName: string;
  messageDate: string;
  messageTime: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  
  constructor(config: EmailConfig) {
    console.log('Initializing email service with config:', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass ? '******' : 'not provided' // Don't log the actual password
      }
    });
    
    // For Gmail, we need to use a specific configuration
    if (config.host.includes('gmail')) {
      console.log('Using Gmail-specific configuration');
      this.transporter = nodemailer.createTransport({
        service: 'gmail',  // Use the 'gmail' service instead of custom host/port
        auth: {
          user: config.auth.user,
          pass: config.auth.pass,
        },
      });
    } else {
      // For other email providers
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.auth.user,
          pass: config.auth.pass,
        },
      });
    }
    
    // Verify the transporter configuration
    this.verifyTransporter();
  }
  
  /**
   * Verify the transporter configuration
   */
  private async verifyTransporter(): Promise<void> {
    try {
      const verification = await this.transporter.verify();
      console.log('Transporter verification successful:', verification);
    } catch (error) {
      console.error('Transporter verification failed:', error);
    }
  }

  /**
   * Send an appointment confirmation email
   * @param appointmentData The appointment data
   * @returns Promise<boolean> True if email was sent successfully
   */
  async sendAppointmentConfirmation(appointmentData: AppointmentData): Promise<boolean> {
    try {
      const { userEmail, userName, typeName, date, time } = appointmentData;
      
      console.log(`Attempting to send confirmation email to ${userEmail} for ${typeName} on ${date} at ${time}`);
      
      // Create email content
      const subject = `Appointment Confirmation: ${typeName} on ${date}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #4CAF50; text-align: center;">Appointment Confirmation</h2>
          <p>Hello ${userName},</p>
          <p>Your appointment has been confirmed. Here are the details:</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Type:</strong> ${typeName}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
          </div>
          
          <p>If you need to reschedule or cancel your appointment, please log in to your account or contact us.</p>
          <p>Thank you for choosing our healthcare services.</p>
          
          <div style="text-align: center; margin-top: 30px; color: #777; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `;
      
      // Email options
      const mailOptions = {
        from: `"Healthcare Portal" <${process.env.EMAIL_USER}>`, // Use your actual email
        to: userEmail,
        subject,
        html,
      };
      
      console.log('Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      
      // Send the email
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      return false;
    }
  }

  /**
   * Send a message confirmation email
   * @param messageData The message confirmation data
   * @returns Promise<boolean> True if email was sent successfully
   */
  async sendMessageConfirmation(messageData: MessageConfirmationData): Promise<boolean> {
    try {
      const { userEmail, userName, doctorName, messageDate, messageTime } = messageData;
      
      console.log(`Attempting to send message confirmation email to ${userEmail} for message to ${doctorName}`);
      
      // Create email content
      const subject = `Message Confirmation: Your message to ${doctorName}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #4CAF50; text-align: center;">Message Confirmation</h2>
          <p>Hello ${userName},</p>
          <p>Your message has been sent to ${doctorName}. Here are the details:</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Doctor:</strong> ${doctorName}</p>
            <p><strong>Date:</strong> ${messageDate}</p>
            <p><strong>Time:</strong> ${messageTime}</p>
          </div>
          
          <p>The doctor has received your message and will respond as soon as possible.</p>
          <p>If your matter is urgent, please call our office directly or visit the emergency room.</p>
          <p>Thank you for using our healthcare messaging service.</p>
          
          <div style="text-align: center; margin-top: 30px; color: #777; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `;
      
      // Email options
      const mailOptions = {
        from: `"Healthcare Portal" <${process.env.EMAIL_USER}>`, // Use your actual email
        to: userEmail,
        subject,
        html,
      };
      
      console.log('Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      
      // Send the email
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('Error sending message confirmation email:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      return false;
    }
  }
}

// Create and export the email service instance
const emailConfig: EmailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
};

// Log email configuration at startup (without sensitive info)
console.log('Email service configuration:', {
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: {
    user: emailConfig.auth.user,
    pass: emailConfig.auth.pass ? 'Password provided' : 'No password provided'
  }
});

export const emailService = new EmailService(emailConfig);