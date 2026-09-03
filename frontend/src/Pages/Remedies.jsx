import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Remedies.css';
import { subscribeRemedies } from '../services/remedyService';
import { getImageUrl } from '../api/config';

function Remedies() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);

  // Subscribe to real-time remedies from database collection
  useEffect(() => {
    setIsLoaded(true);
    const unsubscribe = subscribeRemedies(setProducts);
    return () => unsubscribe();
  }, []);

  // Filter Tabs definition
  const filterTabs = [
    'All',
    'Immunity',
    'Dietary',
    'Haircare',
    'Skincare',
    'Beauty Care',
    'Women',
    'Men',
    'Eyecare',
    'Joint Pain',
    'Classical Formulations',
    'Patent & Proprietary Medicines',
    'Single Herb Supplements',
    'Personal Care & Cosmetics',
    'FMCG',
    'Agriculture & Veterinary',
    'Others'
  ];

  // Filter products by both the selected category and the current search term.
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "All"
      || (Array.isArray(product.category)
          ? product.category.some(c => String(c).toLowerCase().includes(activeCategory.toLowerCase()))
          : String(product.category || "").toLowerCase().includes(activeCategory.toLowerCase()));
    
    const searchableText = [
      product.name,
      product.tag,
      product.description,
      product.specifications?.benefits,
      ...(Array.isArray(product.category) ? product.category : [product.category]),
    ].join(' ').toLowerCase();

    const matchesSearch = searchableText.includes(searchQuery.trim().toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleSearch = (event) => {
    event.preventDefault();
  };

  return (
    <div className="remedies-page-layout light-theme">
      {/* Magical Ambient Effects */}
      <div className="magical-orb orb-1"></div>
      <div className="magical-orb orb-2"></div>
      
      {/* Floating Exit Button */}
      <button 
        className={`exit-btn ${isLoaded ? 'animate-in' : ''}`} 
        onClick={() => navigate('/')}
        aria-label="Close page"
      >
        <i className="bi bi-x"></i>
      </button>

      <div className="container py-5">
        <header className={`remedies-header ${isLoaded ? 'animate-in' : ''}`}>
          <span className="section-kicker">Siddheswari Apothecary</span>
          <h1 className="page-heading">Complete Natural Remedies</h1>
          <p className="section-subtext mx-auto">
            Browse our full collection of authentic Ayurvedic formulations, meticulously crafted from nature's rarest botanicals to restore balance and vitality.
          </p>
          <div className="gold-divider"></div>
        </header>

        {/* Product Search */}
        <form className={`remedies-search-container ${isLoaded ? 'animate-in' : ''}`} onSubmit={handleSearch} style={{ animationDelay: '0.15s' }}>
          <label className="visually-hidden" htmlFor="remedies-search">Search remedies</label>
          <div className="remedies-search-box">
            <i className="bi bi-search remedies-search-icon"></i>
            <input
              id="remedies-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search remedies, benefits, or categories"
            />
            <button type="submit" className="remedies-search-btn" aria-label="Search remedies">
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </form>

        {/* Category Filter Tabs */}
        <div className={`category-filters-container ${isLoaded ? 'animate-in' : ''}`} style={{ animationDelay: '0.2s' }}>
          {filterTabs.map((cat) => (
            <button
              key={cat}
              className={`filter-tab-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Single continuous grid for all filtered products */}
        <div className="catalog-wrapper animate-in" key={`${activeCategory}-${searchQuery}`} style={{ animationDelay: '0.1s' }}>
          {filteredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => (
                <div key={prod._id || prod.remedyId || prod.id} className="product-card-modern">
                  <div className="product-image-wrap">
                    <img src={getImageUrl(prod.image)} alt={prod.name} className="product-img" loading="lazy" />
                    {prod.tag && <span className="product-tag">{prod.tag}</span>}
                    <button className="quick-spec-btn" onClick={() => setSelectedProduct(prod)}>
                      <i className="bi bi-eye"></i> View Specifications
                    </button>
                  </div>

                  <div className="product-info">
                    <div className="product-header-meta">
                      <span className="product-category-badge">
                        {Array.isArray(prod.category)
                          ? prod.category.join(", ")
                          : prod.category}
                      </span>
                      <span className="product-rating">
                        <i className="bi bi-star-fill gold-icon"></i> {prod.rating || 4.9} ({prod.reviews || 120})
                      </span>
                    </div>

                    <h3 className="product-name">{prod.name}</h3>

                    <div className="product-footer-meta">
                      <div className="price-container">
                        <span className="product-price">{prod.price || `₹${prod.mrp || 0}`}</span>
                        <span className="tax-inclusive">Incl. all taxes</span>
                      </div>

                      <button className="btn-add-cart" onClick={() => setSelectedProduct(prod)}>
                        <i className="bi bi-info-circle"></i> Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products-found animate-in py-12 text-center">
              <i className="bi bi-flower1 text-4xl text-emerald-600 mb-3 block"></i>
              <p className="text-gray-600 font-medium">Formulations for this category are currently brewing or not found. Please check back soon.</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Specifications Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="spec-modal glass-card-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>
              <i className="bi bi-x-lg"></i>
            </button>

            <div className="modal-grid">
              <div className="modal-image-col">
                <img src={getImageUrl(selectedProduct.image)} alt={selectedProduct.name} className="modal-product-img" />
                {selectedProduct.badge && <span className="modal-badge">{selectedProduct.badge}</span>}
              </div>

              <div className="modal-info-col">
                <span className="product-category-badge">
                  {Array.isArray(selectedProduct.category)
                    ? selectedProduct.category.join(", ")
                    : selectedProduct.category}
                </span>
                <h2>{selectedProduct.name}</h2>
                <div className="modal-price">{selectedProduct.price || `₹${selectedProduct.mrp || 0}`}</div>

                {selectedProduct.description && (
                  <p className="text-sm text-gray-700 mb-4 italic">{selectedProduct.description}</p>
                )}

                <div className="specs-detail-list">
                  <div className="spec-item">
                    <strong><i className="bi bi-box-seam gold-icon"></i> Packaging & Weight:</strong>
                    <span>{selectedProduct.specifications?.weight || "Standard Pack"}</span>
                  </div>

                  <div className="spec-item">
                    <strong><i className="bi bi-capsule gold-icon"></i> Recommended Dosage:</strong>
                    <span>{selectedProduct.specifications?.dosage || "As directed by Vaidya / Physician"}</span>
                  </div>

                  <div className="spec-item">
                    <strong><i className="bi bi-droplet-half gold-icon"></i> Key Ingredients:</strong>
                    <span>{selectedProduct.specifications?.keyIngredients || "Authentic Ayurvedic Extracts"}</span>
                  </div>

                  <div className="spec-item">
                    <strong><i className="bi bi-heart-pulse gold-icon"></i> Primary Benefits:</strong>
                    <span>{selectedProduct.specifications?.benefits || "Promotes overall health and vitality"}</span>
                  </div>

                  <div className="spec-item">
                    <strong><i className="bi bi-shield-check gold-icon"></i> Certification & Purity:</strong>
                    <span>{selectedProduct.specifications?.certification || "Ayush Certified / ISO 9001"}</span>
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="btn-gold-primary" onClick={() => setSelectedProduct(null)}>
                    <i className="bi bi-geo-alt"></i> Available at Ghatal Clinic
                  </button>
                  <button className="btn-glass-secondary" onClick={() => setSelectedProduct(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Remedies;