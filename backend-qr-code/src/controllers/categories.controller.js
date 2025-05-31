import Category from '../models/Category.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ restaurant: req.restaurant.id });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const imageUrl = req.file?.path;

    if (!name?.en || !name?.ar || !imageUrl) {
      return res.status(400).json({ message: 'Please provide category name in both English and Arabic, and an image.' });
    }

    // Check if category already exists for this restaurant
    const existingCategory = await Category.findOne({
      restaurant: req.restaurant.id,
      $or: [
        { 'name.en': name.en },
        { 'name.ar': name.ar }
      ]
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists in either English or Arabic.' });
    }

    const newCategory = new Category({
      restaurant: req.restaurant.id,
      name: {
        en: name.en,
        ar: name.ar
      },
      image: imageUrl,
      description: description ? {
        en: description.en || '',
        ar: description.ar || ''
      } : { en: '', ar: '' }
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);

  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      restaurant: req.restaurant.id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const imageUrl = req.file?.path;

    const category = await Category.findOne({
      _id: req.params.id,
      restaurant: req.restaurant.id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name) {
      // Check if the new name conflicts with other categories
      if (name.en !== category.name.en || name.ar !== category.name.ar) {
        const existingCategory = await Category.findOne({
          restaurant: req.restaurant.id,
          _id: { $ne: category._id },
          $or: [
            { 'name.en': name.en },
            { 'name.ar': name.ar }
          ]
        });

        if (existingCategory) {
          return res.status(400).json({ message: 'Category with this name already exists in either English or Arabic.' });
        }
      }

      category.name = {
        en: name.en || category.name.en,
        ar: name.ar || category.name.ar
      };
    }

    if (description) {
      category.description = {
        en: description.en || category.description.en,
        ar: description.ar || category.description.ar
      };
    }

    if (imageUrl) {
      category.image = imageUrl;
    }

    const updatedCategory = await category.save();
    res.json(updatedCategory);

  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      restaurant: req.restaurant.id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted successfully' });

  } catch (error) {
    next(error);
  }
}; 
