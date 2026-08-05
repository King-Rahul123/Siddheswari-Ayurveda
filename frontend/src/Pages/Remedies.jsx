import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Remedies.css';

function Remedies() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  // Trigger animations on mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Comprehensive Product Catalog
  const products = [
    {
      id: 1,
      name: "Siddheswari Special Chyawanprash Elixir",
      category: "Immunity",
      price: "₹599",
      rating: 4.9,
      reviews: 142,
      image: "/images/chyawanprash.png",
      tag: "Best Seller",
      badge: "Pure & Organic",
      specifications: {
        weight: "500g Glass Jar",
        dosage: "1-2 teaspoons twice daily with warm milk or water",
        keyIngredients: "Fresh Organic Amla, Kashmiri Saffron, Wild Honey, Bramhi, Shankhpushpi, 48 Classical Ayurvedic Herbs",
        benefits: "Boosts immune system, enhances memory and stamina, supports respiratory wellness, anti-aging properties.",
        certification: "100% Ayurvedic Formulation, GMP & ISO Certified",
        expiry: "24 months from MFD"
      }
    },
    {
      id: 2,
      name: "Kumkumadi Saffron Facial Oil",
      category: "Skincare",
      price: "₹899",
      rating: 5.0,
      reviews: 98,
      image: "/images/kumkumadi.png",
      tag: "Magical Radiance",
      badge: "Pure Saffron",
      specifications: {
        weight: "30ml Dropper Bottle",
        dosage: "3-4 drops gently massaged onto clean face at bedtime",
        keyIngredients: "Pure Saffron (Kesar), Chandana (Sandalwood), Manjistha, Padma (Lotus), Goat Milk, Sesame Oil",
        benefits: "Illuminates skin complexion, reduces hyperpigmentation, smooths fine lines, deep nighttime skin nourishment.",
        certification: "Dermatologically Tested, 100% Chemical-Free",
        expiry: "18 months from MFD"
      }
    },
    {
      id: 3,
      name: "Ashwagandha Gold Vitality Capsules",
      category: "Memory",
      price: "₹450",
      rating: 4.8,
      reviews: 185,
      image: "/images/ashwagandha.png",
      tag: "Stress Relief",
      badge: "KSM-66 Extract",
      specifications: {
        weight: "60 Vegetarian Capsules",
        dosage: "1 capsule twice daily after meals with milk or water",
        keyIngredients: "High Potency KSM-66 Ashwagandha Root Extract (500mg), Swarna Bhasma (Purified Gold ash traces)",
        benefits: "Reduces cortisol and anxiety, elevates muscle strength, improves sleep quality, boosts stamina.",
        certification: "Non-GMO, Vegetarian, Ayush Approved",
        expiry: "24 months from MFD"
      }
    },
    {
      id: 4,
      name: "Organic Triphala Digestive Churna",
      category: "Digestion",
      price: "₹320",
      rating: 4.9,
      reviews: 210,
      image: "/images/triphala.png",
      tag: "Detox Specialist",
      badge: "Raw Herb Powder",
      specifications: {
        weight: "250g Airtight Eco Jar",
        dosage: "1 teaspoon (3-5g) before sleep with lukewarm water",
        keyIngredients: "Equal parts of organic Haritaki, Bibhitaki, and Amla",
        benefits: "Cleanses digestive tract, relieves chronic constipation, balances Tridoshas, promotes metabolic health.",
        certification: "Organic Certified, Zero Preservatives",
        expiry: "12 months from MFD"
      }
    },
    {
      id: 5,
      name: "Brahmi & Shankhpushpi Brain Elixir",
      category: "Memory",
      price: "₹380",
      rating: 4.7,
      reviews: 86,
      image: "/images/brahmi.png",
      tag: "Mental Clarity",
      badge: "Nootropic Tonic",
      specifications: {
        weight: "200ml Glass Bottle",
        dosage: "10ml twice daily with water",
        keyIngredients: "Brahmi (Bacopa monnieri), Shankhpushpi, Jatamansi, Vacha, Mulethi",
        benefits: "Enhances cognitive focus, memory retention, reduces mental exhaustion, calms hyperactive minds.",
        certification: "Classical Syrup Standard, 100% Herbal",
        expiry: "24 months from MFD"
      }
    },
    {
      id: 6,
      name: "Maha Bhringraj Herbal Hair Oil",
      category: "Haircare",
      price: "₹499",
      rating: 4.9,
      reviews: 164,
      image: "/images/hairoil.png",
      tag: "Hair Fall Control",
      badge: "Kshirapak Process",
      specifications: {
        weight: "200ml Glass Bottle with Applicator",
        dosage: "Gently massage into scalp 2-3 times a week, leave for 2 hours or overnight",
        keyIngredients: "Bhringraj, Amla, Sesame Oil, Coconut Milk, Neem, Nagarmotha",
        benefits: "Prevents premature graying, stops hair fall, stimulates new hair growth, relieves stress & headache.",
        certification: "Traditional Kshirapak Recipe, No Mineral Oils",
        expiry: "24 months from MFD"
      }
    }
  ];

  // Filter Tabs definition
  const filterTabs = ['All', 'Immunity', 'Skincare', 'Digestion', 'Memory', 'Haircare'];

  // Filter products based on active category
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

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
        <div className="catalog-wrapper animate-in" key={activeCategory} style={{ animationDelay: '0.1s' }}>
          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map((prod) => (
                <div 
                  key={prod.id} 
                  className="product-card-modern"
                >
                  <div className="product-image-wrap">
                    <img src={prod.image} alt={prod.name} className="product-img" loading="lazy" />
                    <span className="product-tag">{prod.tag}</span>
                    <button className="quick-spec-btn" onClick={() => setSelectedProduct(prod)}>
                      <i className="bi bi-eye"></i> View Specifications
                    </button>
                  </div>

                  <div className="product-info">
                    <div className="product-header-meta">
                      <span className="product-category-badge">{prod.category}</span>
                      <span className="product-rating">
                        <i className="bi bi-star-fill gold-icon"></i> {prod.rating} ({prod.reviews})
                      </span>
                    </div>

                    <h3 className="product-name">{prod.name}</h3>

                    <div className="product-footer-meta">
                      <div className="price-container">
                        <span className="product-price">{prod.price}</span>
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
            <div className="no-products-found animate-in">
              <i className="bi bi-flower1"></i>
              <p>Formulations for this category are currently brewing. Please check back soon.</p>
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
                <img src={selectedProduct.image} alt={selectedProduct.name} className="modal-product-img" />
                <span className="modal-badge">{selectedProduct.badge}</span>
              </div>

              <div className="modal-info-col">
                <span className="product-category-badge">{selectedProduct.category}</span>
                <h2>{selectedProduct.name}</h2>
                <div className="modal-price">{selectedProduct.price}</div>

                <div className="specs-detail-list">
                  <div className="spec-item">
                    <strong><i className="bi bi-box-seam gold-icon"></i> Packaging & Weight:</strong>
                    <span>{selectedProduct.specifications.weight}</span>
                  </div>

                  <div className="spec-item">
                    <strong><i className="bi bi-capsule gold-icon"></i> Recommended Dosage:</strong>
                    <span>{selectedProduct.specifications.dosage}</span>
                  </div>

                  <div className="spec-item">
                    <strong><i className="bi bi-droplet-half gold-icon"></i> Key Ingredients:</strong>
                    <span>{selectedProduct.specifications.keyIngredients}</span>
                  </div>

                  <div className="spec-item">
                    <strong><i className="bi bi-heart-pulse gold-icon"></i> Primary Benefits:</strong>
                    <span>{selectedProduct.specifications.benefits}</span>
                  </div>

                  <div className="spec-item">
                    <strong><i className="bi bi-shield-check gold-icon"></i> Certification & Purity:</strong>
                    <span>{selectedProduct.specifications.certification}</span>
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