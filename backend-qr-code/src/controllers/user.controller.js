import User from '../models/User.js';

// Get all users (restaurant only)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ restaurant: req.restaurant.id }).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Get user by ID (restaurant only)
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      restaurant: req.restaurant.id
    }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Update user (restaurant only)
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, password, role, isActive } = req.body;
    const user = await User.findOne({
      _id: req.params.id,
      restaurant: req.restaurant.id
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    if (password) {
      user.password = password;
    }
    if (role) {
      user.role = role;
    }
    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// Delete user (restaurant only)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      restaurant: req.restaurant.id
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};