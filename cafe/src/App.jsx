import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SmoothScroll from './components/SmoothScroll';
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import ScrollVideoHero from './components/ScrollVideoHero';
import Events from './components/Events';
import Philosophy from './components/Philosophy';
import Menu from './components/Menu';
import Turf from './components/Turf';
import Gallery from './components/Gallery';
import Reels from './components/Reels';
import Reviews from './components/Reviews';
import Booking from './components/Booking';
import Cursor3D from './components/cursor/Cursor3D';
import SectionColorMorph from './components/SectionColorMorph';
import SEO from './components/SEO';
import LocalBusinessSchema from './components/LocalBusinessSchema';
import ScrollReveal from './components/ScrollReveal';

export default function App() {
  const [email, setEmail] = useState('');
  const [joinStatus, setJoinStatus] = useState('');

  const handleJoin = async () => {
    if (!email) return;
    try {
      setJoinStatus('Joining...');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Failed to subscribe');
      setJoinStatus('Joined!');
      setEmail('');
      setTimeout(() => setJoinStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setJoinStatus('Error');
      setTimeout(() => setJoinStatus(''), 3000);
    }
  };

  return (
    <>
      <SEO
        title="R Sports & Cafe Thoothukudi | Turf, Food & Table Booking"
        description="Visit R Sports & Cafe in Thoothukudi for sports turf, great food, coffee and desserts. Book your turf, reserve a table or plan an event."
        canonical="/"
      />
      <LocalBusinessSchema />
      
      {/* Removed hidden natural language SEO text */}

      <SmoothScroll>
        <Preloader />
      <div className="app-wrapper bg-sandalBg text-darkText relative min-h-screen" style={{ transition: 'background-color 0.8s ease' }}>
        {/* Subtle moving paper grain */}
        <div className="noise-overlay" />

        {/* Background color morph between sections */}
        <SectionColorMorph />

        {/* 3D Custom Cursor Overlay */}
        <Cursor3D />

        {/* Premium Luxury Navbar (Moved to main.jsx for global presence) */}

        {/* Animated Pinned Video Scroll Hero Section */}
        <ScrollVideoHero />

        {/* Philosophy / About Section */}
        <ScrollReveal><Philosophy /></ScrollReveal>

        {/* Exclusive VIP Events Section */}
        <ScrollReveal><Events /></ScrollReveal>

        {/* Interactive Luxury Menu Section */}
        <ScrollReveal><Menu /></ScrollReveal>

        {/* High-End Sports Club Campaign Turf Section */}
        <ScrollReveal><Turf /></ScrollReveal>

        {/* Pinned Film Strip Horizontal Gallery Section */}
        <ScrollReveal><Gallery /></ScrollReveal>

        {/* Instagram-Style Video Reels Section */}
        <ScrollReveal><Reels /></ScrollReveal>

        {/* Awwwards-Level Reviews Section */}
        <ScrollReveal><Reviews /></ScrollReveal>

        {/* Luxury Booking Form Section */}
        <ScrollReveal><Booking /></ScrollReveal>

        {/* Hyper-Aesthetic Luxury Footer */}
        <footer className="bg-night text-lightText pt-32 pb-12 px-6 md:px-20 border-t-2 border-t-gold/20 relative overflow-hidden">
          {/* Huge background text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.06]">
            <h2 className="font-sans font-bold text-[15vw] leading-none whitespace-nowrap tracking-[-0.05em] text-gradient-gold" style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>R SPORTS & CAFE</h2>
          </div>

          <div className="max-w-7xl mx-auto relative z-10 flex flex-col justify-between h-full">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 pb-32">
              <div className="md:col-span-5 space-y-8">
                <div className="flex items-center gap-3 font-sans font-bold text-[28px] tracking-[0.1em] text-white">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="3" width="18" height="18" rx="4" />
                    <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
                    <path d="M13 13l4 4" />
                  </svg>
                  R SPORTS & CAFE
                </div>
                <p className="font-inter font-normal text-[16px] md:text-[20px] leading-[1.6] text-white/50 max-w-[340px]">
                  Play well. Eat well. Stay awhile.
                </p>
                <div className="font-inter font-normal text-[14px] leading-[1.6] text-white/40 max-w-[340px]">
                  SNR Nagar, 4/4,<br />
                  Caldwell Colony,<br />
                  Thoothukudi,<br />
                  Tamil Nadu – 628003<br />
                  <br />
                  <span className="text-white">Phone: +91 73585 85151</span>
                </div>
              </div>

              <div className="md:col-span-3 space-y-6">
                <h4 className="font-inter font-medium text-[11px] tracking-[0.2em] text-white/30 uppercase">Quick Links</h4>
                <ul className="space-y-3 font-inter text-[14px] tracking-[0.1em] text-white/70 uppercase">
                  <li><Link to="/" className="hover:text-white transition-colors duration-300 hover-underline-gold">Home</Link></li>
                  <li><Link to="/turf" className="hover:text-white transition-colors duration-300 hover-underline-gold">Sports</Link></li>
                  <li><Link to="/menu" className="hover:text-white transition-colors duration-300 hover-underline-gold">Menu</Link></li>
                  <li><Link to="/book-table" className="hover:text-white transition-colors duration-300 hover-underline-gold">Table Booking</Link></li>
                  <li><Link to="/events" className="hover:text-white transition-colors duration-300 hover-underline-gold">Events</Link></li>
                  <li><Link to="/gallery" className="hover:text-white transition-colors duration-300 hover-underline-gold">Gallery</Link></li>
                  <li><Link to="/contact" className="hover:text-white transition-colors duration-300 hover-underline-gold">Contact</Link></li>
                </ul>
              </div>

              <div className="md:col-span-4 space-y-6">
                <h4 className="font-inter font-medium text-[11px] tracking-[0.2em] text-white/30 uppercase">Services</h4>
                <ul className="space-y-3 font-inter text-[14px] tracking-[0.1em] text-white/70 uppercase">
                  <li><Link to="/turf" className="hover:text-white transition-colors duration-300 hover-underline-gold">Turf Booking</Link></li>
                  <li><Link to="/book-table" className="hover:text-white transition-colors duration-300 hover-underline-gold">Table Reservation</Link></li>
                  <li><Link to="/events" className="hover:text-white transition-colors duration-300 hover-underline-gold">Birthday Parties</Link></li>
                  <li><Link to="/events" className="hover:text-white transition-colors duration-300 hover-underline-gold">Private Events</Link></li>
                </ul>
              </div>
            </div>

            {/* Local SEO Section */}
            <div className="pb-16 max-w-3xl border-t border-white/10 pt-16">
              <h3 className="font-sans font-bold text-2xl text-white mb-4">Looking for a Sports Cafe in Thoothukudi?</h3>
              <p className="font-inter text-[14px] leading-relaxed text-white/60">
                R Sports & Cafe gives you more than one reason to visit.
                <br /><br />
                Play a game on the turf.<br />
                Meet friends over coffee.<br />
                Enjoy pizza, food and desserts.<br />
                Book a table with family.<br />
                Or celebrate a special occasion.
                <br /><br />
                <strong className="text-white">Play. Eat. Meet. Celebrate. All in One Place.</strong>
              </p>
            </div>

            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <span className="font-inter text-[11px] font-medium tracking-[0.2em] text-white/40 uppercase">
                © 2026 R SPORTS CAFE.
              </span>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="group flex items-center gap-2 font-inter text-[11px] font-medium tracking-[0.2em] text-white/40 uppercase hover:text-white/80 transition-colors duration-300"
              >
                <svg className="w-3 h-3 transform group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
                Back to top
              </button>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-inter text-[11px] font-medium tracking-[0.2em] text-white/40 uppercase">
                  Systems Operational
                </span>
              </div>
            </div>
          </div>
        </footer>

      </div>
      </SmoothScroll>
    </>
  );
}
