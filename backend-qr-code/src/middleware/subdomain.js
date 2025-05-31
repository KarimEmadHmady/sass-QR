import Restaurant from '../models/Restaurant.js';

export const subdomainMiddleware = async (req, res, next) => {
  try {
    // Skip subdomain check for registration and login
    if (req.path === '/api/restaurants/register' || req.path === '/api/restaurants/login') {
      return next();
    }

    const host = req.headers.host;
    const subdomain = host.split('.')[0];
    
    // Skip subdomain check for main domain
    if (subdomain === 'www' || subdomain === 'localhost' || subdomain === '127.0.0.1') {
      return next();
    }

    // For local development, allow any subdomain
    if (process.env.NODE_ENV === 'development') {
      req.restaurant = {
        subdomain: subdomain,
        _id: 'development-restaurant-id'
      };
      return next();
    }

    // Find restaurant by subdomain
    const restaurant = await Restaurant.findOne({ subdomain });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Add restaurant to request object
    req.restaurant = restaurant;
    next();
  } catch (error) {
    next(error);
  }
}; 