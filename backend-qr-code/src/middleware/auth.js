import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import dotenv from 'dotenv';
dotenv.config();

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    if (!decoded.role || decoded.role === 'restaurant') {
      const restaurant = await Restaurant.findById(decoded.id);

      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }

      if (!restaurant.active) {
        return res.status(403).json({ message: 'Restaurant account is deactivated' });
      }

      req.restaurant = restaurant;  // Send the full restaurant object
      req.user = null;

    } else {
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      req.user = user;  // Send the full user object
      req.restaurant = null;
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }

    res.status(401).json({ message: 'Token is not valid' });
  }
};