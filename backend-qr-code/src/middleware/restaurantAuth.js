import jwt from 'jsonwebtoken';
import Restaurant from '../models/Restaurant.js';

import dotenv from 'dotenv';
dotenv.config();

export const authenticateRestaurant = async (req, res, next) => {
  try {
    // Skip authentication for public routes
    if (
      req.path.startsWith('/api/auth') || 
      req.path.startsWith('/api/restaurants/register') ||
      req.path.startsWith('/api/restaurants/login')
    ) {
      return next();
    }

    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    // Find restaurant by ID
    const restaurant = await Restaurant.findById(decoded.id);

    if (!restaurant) {
      return res.status(401).json({ message: 'Restaurant not found' });
    }

    // Check if restaurant is active
    if (!restaurant.active) {
      return res.status(403).json({ message: 'Restaurant account is deactivated' });
    }

    // Add restaurant to request
    req.restaurant = restaurant;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authenticateRestaurantToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // For user tokens, use restaurantId. For restaurant tokens, use id
    const restaurantId = decoded.role ? decoded.restaurantId : decoded.id;
    
    // Find restaurant by ID
    let restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ 
        message: 'Restaurant not found',
        details: {
          searchedId: restaurantId,
          tokenType: decoded.role ? 'user' : 'restaurant',
          decodedToken: decoded
        }
      });
    }

    if (!restaurant.active) {
      return res.status(403).json({ 
        message: 'Restaurant is not active',
        details: {
          restaurantId: restaurant._id,
          active: restaurant.active
        }
      });
    }

    // Set the full restaurant object
    req.restaurant = restaurant;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    next(error);
  }
}; 
