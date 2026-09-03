import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

function formatDate(dateStr) {
  if (!dateStr) return { day: '—', month: '—', year: '—', weekday: '', full: '—' };
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return { day: '—', month: '—', year: '—', weekday: '', full: dateStr };
  return {
    day: d.getDate().toString().padStart(2, '0'),
    month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    year: d.getFullYear(),
    weekday: d.toLocaleString('en-US', { weekday: 'long' }).toUpperCase(),
    full: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
  };
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
}

const SportsWatermark = () => (
  <div className="absolute inset-0 opacity-[0.03] overflow-hidden flex items-center justify-center pointer-events-none z-0">
    <svg className="absolute -bottom-8 -right-8 w-48 h-48 rotate-[-15deg] text-black" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2A10 10 0 1022 12 10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8zm-1.5-3.6l-3.2-2.3.8-3.4 3.7-1.1 2.5 2.6-1.1 3.5-2.7.7zm4.2-1.2l2.4-1.8.1-2.9-2.2-1.7-2.3 1.2.1 3.1 1.9 2.1zm-7.6-3.8l-1.8.8-1.5-1.9.9-2.5 2.2-.8 1.8 1.5-1.6 2.9zm3.8-4.6l-1.4-2.5 2.8-.7 2.4 1.4-.4 2.8-2.6 1.1-1.8-2.1z"/>
    </svg>
    <svg className="absolute top-12 -left-10 w-32 h-32 rotate-[25deg] text-black" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 5h-2V3a1 1 0 00-1-1H7a1 1 0 00-1 1v2H4a1 1 0 00-1 1v4a5 5 0 005 5h1.16a5.95 5.95 0 003.84 2V19H9a1 1 0 000 2h6a1 1 0 000-2h-3v-1.02a5.95 5.95 0 003.84-2H17a5 5 0 005-5V6a1 1 0 00-1-1zM8 13H5V7h3v6zm9 0a3 3 0 01-3 3H10a3 3 0 01-3-3V7h10v6zm2-2h-3V7h3v4z"/>
    </svg>
  </div>
);

const getVariant = (pos, isMobile) => {
  if (isMobile) {
    switch (pos) {
      case 'center': return { x: 0, y: 0, rotate: 0, scale: 1, zIndex: 30, opacity: 1 };
      case 'left': return { x: -60, y: -20, rotate: -8, scale: 0.85, zIndex: 10, opacity: 0.3 };
      case 'right': return { x: 60, y: -20, rotate: 8, scale: 0.85, zIndex: 10, opacity: 0.3 };
      case 'bottomRight': return { x: 0, y: 30, rotate: 0, scale: 0.8, zIndex: 5, opacity: 0.1 };
      default: return { opacity: 0 };
    }
  }
  // Desktop
  switch (pos) {
    case 'center': return { x: 0, y: 0, rotate: -1, scale: 1, zIndex: 30, opacity: 1 };
    case 'left': return { x: -350, y: -60, rotate: -12, scale: 0.55, zIndex: 10, opacity: 0.95 };
    case 'right': return { x: 380, y: -30, rotate: 15, scale: 0.6, zIndex: 10, opacity: 0.95 };
    case 'bottomRight': return { x: 260, y: 220, rotate: -6, scale: 0.5, zIndex: 20, opacity: 0.9 };
    default: return { opacity: 0 };
  }
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Touch swipe handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/events?tab=upcoming`);
        const d = await res.json();
        if (d.success && d.data?.length > 0) {
          setEvents(d.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const displayEvents = [...events];
  while (displayEvents.length < 4) {
    displayEvents.push({
      _id: 'dummy-' + displayEvents.length,
      title: 'Exciting Events Ahead',
      date: '2026-12-31',
      category: 'special',
      photo: null,
      description: 'Stay tuned for more premium experiences at R Sports & Cafe.',
      isDummy: true
    });
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % displayEvents.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + displayEvents.length) % displayEvents.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const getPosition = (index) => {
    const diff = (index - activeIndex + displayEvents.length) % displayEvents.length;
    if (diff === 0) return 'center';
    if (diff === 1) return 'right';
    if (diff === 2) return 'bottomRight';
    if (diff === 3) return 'left';
    return 'hidden';
  };

  return (
    <section 
      id="events" 
      className="relative w-full min-h-[100dvh] bg-gradient-to-b from-ivory via-[#F5F0E8] to-cream flex flex-col items-center justify-between py-16 px-4 md:px-12 overflow-hidden font-sans select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Subtle warm grain texture */}
      <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`}}></div>

      {/* Top Bar Branding */}
      <div className="w-full max-w-6xl flex justify-between items-center z-40 mb-6">
        <div>
          <span className="font-inter font-medium text-[11px] md:text-[12px] tracking-[0.24em] text-neutral-400 uppercase block">
            Upcoming Gatherings
          </span>
          <h2 className="text-charcoal font-bold text-xl md:text-3xl tracking-tight uppercase">
            VIP &amp; Featured Events
          </h2>
        </div>

        <div className="text-right hidden sm:block">
          <h3 className="text-charcoal font-bold text-base md:text-xl tracking-widest uppercase">
            R SPORTS <span className="opacity-60">&amp; CAFE</span>
          </h3>
          <p className="text-charcoal/50 font-medium tracking-[0.2em] text-[10px] uppercase">Thoothukudi</p>
        </div>
      </div>

      {/* Interactive Card Canvas Area */}
      <div className="relative w-full max-w-6xl h-[520px] sm:h-[620px] md:h-[720px] flex items-center justify-center my-auto z-10">
        {displayEvents.map((event, idx) => {
          const pos = getPosition(idx);
          const isCenter = pos === 'center';
          const { day, month, year, weekday } = formatDate(event.date);

          return (
            <motion.div
              key={event._id}
              onClick={() => {
                if (!isCenter) setActiveIndex(idx);
              }}
              className={`absolute ev-stamp-shadow flex flex-col ${!isCenter ? 'cursor-pointer' : ''}`}
              style={{
                width: isMobile ? '88vw' : '480px',
                maxWidth: '480px',
                zIndex: isCenter ? 30 : pos === 'bottomRight' ? 20 : 10
              }}
              animate={getVariant(pos, isMobile)}
              transition={{ type: 'spring', damping: 20, stiffness: 120 }}
            >
              <div className="ev-stamp-mask bg-ev-card w-full h-full p-5 sm:p-7 md:p-8 flex flex-col relative overflow-hidden transition-all duration-500 rounded-xl border border-black/5 shadow-2xl">
                <SportsWatermark />

                {/* Event Image Box */}
                <motion.div 
                  layout
                  className="w-full bg-gray-200 overflow-hidden relative rounded-lg"
                  style={{ aspectRatio: isCenter ? (isMobile ? '16/11' : '16/10') : '1/1' }}
                >
                  {event.photo ? (
                    <img src={`${BASE_URL}${event.photo}`} className="w-full h-full object-cover filter brightness-[0.95] contrast-[1.05]" alt="" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-black flex items-center justify-center">
                      <span className="text-white/40 font-bold uppercase tracking-widest text-sm sm:text-base">R Sports &amp; Cafe Event</span>
                    </div>
                  )}
                  
                  {isCenter && (
                    <div className="absolute top-3 right-3 bg-ev-accent text-white px-3 py-1 rounded uppercase font-bold text-[9px] sm:text-[10px] tracking-widest shadow-md">
                      {event.category || 'Special Event'}
                    </div>
                  )}
                </motion.div>

                {/* Card Content - Center Only */}
                <AnimatePresence mode="popLayout">
                  {isCenter && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col flex-1 mt-4 sm:mt-5 relative z-10"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-sans font-black text-xl sm:text-2xl uppercase text-ev-text tracking-tight leading-none mb-1">
                            {weekday}
                          </h3>
                          <h4 className="font-sans font-black text-2xl sm:text-3xl text-ev-accent tracking-tighter leading-none">
                            {day}/{month}/{year}
                          </h4>
                        </div>
                        
                        <div className="border border-dashed border-ev-text/30 rounded px-2.5 py-1 flex items-center gap-1.5 bg-white/60 backdrop-blur-sm">
                          <svg className="w-3.5 h-3.5 text-ev-text/80" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                          <span className="font-bold text-[9px] tracking-[0.1em] uppercase text-ev-text">Thoothukudi</span>
                        </div>
                      </div>

                      <h2 className="font-sans font-black text-2xl sm:text-4xl leading-[1.05] text-ev-text uppercase tracking-tighter line-clamp-2 mb-2">
                        {event.title}
                      </h2>

                      {event.description && (
                        <div className="mt-2 border-t border-dashed border-ev-text/15 pt-3">
                          <p className="text-ev-text/75 font-medium text-xs sm:text-sm leading-relaxed line-clamp-2">
                            {event.description}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Title for non-center cards */}
                {!isCenter && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 text-center"
                  >
                    <h3 className="font-sans font-black text-sm uppercase text-ev-text leading-tight line-clamp-1">{event.title}</h3>
                    <p className="text-ev-accent font-bold text-[11px] mt-0.5">{day} {month}</p>
                  </motion.div>
                )}
              </div>

              {/* Ink Stamp Overlay */}
              <AnimatePresence>
                {isCenter && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 1.4, rotate: 0 }}
                    animate={{ opacity: 1, scale: 1, rotate: -18 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
                    className="ev-ink-stamp w-20 h-20 sm:w-28 sm:h-28 -top-4 -left-3 sm:-top-6 sm:-left-8 origin-center bg-ev-accent border-white text-white z-40"
                  >
                    <span className="text-[7px] sm:text-[9px] tracking-widest">JOIN US</span>
                    <span className="text-[26px] sm:text-[34px] font-bold font-sans leading-none my-0.5">R</span>
                    <span className="text-[7px] sm:text-[9px] tracking-widest">SPORTS</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* ── Navigation Slider Controls (Arrows + Dot Indicators) ── */}
      <div className="relative z-40 flex flex-col items-center gap-4 mt-4 w-full max-w-md">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handlePrev}
            aria-label="Previous Event"
            className="w-12 h-12 rounded-full bg-white/80 border border-black/10 text-charcoal flex items-center justify-center shadow-lg hover:bg-black hover:text-white transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {displayEvents.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to event ${i + 1}`}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === activeIndex ? '28px' : '8px',
                  height: '8px',
                  background: i === activeIndex ? '#c91010' : 'rgba(26,26,26,0.25)',
                }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            aria-label="Next Event"
            className="w-12 h-12 rounded-full bg-charcoal text-white flex items-center justify-center shadow-lg hover:bg-[#c91010] transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <span className="text-[11px] font-semibold tracking-widest text-charcoal/50 uppercase">
          {isMobile ? 'Swipe left / right to browse' : 'Use controls or click side cards to browse'}
        </span>
      </div>
    </section>
  );
}

