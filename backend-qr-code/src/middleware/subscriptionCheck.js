// import Restaurant from '../models/Restaurant.js';

// export const checkSubscriptionStatus = async (req, res, next) => {
//   try {
//     // Only check for restaurant users
//     if (!req.user || req.user.role !== 'restaurant') {
//       return next();
//     }

//     const restaurant = await Restaurant.findById(req.user._id);
//     if (!restaurant) {
//       return res.status(404).json({ message: 'Restaurant not found' });
//     }

//     // Check if trial has expired
//     if (restaurant.subscription.status === 'trial' &&
//         new Date() > restaurant.subscription.trialEndsAt) {
//       restaurant.subscription.status = 'expired';
//       await restaurant.save();
//     }

//     // Check subscription status
//     if (restaurant.subscription.status === 'expired') {
//       return res.status(403).json({ 
//         message: 'Your subscription has expired. Please renew your subscription to continue.',
//         subscriptionStatus: 'expired'
//       });
//     }

//     // Add subscription info to request
//     req.restaurantSubscription = {
//       status: restaurant.subscription.status,
//       plan: restaurant.subscription.plan,
//       trialEndsAt: restaurant.subscription.trialEndsAt
//     };

//     next();
//   } catch (error) {
//     console.error('Subscription check error:', error);
//     res.status(500).json({ message: 'Error checking subscription status' });
//   }
// };

// // Middleware for sensitive operations
// export const requireActiveSubscription = async (req, res, next) => {
//   try {
//     // Only check for restaurant users
//     if (!req.user || req.user.role !== 'restaurant') {
//       return next();
//     }

//     const restaurant = await Restaurant.findById(req.user._id);
//     if (!restaurant) {
//       return res.status(404).json({ message: 'Restaurant not found' });
//     }

//     // Check if trial has expired
//     if (restaurant.subscription.status === 'trial' &&
//         new Date() > restaurant.subscription.trialEndsAt) {
//       restaurant.subscription.status = 'expired';
//       await restaurant.save();
//     }

//     // Only allow active or trial subscriptions
//     if (restaurant.subscription.status === 'expired') {
//       return res.status(403).json({ 
//         message: 'This operation requires an active subscription.',
//         subscriptionStatus: 'expired'
//       });
//     }

//     next();
//   } catch (error) {
//     console.error('Subscription check error:', error);
//     res.status(500).json({ message: 'Error checking subscription status' });
//   }
// }; 


import Restaurant from '../models/Restaurant.js';

// Middleware to attach subscription info (optional use)
export const checkSubscriptionStatus = async (req, res, next) => {
  try {
    // Get restaurant from request (set by authenticateRestaurantToken)
    const restaurant = req.restaurant;
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check if trial has expired
    if (restaurant.subscription?.status === 'trial' &&
        new Date() > restaurant.subscription?.trialEndsAt) {
      restaurant.subscription.status = 'expired';
      await restaurant.save();
    }

    // Add subscription info to request
    req.restaurantSubscription = {
      status: restaurant.subscription?.status || 'expired',
      plan: restaurant.subscription?.plan || 'free',
      trialEndsAt: restaurant.subscription?.trialEndsAt || null
    };

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Error checking subscription status' });
  }
};

// Middleware to require active or trial subscription
export const requireActiveSubscription = async (req, res, next) => {
  try {
    const restaurant = req.restaurant;
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const status = restaurant.subscription?.status;

    // Only allow active or trial subscriptions
    if (status !== 'active' && status !== 'trial') {
      return res.status(403).json({
        message: 'This operation requires an active or trial subscription.',
        subscriptionStatus: status || 'expired'
      });
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Error checking subscription status' });
  }
};

