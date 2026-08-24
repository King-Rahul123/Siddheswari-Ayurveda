import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPatient } from '../services/patientService';

import '../CSS/Landing.css';

function Landing() {
  const navigate = useNavigate();
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
      name: "Agefyte Fresh Under Eye Cream",
      category: "Skincare",
      price: "₹184",
      rating: 4.9,
      reviews: 142,
      image: "/images/Fresh_Under_Eye_Cream.jpg",
      tag: "Bright Eyes",
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
      name: "Neem Face Cleanser",
      category: "Skincare",
      price: "₹190",
      rating: 5.0,
      reviews: 98,
      image: "/images/Neem_FaceCleanser.png",
      tag: "Clear Skin",
      badge: "Pure Neem",
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
      name: "Vatsal Memory Syrup",
      category: "Memory",
      price: "₹152",
      rating: 4.8,
      reviews: 185,
      image: "/images/Vatsal.jpg",
      tag: "Brain Booster",
      badge: "Vatsal Memory Syrup",
      specifications: {
        weight: "60 Vegetarian Capsules",
        dosage: "1 capsule twice daily after meals with milk or water",
        keyIngredients: "High Potency KSM-66 Ashwagandha Root Extract (500mg), Swarna Bhasma (Purified Gold ash traces)",
        benefits: "Reduces cortisol and anxiety, elevates muscle strength, improves sleep quality, boosts stamina.",
        certification: "Non-GMO, Vegetarian, Ayush Approved",
        expiry: "24 months from MFD"
      }
    },
  ];

  // Extracted treatments from doctor liflet.jpg
  const treatmentsList = [
    { id: "t1", title: "Gastric & Acidity", icon: "bi-lightning-charge" },
    { id: "t2", title: "High Blood Pressure", icon: "bi-activity" },
    { id: "t3", title: "Vascular Problems", icon: "bi-heart-pulse" },
    { id: "t4", title: "Fatty Liver", icon: "bi-clipboard-pulse" },
    { id: "t5", title: "Skin Problems", icon: "bi-stars" },
    { id: "t6", title: "Kidney Stones", icon: "bi-droplet" },
    { id: "t7", title: "Thyroid Problems", icon: "bi-person-badge" },
    { id: "t8", title: "Migraine", icon: "bi-bandaid" },
    { id: "t9", title: "PCOS / PCOD", icon: "bi-gender-female" },
    { id: "t10", title: "Irregular Menstruation", icon: "bi-calendar-heart" },
    { id: "t11", title: "Joint Pain", icon: "bi-universal-access" },
    { id: "t12", title: "Heart Disease Risk", icon: "bi-heartbreak" },
    { id: "t13", title: "Cholesterol Risk", icon: "bi-shield-check" },
    { id: "t14", title: "Cold, Cough & Allergies", icon: "bi-thermometer-half" },
    { id: "t15", title: "Immunity Boosting", icon: "bi-shield-plus" },
    { id: "t16", title: "Insomnia & Stroke", icon: "bi-moon-stars" },
    { id: "t17", title: "Low Sperm Count", icon: "bi-gender-male" },
  ];

  // Limit products on the landing page to a curated selection
  const displayedProducts = products.slice(0, 3);

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
            <span className="brand-title text-base sm:text-xl lg:text-2xl">Siddheswari</span>
            <span className="brand-subtitle text-[10px] sm:text-xs">AYURVEDA</span>
          </div>
        </div>

        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>Philosophy</a>
          <a href="#doctor" onClick={() => setMobileMenuOpen(false)}>Chief Vaidya</a>
          <a href="#timetable" className="md:hidden" onClick={() => setMobileMenuOpen(false)}>Visiting Hours</a>
          <a href="#treatments" onClick={() => setMobileMenuOpen(false)}>Treatments</a>
          <a href="#shop" onClick={() => setMobileMenuOpen(false)}>Remedies</a>
          <a href="#location" onClick={() => setMobileMenuOpen(false)}>Ghatal Clinic</a>
          <button className="gold-portal-btn block md:hidden" onClick={() => navigate('/login')}>
            <i className="bi bi-person-circle"></i> Log In
          </button>
        </div>

        <div className="nav-actions">
          <button className="gold-portal-btn hidden md:block" onClick={() => navigate('/login')}>
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
          <div className="glass-card-large grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 p-5 sm:p-6 md:p-8 lg:p-12 items-center">
            <div className="relative overflow-hidden rounded-2xl border-2 border-yellow-600 shadow-xl">
              <img 
                src="/images/doctor.png" 
                alt="Dr. Subham Maity - Chief Ayurvedic Physician" 
                className="doctor-portrait-img"
              />
              <div className="absolute bottom-3 left-2 right-2 md:bottom-10 md:left-7 md:right-7 bg-white/95 backdrop-blur-md rounded-xl shadow-lg px-3 py-2 flex items-center gap-3">
                <span className="exp-years text-sm md:text-4xl">25+</span>
                <span className="exp-text text-xs md:text-lg">Years Clinical Experience</span>
              </div>
            </div>

            <div className="w-full">
              <span className="doctor-kicker">Chief Ayurvedic Physician & Vaidya</span>
              <h2 className="doctor-name">Dr. Subham Maity</h2>
              <p className="doctor-qualifications">
                <i className="bi bi-patch-check-fill gold-icon"></i> B.A.M.S. | M.D. (Ayurveda) | Specialist in Ksharasutra & Panchakarma 
              </p>

              <p className="doctor-bio">
                Dr. Shubham Maity, <strong>M.D. (Ayurveda)</strong>, is an experienced Ayurvedic physician specializing in <em>Ksharasutra</em> and <em>Panchakarma</em>. He offers holistic treatment for skin, digestive, gynecological, ENT, and lifestyle disorders, focusing on restoring health by treating the root cause through authentic Ayurvedic therapies.
              </p>

              {/* Doctor's Timetable Widget */}
              <div className="timetable-box" id="timetable">
                <div className="timetable-header">
                  <i className="bi bi-clock-history gold-icon"></i>
                  <h3>Doctor's Timetable & Visiting Hours</h3>
                </div>

                <div className="timetable-grid">
                  {/* <div className="time-row grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="day-name text-sm md:text-normal"><i className="bi bi-sun hidden md:block"></i> Afternoon Session</span>
                      <span className="time-range text-sm md:text-normal">04:00 PM – 06:30 PM</span>
                    </div>
                    <span className="day-badge text-sm md:text-normal">Mon to Sat</span>
                  </div> */}
                  <div className="time-row highlight-row">
                      <div className="flex items-center gap-2">
                        <i className="bi bi-heart"></i>
                        <span>
                          <p className="day-name text-sm md:text-normal">Every 2nd & 4th Monday</p>
                          <p className="time-range text-sm md:text-normal">04:00 PM – 06:30 PM</p>
                        </span>
                      </div>
                    <span className="day-badge gold-badge text-sm md:text-normal">Healthy Family 🌿</span>
                  </div>
                </div>

                {bookingSuccess ? (
                  <div className="booking-alert-success">
                    <i className="bi bi-check-circle-fill"></i> Your appointment request has been submitted! Our clinic staff at Ghatal will call you shortly.
                  </div>
                ) : (
                  <form className="quick-booking-form" onSubmit={handleBookConsultation}>
                    <div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      </div>
                      <input
                        type="text"
                        placeholder="Problem / Notes"
                        required={false}
                        className="booking-input mt-3"
                        value={bookingForm.notes || ''}
                        onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                      />
                    </div>
                    <button type="submit" className="btn-gold-primary btn-sm" disabled={isSubmitting}>
                      <i className="bi bi-calendar2-plus"></i>
                      {isSubmitting ? ( "Submitting..." ) : (
                        <>
                          <span className="hidden md:inline">Request </span>
                          Appointment
                        </>
                      )}
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
            <h2>Treatments & Medical Services</h2>
            <p className="section-subtext">Restoring balance through natural, non-invasive Ayurvedic therapies tailored to your unique Prakriti.</p>
            <div className="gold-divider"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {treatmentsList.map((item) => (
              <div key={item.id} className="treatment-card-small">
                <div className="icon-box">
                  <i className={`bi ${item.icon}`}></i>
                </div>
                <h3>{item.title}</h3>
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

          {/* Product Grid (Filtered to top 3) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {displayedProducts.map((prod) => (
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

          {/* View More Button */}
          <div className="view-more-container mt-4 text-center">
            <button className="btn-gold-primary" onClick={() => navigate('/remedies')}>
              View All Remedies <i className="bi bi-arrow-right"></i>
            </button>
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
          <div className="location-card glass-card-large grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-5 sm:p-6 lg:p-10 items-center">
            <div className="location-info">
              <span className="section-kicker">Visit Our Authentic Clinic</span>
              <h2 className='text-black'>Siddheswari Ayurveda Clinic & Pharmacy</h2>
              <p className="clinic-location-subtitle">Serving patients with natural care in Paschim Medinipur</p>

              <div className="contact-details">
                <div className="contact-item">
                  <i className="bi bi-geo-alt-fill gold-icon"></i>
                  <div>
                    <strong>Clinic Address:</strong>
                    <p>Ghatal Main Road (Near Baro Haat Kali Mondir), Ghatal, Paschim Medinipur, PIN - 721212, West Bengal, India.</p>
                  </div>
                </div>

                <div className="contact-item">
                  <i className="bi bi-telephone-fill gold-icon"></i>
                  <div>
                    <strong>Helpline & Appointment:</strong>
                    <p>+91 8145322318 / +91 8016811197</p>
                  </div>
                </div>

                <div className="contact-item">
                  <i className="bi bi-envelope-fill gold-icon"></i>
                  <div>
                    <strong>Email Enquiries:</strong>
                    <p>siddheswariayurveda@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="location-badge-box flex justify-center lg:justify-end">
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