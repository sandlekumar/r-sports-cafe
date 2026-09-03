import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import Events from '../components/Events';
import { trackEvent } from '../utils/analytics';

export default function EventsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-ev-bg text-[#FDFBF7] font-sans antialiased selection:bg-ev-accent selection:text-white">
      <SEO
        title="Birthday & Event Venue in Thoothukudi | R Sports & Cafe"
        description="Celebrate birthdays, anniversaries, corporate gatherings and private events at R Sports & Cafe in Thoothukudi."
        canonical="/events"
      />
      
      

      <main>
        <div className="pt-24 pb-8 px-6 lg:px-16 text-center max-w-3xl mx-auto">
          <h1 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-[#D4AF37] uppercase tracking-wider mb-4">Host Your Events</h1>
          <p className="text-white/60 font-inter text-sm md:text-base">Celebrate your special moments with our premium event hosting services.</p>
        </div>
        <Events />
      </main>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-12 px-6 lg:px-16 text-center text-white/40 font-inter text-[12px]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 R Sports & Cafe. Gourmet Dining & Sports Club Experience.</p>
          <div className="flex items-center gap-6 font-bold uppercase tracking-[0.12em] text-[11px] text-white/60">
            <Link to="/" className="hover:text-[#D4AF37]">Home</Link>
            <Link to="/turf" className="hover:text-[#D4AF37]">Turf</Link>
            <Link to="/menu" className="hover:text-[#D4AF37]">Menu</Link>
            <Link to="/book-table" onClick={() => trackEvent('Table Booking Click', 'Footer', 'EventsPage Footer')} className="hover:text-[#D4AF37]">Reserve Table</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
