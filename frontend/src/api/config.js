export const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || "https://shade-graduate-lane-pubs.trycloudflare.com/api";

// Root backend URL without trailing /api
export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, "");

/**
 * Resolves remedy image paths to full public URLs
 */
export const getImageUrl = (img) => {
  if (!img) {
    return "/images/placeholder.png";
  }

  if (typeof img !== "string") {
    return "/images/placeholder.png";
  }

  // Already a full remote URL (e.g. http://, https://)
  if (img.startsWith("http://") || img.startsWith("https://")) {
    return img;
  }

  // Backend uploaded remedy image
  if (img.startsWith("/remedies-images")) {
    return `${BACKEND_URL}${img}`;
  }

  // Fallback for public frontend assets
  return img;
};

