import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/Shop.css";
import "../CSS/Landing.css";
import { subscribeRemedies } from "../services/remedyService";

export default function Shop() {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [sortBy, setSortBy] = useState("featured");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [cart, setCart] = useState([]);
  const [showOffer, setShowOffer] = useState(false);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // =========================================================
  // LOAD PRODUCTS FROM DATABASE
  // =========================================================

  useEffect(() => {
    setShowOffer(true);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setError("");

    const unsubscribe = subscribeRemedies((data) => {
      if (Array.isArray(data)) {
        setProducts(data);
        setError("");
      } else {
        setProducts([]);
        setError("Unable to load products.");
      }

      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // =========================================================
  // IMAGE URL
  // =========================================================

  const getImageUrl = (img) => {
    if (!img) {
      return "/images/placeholder.png";
    }

    if (typeof img !== "string") {
      return "/images/placeholder.png";
    }

    if (img.startsWith("/remedies-images")) {
      return `http://localhost:5000${img}`;
    }

    return img;
  };

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = useMemo(() => {
    const categorySet = new Set();

    products.forEach((product) => {
      if (Array.isArray(product.category)) {
        product.category.forEach((category) => {
          if (category) {
            categorySet.add(String(category).trim());
          }
        });
      } else if (product.category) {
        categorySet.add(String(product.category).trim());
      }
    });

    return ["All", ...Array.from(categorySet).sort()];
  }, [products]);

  // =========================================================
  // CATEGORY MATCH
  // =========================================================

  const productMatchesCategory = (product) => {
    if (activeCategory === "All") {
      return true;
    }

    if (Array.isArray(product.category)) {
      return product.category.some(
        (category) =>
          String(category).toLowerCase() ===
          activeCategory.toLowerCase()
      );
    }

    return (
      String(product.category || "").toLowerCase() ===
      activeCategory.toLowerCase()
    );
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const productMatchesSearch = (product) => {
    const searchableText = [
      product.name,
      product.tag,
      product.description,
      product.price,
      product.mrp,
      product.specifications?.weight,
      product.specifications?.dosage,
      product.specifications?.keyIngredients,
      product.specifications?.benefits,
      product.specifications?.certification,

      ...(Array.isArray(product.category)
        ? product.category
        : [product.category]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(
      searchQuery.trim().toLowerCase()
    );
  };

  // =========================================================
  // FILTER + SORT
  // =========================================================

  const filteredProducts = useMemo(() => {
    let result = products.filter(
      (product) =>
        productMatchesCategory(product) &&
        productMatchesSearch(product)
    );

    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price || a.mrp || 0) -
          Number(b.price || b.mrp || 0)
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price || b.mrp || 0) -
          Number(a.price || a.mrp || 0)
      );
    }

    if (sortBy === "rating") {
      result.sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || "")
        )
      );
    }

    return result;
  }, [
    products,
    activeCategory,
    searchQuery,
    sortBy,
  ]);

  // =========================================================
  // PRICE HELPERS
  // =========================================================

  const getSellingPrice = (product) => {
    if (
      product.price !== undefined &&
      product.price !== null &&
      product.price !== ""
    ) {
      return product.price;
    }

    if (
      product.mrp !== undefined &&
      product.mrp !== null &&
      product.mrp !== ""
    ) {
      return `₹${product.mrp}`;
    }

    return "₹0";
  };

  const getNumericPrice = (product) => {
    const price =
      product.price !== undefined &&
      product.price !== null &&
      product.price !== ""
        ? product.price
        : product.mrp;

    if (typeof price === "number") {
      return price;
    }

    if (typeof price === "string") {
      const numeric = Number(
        price.replace(/[^\d.]/g, "")
      );

      return Number.isNaN(numeric) ? 0 : numeric;
    }

    return 0;
  };

  const getMrp = (product) => {
    if (
      product.mrp !== undefined &&
      product.mrp !== null &&
      product.mrp !== ""
    ) {
      const numeric =
        typeof product.mrp === "number"
          ? product.mrp
          : Number(
              String(product.mrp).replace(/[^\d.]/g, "")
            );

      return Number.isNaN(numeric) ? null : numeric;
    }

    return null;
  };

  const getDiscount = (product) => {
    const sellingPrice = getNumericPrice(product);
    const mrp = getMrp(product);

    if (
      !mrp ||
      !sellingPrice ||
      mrp <= sellingPrice
    ) {
      return 0;
    }

    return Math.round(
      ((mrp - sellingPrice) / mrp) * 100
    );
  };

  const formatPrice = (price) => {
    if (
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return "₹0";
    }

    if (typeof price === "string") {
      if (price.includes("₹")) {
        return price;
      }

      const numeric = Number(
        price.replace(/[^\d.]/g, "")
      );

      if (!Number.isNaN(numeric)) {
        return `₹${numeric.toLocaleString("en-IN")}`;
      }

      return price;
    }

    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  // =========================================================
  // PRODUCT ID
  // =========================================================

  const getProductId = (product) => {
    return (
      product._id ||
      product.remedyId ||
      product.id ||
      product.productId
    );
  };

  // =========================================================
  // CART
  // =========================================================

  const addToCart = (product) => {
    const id = getProductId(product);

    setCart((previous) => {
      const existing = previous.find(
        (item) => item.id === id
      );

      if (existing) {
        return previous.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...previous,
        {
          id,
          product,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (id) => {
    setCart((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const updateQuantity = (id, change) => {
    setCart((previous) =>
      previous
        .map((item) => {
          if (item.id !== id) {
            return item;
          }

          const quantity = item.quantity + change;

          return {
            ...item,
            quantity: Math.max(1, quantity),
          };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      getNumericPrice(item.product) *
        item.quantity,
    0
  );

  // =========================================================
  // VIEW PRODUCT
  // =========================================================

  const openProduct = (product) => {
    setSelectedProduct(product);
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setActiveCategory("All");
    setSearchQuery("");
    setSortBy("featured");
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="shop-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="shop-header">

        <div className="shop-header-inner">

          <div
            className="shop-logo-area"
            onClick={() => navigate("/")}
          >
            <img
              src="/logo2.png"
              alt="Siddheswari Ayurveda"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />

            <div className="shop-logo-text">
              <span>SIDDHESWARI</span>
              <small>AYURVEDA</small>
            </div>
          </div>

          <nav className="shop-main-nav">
            <button
              onClick={() => navigate("/")}
            >
              Home
            </button>

            <button className="active">
              Shop
            </button>
          </nav>

          <div className="shop-header-actions">

            <button
              className="shop-header-icon"
              onClick={() =>
                document
                  .getElementById("shop-search")
                  ?.focus()
              }
              aria-label="Search"
            >
              <i className="bi bi-search"></i>
            </button>

            <button
              className="shop-header-icon cart-trigger"
              onClick={() =>
                setMobileFilterOpen(false)
              }
              aria-label="Shopping cart"
            >
              <i className="bi bi-bag"></i>

              {cartCount > 0 && (
                <span className="header-count">
                  {cartCount}
                </span>
              )}
            </button>

          </div>

        </div>

      </header>

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="shop-hero">

        <div className="shop-hero-background"></div>

        <div className="shop-hero-content">

          <span className="shop-hero-kicker">
            SIDDHESWARI APOTHECARY
          </span>

          <h1>
            Nature's Wisdom,
            <br />
            <em>Made for You</em>
          </h1>

          <p>
            Explore our collection of authentic
            Ayurvedic formulations, created with
            nature's finest ingredients.
          </p>

          <button
            className="shop-hero-button"
            onClick={() =>
              document
                .getElementById("products")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            Explore Collection
            <i className="bi bi-arrow-right"></i>
          </button>

        </div>

        <div className="hero-decoration hero-leaf-one">
          <i className="bi bi-flower1"></i>
        </div>

        <div className="hero-decoration hero-leaf-two">
          <i className="bi bi-leaf"></i>
        </div>

      </section>

      {/* ===================================================
          SHOP INTRO
      =================================================== */}

      <section className="shop-intro">

        <div className="shop-intro-inner">

          <div className="intro-title">

            <span>OUR COLLECTION</span>

            <h2>
              Ayurvedic Care,
              <br />
              Naturally.
            </h2>

          </div>

          <div className="intro-text">

            <p>
              Discover carefully selected Ayurvedic
              products designed to bring traditional
              wellness into your everyday life.
            </p>

            <div className="intro-features">

              <div>
                <i className="bi bi-leaf"></i>
                <span>Natural</span>
              </div>

              <div>
                <i className="bi bi-flower1"></i>
                <span>Ayurvedic</span>
              </div>

              <div>
                <i className="bi bi-patch-check"></i>
                <span>Quality</span>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ===================================================
          PRODUCTS
      =================================================== */}

      <section
        className="shop-products-section"
        id="products"
      >

        <div className="shop-products-container">

          {/* SECTION HEADER */}

          <div className="shop-section-header">

            <div>

              <span className="shop-section-kicker">
                SHOP SIDDHESWARI
              </span>

              <h2>
                Our Products
              </h2>

              <p>
                {isLoading
                  ? "Loading our collection..."
                  : `${filteredProducts.length} products available`}
              </p>

            </div>

            <button
              className="mobile-filter-button"
              onClick={() =>
                setMobileFilterOpen(
                  !mobileFilterOpen
                )
              }
            >
              <i className="bi bi-sliders"></i>
              Filters
            </button>

          </div>

          {/* =================================================
              SEARCH + SORT
          ================================================= */}

          <div className="shop-toolbar">

            <form
              className="shop-search-box"
              onSubmit={(event) =>
                event.preventDefault()
              }
            >

              <i className="bi bi-search"></i>

              <input
                id="shop-search"
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search products, benefits or categories..."
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery("")
                  }
                  aria-label="Clear search"
                >
                  <i className="bi bi-x"></i>
                </button>
              )}

            </form>

            <div className="shop-sort">

              <label htmlFor="shop-sort">
                Sort by
              </label>

              <select
                id="shop-sort"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
              >
                <option value="featured">
                  Featured
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="rating">
                  Highest Rated
                </option>

                <option value="name">
                  Name A-Z
                </option>
              </select>

            </div>

          </div>

          {/* =================================================
              CATEGORY FILTER
          ================================================= */}

          <div
            className={`shop-category-filter ${
              mobileFilterOpen
                ? "mobile-filter-open"
                : ""
            }`}
          >

            <div className="category-label">
              <i className="bi bi-grid"></i>
              Categories
            </div>

            <div className="category-buttons">

              {categories.map((category) => (
                <button
                  key={category}
                  className={
                    activeCategory === category
                      ? "active"
                      : ""
                  }
                  onClick={() => {
                    setActiveCategory(category);
                    setMobileFilterOpen(false);
                  }}
                >
                  {category}
                </button>
              ))}

            </div>

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {isLoading && (

            <div className="shop-loading">

              <div className="loading-leaf">
                <i className="bi bi-leaf"></i>
              </div>

              <h3>
                Preparing our collection...
              </h3>

              <p>
                Please wait while we bring you
                our Ayurvedic products.
              </p>

            </div>

          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {!isLoading && error && (

            <div className="shop-error">

              <div className="error-icon">
                <i className="bi bi-exclamation-circle"></i>
              </div>

              <h3>
                Unable to load products
              </h3>

              <p>{error}</p>

              <button
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </button>

            </div>

          )}

          {/* =================================================
              PRODUCT GRID
          ================================================= */}

          {!isLoading &&
            !error &&
            filteredProducts.length > 0 && (

              <div className="shop-product-grid">

                {filteredProducts.map((product) => {

                  const id =
                    getProductId(product);

                  const discount =
                    getDiscount(product);

                  const mrp =
                    getMrp(product);

                  return (

                    <article
                      className="shop-product-card"
                      key={id}
                    >

                      {/* IMAGE */}

                      <div className="shop-product-image">

                        {product.tag && (
                          <span className="shop-product-tag">
                            {product.tag}
                          </span>
                        )}

                        {discount > 0 && (
                          <span className="shop-discount-tag">
                            {discount}% OFF
                          </span>
                        )}

                        <button
                          className="shop-image-button"
                          onClick={() =>
                            openProduct(product)
                          }
                        >

                          <img
                            src={getImageUrl(
                              product.image
                            )}
                            alt={
                              product.name ||
                              "Ayurvedic product"
                            }
                            loading="lazy"
                            onError={(
                              event
                            ) => {
                              event.currentTarget.src =
                                "/images/placeholder.png";
                            }}
                          />

                        </button>

                        <button
                          className="shop-quick-view"
                          onClick={() =>
                            openProduct(product)
                          }
                        >
                          <i className="bi bi-eye"></i>
                          Quick View
                        </button>

                      </div>

                      {/* INFO */}

                      <div className="shop-product-info">

                        <div className="product-meta-row">

                          <span className="product-category">
                            {Array.isArray(
                              product.category
                            )
                              ? product.category.join(
                                  " • "
                                )
                              : product.category ||
                                "Ayurveda"}
                          </span>

                          <span className="product-rating">

                            <i className="bi bi-star-fill"></i>

                            {product.rating ||
                              "4.9"}

                            <small>
                              (
                              {product.reviews ||
                                "120"}
                              )
                            </small>

                          </span>

                        </div>

                        <h3>
                          {product.name ||
                            "Ayurvedic Product"}
                        </h3>

                        {product.description && (
                          <p>
                            {product.description}
                          </p>
                        )}

                        <div className="product-price-row">

                          <div className="product-prices">

                            <strong>
                              {formatPrice(
                                product.price ||
                                  product.mrp ||
                                  0
                              )}
                            </strong>

                            {mrp &&
                              getNumericPrice(
                                product
                              ) < mrp && (
                                <del>
                                  {formatPrice(mrp)}
                                </del>
                              )}

                          </div>

                          <button
                            className="add-cart-button"
                            onClick={() =>
                              addToCart(product)
                            }
                          >
                            <i className="bi bi-bag-plus"></i>
                            <span>Add</span>
                          </button>

                        </div>

                      </div>

                    </article>

                  );
                })}

              </div>

            )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!isLoading &&
            !error &&
            filteredProducts.length === 0 && (

              <div className="shop-empty">

                <div className="empty-icon">
                  <i className="bi bi-flower1"></i>
                </div>

                <h3>
                  No products found
                </h3>

                <p>
                  We couldn't find products matching
                  your current search or category.
                </p>

                <button
                  onClick={clearFilters}
                >
                  View All Products
                </button>

              </div>

            )}

        </div>

      </section>

      {/* ===================================================
          AYURVEDA BANNER
      =================================================== */}

      <section className="shop-ayurveda-banner">

        <div className="banner-decoration left">
          <i className="bi bi-flower1"></i>
        </div>

        <div className="banner-content">

          <span>
            THE SIDDHESWARI PHILOSOPHY
          </span>

          <h2>
            Rooted in Tradition.
            <br />
            <em>Created for Today.</em>
          </h2>

          <p>
            We believe in bringing the timeless
            principles of Ayurveda closer to modern
            life through carefully selected natural
            formulations.
          </p>

          <button
            onClick={() => navigate("/about")}
          >
            Discover Our Story
            <i className="bi bi-arrow-right"></i>
          </button>

        </div>

        <div className="banner-decoration right">
          <i className="bi bi-leaf"></i>
        </div>

      </section>

      {/* ===================================================
          WHY SIDDHESWARI
      =================================================== */}

      <section className="shop-benefits">

        <div className="shop-benefits-container">

          <div className="benefit-heading">

            <span>WHY CHOOSE US</span>

            <h2>
              The Siddheswari
              <br />
              Difference
            </h2>

          </div>

          <div className="benefit-grid">

            <div className="benefit-item">

              <div className="benefit-icon">
                <i className="bi bi-leaf"></i>
              </div>

              <h3>
                Natural Ingredients
              </h3>

              <p>
                Inspired by the goodness and
                purity of nature.
              </p>

            </div>

            <div className="benefit-item">

              <div className="benefit-icon">
                <i className="bi bi-flower1"></i>
              </div>

              <h3>
                Ayurvedic Wisdom
              </h3>

              <p>
                Products inspired by traditional
                Ayurvedic knowledge.
              </p>

            </div>

            <div className="benefit-item">

              <div className="benefit-icon">
                <i className="bi bi-patch-check"></i>
              </div>

              <h3>
                Quality Focused
              </h3>

              <p>
                We care about quality from
                formulation to packaging.
              </p>

            </div>

            <div className="benefit-item">

              <div className="benefit-icon">
                <i className="bi bi-heart"></i>
              </div>

              <h3>
                Made With Care
              </h3>

              <p>
                Thoughtfully created for your
                everyday wellness.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ===================================================
          PRODUCT DETAILS MODAL
      =================================================== */}

      {selectedProduct && (

        <div
          className="shop-modal-overlay"
          onClick={() =>
            setSelectedProduct(null)
          }
        >

          <div
            className="shop-product-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setSelectedProduct(null)
              }
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <div className="modal-product-grid">

              {/* MODAL IMAGE */}

              <div className="modal-product-image">

                {selectedProduct.tag && (
                  <span className="modal-product-tag">
                    {selectedProduct.tag}
                  </span>
                )}

                <img
                  src={getImageUrl(
                    selectedProduct.image
                  )}
                  alt={
                    selectedProduct.name
                  }
                  onError={(event) => {
                    event.currentTarget.src =
                      "/images/placeholder.png";
                  }}
                />

              </div>

              {/* MODAL INFO */}

              <div className="modal-product-info">

                <span className="modal-category">
                  {Array.isArray(
                    selectedProduct.category
                  )
                    ? selectedProduct.category.join(
                        " • "
                      )
                    : selectedProduct.category ||
                      "Ayurvedic Product"}
                </span>

                <h2>
                  {selectedProduct.name}
                </h2>

                <div className="modal-rating">

                  <span>
                    <i className="bi bi-star-fill"></i>

                    {selectedProduct.rating ||
                      "4.9"}
                  </span>

                  <small>
                    (
                    {selectedProduct.reviews ||
                      "120"}{" "}
                    reviews)
                  </small>

                </div>

                <div className="modal-price-area">

                  <strong>
                    {formatPrice(
                      selectedProduct.price ||
                        selectedProduct.mrp ||
                        0
                    )}
                  </strong>

                  {getMrp(
                    selectedProduct
                  ) &&
                    getNumericPrice(
                      selectedProduct
                    ) <
                      getMrp(
                        selectedProduct
                      ) && (
                      <del>
                        {formatPrice(
                          getMrp(
                            selectedProduct
                          )
                        )}
                      </del>
                    )}

                  {getDiscount(
                    selectedProduct
                  ) > 0 && (
                    <span>
                      {getDiscount(
                        selectedProduct
                      )}
                      % OFF
                    </span>
                  )}

                </div>

                {selectedProduct.description && (
                  <p className="modal-description">
                    {selectedProduct.description}
                  </p>
                )}

                <div className="modal-specifications">

                  <h3>
                    Product Information
                  </h3>

                  <div className="specification-row">

                    <i className="bi bi-box-seam"></i>

                    <div>
                      <strong>
                        Packaging & Weight
                      </strong>

                      <span>
                        {selectedProduct
                          .specifications
                          ?.weight ||
                          "Standard Pack"}
                      </span>
                    </div>

                  </div>

                  <div className="specification-row">

                    <i className="bi bi-capsule"></i>

                    <div>
                      <strong>
                        Recommended Dosage
                      </strong>

                      <span>
                        {selectedProduct
                          .specifications
                          ?.dosage ||
                          "As directed by Vaidya / Physician"}
                      </span>
                    </div>

                  </div>

                  <div className="specification-row">

                    <i className="bi bi-droplet"></i>

                    <div>
                      <strong>
                        Key Ingredients
                      </strong>

                      <span>
                        {selectedProduct
                          .specifications
                          ?.keyIngredients ||
                          "Authentic Ayurvedic Extracts"}
                      </span>
                    </div>

                  </div>

                  <div className="specification-row">

                    <i className="bi bi-heart-pulse"></i>

                    <div>
                      <strong>
                        Primary Benefits
                      </strong>

                      <span>
                        {selectedProduct
                          .specifications
                          ?.benefits ||
                          "Promotes overall health and vitality"}
                      </span>

                    </div>

                  </div>

                  <div className="specification-row">

                    <i className="bi bi-shield-check"></i>

                    <div>
                      <strong>
                        Certification & Purity
                      </strong>

                      <span>
                        {selectedProduct
                          .specifications
                          ?.certification ||
                          "Ayush Certified / ISO 9001"}
                      </span>

                    </div>

                  </div>

                </div>

                <div className="modal-actions">

                  <button
                    className="modal-add-cart"
                    onClick={() => {
                      addToCart(
                        selectedProduct
                      );
                      setSelectedProduct(
                        null
                      );
                    }}
                  >
                    <i className="bi bi-bag-plus"></i>
                    Add to Cart
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ===================================================
          CART DRAWER
      =================================================== */}

      {cart.length > 0 && (

        <aside className="shop-cart-drawer">

          <div className="cart-drawer-header">

            <div>
              <span>
                YOUR SHOPPING BAG
              </span>

              <h2>
                Cart ({cartCount})
              </h2>
            </div>

          </div>

          <div className="cart-items">

            {cart.map((item) => (

              <div
                className="cart-item"
                key={item.id}
              >

                <img
                  src={getImageUrl(
                    item.product.image
                  )}
                  alt={
                    item.product.name
                  }
                  onError={(event) => {
                    event.currentTarget.src =
                      "/images/placeholder.png";
                  }}
                />

                <div className="cart-item-info">

                  <h4>
                    {item.product.name}
                  </h4>

                  <strong>
                    {formatPrice(
                      getNumericPrice(
                        item.product
                      )
                    )}
                  </strong>

                  <div className="cart-quantity">

                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          -1
                        )
                      }
                    >
                      −
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          1
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                </div>

                <button
                  className="remove-cart-item"
                  onClick={() =>
                    removeFromCart(
                      item.id
                    )
                  }
                  aria-label="Remove"
                >
                  <i className="bi bi-trash"></i>
                </button>

              </div>

            ))}

          </div>

          <div className="cart-drawer-footer">

            <div className="cart-total">

              <span>
                Total
              </span>

              <strong>
                ₹
                {cartTotal.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            <button
              className="checkout-button"
              onClick={() =>
                navigate("/checkout")
              }
            >
              Proceed to Checkout
              <i className="bi bi-arrow-right"></i>
            </button>

          </div>

        </aside>

      )}

      {showOffer && (
        <div className="offer-popup-overlay">
          <div className="offer-popup">

            <button
              className="offer-popup-close"
              onClick={() => setShowOffer(false)}
              aria-label="Close offer"
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <div className="offer-popup-icon">
              <i className="bi bi-gift-fill"></i>
            </div>

            <span className="offer-popup-kicker">
              🌿 CURRENT OFFER 🌿
            </span>

            <h2>Special Ayurvedic Offer</h2>

            <div className="offer-discount">
              <span>15%</span> OFF
            </div>

            <p>
              Enjoy <strong>15% OFF</strong> on selected Ayurvedic
              products from Siddheswari Ayurveda.
            </p>

            <span className="offer-limited">
              ✨ Limited Time Offer ✨
            </span>

            <button
              className="btn-gold-primary offer-shop-btn"
              onClick={() => {
                setShowOffer(false);
                document.getElementById('shop')?.scrollIntoView({
                  behavior: 'smooth'
                });
              }}
            >
              <i className="bi bi-bag-heart-fill"></i>
              Shop Now
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
