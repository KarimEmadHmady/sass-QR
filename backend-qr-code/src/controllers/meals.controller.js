import Meal from '../models/Meal.js';
import Category from '../models/Category.js';

export const getMeals = async (req, res, next) => {
  try {
    const meals = await Meal.find({ restaurant: req.restaurant.id }).populate('category');
    
    // Add isDiscountActive and discountedPrice to each meal
    const mealsWithDiscounts = meals.map(meal => {
      const mealObj = meal.toObject();
      mealObj.isDiscountActive = meal.isDiscountActive();
      mealObj.discountedPrice = meal.discountedPrice;
      return mealObj;
    });
    
    res.json(mealsWithDiscounts);
  } catch (error) {
    next(error);  
  }
};

export const createMeal = async (req, res, next) => {
  try {
    const { name, description, price, categoryId, discountPercentage, discountStartDate, discountEndDate } = req.body;
    const imageUrl = req.file?.path;

    if (!name?.en || !name?.ar || !description?.en || !description?.ar || !price || !imageUrl || !categoryId) {
      return res.status(400).json({ 
        message: 'Please provide all required fields including name and description in both English and Arabic, price, image, and category.' 
      });
    }

    // Validate discount fields
    if (discountPercentage !== undefined) {
      if (discountPercentage < 0 || discountPercentage > 100) {
        return res.status(400).json({ 
          message: 'Discount percentage must be between 0 and 100' 
        });
      }
      
      if (discountPercentage > 0) {
        if (!discountStartDate || !discountEndDate) {
          return res.status(400).json({ 
            message: 'Discount start and end dates are required when setting a discount percentage' 
          });
        }
        
        const startDate = new Date(discountStartDate);
        const endDate = new Date(discountEndDate);
        
        if (startDate >= endDate) {
          return res.status(400).json({ 
            message: 'Discount end date must be after start date' 
          });
        }
        
        if (startDate < new Date()) {
          return res.status(400).json({ 
            message: 'Discount start date cannot be in the past' 
          });
        }
      }
    }

    // Verify that the category exists and belongs to this restaurant
    const category = await Category.findOne({ 
      _id: categoryId,
      restaurant: req.restaurant.id 
    });
    
    if (!category) {
      return res.status(400).json({ message: 'Selected category does not exist or does not belong to this restaurant.' });
    }

    const newMeal = new Meal({
      restaurant: req.restaurant.id,
      name: {
        en: name.en,
        ar: name.ar
      },
      description: {
        en: description.en,
        ar: description.ar
      },
      image: imageUrl,
      category: categoryId,
      price: parseFloat(price),
      rating: 0,
      reviews: [],
      discountPercentage: discountPercentage || 0,
      discountStartDate: discountStartDate ? new Date(discountStartDate) : null,
      discountEndDate: discountEndDate ? new Date(discountEndDate) : null
    });

    const savedMeal = await newMeal.save();
    const populatedMeal = await savedMeal.populate('category');
    
    // Add isDiscountActive and discountedPrice to the response
    const mealObj = populatedMeal.toObject();
    mealObj.isDiscountActive = populatedMeal.isDiscountActive();
    mealObj.discountedPrice = populatedMeal.discountedPrice;
    
    res.status(201).json(mealObj);

  } catch (error) {
    console.error('Error stack trace:', error.stack);
    next(error); 
  }
};

export const getMealById = async (req, res, next) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      restaurant: req.restaurant.id
    }).populate('category');

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    // Add isDiscountActive and discountedPrice to the meal
    const mealObj = meal.toObject();
    mealObj.isDiscountActive = meal.isDiscountActive();
    mealObj.discountedPrice = meal.discountedPrice;

    res.json(mealObj);

  } catch (error) {
    next(error);
  }
};

export const updateMeal = async (req, res, next) => {
  try {
    const { name, description, price, categoryId, discountPercentage, discountStartDate, discountEndDate } = req.body;
    const imageUrl = req.file?.path;

    const meal = await Meal.findOne({
      _id: req.params.id,
      restaurant: req.restaurant.id
    });

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    // Validate discount fields
    if (discountPercentage !== undefined) {
      if (discountPercentage < 0 || discountPercentage > 100) {
        return res.status(400).json({ 
          message: 'Discount percentage must be between 0 and 100' 
        });
      }
      
      if (discountPercentage > 0) {
        if (!discountStartDate || !discountEndDate) {
          return res.status(400).json({ 
            message: 'Discount start and end dates are required when setting a discount percentage' 
          });
        }
        
        const startDate = new Date(discountStartDate);
        const endDate = new Date(discountEndDate);
        
        if (startDate >= endDate) {
          return res.status(400).json({ 
            message: 'Discount end date must be after start date' 
          });
        }
        
        if (startDate < new Date()) {
          return res.status(400).json({ 
            message: 'Discount start date cannot be in the past' 
          });
        }
      }
    }

    if (categoryId) {
      // Verify that the new category exists and belongs to this restaurant
      const category = await Category.findOne({ 
        _id: categoryId,
        restaurant: req.restaurant.id 
      });
      
      if (!category) {
        return res.status(400).json({ message: 'Selected category does not exist or does not belong to this restaurant.' });
      }
      meal.category = categoryId;
    }

    if (name) {
      meal.name = {
        en: name.en || meal.name.en,
        ar: name.ar || meal.name.ar
      };
    }

    if (description) {
      meal.description = {
        en: description.en || meal.description.en,
        ar: description.ar || meal.description.ar
      };
    }

    meal.price = price ? parseFloat(price) : meal.price;
    if (imageUrl) meal.image = imageUrl;

    // Update discount fields
    if (discountPercentage !== undefined) {
      meal.discountPercentage = discountPercentage;
      meal.discountStartDate = discountStartDate ? new Date(discountStartDate) : null;
      meal.discountEndDate = discountEndDate ? new Date(discountEndDate) : null;
    }

    const updatedMeal = await meal.save();
    const populatedMeal = await updatedMeal.populate('category');
    
    // Add isDiscountActive and discountedPrice to the response
    const mealObj = populatedMeal.toObject();
    mealObj.isDiscountActive = populatedMeal.isDiscountActive();
    mealObj.discountedPrice = populatedMeal.discountedPrice;
    
    res.json(mealObj);

  } catch (error) {
    next(error); 
  }
};

export const deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      restaurant: req.restaurant.id
    });

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    await meal.deleteOne();
    res.json({ message: 'Meal deleted successfully' });

  } catch (error) {
    next(error);  
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    // نجيب الوجبة حسب ID فقط
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    // تحديد معلومات المستخدم
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    // منع صاحب المطعم من تقييم أكل نفسه
    if (req.restaurant && meal.restaurant.toString() === req.restaurant._id.toString()) {
      return res.status(403).json({ message: 'You cannot review your own meal' });
    }

    // بناء الريفيو
    const review = {
      user: req.user._id,
      name: req.user.username || req.user.name,
      rating: parseInt(rating, 10),
      comment,
      createdAt: new Date()
    };

    // دفع الريفيو داخل meal
    meal.reviews.push(review);

    // حساب المتوسط الجديد
    meal.rating =
      meal.reviews.reduce((acc, item) => item.rating + acc, 0) /
      meal.reviews.length;

    // حفظ الوجبة
    await meal.save();

    res.status(201).json({
      message: 'Review added successfully',
      review
    });

  } catch (error) {
    console.error('Error in addReview:', error);
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    
    // تغيير طريقة البحث عن الوجبة
    const meal = await Meal.findById(req.params.mealId);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    const review = meal.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // التحقق من أن المطعم هو صاحب الوجبة
    if (meal.restaurant.toString() !== req.restaurant._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to edit this review' });
    }

    // تعديل التقييم
    review.rating = parseInt(rating, 10) || review.rating;
    review.comment = comment || review.comment;

    // تحديث متوسط التقييم
    meal.rating = meal.reviews.reduce((acc, item) => item.rating + acc, 0) / meal.reviews.length;

    await meal.save();
    res.json({ message: 'Review updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.mealId,
      restaurant: req.restaurant.id
    });

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    const reviewIndex = meal.reviews.findIndex(review => review.id.toString() === req.params.reviewId);
    
    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = meal.reviews[reviewIndex];

    // السماح للمطعم أو صاحب التقييم بالحذف
    if (req.restaurant && meal.restaurant.toString() === req.restaurant.id) {
      // المطعم يمكنه حذف التقييم
      meal.reviews.splice(reviewIndex, 1);
    } else if (req.user && req.user.id === review.user.toString()) {
      // صاحب التقييم يمكنه حذف تقييمه
      meal.reviews.splice(reviewIndex, 1);
    } else {
      return res.status(403).json({ message: 'You are not authorized to delete this review' });
    }

    meal.rating = meal.reviews.length
      ? meal.reviews.reduce((acc, item) => item.rating + acc, 0) / meal.reviews.length
      : 0;

    await meal.save();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ✅ دالة إضافة خصم للوجبة
export const setDiscount = async (req, res, next) => {
  try {
    const { discountPercentage, discountStartDate, discountEndDate } = req.body;

    // التحقق من وجود الوجبة
    const meal = await Meal.findOne({
      _id: req.params.id,
      restaurant: req.restaurant.id
    });

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    // التحقق من صحة بيانات الخصم
    if (!discountPercentage || discountPercentage < 0 || discountPercentage > 100) {
      return res.status(400).json({ 
        message: 'Discount percentage must be between 0 and 100' 
      });
    }

    if (!discountStartDate || !discountEndDate) {
      return res.status(400).json({ 
        message: 'Discount start and end dates are required' 
      });
    }

    const startDate = new Date(discountStartDate);
    const endDate = new Date(discountEndDate);
    
    if (startDate >= endDate) {
      return res.status(400).json({ 
        message: 'Discount end date must be after start date' 
      });
    }
    
    if (startDate < new Date()) {
      return res.status(400).json({ 
        message: 'Discount start date cannot be in the past' 
      });
    }

    // تحديث بيانات الخصم
    meal.discountPercentage = discountPercentage;
    meal.discountStartDate = startDate;
    meal.discountEndDate = endDate;

    const updatedMeal = await meal.save();
    const populatedMeal = await updatedMeal.populate('category');

    // Add isDiscountActive and discountedPrice to the response
    const mealObj = populatedMeal.toObject();
    mealObj.isDiscountActive = populatedMeal.isDiscountActive();
    mealObj.discountedPrice = populatedMeal.discountedPrice;

    res.json({
      message: 'Discount set successfully',
      meal: mealObj
    });

  } catch (error) {
    next(error);
  }
};

// ✅ دالة إزالة الخصم من الوجبة
export const removeDiscount = async (req, res, next) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      restaurant: req.restaurant.id
    });

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    // إزالة بيانات الخصم
    meal.discountPercentage = 0;
    meal.discountStartDate = null;
    meal.discountEndDate = null;

    const updatedMeal = await meal.save();
    const populatedMeal = await updatedMeal.populate('category');

    res.json({
      message: 'Discount removed successfully',
      meal: populatedMeal
    });

  } catch (error) {
    next(error);
  }
};

// ✅ دالة جلب الوجبات التي لديها خصم نشط
export const getActiveDiscounts = async (req, res, next) => {
  try {
    const now = new Date();
    
    const mealsWithDiscounts = await Meal.find({
      restaurant: req.restaurant.id,
      discountPercentage: { $gt: 0 },
      discountStartDate: { $lte: now },
      discountEndDate: { $gte: now }
    }).populate('category');

    // Add isDiscountActive and discountedPrice to each meal
    const mealsWithDiscountInfo = mealsWithDiscounts.map(meal => {
      const mealObj = meal.toObject();
      mealObj.isDiscountActive = meal.isDiscountActive();
      mealObj.discountedPrice = meal.discountedPrice;
      return mealObj;
    });

    res.json({
      message: 'Active discounts retrieved successfully',
      meals: mealsWithDiscountInfo,
      count: mealsWithDiscountInfo.length
    });

  } catch (error) {
    next(error);
  }
};

// ✅ دالة تنظيف الخصومات المنتهية
export const cleanupExpiredDiscounts = async (req, res, next) => {
  try {
    const result = await Meal.cleanupExpiredDiscounts();
    
    res.json({
      message: 'Expired discounts cleaned up successfully',
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    next(error);
  }
};

// ✅ دالة إضافة خصم جماعي للوجبات المحددة
export const bulkSetDiscount = async (req, res, next) => {
  try {
    const { mealIds, discountPercentage, discountStartDate, discountEndDate } = req.body;

    // التحقق من البيانات المطلوبة
    if (!mealIds || !Array.isArray(mealIds) || mealIds.length === 0) {
      return res.status(400).json({ 
        message: 'Please provide an array of meal IDs' 
      });
    }

    if (!discountPercentage || discountPercentage < 0 || discountPercentage > 100) {
      return res.status(400).json({ 
        message: 'Discount percentage must be between 0 and 100' 
      });
    }

    if (!discountStartDate || !discountEndDate) {
      return res.status(400).json({ 
        message: 'Discount start and end dates are required' 
      });
    }

    const startDate = new Date(discountStartDate);
    const endDate = new Date(discountEndDate);
    
    if (startDate >= endDate) {
      return res.status(400).json({ 
        message: 'Discount end date must be after start date' 
      });
    }
    
    if (startDate < new Date()) {
      return res.status(400).json({ 
        message: 'Discount start date cannot be in the past' 
      });
    }

    // تحديث جميع الوجبات المحددة
    const result = await Meal.updateMany(
      {
        _id: { $in: mealIds },
        restaurant: req.restaurant.id
      },
      {
        discountPercentage,
        discountStartDate: startDate,
        discountEndDate: endDate
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        message: 'No meals found with the provided IDs' 
      });
    }

    res.json({
      message: `Discount applied successfully to ${result.modifiedCount} meals`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });

  } catch (error) {
    console.error('Bulk discount error:', error);
    next(error);
  }
};

// ✅ دالة حذف جماعي للوجبات المحددة
export const bulkDeleteMeals = async (req, res, next) => {
  try {
    const { mealIds } = req.body;

    // التحقق من البيانات المطلوبة
    if (!mealIds || !Array.isArray(mealIds) || mealIds.length === 0) {
      return res.status(400).json({ 
        message: 'Please provide an array of meal IDs' 
      });
    }

    // حذف جميع الوجبات المحددة
    const result = await Meal.deleteMany({
      _id: { $in: mealIds },
      restaurant: req.restaurant.id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        message: 'No meals found with the provided IDs' 
      });
    }

    res.json({
      message: `Successfully deleted ${result.deletedCount} meals`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    next(error);
  }
};
