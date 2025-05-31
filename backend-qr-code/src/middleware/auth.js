import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import dotenv from 'dotenv';
dotenv.config();

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Check if this is a restaurant token
    if (!decoded.role || decoded.role === 'restaurant') {
      // Find restaurant by ID
      const restaurant = await Restaurant.findById(decoded.id);
      console.log('Found restaurant:', restaurant);
      
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }

      // Check if restaurant is active
      if (!restaurant.active) {
        return res.status(403).json({ message: 'Restaurant account is deactivated' });
      }

      // Add restaurant to request
      req.restaurant = restaurant;
      req.user = null; // Clear any user context
    } else {
      // This is a regular user token
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      req.user = user;
      req.restaurant = null; // Clear any restaurant context
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check if user is admin (for user management only)
export const isAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};