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
    console.log('Decoded token:', decoded);

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
    next();
  } catch (error) {
    console.error('Restaurant auth error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const authenticateRestaurantToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    console.log('=== Restaurant Token Authentication Debug ===');
    console.log('1. Received token:', token);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    console.log('2. Decoded token:', decoded);
    
    // For user tokens, use restaurantId. For restaurant tokens, use id
    const restaurantId = decoded.role ? decoded.restaurantId : decoded.id;
    console.log('3. Using restaurant ID:', restaurantId);
    
    // Find restaurant by ID
    let restaurant = await Restaurant.findById(restaurantId);
    console.log('4. Restaurant from DB:', restaurant);

    if (!restaurant) {
      console.log('5. Restaurant not found with ID:', restaurantId);
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
      console.log('6. Restaurant is not active');
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
    console.log('7. Authentication successful, restaurant context set:', req.restaurant);

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    next(error);
  }
}; 
