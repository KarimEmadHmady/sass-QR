import express from 'express';
import Restaurant from '../models/Restaurant.js';
import jwt from 'jsonwebtoken';
import upload from '../utils/cloudinary.js';
import dotenv from 'dotenv';
import { authenticate } from '../middleware/auth.js';
import { 
  registerRestaurant, 
  loginRestaurant, 
  getRestaurantProfile, 
  updateRestaurantProfile, 
  getRestaurantBySubdomain, 
  getRestaurantBySubdomainPublic, 
  updateSubscription 
} from '../controllers/restaurant.controller.js';

dotenv.config();
const router = express.Router();

// Register new restaurant
router.post('/register', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), registerRestaurant);

// Restaurant login
router.post('/login', loginRestaurant);

// Get restaurant profile
router.get('/profile', authenticate, getRestaurantProfile);

// Update restaurant profile
router.put('/profile', authenticate, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), updateRestaurantProfile);

// Get restaurant by subdomain (public)
router.get('/:subdomain', getRestaurantBySubdomainPublic);

// Get restaurant by subdomain
router.get('/subdomain/:subdomain', getRestaurantBySubdomain);

// Update subscription status
router.put('/subscription', authenticate, updateSubscription);

export default router; 