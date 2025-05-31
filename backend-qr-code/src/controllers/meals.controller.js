import Meal from '../models/Meal.js';
import Category from '../models/Category.js';

export const getMeals = async (req, res, next) => {
  try {
    const meals = await Meal.find({ restaurant: req.restaurant.id }).populate('category');
    res.json(meals);
  } catch (error) {
    next(error);  
  }
};

export const createMeal = async (req, res, next) => {
  try {
    const { name, description, price, categoryId } = req.body;
    const imageUrl = req.file?.path;

    if (!name?.en || !name?.ar || !description?.en || !description?.ar || !price || !imageUrl || !categoryId) {
      return res.status(400).json({ 
        message: 'Please provide all required fields including name and description in both English and Arabic, price, image, and category.' 
      });
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
    });

    const savedMeal = await newMeal.save();
    const populatedMeal = await savedMeal.populate('category');
    res.status(201).json(populatedMeal);

  } catch (error) {
    console.log('Request file:', req.file);
    console.log('Request body:', req.body);
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

    res.json(meal);

  } catch (error) {
    next(error);
  }
};

export const updateMeal = async (req, res, next) => {
  try {
    const { name, description, price, categoryId } = req.body;
    const imageUrl = req.file?.path;

    const meal = await Meal.findOne({
      _id: req.params.id,
      restaurant: req.restaurant.id
    });

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
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

    const updatedMeal = await meal.save();
    const populatedMeal = await updatedMeal.populate('category');
    res.json(populatedMeal);

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

    const meal = await Meal.findOne({
      _id: req.params.id,
      restaurant: req.restaurant.id
    });

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    const review = {
      user: req.user.id,
      name: req.user.username,
      rating: parseInt(rating, 10),
      comment,
    };

    meal.reviews.push(review);
    meal.rating = meal.reviews.reduce((acc, item) => item.rating + acc, 0) / meal.reviews.length;

    await meal.save();
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Error in addReview:', error);
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const meal = await Meal.findOne({
      _id: req.params.mealId,
      restaurant: req.restaurant.id
    });

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    const review = meal.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (req.user.role !== 'admin' && req.user.id !== review.user.toString()) {
      return res.status(403).json({ message: 'You are not authorized to edit this review' });
    }

    review.rating = parseInt(rating, 10) || review.rating;
    review.comment = comment || review.comment;

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

    if (req.user.role !== 'admin' && req.user.id !== review.user.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this review' });
    }

    meal.reviews.splice(reviewIndex, 1);

    meal.rating = meal.reviews.length
      ? meal.reviews.reduce((acc, item) => item.rating + acc, 0) / meal.reviews.length
      : 0;

    await meal.save();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};
