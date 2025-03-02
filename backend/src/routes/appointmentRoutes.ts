import express from 'express';
import { appointmentController } from '../controllers/appointmentController';

const router = express.Router();

// Route to create a new appointment and send confirmation email
router.post('/create', appointmentController.createAppointment);

// Route to get all appointments for a user
router.get('/user/:userId', appointmentController.getUserAppointments);

export default router; 