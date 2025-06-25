import Restaurant from '../models/Restaurant.js';
import jwt from 'jsonwebtoken';

// Register new restaurant
export const registerRestaurant = async (req, res, next) => {
  try {
    const { name, email, password, subdomain, phone, address, settings, description } = req.body;
    const logoUrl = req.files?.logo?.[0]?.path;
    const bannerUrl = req.files?.banner?.[0]?.path;

    // Validate required fields
    if (!name || !email || !password || !subdomain) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: name, email, password, and subdomain' 
      });
    }

    // Format subdomain
    const formattedSubdomain = subdomain
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if subdomain exists
    const existingSubdomain = await Restaurant.findOne({ subdomain: formattedSubdomain }).lean();
    if (existingSubdomain) {
      return res.status(400).json({ message: 'This subdomain is already taken' });
    }

    // Check if email exists
    const existingEmail = await Restaurant.findOne({ email }).lean();
    if (existingEmail) {
      return res.status(400).json({ message: 'This email is already registered' });
    }

    // Create new restaurant
    const restaurant = new Restaurant({
      name,
      email,
      password,
      subdomain: formattedSubdomain,
      phone,
      address,
      description,
      logo: logoUrl,
      banner: bannerUrl,
      settings: settings ? JSON.parse(settings) : undefined
    });

    await restaurant.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: restaurant._id,
        subdomain: restaurant.subdomain
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Restaurant registered successfully',
      token,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        subdomain: restaurant.subdomain,
        email: restaurant.email,
        phone: restaurant.phone,
        address: restaurant.address,
        description: restaurant.description,
        logo: restaurant.logo,
        banner: restaurant.banner,
        settings: restaurant.settings
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

// Restaurant login
export const loginRestaurant = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find restaurant
    const restaurant = await Restaurant.findOne({ email });
    if (!restaurant) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await restaurant.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if restaurant is active
    if (!restaurant.active) {
      return res.status(403).json({ message: 'This restaurant account is deactivated' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: restaurant._id,
        subdomain: restaurant.subdomain
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        subdomain: restaurant.subdomain,
        email: restaurant.email,
        phone: restaurant.phone,
        address: restaurant.address,
        logo: restaurant.logo,
        banner: restaurant.banner,
        settings: restaurant.settings
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get restaurant profile
export const getRestaurantProfile = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.restaurant.id)
      .select('-password')
      .lean();
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Ensure subscription data is included
    if (!restaurant.subscription) {
      restaurant.subscription = {
        status: 'trial',
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        plan: 'free'
      };
    }
    
    res.json(restaurant);
  } catch (error) {
    next(error);
  }
};

// Update restaurant profile
export const updateRestaurantProfile = async (req, res, next) => {
  try {
    const { 
      name, 
      phone, 
      address, 
      settings,
      socialMedia,
      location,
      description 
    } = req.body;
    const logoUrl = req.files?.logo?.[0]?.path;
    const bannerUrl = req.files?.banner?.[0]?.path;

    const restaurant = await Restaurant.findById(req.restaurant.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Update fields
    if (name) restaurant.name = name;
    if (phone) restaurant.phone = phone;
    if (address) restaurant.address = address;
    if (description !== undefined) {
      const parsedDescription = JSON.parse(description);
      restaurant.description = {
        en: parsedDescription.en || '',
        ar: parsedDescription.ar || ''
      };
    }
    if (logoUrl) restaurant.logo = logoUrl;
    if (bannerUrl) restaurant.banner = bannerUrl;
    
    // Update settings
    if (settings) {
      const parsedSettings = JSON.parse(settings);
      restaurant.settings = { ...restaurant.settings, ...parsedSettings };
    }

    // Update social media
    if (socialMedia) {
      const parsedSocialMedia = JSON.parse(socialMedia);
      restaurant.settings.socialMedia = {
        ...restaurant.settings.socialMedia,
        ...parsedSocialMedia
      };
    }

    // Update location
    if (location) {
      restaurant.settings.location = location;
    }

    await restaurant.save();

    res.json({
      message: 'Profile updated successfully',
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        subdomain: restaurant.subdomain,
        email: restaurant.email,
        description: restaurant.description,
        logo: restaurant.logo,
        banner: restaurant.banner,
        phone: restaurant.phone,
        address: restaurant.address,
        settings: restaurant.settings
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get restaurant by subdomain (public)
export const getRestaurantBySubdomainPublic = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ 
      subdomain: req.params.subdomain,
      active: true 
    }).select('-password -settings').lean();

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    next(error);
  }
};

// Get restaurant by subdomain
export const getRestaurantBySubdomain = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ subdomain: req.params.subdomain })
      .select('-password -__v');
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (error) {
    next(error);
  }
};

// Update subscription status
export const updateSubscription = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.restaurant.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // If subscription doesn't exist or trialEndsAt is not set, set it
    if (!restaurant.subscription || !restaurant.subscription.trialEndsAt) {
      restaurant.subscription = {
        status: 'trial',
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        plan: 'free'
      };
    }

    await restaurant.save();
    res.json({
      message: 'Subscription updated successfully',
      subscription: restaurant.subscription
    });
  } catch (error) {
    next(error);
  }
}; 