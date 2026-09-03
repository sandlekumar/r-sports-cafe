import React, { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AnimatePresence } from 'framer-motion'
import './index.css'
import App from './App.jsx'
import TurfPage from './pages/TurfPage.jsx'
import PageTransition from './components/PageTransition.jsx'
import Navbar from './components/Navbar.jsx'
import { initGA } from './utils/analytics.js'

// Lazy-loaded pages
const MenuPage = React.lazy(() => import('./pages/MenuPage.jsx'))
const EventsPage = React.lazy(() => import('./pages/EventsPage.jsx'))
const GalleryPage = React.lazy(() => import('./pages/GalleryPage.jsx'))
const ContactPage = React.lazy(() => import('./pages/ContactPage.jsx'))
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage.jsx'))
const TableBooking = React.lazy(() => import('./features/booking/pages/TableBooking.jsx'))

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-night">
    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Wrap route in suspense + page transition
const Lazy = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    <PageTransition>{children}</PageTransition>
  </Suspense>
);

// Animated routes wrapper — uses useLocation for exit animations
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<App />} />
        <Route path="/turf" element={<PageTransition><TurfPage /></PageTransition>} />
        <Route path="/menu" element={<Lazy><MenuPage /></Lazy>} />
        <Route path="/events" element={<Lazy><EventsPage /></Lazy>} />
        <Route path="/gallery" element={<Lazy><GalleryPage /></Lazy>} />
        <Route path="/contact" element={<Lazy><ContactPage /></Lazy>} />
        <Route path="/book-table" element={<Lazy><TableBooking /></Lazy>} />
        <Route path="*" element={<Lazy><NotFoundPage /></Lazy>} />
      </Routes>
    </AnimatePresence>
  );
}

// Initialize Google Analytics
initGA()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Navbar />
        <AnimatedRoutes />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
