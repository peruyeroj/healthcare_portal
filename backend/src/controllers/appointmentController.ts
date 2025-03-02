import { Request, Response } from 'express';
import { emailService } from '../services/emailService';
import User from '../models/User';
import mongoose from 'mongoose';

// Define the appointment interface
interface Appointment {
  id: string;
  type: string;
  typeName: string;
  date: string;
  time: string;
  createdAt: Date;
  userId: string;
}

/**
 * Controller for handling appointment-related operations
 */
export const appointmentController = {
  /**
   * Create a new appointment and send confirmation email
   * @param req Request object
   * @param res Response object
   */
  createAppointment: async (req: Request, res: Response) => {
    try {
      console.log('Received appointment creation request:', req.body);
      const { appointment, userId } = req.body;
      
      if (!appointment || !userId) {
        console.log('Missing required fields:', { appointment: !!appointment, userId: !!userId });
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields' 
        });
      }
      
      // Check if we're using a test user or a real MongoDB user
      let user;
      let userEmail;
      let userName;
      
      // Check if userId is a valid MongoDB ObjectId
      const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);
      
      if (isValidObjectId) {
        // Fetch user information from MongoDB
        console.log(`Fetching user information for userId: ${userId}`);
        user = await User.findById(userId);
        
        if (!user) {
          console.log(`User not found for userId: ${userId}`);
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }
        
        console.log(`User found: ${user.email}, ${user.firstName} ${user.lastName}`);
        userEmail = user.email;
        userName = user.getFullName ? user.getFullName() : `${user.firstName} ${user.lastName}`;
      } else {
        // This is a test user ID, use the email from the request or a default
        console.log('Using test user data since userId is not a valid MongoDB ObjectId');
        
        // Check if we have test user data in the request
        if (req.body.testUserEmail && req.body.testUserName) {
          userEmail = req.body.testUserEmail;
          userName = req.body.testUserName;
        } else {
          // Default test user data
          userEmail = 'josephcperuyero@gmail.com';
          userName = 'Joseph Peruyero';
        }
        
        console.log(`Using test user data: ${userEmail}, ${userName}`);
      }
      
      // In a real application, you would save the appointment to the database here
      // For now, we'll just simulate that and focus on sending the email
      
      // Send confirmation email
      console.log(`Sending confirmation email to ${userEmail}...`);
      const emailSent = await emailService.sendAppointmentConfirmation({
        type: appointment.type,
        typeName: appointment.typeName,
        date: appointment.date,
        time: appointment.time,
        userEmail: userEmail,
        userName: userName
      });
      
      if (!emailSent) {
        console.log('Email sending failed');
        // If email fails, we still create the appointment but inform the client
        return res.status(201).json({
          success: true,
          message: 'Appointment created but confirmation email could not be sent',
          appointment
        });
      }
      
      console.log('Email sent successfully');
      // Return success response
      return res.status(201).json({
        success: true,
        message: 'Appointment created and confirmation email sent',
        appointment
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while creating the appointment'
      });
    }
  },
  
  /**
   * Get all appointments for a user
   * @param req Request object
   * @param res Response object
   */
  getUserAppointments: (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      // In a real application, you would fetch appointments from the database
      // For now, we'll return an empty array
      
      return res.status(200).json({
        success: true,
        appointments: []
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while fetching appointments'
      });
    }
  }
}; 