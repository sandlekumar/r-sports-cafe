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

const REVIEWS = [
  {
    id: 1,
    name: 'Priya Menon',
    role: 'Verified Customer',
    rating: 5,
    text: 'R Sports & Cafe redefines what a sports cafe should be. The biryani is exceptional â€” aromatic, layered with the most tender meat I\'ve ever tasted. The coffee is specialty-grade, brewed with obvious passion. And the ambiance? It feels like a luxury lounge rather than a typical sports venue.',
    date: 'JUN 2026',
    avatar: '/assets/customer-cutout.png',
    tag: 'CAFE',
  },
  {
    id: 2,
    name: 'Arjun Krishnan',
    role: 'Verified Customer',
    rating: 5,
    text: 'The turf quality is absolutely unmatched in Thoothukudi. We play every Friday night under the floodlights and it creates a true stadium atmosphere. After every match, the cafe becomes our second home. The post-game burgers and cold coffee are legendary among our squad.',
    date: 'MAY 2026',
    avatar: '/assets/customer-cutout.png',
    tag: 'TURF',
  },
  {
    id: 3,
    name: 'Deepa Raghavan',
    role: 'Verified Customer',
    rating: 5,
    text: 'Hosted our company\'s annual sports day here and it was flawless. The team handled everything â€” from tournament bracket setup to live scoring, and the catering was world-class. Fifty employees had the time of their lives. The combination of premium sports facilities and gourmet dining is truly unique.',
    date: 'APR 2026',
    avatar: '/assets/customer-cutout.png',
    tag: 'EVENTS',
  },
  {
    id: 4,
    name: 'Vikram Selvam',
    role: 'Verified Customer',
    rating: 5,
    text: 'I bring my entire cricket academy here for net practice and the facilities are professional-grade. The pitch surface is excellent, and the lighting makes evening sessions feel like day matches. After sessions, we refuel at the cafe â€” their protein smoothies and grilled wraps are exactly what athletes need.',
    date: 'MAR 2026',
    avatar: '/assets/customer-cutout.png',
    tag: 'COACHING',
  },
  {
    id: 5,
    name: 'Karthik Balaji',
    role: 'Verified Customer',
    rating: 4,
    text: 'The agility training area is perfect for my morning fitness routine. Open field, fresh morning air, and professional-grade equipment provided. The staff even helped me design a circuit training layout. And the post-workout smoothie from the cafe? Absolute game changer â€” fresh fruits, no artificial anything, made to order.',
    date: 'FEB 2026',
    avatar: '/assets/customer-cutout.png',
    tag: 'FITNESS',
  },
];

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

/* â”€â”€â”€ Main Reviews Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function Reviews() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const currentReview = REVIEWS[activeIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const goNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % REVIEWS.length);
  };
  const goPrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  };
  const goTo = (i) => {
    setDirection(i > activeIndex ? 1 : -1);
    setActiveIndex(i);
  };

  const textVariants = {
    enter: (d) => ({ opacity: 0, y: d > 0 ? 24 : -24 }),
    center: { opacity: 1, y: 0 },
    exit: (d) => ({ opacity: 0, y: d > 0 ? -24 : 24 }),
  };

  const cardVariants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
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

        {/* â”€â”€ Main two-column layout â”€â”€ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">

          {/* LEFT: Profile card â€” 5 cols */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`card-${activeIndex}`}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[380px]"
              >
                {/* Card */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    background: '#FAFAF7',
                    border: '1px solid rgba(17,17,17,0.09)',
                    borderRadius: '4px',
                    boxShadow: '0 8px 40px rgba(17,17,17,0.07), 0 1px 3px rgba(17,17,17,0.05)',
                  }}
                >
                  {/* Top gold accent bar */}
                  <div
                    className="h-[3px] w-full"
                    style={{ background: 'linear-gradient(to right, #AA771C, #D4AF37, #F5E6A3, #D4AF37, #AA771C)' }}
                  />

                  <div className="p-7 sm:p-8">
                    {/* Tag + Date row */}
                    <div className="flex items-center justify-between mb-7">
                      <TagPill label={currentReview.tag} />
                      <span
                        className="text-[11px] font-semibold tracking-[0.18em] uppercase"
                        style={{ color: '#8A8578', fontFamily: '"Inter", sans-serif' }}
                      >
                        {currentReview.date}
                      </span>
                    </div>

                    {/* Avatar */}
                    <div className="flex justify-center mb-6">
                      <div
                        className="relative"
                        style={{
                          width: '130px',
                          height: '130px',
                        }}
                      >
                        {/* Thin gold ring */}
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            border: '1.5px solid rgba(212,175,55,0.35)',
                            borderRadius: '50%',
                          }}
                        />
                        <div
                          className="w-full h-full rounded-full overflow-hidden"
                          style={{
                            border: '4px solid #FAFAF7',
                            boxShadow: '0 4px 20px rgba(17,17,17,0.12)',
                          }}
                        >
                          <img
                            src={currentReview.avatar}
                            alt={currentReview.name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Name + role */}
                    <div className="text-center mb-5">
                      <h3
                        className="font-bold text-[20px] sm:text-[22px] tracking-tight mb-1"
                        style={{ color: '#111111', fontFamily: '"Inter", "Satoshi", sans-serif' }}
                      >
                        {currentReview.name}
                      </h3>
                      <p
                        className="text-[12px] font-medium tracking-[0.15em] uppercase"
                        style={{ color: '#8A8578', fontFamily: '"Inter", sans-serif' }}
                      >
                        {currentReview.role}
                      </p>
                    </div>

                    {/* Stars centered */}
                    <div className="flex justify-center mb-6">
                      <StarRow rating={currentReview.rating} />
                    </div>

                    <GoldRule />
                  </div>
                </div>

                {/* Subtle card shadow strip */}
                <div
                  className="mx-6 h-4"
                  style={{
                    background: 'rgba(17,17,17,0.04)',
                    filter: 'blur(8px)',
                    borderRadius: '0 0 4px 4px',
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT: Review text â€” 7 cols */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`text-${activeIndex}`}
                custom={direction}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Pull-quote open */}
                <div
                  className="mb-6 select-none"
                  style={{
                    fontSize: '72px',
                    lineHeight: '0.6',
                    color: '#D4AF37',
                    fontFamily: 'Georgia, serif',
                    opacity: 0.6,
                  }}
                >
                  "
                </div>

                {/* Review body text */}
                <p
                  className="text-[17px] sm:text-[19px] leading-[1.8] mb-8 font-normal"
                  style={{
                    color: '#2A2A2A',
                    fontFamily: '"Inter", "Satoshi", sans-serif',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {currentReview.text}
                </p>

                {/* Attribution row */}
                <div
                  className="flex items-center gap-4 pt-6 mb-10"
                  style={{ borderTop: '1px solid rgba(17,17,17,0.10)' }}
                >
                  {/* Small avatar */}
                  <div
                    className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0"
                    style={{ border: '1.5px solid rgba(212,175,55,0.3)' }}
                  >
                    <img
                      src={currentReview.avatar}
                      alt={currentReview.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <p
                      className="font-semibold text-[14px]"
                      style={{ color: '#111111', fontFamily: '"Inter", sans-serif' }}
                    >
                      {currentReview.name}
                    </p>
                    <p
                      className="text-[12px] font-medium tracking-[0.12em] uppercase mt-0.5"
                      style={{ color: '#D4AF37', fontFamily: '"Inter", sans-serif' }}
                    >
                      {currentReview.tag} Â· {currentReview.date}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <StarRow rating={currentReview.rating} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* â”€â”€ Navigation â”€â”€ */}
            <div className="flex flex-col gap-6">
              {/* Prev / Next arrows + dots */}
              <div className="flex items-center gap-4">
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

                {/* Dot indicators */}
                <div className="flex items-center gap-2 ml-1">
                  {REVIEWS.map((_, i) => (
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

                {/* Review counter */}
                <span
                  className="ml-auto text-[13px] font-medium tabular-nums"
                  style={{ color: '#8A8578', fontFamily: '"Inter", sans-serif' }}
                >
                  {String(activeIndex + 1).padStart(2, '0')} / {String(REVIEWS.length).padStart(2, '0')}
                </span>
              </div>

              {/* CTA button */}
              <motion.a
                href="#booking"
                className="relative inline-flex items-center gap-3 self-start overflow-hidden"
                style={{
                  background: '#111111',
                  color: '#fff',
                  borderRadius: '4px',
                  padding: '14px 32px',
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
                whileHover={{ background: '#D4AF37', color: '#111' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.25 }}
              >
                <span>Leave a Review</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.a>
            </div>
          </div>
        </div>

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

