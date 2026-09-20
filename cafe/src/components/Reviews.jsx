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
          className="mb-14 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span
            className="block font-bold tracking-[0.24em] uppercase mb-4 text-[12px]"
            style={{ color: '#D8C3A5', fontFamily: '"Inter", sans-serif' }}
          >
            Customer Testimonials
          </span>
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
        </motion.div>

        {/* â”€â”€ Main Review Slider â”€â”€ */}
        <motion.div 
          className="max-w-[700px] mx-auto w-full relative z-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Image & Text Container */}
          <div className="relative w-full aspect-[4/3] md:aspect-[16/9] flex items-center justify-center">
            <AnimatePresence mode="wait" custom={{ d: direction, i: activeIndex }}>
              <motion.div
                key={`review-${activeIndex}`}
                custom={{ d: direction, i: activeIndex }}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 w-full h-full rounded-xl shadow-[0_20px_60px_rgba(17,17,17,0.15)] border border-[rgba(17,17,17,0.06)] overflow-hidden bg-[#FAFAF7]"
              >
                {/* Background Box for Image fit */}
                <div className="w-full h-[65%] sm:h-[75%] p-4 sm:p-8 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)' }}>
                  <img
                    src={currentReview.imageUrl}
                    alt={currentReview.name}
                    loading="lazy"
                    className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
                  />
                </div>
                
                {/* Text and Name Overlay Block */}
                <div className="w-full h-[35%] sm:h-[25%] bg-[#FAFAF7] flex flex-col justify-center items-center px-4 sm:px-12 text-center relative z-10 border-t border-[rgba(17,17,17,0.05)]">
                  {currentReview.text && (
                    <p className="text-[13px] sm:text-[15px] italic text-[#4a4a4a] mb-3 sm:mb-4 line-clamp-2 leading-relaxed" style={{ fontFamily: '"Inter", "Satoshi", sans-serif' }}>
                      "{currentReview.text}"
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <StarRow rating={5} />
                    <span className="w-px h-3.5 bg-[#d4af37]/40" />
                    <span className="font-sans font-bold text-[#111111] text-[13px] sm:text-[14px] uppercase tracking-wider">
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

