import mongoose from 'mongoose';

const TranslationSchema = new mongoose.Schema({
  en: { type: String, required: true },
  ar: { type: String, required: true }
}, { _id: false });

const ReviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: false },
  },
  { timestamps: true }
);

const MealSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    name: { type: TranslationSchema, required: true },
    description: { type: TranslationSchema, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    reviews: [ReviewSchema],
    rating: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    discountStartDate: { type: Date, default: null },
    discountEndDate: { type: Date, default: null }
  },
  { timestamps: true }
);

// Add compound indexes for restaurant-specific queries
MealSchema.index({ restaurant: 1, category: 1 });
MealSchema.index({ restaurant: 1, 'name.en': 1 });
MealSchema.index({ restaurant: 1, 'name.ar': 1 });

// Virtual property to calculate discounted price
MealSchema.virtual('discountedPrice').get(function() {
  if (this.isDiscountActive()) {
    const discountAmount = (this.price * this.discountPercentage) / 100;
    return Math.round((this.price - discountAmount) * 100) / 100; // Round to 2 decimal places
  }
  return this.price;
});

// Method to check if discount is active
MealSchema.methods.isDiscountActive = function() {
  if (!this.discountPercentage || this.discountPercentage <= 0) {
    return false;
  }
  
  const now = new Date();
  
  if (this.discountStartDate && now < this.discountStartDate) {
    return false;
  }
  
  if (this.discountEndDate && now > this.discountEndDate) {
    return false;
  }
  
  return true;
};

// Ensure virtual properties are included in JSON output
MealSchema.set('toJSON', { virtuals: true });
MealSchema.set('toObject', { virtuals: true });

// ✅ Static method to clean up expired discounts
MealSchema.statics.cleanupExpiredDiscounts = async function() {
  const now = new Date();
  
  const result = await this.updateMany(
    {
      discountEndDate: { $lt: now },
      discountPercentage: { $gt: 0 }
    },
    {
      $set: {
        discountPercentage: 0,
        discountStartDate: null,
        discountEndDate: null
      }
    }
  );
  
  return result;
};

// ✅ Pre-save middleware to validate discount dates
MealSchema.pre('save', function(next) {
  if (this.discountPercentage > 0) {
    if (!this.discountStartDate || !this.discountEndDate) {
      return next(new Error('Discount start and end dates are required when setting a discount percentage'));
    }
    
    if (this.discountStartDate >= this.discountEndDate) {
      return next(new Error('Discount end date must be after start date'));
    }
  }
  next();
});

export default mongoose.model('Meal', MealSchema);
