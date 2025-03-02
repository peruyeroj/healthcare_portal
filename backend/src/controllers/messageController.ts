import { Request, Response } from 'express';
import { emailService } from '../services/emailService';

// Extend the Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
      };
    }
  }
}

/**
 * Controller for handling messaging functionality
 */
export const messageController = {
  /**
   * Send a message to a doctor and send an automated email confirmation to the user
   * @param req Request object containing doctorId, doctorName, and message
   * @param res Response object
   */
  sendMessage: async (req: Request, res: Response) => {
    try {
      const { doctorId, doctorName, message } = req.body;
      
      // Validate request
      if (!doctorId || !doctorName || !message) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: doctorId, doctorName, or message' 
        });
      }

      // Get user information from the authenticated request
      const user = req.user;
      
      if (!user || !user.email) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not authenticated or missing email' 
        });
      }

      // Store message in database (this would be implemented with a real database)
      console.log(`Message from ${user.email} to ${doctorName} (ID: ${doctorId}): ${message}`);
      
      // Create a userName, defaulting to "Patient" if both firstName and lastName are missing
      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Patient';
      
      // Send confirmation email to the user
      const emailSent = await emailService.sendMessageConfirmation({
        userEmail: user.email,
        userName: userName,
        doctorName,
        messageDate: new Date().toLocaleDateString(),
        messageTime: new Date().toLocaleTimeString()
      });

      if (!emailSent) {
        // Still return success but note the email failure
        return res.status(200).json({
          success: true,
          message: 'Message sent successfully but confirmation email failed',
          emailSent: false
        });
      }

      // Return success response
      return res.status(200).json({
        success: true,
        message: 'Message sent successfully and confirmation email sent',
        emailSent: true
      });
    } catch (error) {
      console.error('Error in sendMessage controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while sending message'
      });
    }
  }
}; 