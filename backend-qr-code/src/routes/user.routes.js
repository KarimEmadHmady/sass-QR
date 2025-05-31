import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all users (restaurant only)
router.get('/', authenticate, getAllUsers);

// Get user by ID (restaurant only)
router.get('/:id', authenticate, getUserById);

// Update user (restaurant only)
router.put('/:id', authenticate, updateUser);

// Delete user (restaurant only)
router.delete('/:id', authenticate, deleteUser);

export default router;