import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { recipeService } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Plus, Trash2, MoveUp, MoveDown, Save } from 'lucide-react';

const CATEGORIES = [
  'Breakfast',
  'Brunch',
  'Lunch',
  'Dinner',
  'Snacks',
  'Street Food',
  'Vegetarian',
  'Vegan',
  'Desserts',
  'Beverages',
  'Healthy',
  'Quick Meals',
  'International',
];

const EditRecipePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    description: '',
    cookTime: '',
    difficulty: 'Medium',
    category: 'Dinner',
  });

  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        setLoading(true);
        const data = await recipeService.getRecipeById(id);
        setFormData({
          name: data.name || '',
          image: data.image || '',
          description: data.description || '',
          cookTime: data.cookTime || '',
          difficulty: data.difficulty || 'Medium',
          category: data.category || 'Dinner',
        });
        setIngredients(data.ingredients && data.ingredients.length > 0 ? data.ingredients : ['']);
        setSteps(data.steps && data.steps.length > 0 ? data.steps : ['']);
      } catch (err) {
        console.error('Error fetching recipe for edit:', err);
        showError('Could not load recipe details for editing.');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipeData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleIngredientChange = (idx, value) => {
    const updated = [...ingredients];
    updated[idx] = value;
    setIngredients(updated);
  };

  const addIngredientField = () => setIngredients((prev) => [...prev, '']);

  const removeIngredientField = (idx) => {
    if (ingredients.length === 1) return;
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveIngredient = (idx, direction) => {
    if ((direction === -1 && idx === 0) || (direction === 1 && idx === ingredients.length - 1)) return;
    const updated = [...ingredients];
    const temp = updated[idx];
    updated[idx] = updated[idx + direction];
    updated[idx + direction] = temp;
    setIngredients(updated);
  };

  const handleStepChange = (idx, value) => {
    const updated = [...steps];
    updated[idx] = value;
    setSteps(updated);
  };

  const addStepField = () => setSteps((prev) => [...prev, '']);

  const removeStepField = (idx) => {
    if (steps.length === 1) return;
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveStep = (idx, direction) => {
    if ((direction === -1 && idx === 0) || (direction === 1 && idx === steps.length - 1)) return;
    const updated = [...steps];
    const temp = updated[idx];
    updated[idx] = updated[idx + direction];
    updated[idx + direction] = temp;
    setSteps(updated);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Recipe name is required.';
    if (!formData.image.trim()) newErrors.image = 'Image URL is required.';
    if (!formData.cookTime.trim()) newErrors.cookTime = 'Cooking time is required.';
    if (!formData.category) newErrors.category = 'Please select a category.';

    const validIngredients = ingredients.filter((ing) => ing.trim() !== '');
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required.';
    }

    const validSteps = steps.filter((step) => step.trim() !== '');
    if (validSteps.length === 0) {
      newErrors.steps = 'At least one preparation step is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      showError('Please fix validation errors before updating.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        ingredients: ingredients.filter((ing) => ing.trim() !== ''),
        steps: steps.filter((step) => step.trim() !== ''),
      };

      await recipeService.updateRecipe(id, payload);
      showSuccess('Recipe updated successfully!');
      navigate('/admin');
    } catch (err) {
      console.error('Error updating recipe:', err);
      showError(err.response?.data?.message || 'Failed to update recipe.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading recipe details for editing..." />;

  return (
    <div style={{ padding: '3rem 0 6rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <Link
          to="/admin"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#172A3A',
            fontWeight: 600,
            marginBottom: '2rem',
          }}
        >
          <ArrowLeft size={18} /> Back to Admin Dashboard
        </Link>

        <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF' }}>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: '2.2rem', color: '#172A3A', marginBottom: '0.5rem' }}>
            Edit Recipe
          </h1>
          <p style={{ color: '#718096', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
            Update the recipe details, ingredients or preparation steps below.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Field 1: Name */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#172A3A', marginBottom: '0.5rem' }}>
                Recipe Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: errors.name ? '1.5px solid #C44536' : '1px solid #CBD5E0',
                  outline: 'none',
                  fontSize: '0.95rem',
                }}
              />
              {errors.name && <span style={{ color: '#C44536', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.name}</span>}
            </div>

            {/* Field 2: Image URL */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#172A3A', marginBottom: '0.5rem' }}>
                Image URL *
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: errors.image ? '1.5px solid #C44536' : '1px solid #CBD5E0',
                  outline: 'none',
                  fontSize: '0.95rem',
                }}
              />
              {errors.image && <span style={{ color: '#C44536', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{errors.image}</span>}
            </div>

            {/* Field 3: Description */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#172A3A', marginBottom: '0.5rem' }}>
                Short Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E0',
                  outline: 'none',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Field 4 & 5 & 6: Cook Time, Difficulty, Category */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#172A3A', marginBottom: '0.5rem' }}>
                  Cooking Time *
                </label>
                <input
                  type="text"
                  name="cookTime"
                  value={formData.cookTime}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: errors.cookTime ? '1.5px solid #C44536' : '1px solid #CBD5E0',
                    outline: 'none',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#172A3A', marginBottom: '0.5rem' }}>
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E0',
                    outline: 'none',
                    fontSize: '0.95rem',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#172A3A', marginBottom: '0.5rem' }}>
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: errors.category ? '1.5px solid #C44536' : '1px solid #CBD5E0',
                    outline: 'none',
                    fontSize: '0.95rem',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Field 7: Ingredients */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 700, fontSize: '1rem', color: '#172A3A' }}>
                  Ingredients List *
                </label>
                <button
                  type="button"
                  onClick={addIngredientField}
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                >
                  <Plus size={14} /> Add Ingredient
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {ingredients.map((ing, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={ing}
                      onChange={(e) => handleIngredientChange(idx, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.65rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E0',
                        fontSize: '0.9rem',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => moveIngredient(idx, -1)}
                      disabled={idx === 0}
                      style={{ opacity: idx === 0 ? 0.3 : 1, color: '#718096', padding: '6px' }}
                    >
                      <MoveUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveIngredient(idx, 1)}
                      disabled={idx === ingredients.length - 1}
                      style={{ opacity: idx === ingredients.length - 1 ? 0.3 : 1, color: '#718096', padding: '6px' }}
                    >
                      <MoveDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeIngredientField(idx)}
                      style={{ color: '#C44536', padding: '6px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Field 8: Steps */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 700, fontSize: '1rem', color: '#172A3A' }}>
                  Preparation Steps *
                </label>
                <button
                  type="button"
                  onClick={addStepField}
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                >
                  <Plus size={14} /> Add Step
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {steps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span
                      style={{
                        padding: '0.65rem 0.5rem',
                        fontWeight: 700,
                        color: '#6FAF98',
                        fontFamily: 'Playfair Display',
                        fontSize: '1rem',
                      }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <textarea
                      rows={2}
                      value={step}
                      onChange={(e) => handleStepChange(idx, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.65rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E0',
                        fontSize: '0.9rem',
                        resize: 'vertical',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => moveStep(idx, -1)}
                      disabled={idx === 0}
                      style={{ opacity: idx === 0 ? 0.3 : 1, color: '#718096', padding: '6px', marginTop: '6px' }}
                    >
                      <MoveUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(idx, 1)}
                      disabled={idx === steps.length - 1}
                      style={{ opacity: idx === steps.length - 1 ? 0.3 : 1, color: '#718096', padding: '6px', marginTop: '6px' }}
                    >
                      <MoveDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStepField(idx)}
                      style={{ color: '#C44536', padding: '6px', marginTop: '6px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Action Buttons */}
            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Link to="/admin" className="btn btn-outline">
                Cancel
              </Link>
              <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                <Save size={18} /> {submitting ? 'Updating...' : 'Update Recipe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRecipePage;
