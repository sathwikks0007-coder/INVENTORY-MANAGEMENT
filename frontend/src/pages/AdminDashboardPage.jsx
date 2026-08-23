import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recipeService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { Plus, Edit, Trash2, BookOpen, Tag, Clock, Calendar, Search } from 'lucide-react';

const AdminDashboardPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, recipeId: null, recipeName: '' });

  const { showSuccess, showError } = useToast();

  const fetchAdminRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getAllRecipes();
      setRecipes(data);
    } catch (err) {
      console.error('Error fetching admin recipes:', err);
      showError('Failed to load recipes for admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminRecipes();
  }, []);

  const handleDeleteClick = (recipe) => {
    setDeleteModal({
      isOpen: true,
      recipeId: recipe._id,
      recipeName: recipe.name,
    });
  };

  const handleConfirmDelete = async () => {
    const { recipeId, recipeName } = deleteModal;
    setDeleteModal({ isOpen: false, recipeId: null, recipeName: '' });

    try {
      await recipeService.deleteRecipe(recipeId);
      showSuccess(`Recipe "${recipeName}" deleted successfully`);
      setRecipes((prev) => prev.filter((r) => r._id !== recipeId));
    } catch (err) {
      console.error('Error deleting recipe:', err);
      showError('Failed to delete recipe. Please try again.');
    }
  };

  const filteredRecipes = recipes.filter((r) =>
    r.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const uniqueCategoriesCount = new Set(recipes.map((r) => r.category)).size;

  return (
    <div style={{ padding: '3rem 0 6rem' }}>
      <div className="container">
        {/* Header & Actions */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <div>
            <h1 style={{ fontFamily: 'Playfair Display', fontSize: '2.4rem', color: '#172A3A', marginBottom: '0.4rem' }}>
              Admin Recipe Collection
            </h1>
            <p style={{ color: '#718096', fontSize: '1rem' }}>
              Manage, edit, create, and oversee all recipes on Plate & Pantry.
            </p>
          </div>

          <Link to="/admin/add" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
            <Plus size={20} /> Add New Recipe
          </Link>
        </div>

        {/* Stats Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Card 1: Total Recipes */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                backgroundColor: '#EBF4F0',
                color: '#2F6B56',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={26} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600, textTransform: 'uppercase' }}>
                TOTAL RECIPES
              </span>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', color: '#172A3A', lineHeight: 1.1 }}>
                {recipes.length}
              </h3>
            </div>
          </div>

          {/* Card 2: Total Categories */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                backgroundColor: '#FDF6EC',
                color: '#9C6721',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Tag size={26} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600, textTransform: 'uppercase' }}>
                ACTIVE CATEGORIES
              </span>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', color: '#172A3A', lineHeight: 1.1 }}>
                {uniqueCategoriesCount}
              </h3>
            </div>
          </div>
        </div>

        {/* Filter Search */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', maxWidth: '360px', width: '100%' }}>
            <Search size={18} color="#718096" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Filter by recipe name or category..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.5rem',
                borderRadius: '9999px',
                border: '1px solid #E2E8F0',
                outline: 'none',
                fontSize: '0.9rem',
              }}
            />
          </div>
        </div>

        {/* Content Table / Cards */}
        {loading ? (
          <LoadingSpinner message="Loading admin dashboard..." />
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(23, 42, 58, 0.05)',
                  border: '1px solid #E2E8F0',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#172A3A', color: '#FFFFFF', textAlign: 'left', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '1rem 1.25rem' }}>Recipe</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Category</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Cook Time</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Created Date</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipes.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
                        No recipes found matching "{searchFilter}".
                      </td>
                    </tr>
                  ) : (
                    filteredRecipes.map((recipe) => (
                      <tr
                        key={recipe._id}
                        style={{
                          borderBottom: '1px solid #E2E8F0',
                          transition: 'background-color 0.15s',
                        }}
                      >
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img
                              src={recipe.image}
                              alt={recipe.name}
                              style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80';
                              }}
                            />
                            <div>
                              <Link to={`/recipe/${recipe._id}`} style={{ fontWeight: 700, color: '#172A3A', fontSize: '0.98rem' }}>
                                {recipe.name}
                              </Link>
                              <p style={{ fontSize: '0.8rem', color: '#718096' }}>
                                {recipe.difficulty || 'Medium'} difficulty
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span className="badge">{recipe.category}</span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.9rem', color: '#263238' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Clock size={14} color="#6FAF98" /> {recipe.cookTime}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#718096' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={14} /> {new Date(recipe.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <Link
                              to={`/admin/edit/${recipe._id}`}
                              style={{
                                padding: '0.45rem 0.85rem',
                                borderRadius: '8px',
                                backgroundColor: '#EBF4F0',
                                color: '#2F6B56',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}
                            >
                              <Edit size={14} /> Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(recipe)}
                              style={{
                                padding: '0.45rem 0.85rem',
                                borderRadius: '8px',
                                backgroundColor: '#FDF2F0',
                                color: '#C44536',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards View */}
            <div className="admin-mobile-cards" style={{ display: 'none', flexDirection: 'column', gap: '1rem' }}>
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe._id}
                  className="card"
                  style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}
                >
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <span className="badge" style={{ marginBottom: '0.25rem' }}>{recipe.category}</span>
                    <h4 style={{ fontFamily: 'Playfair Display', fontSize: '1.1rem', color: '#172A3A' }}>
                      {recipe.name}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.5rem' }}>
                      {recipe.cookTime} • {recipe.difficulty || 'Medium'}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/admin/edit/${recipe._id}`} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                        Edit
                      </Link>
                      <button onClick={() => handleDeleteClick(recipe)} className="btn btn-danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Recipe?"
        message={`Are you sure you want to delete "${deleteModal.recipeName}"? This action will permanently remove it from the collection.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, recipeId: null, recipeName: '' })}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />

      <style>{`
        @media (max-width: 768px) {
          .admin-table-wrapper { display: none !important; }
          .admin-mobile-cards { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardPage;
