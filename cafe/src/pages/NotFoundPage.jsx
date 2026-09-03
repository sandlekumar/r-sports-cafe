import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFoundPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#070709] text-[#F7F5EF] flex flex-col items-center justify-center font-sans antialiased selection:bg-[#D4AF37] selection:text-black px-6 text-center relative overflow-hidden">
      <SEO
        title="404 - Page Not Found | R Sports & Cafe"
        description="The page you are looking for does not exist."
      />
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[#D4AF37] rounded-full blur-[200px] opacity-[0.05] pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        <h1 className="font-sans font-bold text-[120px] md:text-[180px] leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#D4AF37] to-[#B8860B] mb-2 drop-shadow-2xl">
          404
        </h1>
        <h2 className="font-sans font-bold text-[28px] md:text-[40px] uppercase tracking-tight text-white mb-6">
          Page Not Found
        </h2>
        <p className="font-inter text-[16px] text-white/50 mb-10 max-w-md mx-auto leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Link 
          to="/" 
          className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-sans text-[13px] font-bold tracking-[0.14em] uppercase hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all active:scale-95"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
