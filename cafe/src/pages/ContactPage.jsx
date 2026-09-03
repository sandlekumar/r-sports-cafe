import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import Booking from '../components/Booking';
import { trackEvent } from '../utils/analytics';

export default function ContactPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#070709] text-[#F7F5EF] font-sans antialiased selection:bg-[#D4AF37] selection:text-black">
      <SEO
        title="Contact R Sports & Cafe | Thoothukudi"
        description="Find R Sports & Cafe at Caldwell Colony, Thoothukudi. Get directions, contact us or make your booking online."
        canonical="/contact"
      />
      
      

      <main className="bg-[#0A0A0A]">
        <div className="pt-24 pb-8 px-6 lg:px-16 text-center max-w-3xl mx-auto">
          <h1 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-[#D4AF37] uppercase tracking-wider mb-4">Contact & Reservations</h1>
          <p className="text-white/60 font-inter text-sm md:text-base">Reserve your table, book the turf, or get in touch for any inquiries.</p>
        </div>
        <Booking />
      </main>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-12 px-6 lg:px-16 text-center text-white/40 font-inter text-[12px]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 R Sports & Cafe. Gourmet Dining & Sports Club Experience.</p>
          <div className="flex items-center gap-6 font-bold uppercase tracking-[0.12em] text-[11px] text-white/60">
            <Link to="/" className="hover:text-[#D4AF37]">Home</Link>
            <Link to="/turf" className="hover:text-[#D4AF37]">Turf</Link>
            <Link to="/menu" className="hover:text-[#D4AF37]">Menu</Link>
            <Link to="/book-table" onClick={() => trackEvent('Table Booking Click', 'Footer', 'ContactPage Footer')} className="hover:text-[#D4AF37]">Reserve Table</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
