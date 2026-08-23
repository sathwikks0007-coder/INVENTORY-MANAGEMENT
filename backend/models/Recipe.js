const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Recipe name is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    ingredients: {
      type: [String],
      required: [true, 'At least one ingredient is required'],
      validate: {
        validator: function (arr) {
          return arr && arr.length > 0;
        },
        message: 'At least one ingredient is required',
      },
    },
    steps: {
      type: [String],
      required: [true, 'At least one preparation step is required'],
      validate: {
        validator: function (arr) {
          return arr && arr.length > 0;
        },
        message: 'At least one step is required',
      },
    },
    cookTime: {
      type: String,
      required: [true, 'Cooking time is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Intermediate', 'Advanced'],
      default: 'Medium',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'recipes',
  }
);

// Search index for fast case-insensitive query
recipeSchema.index({ name: 'text', category: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
