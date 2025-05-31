import mongoose from 'mongoose';

const TranslationSchema = new mongoose.Schema({
  en: { type: String, required: true },
  ar: { type: String, required: true }
}, { _id: false });

const CategorySchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    name: { 
      type: TranslationSchema,
      required: true
    },
    image: { 
      type: String, 
      required: true 
    },
    description: { 
      type: TranslationSchema,
      required: false,
      default: { en: '', ar: '' }
    }
  },
  { timestamps: true }
);

// Remove unique constraint from name and add compound index
CategorySchema.index({ 'restaurant': 1, 'name.en': 1 }, { unique: true });
CategorySchema.index({ 'restaurant': 1, 'name.ar': 1 }, { unique: true });

export default mongoose.model('Category', CategorySchema); 