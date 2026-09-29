import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../api/config";
import "../CSS/Checkout.css";

const getProductId = (product) =>
    product._id || product.remedyId || product.id || product.productId;

const getOriginalPrice = (product) => {
    const value = product.price ?? product.mrp ?? 0;
    const numericValue = Number(String(value).replace(/[^\d.]/g, ""));
    return Number.isNaN(numericValue) ? 0 : numericValue;
};

const getPrice = (product) =>
    getOriginalPrice(product) *
    (1 - Number(product.discount || 0) / 100);

const formatPrice = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 0,
    })}`;

const readCart = () => {
    try {
        const savedCart = JSON.parse (
            localStorage.getItem("ayurveda-cart") || "[]"
        );

        return Array.isArray(savedCart) ? savedCart : [];
    } catch {
        return [];
    }
};

export default function Checkout() {
    const navigate = useNavigate();

    const [cart, setCart] = useState(readCart);

    const loggedInUser = JSON.parse (
        localStorage.getItem("loggedInUser") || "null"
    );

    const [customer, setCustomer] = useState({
        name: loggedInUser?.name || loggedInUser?.customerName || "",
        phone: loggedInUser?.phone || "",
        address: loggedInUser?.address || "",
        city: loggedInUser?.city || "",
        state: loggedInUser?.state || "",
        pincode: loggedInUser?.pincode || "",
    });

    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [submitted, setSubmitted] = useState(false);

    const totals = useMemo(() => {
        const subtotal = cart.reduce(
            (total, item) =>
            total + getPrice(item.product) * item.quantity,
            0
        );

        const mrpTotal = cart.reduce((total, item) => {
            const mrp = item.product.mrp || getOriginalPrice(item.product);

            const numericMrp = Number(
                String(mrp).replace(/[^\d.]/g, "")
            );

            return (
                total + (Number.isNaN(numericMrp) ? 0 : numericMrp) * item.quantity
            );
        }, 0);

        // Delivery rule:
        // More than ₹700 = FREE
        // ₹700 or less = ₹20
        const deliveryCharge = subtotal > 700 ? 0 : 20;

        const total = subtotal + deliveryCharge;

        return {
            subtotal,
            savings: Math.max(0, mrpTotal - subtotal),
            deliveryCharge,
            total,
        };
    }, [cart]);

    const updateCustomer = (event) => {
        const { name, value } = event.target;

        setCustomer((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        setSubmitted(true);
        localStorage.removeItem("ayurveda-cart");
        setCart([]);
    };

    if (submitted) {
        return (
            <main className="checkout-page checkout-confirmation">
                <div className="checkout-success">
                    <div className="success-icon">
                        <i className="bi bi-check-lg"></i>
                    </div>

                    <span className="success-label">SIDDHESWARI AYURVEDA</span>
                    <h1>Order Received Successfully</h1>
                    <p>
                        Thank you for shopping with Siddheswari Ayurveda.
                        Your order details have been received and prepared
                        for payment.
                    </p>

                    <button className="checkout-primary-button" onClick={() => navigate("/shop")}>
                        Continue Shopping
                        <i className="bi bi-arrow-right"></i>
                    </button>
                </div>
            </main>
        );
    }

    if (!cart.length) {
        return (
            <main className="checkout-page checkout-confirmation">
                <div className="checkout-success empty-cart">
                    <div className="success-icon">
                        <i className="bi bi-bag"></i>
                    </div>

                    <span className="success-label">YOUR SHOPPING BAG</span>

                    <h1>Your Cart Is Empty</h1>

                    <p>
                        Discover our Ayurvedic remedies and add your
                        favourites to your shopping bag.
                    </p>

                    <button className="checkout-primary-button" onClick={() => navigate("/shop")}>
                        Explore Shop
                        <i className="bi bi-arrow-right"></i>
                    </button>
                </div>
            </main>
        );
    }

  return (
    <main className="checkout-page">

      {/* Decorative background */}
      <div className="checkout-decoration checkout-leaf-one">
        <i className="bi bi-leaf"></i>
      </div>

      <div className="checkout-decoration checkout-leaf-two">
        <i className="bi bi-flower1"></i>
      </div>

      {/* Header */}
      <header className="checkout-header">

        <button
          className="checkout-back-button"
          onClick={() => navigate("/shop")}
          aria-label="Back to shop"
        >
          <i className="bi bi-arrow-left"></i>
        </button>

        <div className="checkout-title-area">
          <span>SIDDHESWARI AYURVEDA</span>
          <h1>Checkout</h1>
          <p>Complete your order with confidence.</p>
        </div>

        <div className="checkout-secure-badge">
          <i className="bi bi-shield-check"></i>
          Secure Checkout
        </div>

      </header>

      <form
        className="checkout-layout"
        onSubmit={handleSubmit}
      >

        {/* LEFT SIDE */}
        <section className="checkout-panel checkout-main-panel">

          {/* Delivery */}
          <div className="checkout-section-heading">

            <div className="section-icon">
              <i className="bi bi-person-vcard"></i>
            </div>

            <div>
              <h2>Delivery Details</h2>
              <p>
                Tell us where you'd like your remedies delivered.
              </p>
            </div>

          </div>

          <div className="checkout-form-grid">

            <label>
              <span>
                Full Name <em>*</em>
              </span>

              <div className="input-wrapper">
                <i className="bi bi-person"></i>

                <input
                  name="name"
                  value={customer.name}
                  onChange={updateCustomer}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </label>

            <label>
              <span>
                Phone Number <em>*</em>
              </span>

              <div className="input-wrapper">
                <i className="bi bi-telephone"></i>

                <input
                  name="phone"
                  type="tel"
                  value={customer.phone}
                  onChange={updateCustomer}
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
            </label>

            <label className="checkout-full-width">
              <span>
                Delivery Address <em>*</em>
              </span>

              <div className="input-wrapper textarea-wrapper">
                <i className="bi bi-geo-alt"></i>

                <textarea
                  name="address"
                  value={customer.address}
                  onChange={updateCustomer}
                  placeholder="House / Shop / Street / Locality"
                  rows="3"
                  required
                />
              </div>
            </label>

            <label>
              <span>
                City <em>*</em>
              </span>

              <div className="input-wrapper">
                <i className="bi bi-buildings"></i>

                <input
                  name="city"
                  value={customer.city}
                  onChange={updateCustomer}
                  placeholder="Your city"
                  required
                />
              </div>
            </label>

            <label>
              <span>
                State <em>*</em>
              </span>

              <div className="input-wrapper">
                <i className="bi bi-map"></i>

                <input
                  name="state"
                  value={customer.state}
                  onChange={updateCustomer}
                  placeholder="Your state"
                  required
                />
              </div>
            </label>

            <label>
              <span>
                PIN Code <em>*</em>
              </span>

              <div className="input-wrapper">
                <i className="bi bi-pin-map"></i>

                <input
                  name="pincode"
                  value={customer.pincode}
                  onChange={updateCustomer}
                  placeholder="6-digit PIN"
                  inputMode="numeric"
                  required
                />
              </div>
            </label>

          </div>

          {/* Payment */}
          <div className="checkout-section-heading checkout-payment-heading">

            <div className="section-icon">
              <i className="bi bi-wallet2"></i>
            </div>

            <div>
              <h2>Payment Method</h2>
              <p>Choose your preferred payment option.</p>
            </div>

          </div>

          <div className="payment-options">

            <label
              className={`payment-option ${
                paymentMethod === "cod" ? "selected" : ""
              }`}
            >

              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
              />

              <div className="payment-option-icon">
                <i className="bi bi-cash-stack"></i>
              </div>

              <span>
                <strong>Cash on Delivery</strong>
                <small>Pay when your order arrives</small>
              </span>

              <i className="bi bi-check-circle-fill payment-check"></i>

            </label>

            {/* <label
              className={`payment-option ${
                paymentMethod === "online" ? "selected" : ""
              }`}
            >

              <input
                type="radio"
                name="payment"
                value="online"
                checked={paymentMethod === "online"}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
              />

              <div className="payment-option-icon">
                <i className="bi bi-credit-card"></i>
              </div>

              <span>
                <strong>Online Payment</strong>
                <small>UPI, card or net banking</small>
              </span>

              <i className="bi bi-check-circle-fill payment-check"></i>

            </label> */}

          </div>

          <button
            className="checkout-primary-button checkout-submit"
            type="submit"
          >
            <span>Place Order</span>
            <i className="bi bi-arrow-right"></i>
          </button>

          <div className="checkout-trust-row">
            <span>
              <i className="bi bi-shield-check"></i>
              Secure
            </span>

            <span>
              <i className="bi bi-truck"></i>
              Reliable Delivery
            </span>

            <span>
              <i className="bi bi-leaf"></i>
              Ayurvedic Care
            </span>
          </div>

        </section>

        {/* RIGHT SIDE */}
        <aside className="checkout-panel checkout-summary">

          <div className="summary-top">

            <div className="checkout-section-heading">

              <div className="section-icon">
                <i className="bi bi-bag-heart"></i>
              </div>

              <div>
                <h2>Order Summary</h2>
                <p>
                  {cart.length} product
                  {cart.length === 1 ? "" : "s"} in your order
                </p>
              </div>

            </div>

          </div>

          <div className="checkout-items">

            {cart.map((item) => {
              const originalPrice = getOriginalPrice(item.product);
              const discountedPrice = getPrice(item.product);
              const discount = Number(item.product.discount || 0);

              return (
                <div
                  className="checkout-item"
                  key={getProductId(item.product)}
                >

                  <div className="checkout-item-image">

                    <img
                      src={getImageUrl(item.product.image)}
                      alt={item.product.name}
                    />

                    {discount > 0 && (
                      <span>{discount}% OFF</span>
                    )}

                  </div>

                  <div className="checkout-item-info">

                    <strong>
                      {item.product.name}
                    </strong>

                    <span>
                      Qty {item.quantity}
                    </span>

                    <div className="item-price">

                      {discount > 0 && (
                        <del>
                          {formatPrice(originalPrice)}
                        </del>
                      )}

                      <b>
                        {formatPrice(discountedPrice)}
                      </b>

                    </div>

                  </div>

                  <strong className="checkout-item-total">
                    {formatPrice(
                      discountedPrice * item.quantity
                    )}
                  </strong>

                </div>
              );
            })}

          </div>

          {/* Savings */}
          {totals.savings > 0 && (
            <div className="checkout-savings-card">

              <div className="savings-icon">
                <i className="bi bi-tag-fill"></i>
              </div>

              <div>
                <strong>You're saving money!</strong>
                <span>
                  You saved {formatPrice(totals.savings)} on this order.
                </span>
              </div>

            </div>
          )}

          <div className="checkout-total-lines">

            <div>
              <span>Subtotal</span>
              <b>{formatPrice(totals.subtotal)}</b>
            </div>

            <div>
                <span>Delivery</span>

                {totals.deliveryCharge === 0 ? (
                    <b className="free-text">FREE</b>
                ) : (
                    <b>{formatPrice(totals.deliveryCharge)}</b>
                )}
            </div>

            {totals.savings > 0 && (
              <div className="saving-line">
                <span>Total Savings</span>
                <b>
                  - {formatPrice(totals.savings)}
                </b>
              </div>
            )}

          </div>

          <div className="checkout-grand-total">

            <div>
              <span>Total Payable</span>
              <small>Inclusive of applicable discounts</small>
            </div>

            <strong>
              {formatPrice(totals.total)}
            </strong>

          </div>

          <div className="checkout-secure">

            <i className="bi bi-shield-lock-fill"></i>

            <div>
              <strong>Safe & Secure Checkout</strong>
              <span>Your order information is protected.</span>
            </div>

          </div>

        </aside>

      </form>

    </main>
  );
}