import express from 'express';
import { getMeals, createMeal, getMealById, updateMeal, deleteMeal, addReview, updateReview, deleteReview, setDiscount, removeDiscount, getActiveDiscounts, cleanupExpiredDiscounts, bulkSetDiscount, bulkDeleteMeals } from '../controllers/meals.controller.js';
import multer from '../utils/cloudinary.js';
import { authenticate } from '../middleware/auth.js';
import { authenticateRestaurantToken } from '../middleware/restaurantAuth.js';
import { requireActiveSubscription } from '../middleware/subscriptionCheck.js';
import Meal from '../models/Meal.js';
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

    // Then get meals for this restaurant
    const meals = await Meal.find({ restaurant: restaurant._id })
      .populate('category')
      .populate('reviews');

    if (!meals || meals.length === 0) {
      return res.status(404).json({ message: 'No meals found for this restaurant' });
    }

    // Add isDiscountActive and discountedPrice to each meal
    const mealsWithDiscounts = meals.map(meal => {
      const mealObj = meal.toObject();
      mealObj.isDiscountActive = meal.isDiscountActive();
      mealObj.discountedPrice = meal.discountedPrice;
      return mealObj;
    });

    res.json(mealsWithDiscounts);
  } catch (error) {
    console.error('Error fetching restaurant meals:', error);
    res.status(500).json({ message: 'Error fetching meals' });
  }
});

// Protected routes (auth required)
router.get('/', authenticateRestaurantToken, requireActiveSubscription, getMeals);
router.get('/:id', authenticateRestaurantToken, requireActiveSubscription, getMealById);

// ✅ Bulk operations routes
router.post('/bulk-discount', authenticateRestaurantToken, requireActiveSubscription, bulkSetDiscount);

router.post('/', authenticate, requireActiveSubscription, multer.single('image'), createMeal);
router.put('/:id', authenticate, requireActiveSubscription, multer.single('image'), updateMeal);
router.delete('/bulk-delete', authenticateRestaurantToken, requireActiveSubscription, bulkDeleteMeals);
router.delete('/:id', authenticate, requireActiveSubscription, deleteMeal);

// Review routes
router.post('/:id/reviews', authenticate, addReview);
router.put('/:mealId/reviews/:reviewId', authenticateRestaurantToken, requireActiveSubscription, updateReview);
router.delete('/:mealId/reviews/:reviewId', authenticate, requireActiveSubscription, deleteReview);

// ✅ Discount routes
router.post('/:id/discount', authenticateRestaurantToken, requireActiveSubscription, setDiscount);
router.delete('/:id/discount', authenticateRestaurantToken, requireActiveSubscription, removeDiscount);
router.get('/discounts/active', authenticateRestaurantToken, requireActiveSubscription, getActiveDiscounts);
router.post('/discounts/cleanup', authenticateRestaurantToken, requireActiveSubscription, cleanupExpiredDiscounts);





export default router;
