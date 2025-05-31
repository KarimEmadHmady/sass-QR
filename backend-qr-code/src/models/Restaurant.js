import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  subdomain: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    required: false
  },
  banner: {
    type: String,
    required: false
  },
  active: {
    type: Boolean,
    default: true
  },
  subscription: {
    status: {
      type: String,
      enum: ['trial', 'active', 'expired'],
      default: 'trial'
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    },
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free'
    }
  },
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    currency: {
      type: String,
      enum: ['EGP', 'SAR', 'AED'],
      default: 'EGP'
    },
    language: {
      type: String,
      enum: ['ar', 'en'],
      default: 'ar'
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
restaurantSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

// Method to check password
restaurantSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Method to check if trial is active
restaurantSchema.methods.isTrialActive = function() {
  return this.subscription.status === 'trial' && new Date() < this.subscription.trialEndsAt;
};

// Method to get remaining trial days
restaurantSchema.methods.getRemainingTrialDays = function() {
  if (!this.isTrialActive()) return 0;
  const remaining = this.subscription.trialEndsAt - new Date();
  return Math.ceil(remaining / (1000 * 60 * 60 * 24));
};

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant; 