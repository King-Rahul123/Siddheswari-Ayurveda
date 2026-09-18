import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import "../CSS/Offer.css";

const STORAGE_KEY = "ayurveda-user-offers";

export default function Offer() {
  const [offers, setOffers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    try {
      const parsedOffers = JSON.parse(saved);
      return Array.isArray(parsedOffers) ? parsedOffers : [];
    } catch {
      return [];
    }
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount: "",
    startDate: "",
    validUntil: "",
    image: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
    window.dispatchEvent(new Event("ayurveda-offer-updated"));
  }, [offers]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.discount.trim()) {
      toast.error("Please fill in the offer title, description, and discount.");
      return;
    }

    const newOffer = {
      id: Date.now(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      discount: formData.discount.trim(),
      startDate: formData.startDate || "No start date",
      validUntil: formData.validUntil || "No expiry",
      image: formData.image,
    };

    setOffers((prev) => [newOffer, ...prev]);
    window.dispatchEvent(new Event("ayurveda-offer-updated"));
    setFormData({
      title: "",
      description: "",
      discount: "",
      startDate: "",
      validUntil: "",
      image: "",
    });

    toast.success("Offer uploaded successfully.");
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-wrapper">
        <Header />

        <main className="dashboard-content">
          <div className="offer-page-header">
            <div>
              <p className="offer-page-kicker">Marketing</p>
              <h2>Offers & Promotions</h2>
            </div>
          </div>

          <div className="offer-layout">
            <section className="offer-upload-panel offer-row">
                <div className="offer-panel-header">
                    <div>
                        <h3>Upload New Offer</h3>
                        <span>Create and publish a new offer</span>
                    </div>

                    <i className="bi bi-cloud-upload-fill offer-header-icon"></i>
                </div>

                <form onSubmit={handleSubmit} className="offer-form">
                    <div className="offer-form-column">
                        <div className="form-group">
                            <label>
                                <i className="bi bi-percent"></i>
                                Discount
                            </label>

                            <input
                                type="text"
                                name="discount"
                                value={formData.discount}
                                onChange={handleInputChange}
                                placeholder="e.g. 20% OFF"
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                <i className="bi bi-calendar-event-fill"></i>
                                Starting Date
                            </label>
                            <input
                                type="date"
                              name="startDate"
                              value={formData.startDate}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                <i className="bi bi-calendar-event-fill"></i>
                                Valid Till
                            </label>

                            <input
                                type="date"
                                name="validUntil"
                                value={formData.validUntil}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="offer-form-column offer-description-column">
                        <div className="form-group">
                            <label>
                                <i className="bi bi-tag-fill"></i>
                                Offer Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g. Ayurveda Wellness Weekend"
                            />
                        </div>
                        
                        <div className="form-group description-group">
                            <label>
                                <i className="bi bi-text-paragraph"></i>
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="5"
                                placeholder="Describe the offer for your customers..."
                            />
                        </div>
                    </div>

                    <div className="offer-form-column">
                        

                        <div className="form-group offer-image-group">
                            <label>
                                <i className="bi bi-image-fill"></i>
                                Offer Image
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>

                        {formData.image && (
                            <div className="offer-preview-box">
                                <img src={formData.image} alt="Offer preview" />

                                <button
                                    type="button"
                                    className="remove-preview-btn"
                                    onClick={() =>setFormData((prev) => ({
                                        ...prev,
                                        image: "",
                                        }))
                                    }
                                >
                                    <i className="bi bi-x"></i>
                                </button>
                            </div>
                        )}
                        <button type="submit" className="offer-submit-btn">
                            <i className="bi bi-cloud-upload-fill"></i>
                            Upload Offer
                        </button>
                    </div>
                </form>
            </section>


            {/* ==============================
                ROW 2 - ALL OFFERS
            =============================== */}
            <section className="offer-list-panel offer-row">

                <div className="offer-panel-header">
                <div>
                    <h3>All Offers</h3>
                    <span>
                    {offers.length} {offers.length === 1 ? "offer" : "offers"}
                    </span>
                </div>

                <i className="bi bi-grid-3x3-gap-fill offer-header-icon"></i>
                </div>

                <div className="offer-grid">

                {offers.length > 0 ? (
                    [...offers]
                    .sort((a, b) => {
                        const dateA = Number(a.id) || 0;
                        const dateB = Number(b.id) || 0;

                        return dateB - dateA;
                    })
                    .map((offer, index) => (

                        <article
                        key={offer.id}
                        className="offer-card"
                        >

                        <div className="offer-image-wrap">

                            {offer.image ? (
                              <img src={offer.image} alt={offer.title} />
                            ) : (
                              <div className="offer-image-placeholder" aria-label="No offer image">
                                <i className="bi bi-image"></i>
                              </div>
                            )}

                            <span className="offer-badge">
                            {offer.discount}
                            </span>

                            {index === 0 && (
                            <span className="offer-new-badge">
                                NEW
                            </span>
                            )}

                        </div>

                        <div className="offer-card-body">

                            <h4>{offer.title}</h4>

                            <p>
                            {offer.description}
                            </p>

                            <div className="offer-meta">

                            <span>
                                <i className="bi bi-calendar-event"></i>

                                {offer.startDate !== "No start date" && (
                                  <>Starts: {offer.startDate} | </>
                                )}
                                Valid until:{" "}
                                {offer.validUntil}
                            </span>

                            </div>

                        </div>

                        </article>

                    ))
                ) : (
                    <div className="no-offers">

                    <i className="bi bi-gift"></i>

                    <h4>No offers available</h4>

                    <p>
                        Upload your first offer using the form above.
                    </p>

                    </div>
                )}

                </div>

            </section>

            </div>
        </main>
      </div>
    </div>
  );
}
