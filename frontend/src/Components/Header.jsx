import { useEffect, useRef, useState } from "react";
import Notification from "./Notification";
import "../CSS/Notification.css";
import { subscribeProducts } from "../services/productService";

const OFFER_STORAGE_KEY = "ayurveda-user-offers";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function readOffers() {
  try {
    const offers = JSON.parse(localStorage.getItem(OFFER_STORAGE_KEY) || "[]");
    return Array.isArray(offers) ? offers : [];
  } catch {
    return [];
  }
}

function parseDate(value) {
  if (!value || String(value).trim().toLowerCase() === "no expiry") return null;

  const valueString = String(value).trim();
  const monthYearMatch = valueString.match(/^(\d{1,2})[/-](\d{2}|\d{4})$/);
  if (monthYearMatch) {
    const month = Number(monthYearMatch[1]);
    const yearValue = Number(monthYearMatch[2]);
    const year = yearValue < 100 ? 2000 + yearValue : yearValue;
    if (month < 1 || month > 12) return null;
    return new Date(year, month, 0, 23, 59, 59, 999);
  }

  const date = new Date(`${valueString}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDate(value);
  return date
    ? date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "-";
}

function getDaysUntil(value, now) {
  const date = parseDate(value);
  if (!date) return null;
  return Math.ceil((date.getTime() - now.getTime()) / DAY_IN_MS);
}

export default function Header() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState(readOffers);
  const notificationContainerRef = useRef(null);
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  const capitalize = (text) => text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : "";

  const displayName = capitalize(loggedInUser?.username);

  // Get first letter of full name
  const avatarLetter =
    loggedInUser?.fullName?.trim()?.charAt(0).toUpperCase() ||
    loggedInUser?.username?.trim()?.charAt(0).toUpperCase();

  useEffect(() => subscribeProducts(setProducts), []);

  useEffect(() => {
    const refreshOffers = () => setOffers(readOffers());
    window.addEventListener("ayurveda-offer-updated", refreshOffers);
    window.addEventListener("storage", refreshOffers);
    return () => {
      window.removeEventListener("ayurveda-offer-updated", refreshOffers);
      window.removeEventListener("storage", refreshOffers);
    };
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryNotifications = products.flatMap((product) => {
    const expiry = product.expiryDate || product.expiry || product.batchExpiry;
    const daysUntilExpiry = getDaysUntil(expiry, today);
    if (daysUntilExpiry === null || daysUntilExpiry <= 0 || daysUntilExpiry > 60) return [];

    return [{
      id: `expiry-${product.itemCode || product._id || product.productName || product.product}`,
      title: "Upcoming expiry",
      message: `${product.productName || product.product || "Product"} expires on ${formatDate(expiry)}.`,
      icon: "bi-calendar-x",
      time: `${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"} remaining`,
    }];
  });

  const offerNotifications = offers.flatMap((offer) => {
    const daysUntilEnd = getDaysUntil(offer.validUntil, today);
    if (daysUntilEnd === null || daysUntilEnd < 0 || daysUntilEnd > 2) return [];

    return [{
      id: `offer-${offer.id || offer.title}`,
      title: "Offer ending soon",
      message: `${offer.title} ends on ${formatDate(offer.validUntil)}.`,
      icon: "bi-tag-fill",
      time: daysUntilEnd === 0 ? "Ends today" : `${daysUntilEnd} day${daysUntilEnd === 1 ? "" : "s"} remaining`,
    }];
  });

  const notifications = [...expiryNotifications, ...offerNotifications];

  useEffect(() => {
    if (!isNotificationsOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (!notificationContainerRef.current?.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isNotificationsOpen]);

  return (
    <header className="dashboard-header text-center">
      <h3 className="text-black">Welcome to the Dashboard, <span className="text-primary">{displayName}</span></h3>

      <div className="profile">
        <div className="notification-container" ref={notificationContainerRef}>
          <button
            type="button"
            className={`notification-trigger notification-icon hidden md:block ${isNotificationsOpen ? "is-open" : ""}`}
            onClick={() => setIsNotificationsOpen((isOpen) => !isOpen)}
            aria-label="Open notifications"
            aria-expanded={isNotificationsOpen}
          >
            <i className="bi bi-bell-fill"></i>
            {notifications.length > 0 && <span className="notification-count">{notifications.length > 99 ? "99+" : notifications.length}</span>}
          </button>
          <Notification
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            notifications={notifications}
          />
        </div>

        <div className="avatar">
          <span className="avatar-letter">
            {avatarLetter}
          </span>
        </div>
      </div>
    </header>
  );
}