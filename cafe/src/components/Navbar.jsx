import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import MagneticButton from './MagneticButton';
import { trackEvent } from '../utils/analytics';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuItems = ['HOME', 'EVENTS', 'MENU', 'TURF', 'GALLERY', 'REVIEWS', 'BOOKING'];

  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Detect if current section has a dark background
  const DARK_SECTIONS = ['menu', 'turf', 'booking'];
  let isDark = DARK_SECTIONS.includes(activeSection);
  
  if (!isHomePage) {
    if (location.pathname === '/menu') isDark = true;
    if (location.pathname === '/turf') isDark = false;
    if (location.pathname === '/events') isDark = true;
    if (location.pathname === '/gallery') isDark = true;
    if (location.pathname === '/contact') isDark = false;
    if (location.pathname === '/book-table') isDark = false;
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('section[id], div[id="hero-section"]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id === 'hero-section' ? 'home' : entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      if (window.__lenis) window.__lenis.stop();
    } else {
      document.body.style.overflow = '';
      if (window.__lenis) window.__lenis.start();
    }
  }, [menuOpen]);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 px-4 sm:px-6 md:px-12 pointer-events-none flex justify-between items-center font-sans transition-all duration-500 ${scrolled ? 'py-4' : 'py-6 md:py-8'}`}
        style={{
          background: 'transparent',
          backdropFilter: 'none',
          borderBottom: scrolled ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(17,17,17,0.06)'}` : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.04)' : 'none',
        }}
      >
        
        {/* Left: Floating Brand Logo with small R monogram icon */}
        <div 
          className="pointer-events-auto flex items-center gap-2.5 px-3 md:px-4 py-2 md:py-2.5 rounded-full select-none transition-all duration-300 hover:scale-102"
        >
          {/* Custom luxury R logo SVG monogram */}
          <svg 
            className={`w-3.5 h-3.5 transition-colors duration-500 ${isDark ? 'text-white' : 'text-darkText'}`}
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
            <path d="M13 13l4 4" />
          </svg>
          <span className={`font-sans font-semibold text-[18px] md:text-[22px] tracking-[0.08em] whitespace-nowrap transition-colors duration-500 ${isDark ? 'text-white' : 'text-darkText'}`}>
            R SPORTS <span className="hidden sm:inline">&amp; CAFE</span>
          </span>
        </div>

        {/* Center: Rounded Pill Navbar in transparent clear glass style */}
        <div 
          className="pointer-events-auto hidden md:flex items-center gap-8 px-8 py-2.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-500"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.45)',
            backdropFilter: 'blur(18px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.10)' : '1px solid rgba(17, 17, 17, 0.12)',
          }}
        >
          {menuItems.map((item) => {
            const isMenu = item === 'MENU';
            const isBook = item === 'BOOKING';
            const targetUrl = isMenu ? '/menu' : isBook ? '/book-table' : (isHomePage ? `#${item.toLowerCase()}` : `/#${item.toLowerCase()}`);
            return (
              <MagneticButton key={item} strength={0.25}>
                {isMenu || isBook ? (
                  <Link
                    to={targetUrl}
                    className={`relative font-sans text-[15px] tracking-[0.08em] font-medium transition-colors duration-500 uppercase ${activeSection === item.toLowerCase() ? (isDark ? 'text-white' : 'text-darkText') : (isDark ? 'text-white/50 hover:text-white' : 'text-darkText/50 hover:text-darkText')}`}
                  >
                    {item}
                  </Link>
                ) : (
                  <a
                    href={targetUrl}
                    className={`relative font-sans text-[15px] tracking-[0.08em] font-medium transition-colors duration-500 uppercase ${activeSection === item.toLowerCase() ? (isDark ? 'text-white' : 'text-darkText') : (isDark ? 'text-white/50 hover:text-white' : 'text-darkText/50 hover:text-darkText')}`}
                  >
                    {item}
                    {activeSection === item.toLowerCase() && (
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />
                    )}
                  </a>
                )}
              </MagneticButton>
            );
          })}
        </div>

        {/* Right: CTA Button & Hamburger */}
        <div className="flex items-center gap-3">
          <MagneticButton strength={0.35}>
            <Link
              to="/book-table"
              onClick={() => trackEvent('Table Booking Click', 'Navigation', 'Navbar Reserve Table')}
              className="pointer-events-auto flex font-sans font-medium text-[11px] sm:text-[13px] md:text-[14px] tracking-[0.08em] px-4 sm:px-5 md:px-6 py-2 md:py-2.5 rounded-full border transition-all duration-300 hover:scale-105 uppercase"
              style={{ borderColor: '#D4AF37', color: '#D4AF37', background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#D4AF37'; e.currentTarget.style.color = '#070707'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#D4AF37'; }}
            >
              <span className="sm:hidden">{location.pathname === '/turf' ? 'BOOK TURF' : 'RESERVE'}</span>
              <span className="hidden sm:inline">{location.pathname === '/turf' ? 'BOOK TURF' : 'RESERVE TABLE'}</span>
            </Link>
          </MagneticButton>



          {/* Hamburger Menu Toggle (Mobile) */}
          <button 
            className="pointer-events-auto md:hidden w-10 h-10 rounded-full bg-white/50 border border-darkText/10 backdrop-blur-md flex flex-col items-center justify-center gap-[4px] relative z-[60]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            <span className={`w-5 h-[1.5px] transition-all duration-300 ${isDark ? 'bg-white' : 'bg-darkText'} ${menuOpen ? 'translate-y-[2.75px] rotate-45' : ''}`} />
            <span className={`w-5 h-[1.5px] transition-all duration-300 ${isDark ? 'bg-white' : 'bg-darkText'} ${menuOpen ? '-translate-y-[2.75px] -rotate-45' : ''}`} />
          </button>
        </div>

      </nav>

      {/* Mobile Menu Fullscreen Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[55] bg-sandalBg flex flex-col justify-center items-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 backdrop-blur-3xl pointer-events-none" />
            
            <ul className="relative z-10 flex flex-col items-center gap-6 w-full px-6">
              {menuItems.map((item, i) => {
                const isMenu = item === 'MENU';
                const isBook = item === 'BOOKING';
                const targetUrl = isMenu ? '/menu' : isBook ? '/book-table' : (isHomePage ? `#${item.toLowerCase()}` : `/#${item.toLowerCase()}`);
                return (
                  <motion.li 
                    key={item}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.05), duration: 0.4 }}
                  >
                    {isMenu || isBook ? (
                      <Link
                        to={targetUrl}
                        className={`font-sans font-bold text-[32px] tracking-widest uppercase transition-colors ${activeSection === item.toLowerCase() ? 'text-[#D4AF37]' : 'text-darkText hover:text-darkText/70'}`}
                        onClick={() => setMenuOpen(false)}
                      >
                        {item}
                      </Link>
                    ) : (
                      <a
                        href={targetUrl}
                        className={`font-sans font-bold text-[32px] tracking-widest uppercase transition-colors ${activeSection === item.toLowerCase() ? 'text-[#D4AF37]' : 'text-darkText hover:text-darkText/70'}`}
                        onClick={() => setMenuOpen(false)}
                      >
                        {item}
                      </a>
                    )}
                  </motion.li>
                );
              })}
              <motion.li
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (menuItems.length * 0.05), duration: 0.4 }}
                className="mt-8 sm:hidden"
              >
                 <Link
                    to="/book-table"
                    className="font-sans font-medium text-[16px] tracking-widest uppercase text-sandalBg bg-darkText px-8 py-4 rounded-full transition-all hover:scale-105"
                    onClick={() => setMenuOpen(false)}
                  >
                    {location.pathname === '/turf' ? 'BOOK TURF' : 'RESERVE TABLE'}
                  </Link>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
