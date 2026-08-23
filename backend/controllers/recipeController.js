const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');

// @desc    Get all recipes with optional query filtering (search, category, sort)
// @route   GET /api/recipes
const getRecipes = async (req, res) => {
  try {
    const { name, category, sort } = req.query;
    let query = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    let sortOptions = { createdAt: -1 }; // Default: Latest

    if (sort) {
      switch (sort) {
        case 'Name A-Z':
          sortOptions = { name: 1 };
          break;
        case 'Name Z-A':
          sortOptions = { name: -1 };
          break;
        case 'Quickest Cooking Time':
          // Sort by cookTime string or numeric extraction
          sortOptions = { cookTime: 1 };
          break;
        case 'Longest Cooking Time':
          sortOptions = { cookTime: -1 };
          break;
        case 'Latest':
        default:
          sortOptions = { createdAt: -1 };
          break;
      }
    }

    const recipes = await Recipe.find(query).sort(sortOptions);
    return res.status(200).json(recipes);
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching recipes', error: error.message });
  }
};

// @desc    Search recipes by name using regex
// @route   GET /api/recipes/search?name=keyword
const searchRecipes = async (req, res) => {
  try {
    const keyword = req.query.name || '';
    const recipes = await Recipe.find({
      name: { $regex: keyword, $options: 'i' },
    }).sort({ createdAt: -1 });

    return res.status(200).json(recipes);
  } catch (error) {
    return res.status(500).json({ message: 'Server error searching recipes', error: error.message });
  }
};

// @desc    Get recipes by category
// @route   GET /api/recipes/category/:category
const getRecipesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    let query = {};
    if (category && category !== 'All') {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    const recipes = await Recipe.find(query).sort({ createdAt: -1 });
    return res.status(200).json(recipes);
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching category recipes', error: error.message });
  }
};

// @desc    Get single recipe by ID
// @route   GET /api/recipes/:id
const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    return res.status(200).json(recipe);
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching recipe', error: error.message });
  }
};

// @desc    Create new recipe
// @route   POST /api/recipes
const createRecipe = async (req, res) => {
  try {
    const { name, image, description, ingredients, steps, cookTime, difficulty, category } = req.body;

    if (!name || !image || !category || !cookTime) {
      return res.status(400).json({ message: 'Please provide all required fields (name, image, category, cookTime)' });
    }

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: 'At least one ingredient is required' });
    }

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({ message: 'At least one preparation step is required' });
    }

    const newRecipe = new Recipe({
      name,
      image,
      description: description || '',
      ingredients,
      steps,
      cookTime,
      difficulty: difficulty || 'Medium',
      category,
    });

    const savedRecipe = await newRecipe.save();
    return res.status(201).json(savedRecipe);
  } catch (error) {
    return res.status(500).json({ message: 'Server error creating recipe', error: error.message });
  }
};

// @desc    Update recipe by ID
// @route   PUT /api/recipes/:id
const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const { name, image, description, ingredients, steps, cookTime, difficulty, category } = req.body;

    if (name) recipe.name = name;
    if (image) recipe.image = image;
    if (description !== undefined) recipe.description = description;
    if (ingredients && Array.isArray(ingredients)) recipe.ingredients = ingredients;
    if (steps && Array.isArray(steps)) recipe.steps = steps;
    if (cookTime) recipe.cookTime = cookTime;
    if (difficulty) recipe.difficulty = difficulty;
    if (category) recipe.category = category;

    const updatedRecipe = await recipe.save();
    return res.status(200).json(updatedRecipe);
  } catch (error) {
    return res.status(500).json({ message: 'Server error updating recipe', error: error.message });
  }
};

// @desc    Delete recipe by ID
// @route   DELETE /api/recipes/:id
const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    await Recipe.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Recipe deleted successfully', id });
  } catch (error) {
    return res.status(500).json({ message: 'Server error deleting recipe', error: error.message });
  }
};

module.exports = {
  getRecipes,
  searchRecipes,
  getRecipesByCategory,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};
