import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPatient } from '../services/patientService';

import '../CSS/Landing.css';

function Landing() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({ patientName: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Comprehensive Product Catalog with detailed specifications
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
        keyIngredients: "Equal parts of organic Haritaki (Terminalia chebula), Bibhitaki (Terminalia bellirica), and Amla (Emblica officinalis)",
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
        keyIngredients: "Bhringraj, Amla, Sesame Oil, Coconut Milk, Neem, Nagarmotha, Gunja",
        benefits: "Prevents premature graying, stops hair fall, stimulates new hair growth, relieves stress & headache.",
        certification: "Traditional Kshirapak Recipe, No Mineral Oils",
        expiry: "24 months from MFD"
      }
    }
  ];

  // Treatments dataset at Ghatal Clinic
  const treatments = [
    {
      id: "nadi",
      title: "Nadi Pariksha (Pulse Diagnosis)",
      subtitle: "Ancient Ayurvedic Diagnostics",
      icon: "bi-activity",
      duration: "30 - 45 Mins",
      description: "Non-invasive, precise diagnosis of Vata, Pitta, and Kapha imbalances through radial pulse reading by our Chief Vaidya.",
      highlights: ["Root-cause discovery", "Personalized diet blueprint", "Early disease detection"]
    },
    {
      id: "panchakarma",
      title: "Panchakarma Detox Therapy",
      subtitle: "Deep Cellular Purification",
      icon: "bi-flower2",
      duration: "7 to 21 Days Packages",
      description: "Comprehensive 5-fold detoxification (Vamana, Virechana, Basti, Nasya, Raktamokshana) to purge accumulated toxins (Ama).",
      highlights: ["Cellular renewal", "Immune rejuvenation", "Stress & toxin elimination"]
    },
    {
      id: "kayachikitsa",
      title: "Kayachikitsa & Chronic Care",
      subtitle: "Internal Medicine Healing",
      icon: "bi-heart-pulse-fill",
      duration: "Customized Treatment Plan",
      description: "Specialized remedies for Diabetes, Gastrointestinal disorders, Hypertension, Thyroid, and Chronic Fatigue.",
      highlights: ["Zero side-effects", "Herbal formulations", "Metabolic balancing"]
    },
    {
      id: "asthi",
      title: "Asthi & Sandhi Chikitsa",
      subtitle: "Joint & Spine Care",
      icon: "bi-shield-plus",
      duration: "Session Based",
      description: "Therapeutic Kati Basti, Janu Basti, and herbal oils for Osteoarthritis, Rheumatoid Arthritis, Sciatica, and Spondylitis.",
      highlights: ["Pain relief without surgery", "Joint lubrication", "Improved mobility"]
    },
    {
      id: "twak",
      title: "Twak Roga Chikitsa",
      subtitle: "Skin & Psoriasis Management",
      icon: "bi-sun-fill",
      duration: "Targeted Care",
      description: "Natural herbal remedies, Takradhara, and blood-purifying formulations for Psoriasis, Eczema, Acne, and Allergic Dermatitis.",
      highlights: ["Blood purification", "Skin barrier restoration", "Natural radiance"]
    },
    {
      id: "soundarya",
      title: "Soundarya & Kesha Chikitsa",
      subtitle: "Herbal Beauty & Hair Care",
      icon: "bi-sparkles",
      duration: "60 Mins per session",
      description: "Traditional Mukha Lepam (herbal face packs), Shirodhara, and Kshiradhara for lustrous hair and youthful glowing skin.",
      highlights: ["Chemical-free glow", "Hair follicle revival", "Mind relaxation"]
    }
  ];

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleBookConsultation = async (e) => {
    e.preventDefault();
    const nameVal = (bookingForm.patientName || '').trim();
    const phoneVal = (bookingForm.phone || '').trim();

    if (!nameVal || !phoneVal) return;

    setBookingError('');
    setIsSubmitting(true);
    try {
      await addPatient({
        patientName: nameVal,
        phone: phoneVal,
        appointmentDate: new Date().toISOString().split("T")[0],
        notes: "Requested from Website Landing Page",
        status: "Scheduled"
      });
      setBookingSuccess(true);
      setBookingForm({ patientName: '', phone: '' });
      setTimeout(() => setBookingSuccess(false), 6000);
    } catch (err) {
      console.error("Booking submission error:", err);
      setBookingError(err.message || 'Failed to submit appointment request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-layout light-theme">
      {/* Background Magical Ambient Effects */}
      <div className="magical-orb orb-1"></div>
      <div className="magical-orb orb-2"></div>
      <div className="magical-orb orb-3"></div>

      {/* Navigation Bar */}
      <nav className="top-nav glass-nav">
        <div className="nav-brand" onClick={() => navigate('/')}>
          <img src="/logo2.png" alt="Siddheswari Ayurveda Logo" className="brand-logo-img" />
          <div className="brand-text-container">
            <span className="brand-title">Siddheswari</span>
            <span className="brand-subtitle">AYURVEDA</span>
          </div>
        </div>

        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>Philosophy</a>
          <a href="#doctor" onClick={() => setMobileMenuOpen(false)}>Chief Vaidya</a>
          <a href="#timetable" onClick={() => setMobileMenuOpen(false)}>Visiting Hours</a>
          <a href="#treatments" onClick={() => setMobileMenuOpen(false)}>Treatments</a>
          <a href="#shop" onClick={() => setMobileMenuOpen(false)}>Remedies</a>
          <a href="#location" onClick={() => setMobileMenuOpen(false)}>Ghatal Clinic</a>
        </div>

        <div className="nav-actions">
          <button className="gold-portal-btn" onClick={() => navigate('/login')}>
            <i className="bi bi-person-circle"></i> Log In
          </button>
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section" id="hero">
        <div className="hero-wrapper">
          <div className="hero-content">
            <div className="kicker-badge">
              <i className="bi bi-stars"></i>
              <span>100% Pure, Natural & Time-Tested Ayurvedic Healing</span>
            </div>
            
            <h1 className="hero-heading">
              Ancient Wisdom <br />
              <span className="gold-shimmer-text">Magical Natural Healing</span>
            </h1>

            <p className="hero-description">
              Welcome to <strong>Siddheswari Ayurveda</strong> at Ghatal. We restore harmony to body, mind, and spirit through authentic Nadi Pariksha, classical Panchakarma therapies, and pure herbal formulations crafted from nature's rarest botanicals.
            </p>

            <div className="hero-actions">
              <a href="#timetable" className="btn-gold-primary">
                <i className="bi bi-calendar-check-fill"></i> Book Vaidya Consultation
              </a>
              <a href="#shop" className="btn-glass-secondary">
                <i className="bi bi-flower1"></i> Explore Pure Remedies
              </a>
            </div>

            {/* Quick Stats Grid */}
            <div className="hero-stats-grid">
              <div className="stat-card">
                <span className="stat-num">25+</span>
                <span className="stat-label">Years Heritage</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">100%</span>
                <span className="stat-label">Pure Organic Botanicals</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">15,000+</span>
                <span className="stat-label">Patients Healed</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Philosophy & Trust Banner */}
      <section className="philosophy-section" id="about">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-kicker">Our Sacred Roots</span>
            <h2>Pure. Natural. Trusted.</h2>
            <div className="gold-divider"></div>
          </div>

          <div className="philosophy-grid">
            <div className="philosophy-card">
              <div className="card-icon-box">
                <i className="bi bi-leaf"></i>
              </div>
              <h3>100% Pure Herbs</h3>
              <p>Hand-harvested from pristine organic herbal gardens, ensuring uncompromised potency and zero synthetic chemicals.</p>
            </div>

            <div className="philosophy-card">
              <div className="card-icon-box">
                <i className="bi bi-person-badge-fill"></i>
              </div>
              <h3>Nadi Pariksha Experts</h3>
              <p>Precise pulse diagnosis uncovering internal dosha imbalances (Vata, Pitta, Kapha) before symptoms manifest.</p>
            </div>

            <div className="philosophy-card">
              <div className="card-icon-box">
                <i className="bi bi-award-fill"></i>
              </div>
              <h3>GMP & Ayush Standard</h3>
              <p>Rigorous quality controls following traditional Samhita scriptures combined with modern purity standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor & Timetable Section */}
      <section className="doctor-section" id="doctor">
        <div className="container">
          <div className="doctor-wrapper glass-card-large">
            <div className="doctor-image-container">
              <img 
                src="/images/doctor.png" 
                alt="Kaviraj Dr. Siddheshwar Sen - Chief Ayurvedic Physician" 
                className="doctor-portrait-img"
              />
              <div className="doctor-experience-badge">
                <span className="exp-years">25+</span>
                <span className="exp-text">Years Clinical Experience</span>
              </div>
            </div>

            <div className="doctor-info-container">
              <span className="doctor-kicker">Chief Ayurvedic Physician & Vaidya</span>
              <h2 className="doctor-name">Kaviraj Dr. Siddheshwar Sen</h2>
              <p className="doctor-qualifications">
                <i className="bi bi-patch-check-fill gold-icon"></i> B.A.M.S. | M.D. (Ayurveda) | Panchakarma & Nadi Pariksha Specialist
              </p>

              <p className="doctor-bio">
                Renowned for his compassionate healing touch and profound mastery over ancient <em>Nadi Pariksha</em> (pulse reading), Dr. Sen has devoted over two decades to curing chronic ailments at their root cause. Under his guidance, Siddheswari Ayurveda has become a sanctuary of holistic wellness for patients across West Bengal.
              </p>

              {/* Doctor's Timetable Widget */}
              <div className="timetable-box" id="timetable">
                <div className="timetable-header">
                  <i className="bi bi-clock-history gold-icon"></i>
                  <h3>Doctor's Timetable & Visiting Hours</h3>
                </div>

                <div className="timetable-grid">
                  <div className="time-row">
                    <span className="day-name"><i className="bi bi-sun"></i> Morning Session</span>
                    <span className="time-range">09:00 AM – 01:00 PM</span>
                    <span className="day-badge">Mon to Sat</span>
                  </div>
                  <div className="time-row">
                    <span className="day-name"><i className="bi bi-moon-stars"></i> Evening Session</span>
                    <span className="time-range">05:00 PM – 08:30 PM</span>
                    <span className="day-badge">Mon to Sat</span>
                  </div>
                  <div className="time-row highlight-row">
                    <span className="day-name"><i className="bi bi-heart"></i> Special Sunday Session</span>
                    <span className="time-range">10:00 AM – 02:00 PM</span>
                    <span className="day-badge gold-badge">Panchakarma & Nadi</span>
                  </div>
                </div>

                {bookingSuccess ? (
                  <div className="booking-alert-success">
                    <i className="bi bi-check-circle-fill"></i> Your appointment request has been submitted! Our clinic staff at Ghatal will call you shortly.
                  </div>
                ) : (
                  <form className="quick-booking-form" onSubmit={handleBookConsultation}>
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      required 
                      className="booking-input" 
                      value={bookingForm.patientName}
                      onChange={(e) => setBookingForm({ ...bookingForm, patientName: e.target.value })}
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone Number" 
                      required 
                      className="booking-input" 
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    />
                    <button type="submit" className="btn-gold-primary btn-sm" disabled={isSubmitting}>
                      <i className="bi bi-calendar2-plus"></i> {isSubmitting ? 'Submitting...' : 'Request Appointment'}
                    </button>
                  </form>
                )}
                {bookingError && (
                  <div className="booking-alert-error" style={{ color: '#d9534f', marginTop: '0.8rem', fontSize: '0.88rem', fontWeight: 600 }}>
                    <i className="bi bi-exclamation-triangle-fill"></i> {bookingError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Treatments Section */}
      <section className="treatments-section" id="treatments">
        <div className="container">
          <div className="section-title-wrap text-center">
            <span className="section-kicker">Holistic Therapies at Ghatal Clinic</span>
            <h2>Treatments Performed at Siddheswari Ayurveda</h2>
            <p className="section-subtext">Restoring balance through natural, non-invasive Ayurvedic therapies tailored to your unique Prakriti.</p>
            <div className="gold-divider"></div>
          </div>

          <div className="treatments-grid">
            {treatments.map((item) => (
              <div key={item.id} className="treatment-card">
                <div className="treatment-header">
                  <div className="treatment-icon">
                    <i className={`bi ${item.icon}`}></i>
                  </div>
                  <span className="treatment-duration"><i className="bi bi-hourglass-split"></i> {item.duration}</span>
                </div>
                <h3 className="treatment-title">{item.title}</h3>
                <span className="treatment-subtitle">{item.subtitle}</span>
                <p className="treatment-desc">{item.description}</p>
                
                <ul className="treatment-highlights">
                  {item.highlights.map((h, idx) => (
                    <li key={idx}><i className="bi bi-check2-circle"></i> {h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Apothecary Section */}
      <section className="shop-section" id="shop">
        <div className="container">
          <div className="section-title-wrap text-center">
            <span className="section-kicker">Hand-Crafted Formulations</span>
            <h2>Our Pure Natural Remedies</h2>
            <p className="section-subtext">Formulated using authentic classical recipes, free from artificial additives.</p>
            <div className="gold-divider"></div>
          </div>

          {/* Category Filter Tabs */}
          <div className="category-tabs">
            {['All', 'Immunity', 'Skincare', 'Digestion', 'Memory', 'Haircare'].map((cat) => (
              <button
                key={cat}
                className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="products-grid">
            {filteredProducts.map((prod) => (
              <div key={prod.id} className="product-card-modern">
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
                      <i className="bi bi-info-circle"></i> View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                  <a href="#location" className="btn-gold-primary" onClick={() => setSelectedProduct(null)}>
                    <i className="bi bi-geo-alt"></i> Available at Ghatal Clinic
                  </a>
                  <button className="btn-glass-secondary" onClick={() => setSelectedProduct(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location & Contact Section */}
      <section className="location-section" id="location">
        <div className="container">
          <div className="location-card glass-card-large">
            <div className="location-info">
              <span className="section-kicker">Visit Our Authentic Clinic</span>
              <h2>Siddheswari Ayurveda Clinic & Pharmacy</h2>
              <p className="clinic-location-subtitle">Serving patients with natural care in Paschim Medinipur</p>

              <div className="contact-details">
                <div className="contact-item">
                  <i className="bi bi-geo-alt-fill gold-icon"></i>
                  <div>
                    <strong>Clinic Address:</strong>
                    <p>Ghatal Main Road (Near Central Bus Stand), Ghatal, Paschim Medinipur, PIN - 721212, West Bengal, India.</p>
                  </div>
                </div>

                <div className="contact-item">
                  <i className="bi bi-telephone-fill gold-icon"></i>
                  <div>
                    <strong>Helpline & Appointment:</strong>
                    <p>+91 98765 43210 / +91 91234 56789</p>
                  </div>
                </div>

                <div className="contact-item">
                  <i className="bi bi-envelope-fill gold-icon"></i>
                  <div>
                    <strong>Email Enquiries:</strong>
                    <p>care@siddheswariayurveda.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="location-badge-box">
              <div className="purity-seal">
                <i className="bi bi-shield-lock-fill"></i>
                <span>Ghatal's Premier Center for Pure Ayurvedic Healthcare</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-top-grid">
            <div className="footer-brand-col">
              <div className="footer-brand-header">
                <img src="/logo2.png" alt="Siddheswari Ayurveda Logo" className="footer-logo-img" />
                <span className="footer-brand-title">Siddheswari Ayurveda</span>
              </div>
              <p className="footer-tagline">
                Nurturing life, purity, and holistic health through the timeless magical science of classical Ayurveda.
              </p>
              <p className="footer-address">
                <i className="bi bi-geo-alt"></i> Ghatal, Paschim Medinipur, Pin-721212
              </p>
            </div>

            <div className="footer-links-col">
              <h4>Quick Links</h4>
              <a href="#about">Our Philosophy</a>
              <a href="#doctor">Chief Physician</a>
              <a href="#timetable">Doctor Timetable</a>
              <a href="#treatments">Treatments</a>
            </div>

            <div className="footer-links-col">
              <h4>Formulations</h4>
              <a href="#shop">Immunity Elixirs</a>
              <a href="#shop">Kumkumadi Skincare</a>
              <a href="#shop">Ashwagandha Gold</a>
              <a href="#shop">Organic Triphala</a>
            </div>

            <div className="footer-links-col">
              <h4>Connect</h4>
              <div className="social-icons">
                <a href="#" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
                <a href="#" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
                <a href="#" aria-label="WhatsApp"><i className="bi bi-whatsapp"></i></a>
                <a href="#" aria-label="YouTube"><i className="bi bi-youtube"></i></a>
              </div>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <p>&copy; {new Date().getFullYear()} Siddheswari Ayurveda (Ghatal, Paschim Medinipur - 721212). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;