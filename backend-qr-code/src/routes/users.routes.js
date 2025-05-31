import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all users for a restaurant
router.get('/', authenticate, async (req, res) => {
  try {
    const users = await User.find({ restaurant: req.restaurant._id });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get single user
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      restaurant: req.restaurant._id
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Create user (restaurant only)
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'user',
      restaurant: req.restaurant._id
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Update user (restaurant only)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      restaurant: req.restaurant._id
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, role } = req.body;
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user (restaurant only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({
      _id: req.params.id,
      restaurant: req.restaurant._id
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

export default router; 