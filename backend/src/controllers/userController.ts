import { Request, Response } from 'express';
import User from '../models/User';

/**
 * Update user's personal information
 * @route PUT /api/users/personal-info
 * @access Private
 */
export const updatePersonalInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const {
      fullName,
      dob,
      gender,
      genderIdentity,
      address,
      primaryPhone,
      alternatePhone
    } = req.body;
    
    // Split full name into first and last name
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    // Format date of birth
    const dateOfBirth = new Date(dob);
    
    // Create update object without email
    const updateData = {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      genderIdentity,
      address,
      primaryPhone,
      alternatePhone,
      personalInfoCompleted: true
    };
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user without password
    const userResponse = {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      dateOfBirth: updatedUser.dateOfBirth,
      gender: updatedUser.gender,
      genderIdentity: updatedUser.genderIdentity,
      address: updatedUser.address,
      primaryPhone: updatedUser.primaryPhone,
      alternatePhone: updatedUser.alternatePhone,
      personalInfoCompleted: updatedUser.personalInfoCompleted
    };
    
    res.status(200).json(userResponse);
  } catch (error: any) {
    console.error('Error updating personal information:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get user's personal information
 * @route GET /api/users/personal-info
 * @access Private
 */
export const getPersonalInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format the response
    const personalInfo = {
      fullName: `${user.firstName} ${user.lastName}`,
      dob: user.dateOfBirth,
      gender: user.gender || '',
      genderIdentity: user.genderIdentity || '',
      address: user.address || '',
      primaryPhone: user.primaryPhone || '',
      alternatePhone: user.alternatePhone || '',
      email: user.email,
      personalInfoCompleted: user.personalInfoCompleted
    };
    
    res.status(200).json(personalInfo);
  } catch (error: any) {
    console.error('Error fetching personal information:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update user's insurance information
 * @route PUT /api/users/insurance-info
 * @access Private
 */
export const updateInsuranceInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const {
      insuranceCompany,
      insuranceId,
      groupNumber
    } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        insuranceCompany,
        insuranceId,
        groupNumber,
        insuranceInfoCompleted: true
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return insurance information
    const insuranceInfo = {
      insuranceCompany: updatedUser.insuranceCompany,
      insuranceId: updatedUser.insuranceId,
      groupNumber: updatedUser.groupNumber,
      insuranceInfoCompleted: updatedUser.insuranceInfoCompleted
    };
    
    res.status(200).json(insuranceInfo);
  } catch (error: any) {
    console.error('Error updating insurance information:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get user's insurance information
 * @route GET /api/users/insurance-info
 * @access Private
 */
export const getInsuranceInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format the response
    const insuranceInfo = {
      insuranceCompany: user.insuranceCompany || '',
      insuranceId: user.insuranceId || '',
      groupNumber: user.groupNumber || '',
      insuranceInfoCompleted: user.insuranceInfoCompleted
    };
    
    res.status(200).json(insuranceInfo);
  } catch (error: any) {
    console.error('Error fetching insurance information:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};