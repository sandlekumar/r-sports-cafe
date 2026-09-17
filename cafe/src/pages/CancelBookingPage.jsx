import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { apiClient } from '../services/apiClient';

export default function CancelBookingPage() {
  const [searchParams] = useSearchParams();
  const bookingRef = searchParams.get('ref') || '';
  const token = searchParams.get('token') || '';

  const [state, setState] = useState(() => (!bookingRef || !token ? 'invalid' : 'confirm'));
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCancel = async () => {
    setState('loading');
    try {
      await apiClient('/table-bookings/cancel', {
        method: 'POST',
        body: JSON.stringify({ bookingNumber: bookingRef, token, reason: reason || undefined }),
      });
      setState('success');
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again or contact us.');
      setState('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#F7F5EF] flex flex-col items-center justify-center font-sans antialiased selection:bg-[#D4AF37] selection:text-black px-6 text-center relative overflow-hidden">
      <SEO
        title="Cancel Booking | R Sports & Cafe"
        description="Cancel your table booking at R Sports & Cafe."
      />

      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[#D4AF37] rounded-full blur-[200px] opacity-[0.05] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full mx-auto relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <svg className="w-4 h-4 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
            <path d="M13 13l4 4" />
          </svg>
          <span className="font-sans font-bold text-[14px] tracking-[0.15em] text-[#D4AF37]">R SPORTS & CAFE</span>
        </div>

        {/* ── Invalid Link ── */}
        {state === 'invalid' && (
          <div>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h1 className="font-sans font-bold text-[28px] text-white mb-3">Invalid Link</h1>
            <p className="font-inter text-[15px] text-white/50 mb-8 leading-relaxed">
              This cancellation link appears to be invalid or incomplete. Please check the link in your email and try again.
            </p>
            <Link
              to="/"
              className="inline-block px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-sans text-[12px] font-bold tracking-[0.14em] uppercase hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all active:scale-95"
            >
              Back to Home
            </Link>
          </div>
        )}

        {/* ── Confirm Cancellation ── */}
        {state === 'confirm' && (
          <div>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#D4AF37]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h1 className="font-sans font-bold text-[28px] text-white mb-3">Cancel Booking</h1>
            <p className="font-inter text-[15px] text-white/50 mb-6 leading-relaxed">
              You're about to cancel booking <span className="text-[#D4AF37] font-semibold">{bookingRef}</span>. This action cannot be undone.
            </p>

            {/* Booking reference card */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5 mb-6 text-left">
              <div className="flex items-center justify-between">
                <span className="font-inter text-[12px] tracking-[0.1em] text-white/40 uppercase">Reference</span>
                <span className="font-sans font-semibold text-[14px] text-[#D4AF37]">{bookingRef}</span>
              </div>
            </div>

            {/* Optional reason */}
            <textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 font-inter text-[16px] outline-none placeholder:text-white/25 focus:border-[#D4AF37]/40 transition-colors resize-none mb-6"
            />

            <div className="flex flex-col gap-3">
              <button
                id="confirm-cancel-btn"
                onClick={handleCancel}
                className="w-full px-8 py-3.5 rounded-full bg-red-500/90 hover:bg-red-500 text-white font-sans text-[12px] font-bold tracking-[0.14em] uppercase transition-all active:scale-95 hover:shadow-[0_0_24px_rgba(239,68,68,0.3)]"
              >
                Confirm Cancellation
              </button>
              <Link
                to="/"
                className="w-full px-8 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white/70 font-sans text-[12px] font-bold tracking-[0.14em] uppercase transition-all text-center"
              >
                Keep My Booking
              </Link>
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {state === 'loading' && (
          <div>
            <div className="w-10 h-10 mx-auto mb-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            <p className="font-inter text-[15px] text-white/50">Cancelling your booking…</p>
          </div>
        )}

        {/* ── Success ── */}
        {state === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h1 className="font-sans font-bold text-[28px] text-white mb-3">Booking Cancelled</h1>
            <p className="font-inter text-[15px] text-white/50 mb-3 leading-relaxed">
              Your booking <span className="text-[#D4AF37] font-semibold">{bookingRef}</span> has been cancelled successfully.
            </p>
            <p className="font-inter text-[13px] text-white/30 mb-8 leading-relaxed">
              Want to rebook? You can make a new reservation anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/book-table"
                className="inline-block px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-sans text-[12px] font-bold tracking-[0.14em] uppercase hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all active:scale-95"
              >
                Book Again
              </Link>
              <Link
                to="/"
                className="inline-block px-8 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white/70 font-sans text-[12px] font-bold tracking-[0.14em] uppercase transition-all text-center"
              >
                Home
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── Error ── */}
        {state === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h1 className="font-sans font-bold text-[28px] text-white mb-3">Cancellation Failed</h1>
            <p className="font-inter text-[15px] text-white/50 mb-8 leading-relaxed">
              {errorMsg}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => { setState('confirm'); setErrorMsg(''); }}
                className="inline-block px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-sans text-[12px] font-bold tracking-[0.14em] uppercase hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all active:scale-95"
              >
                Try Again
              </button>
              <Link
                to="/contact"
                className="inline-block px-8 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white/70 font-sans text-[12px] font-bold tracking-[0.14em] uppercase transition-all text-center"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
