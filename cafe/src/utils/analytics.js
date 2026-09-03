import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-XXXXXXXXXX"; // Replace with your actual GA4 Measurement ID

/**
 * Initialize Google Analytics
 */
export const initGA = () => {
  if (import.meta.env.PROD) { // Optional: only run in production, but for testing we can initialize it always or conditionally
    ReactGA.initialize(MEASUREMENT_ID);
  } else {
    // For local testing, initialize anyway to see events in console via GA Debugger
    ReactGA.initialize(MEASUREMENT_ID, { testMode: true });
  }
};

/**
 * Track Page Views
 * Call this inside a useEffect in App or Router
 */
export const trackPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

/**
 * Track Custom Events
 * @param {string} action - e.g., 'Turf Booking Click', 'WhatsApp Click'
 * @param {string} category - e.g., 'Engagement', 'Conversion'
 * @param {string} label - e.g., 'Navbar CTA', 'Footer'
 */
export const trackEvent = (action, category = "User Engagement", label = "") => {
  ReactGA.event({
    category: category,
    action: action,
    label: label,
  });
};
