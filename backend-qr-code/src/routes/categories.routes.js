import express from 'express';
import { getCategories, createCategory, getCategoryById, updateCategory, deleteCategory } from '../controllers/categories.controller.js';
import multer from '../utils/cloudinary.js';
import { authenticate } from '../middleware/auth.js';
import { authenticateRestaurantToken } from '../middleware/restaurantAuth.js';
import { requireActiveSubscription } from '../middleware/subscriptionCheck.js';
import Category from '../models/Category.js';
import Restaurant from '../models/Restaurant.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/restaurant/:subdomain', async (req, res) => {
  try {
    const { subdomain } = req.params;
    
    // First find the restaurant by subdomain
    const restaurant = await Restaurant.findOne({ subdomain }).lean();
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Then get categories for this restaurant
    const categories = await Category.find({ restaurant: restaurant._id });

    if (!categories || categories.length === 0) {
      return res.status(404).json({ message: 'No categories found for this restaurant' });
    }

    res.json(categories);
  } catch (error) {
    console.error('Error fetching restaurant categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Protected routes (auth required)
router.get('/', authenticateRestaurantToken, requireActiveSubscription, getCategories);
router.get('/:id', authenticateRestaurantToken, requireActiveSubscription, getCategoryById);

router.post('/', authenticate, requireActiveSubscription, multer.single('image'), createCategory);
router.put('/:id', authenticate, requireActiveSubscription, multer.single('image'), updateCategory);
router.delete('/:id', authenticate, requireActiveSubscription, deleteCategory);

export default router;