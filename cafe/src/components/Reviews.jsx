import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* â”€â”€â”€ Brand Palette (matching site identity) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   cream    #F7F3EC   warm light background
   ivory    #FAFAF7   slightly cooler card bg
   night    #0A0A0A   primary dark text
   charcoal #1A1A1A   deep headings
   gold     #D4AF37   primary accent
   goldDark #AA771C   rich accent for dividers
   sand     #D8C3A5   warm muted accent
   warmGray #8A8578   secondary text
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */


/* â”€â”€â”€ Gold star â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const StarRow = ({ rating }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={i < rating ? '#D4AF37' : 'transparent'}
          stroke={i < rating ? '#D4AF37' : '#D8C3A5'}
          strokeWidth="1.5"
        />
      </svg>
    ))}
  </div>
);

/* â”€â”€â”€ Tag pill â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const TagPill = ({ label }) => (
  <span
    className="inline-block text-[10px] font-bold tracking-[0.22em] uppercase px-3 py-1 rounded-sm"
    style={{
      background: 'rgba(212, 175, 55, 0.10)',
      color: '#AA771C',
      border: '1px solid rgba(212, 175, 55, 0.30)',
      fontFamily: '"Inter", sans-serif',
    }}
  >
    {label}
  </span>
);

/* â”€â”€â”€ Thin gold divider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const GoldRule = ({ className = '' }) => (
  <div
    className={`h-px ${className}`}
    style={{ background: 'linear-gradient(to right, transparent, #D4AF37, transparent)' }}
  />
);

/* ─── Main Reviews Component ──────────────────────────────────────────────── */
export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    fetch('http://localhost:5000/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const processed = data.map(r => ({
            ...r,
            imageUrl: r.imageUrl && r.imageUrl.startsWith('/uploads') ? `http://localhost:5000${r.imageUrl}` : r.imageUrl
          }));
          setReviews(processed);
        }
      })
      .catch(err => console.error('Failed to fetch reviews:', err));
  }, []);

  useEffect(() => {
    if (reviews.length === 0) return;
    const interval = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  if (reviews.length === 0) {
    return (
      <section id="reviews" className="relative bg-cream py-20 flex items-center justify-center min-h-[50vh]">
        <h2 className="text-[28px] font-bold text-charcoal">Loading Reviews...</h2>
      </section>
    );
  }

  const currentReview = reviews[activeIndex] || reviews[0];

  const goNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };
  const goPrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };
  const goTo = (i) => {
    setDirection(i > activeIndex ? 1 : -1);
    setActiveIndex(i);
  };

  const textVariants = {
    enter: (custom) => ({ opacity: 0, y: custom.d > 0 ? 24 : -24 }),
    center: { opacity: 1, y: 0 },
    exit: (custom) => ({ opacity: 0, y: custom.d > 0 ? -24 : 24 }),
  };

  const cardVariants = {
    enter: (custom) => ({ 
      opacity: 0, 
      x: custom.d > 0 ? 40 : -40,
      rotate: custom.i % 2 === 0 ? 2 : -2 
    }),
    center: { opacity: 1, x: 0, rotate: 0 },
    exit: (custom) => ({ 
      opacity: 0, 
      x: custom.d > 0 ? -40 : 40,
      rotate: custom.i % 2 === 0 ? -2 : 2 
    }),
  };

  return (
    <section
      id="reviews"
      className="relative overflow-hidden"
      style={{ background: '#F7F3EC' }}
    >
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'rgba(17,17,17,0.10)' }} />

      {/* Faint watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
        <span
          className="font-bold uppercase whitespace-nowrap"
          style={{
            fontSize: '10vw',
            color: '#1A1A1A',
            opacity: 0.018,
            letterSpacing: '0.08em',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          R SPORTS &amp; CAFE
        </span>
      </div>

      {/* Decorative background quote mark */}
      <div
        className="absolute pointer-events-none select-none z-0"
        style={{ top: '-40px', left: '4%', opacity: 0.05 }}
      >
        <span
          style={{
            fontSize: 'clamp(200px, 28vw, 400px)',
            color: '#D4AF37',
            fontFamily: 'Georgia, serif',
            lineHeight: 1,
          }}
        >
          "
        </span>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-10 lg:px-20 py-20 md:py-32">

        {/* â”€â”€ Section label â”€â”€ */}
        <motion.div
          className="mb-14 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span
                className="block font-bold tracking-[0.24em] uppercase text-[12px]"
                style={{ color: '#D8C3A5', fontFamily: '"Inter", sans-serif' }}
              >
                Customer Testimonials
              </span>
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full shadow-sm border border-black/5">
                <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <span className="text-[11px] font-bold text-gray-800 tracking-wide font-sans">Rating 4.9</span>
              </div>
            </div>
            <div className="w-12 h-px" style={{ background: 'rgba(212,175,55,0.5)' }} />
            <h2
              className="mt-5 font-bold leading-[1.05] uppercase"
              style={{
                fontFamily: '"Inter", "Satoshi", sans-serif',
                fontSize: 'clamp(28px, 5vw, 60px)',
                color: '#111111',
                letterSpacing: '-0.02em',
              }}
            >
              What Our Guests<br />Are Saying
            </h2>
            <p
              className="mt-4 text-[15px] sm:text-[16px] leading-relaxed max-w-xl"
              style={{ color: '#8A8578', fontFamily: '"Inter", sans-serif' }}
            >
              Authentic feedback from our community of players, diners, and regulars.
            </p>
          </div>
          
          <a
            href="https://www.google.com/maps/place/R+SPORTS+%26+CAFE/@8.785908,78.138281,17z/data=!3m1!4b1!4m6!3m5!1s0x3b03ef5a831e4fcb:0x6d5a035b4757c634!8m2!3d8.7859027!4d78.1408559!16s%2Fg%2F11nhm7b7hs?entry=ttu&g_ep=EgoyMDI2MDkyMS4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 md:py-4 rounded-full font-sans font-bold text-[12px] md:text-[13px] tracking-widest uppercase transition-all hover:scale-105 border border-black/10 bg-white text-gray-800 shadow-sm hover:shadow-md"
          >
             <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Write a Google Review
          </a>
        </motion.div>

        {/* â”€â”€ Main Review Slider â”€â”€ */}
        <motion.div 
          className="max-w-[700px] md:max-w-[950px] lg:max-w-[1050px] mx-auto w-full relative z-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Image & Text Container */}
          <div className="relative w-full h-[550px] md:h-[420px] lg:h-[460px] flex items-center justify-center">
            <AnimatePresence mode="wait" custom={{ d: direction, i: activeIndex }}>
              <motion.div
                key={`review-${activeIndex}`}
                custom={{ d: direction, i: activeIndex }}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="premium-box absolute inset-0 w-full h-full flex flex-col md:flex-row rounded-[24px] border border-[#D4AF37]/20 overflow-hidden bg-[#0A0A0A] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              >
                {/* Background Box for Image fit */}
                <div className="w-full h-[50%] md:w-[45%] md:h-full p-6 sm:p-8 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-[#D4AF37]/10" style={{ background: 'linear-gradient(135deg, #050505 0%, #111111 100%)' }}>
                  <div className="absolute inset-0 bg-[#D4AF37]/5 mix-blend-overlay pointer-events-none" />
                  <img
                    src={currentReview.imageUrl}
                    alt={currentReview.name}
                    loading="lazy"
                    className="no-premium w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] scale-[1.02]"
                  />
                </div>
                
                {/* Text and Name Overlay Block */}
                <div className="w-full h-[50%] md:w-[55%] md:h-full bg-gradient-to-br from-[#111111] to-[#0A0A0A] flex flex-col justify-center items-center md:items-start px-6 sm:px-12 md:px-16 text-center md:text-left relative z-10">
                  <div className="flex items-center gap-2 mb-4 md:mb-6">
                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    <span className="text-[12px] font-sans text-white/70 tracking-wider font-medium uppercase">Verified Google Review</span>
                  </div>
                  {currentReview.text && (
                    <p className="text-[15px] sm:text-[16px] md:text-[20px] text-[#EFE7DB] mb-6 md:mb-8 line-clamp-4 leading-relaxed tracking-wide" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                      "{currentReview.text}"
                    </p>
                  )}
                  
                  <div className="flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-4 mt-auto md:mt-0">
                    <StarRow rating={5} />
                    <span className="w-px h-4 bg-[#d4af37]/40 hidden md:block" />
                    <span className="font-sans font-bold text-[#D4AF37] text-[13px] sm:text-[14px] uppercase tracking-[0.15em] filter drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]">
                      {currentReview.name}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* â”€â”€ Navigation â”€â”€ */}
          <div className="flex items-center justify-between mt-10 w-full px-4 md:px-0">
            {/* Prev */}
            <button
              onClick={goPrev}
              aria-label="Previous review"
              className="flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200"
              style={{
                background: 'transparent',
                border: '1px solid rgba(17,17,17,0.18)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.background = 'rgba(212,175,55,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(17,17,17,0.18)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8578" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  className="no-premium"
                  onClick={() => goTo(i)}
                  aria-label={`Review ${i + 1}`}
                  style={{
                    width: i === activeIndex ? '28px' : '7px',
                    height: '7px',
                    borderRadius: '9999px',
                    background: i === activeIndex ? '#D4AF37' : 'rgba(17,17,17,0.18)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
              ))}
            </div>

            {/* Next */}
            <button
              onClick={goNext}
              aria-label="Next review"
              className="flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200"
              style={{
                background: '#111111',
                border: '1px solid #111111',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#D4AF37'; e.currentTarget.style.borderColor = '#D4AF37'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#111111'; e.currentTarget.style.borderColor = '#111111'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* â”€â”€ Bottom stats bar â”€â”€ */}
        <div className="mt-20 md:mt-28">
          <GoldRule className="mb-12" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-0 sm:divide-x divide-[rgba(17,17,17,0.10)]">
            {[
              { value: '500+', label: 'Happy Customers' },
              { value: '4.9 / 5', label: 'Average Rating' },
              { value: '48', label: 'Reviews This Month' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="sm:px-10 first:pl-0 last:pr-0 text-center sm:text-left"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
              >
                <p
                  className="font-bold mb-1"
                  style={{
                    fontSize: 'clamp(28px, 4vw, 40px)',
                    color: '#111111',
                    fontFamily: '"Inter", "Satoshi", sans-serif',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-[12px] sm:text-[13px] font-medium tracking-[0.18em] uppercase"
                  style={{ color: '#8A8578', fontFamily: '"Inter", sans-serif' }}
                >
                  {stat.label}
                </p>
                {/* Gold underscore on stat label */}
                <div
                  className="mt-3 h-px w-8"
                  style={{ background: '#D4AF37', opacity: 0.6 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'rgba(17,17,17,0.10)' }} />
    </section>
  );
}

