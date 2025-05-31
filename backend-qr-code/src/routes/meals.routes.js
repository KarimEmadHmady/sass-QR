import express from 'express';
import { getMeals, createMeal, getMealById, updateMeal, deleteMeal, addReview, updateReview, deleteReview } from '../controllers/meals.controller.js';
import multer from '../utils/cloudinary.js';
import { authenticate } from '../middleware/auth.js';
import { authenticateRestaurantToken } from '../middleware/restaurantAuth.js';
import Meal from '../models/Meal.js';
import Restaurant from '../models/Restaurant.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/restaurant/:subdomain', async (req, res) => {
  try {
    const { subdomain } = req.params;
    
    // First find the restaurant by subdomain
    const restaurant = await Restaurant.findOne({ subdomain });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Then get meals for this restaurant
    const meals = await Meal.find({ restaurant: restaurant._id })
      .populate('category')
      .populate('reviews');

    if (!meals || meals.length === 0) {
      return res.status(404).json({ message: 'No meals found for this restaurant' });
    }

    res.json(meals);
  } catch (error) {
    console.error('Error fetching restaurant meals:', error);
    res.status(500).json({ message: 'Error fetching meals' });
  }
});

// Protected routes (auth required)
router.get('/', authenticateRestaurantToken, getMeals);
router.get('/:id', authenticateRestaurantToken, getMealById);
router.post('/', authenticate, multer.single('image'), createMeal);
router.put('/:id', authenticate, multer.single('image'), updateMeal);
router.delete('/:id', authenticate, deleteMeal);

// Review routes
router.post('/:id/reviews', authenticate, addReview);
router.put('/:mealId/reviews/:reviewId', authenticate, updateReview);
router.delete('/:mealId/reviews/:reviewId', authenticate, deleteReview);

export default router;
