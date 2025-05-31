import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import categoryRoutes from './src/routes/categories.routes.js';
import mealRoutes from './src/routes/meals.routes.js';
import userRoutes from './src/routes/users.routes.js';
import restaurantRoutes from './src/routes/restaurant.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { authenticateRestaurant } from './src/middleware/restaurantAuth.js';
import { subdomainMiddleware } from './src/middleware/subdomain.js';
import { connectDB } from './src/config/db.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Public routes (no restaurant context needed)
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/auth', authRoutes);

// Public routes that need subdomain but no auth
app.use('/api/categories', categoryRoutes);
app.use('/api/meals', mealRoutes);

// Subdomain middleware for authenticated routes
app.use(subdomainMiddleware);

// Restaurant authentication middleware
app.use(authenticateRestaurant);

// Protected routes that need restaurant context
app.use('/api/users', userRoutes);

// Error handling
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
