const express = require('express');
const router = express.Router();
const {
  getRecipes,
  searchRecipes,
  getRecipesByCategory,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} = require('../controllers/recipeController');

// Search & Category specific routes (placed before :id route)
router.get('/search', searchRecipes);
router.get('/category/:category', getRecipesByCategory);

// General collection routes
router.route('/')
  .get(getRecipes)
  .post(createRecipe);

// Single item routes by ID
router.route('/:id')
  .get(getRecipeById)
  .put(updateRecipe)
  .delete(deleteRecipe);

module.exports = router;
