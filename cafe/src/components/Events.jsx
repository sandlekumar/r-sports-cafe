import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../services/apiClient';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const BASE_URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : '') || 'http://localhost:5000';

function formatDate(dateStr) {
  if (!dateStr) return { day: '—', month: '—', year: '—', weekday: '', full: '—' };
  try {
    const cleanStr = typeof dateStr === 'string' && dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
    const d = new Date(cleanStr);
    if (isNaN(d.getTime())) {
      return { day: '—', month: '—', year: '—', weekday: '', full: String(dateStr) };
    }
    return {
      day: d.getDate().toString().padStart(2, '0'),
      month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      year: d.getFullYear(),
      weekday: d.toLocaleString('en-US', { weekday: 'long' }).toUpperCase(),
      full: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    };
  } catch {
    return { day: '—', month: '—', year: '—', weekday: '', full: String(dateStr) };
  }
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

const getVariant = (pos, isMobile) => {
  if (isMobile) {
    switch (pos) {
      case 'center': return { x: 0, y: 0, rotate: 0, scale: 1, zIndex: 30, opacity: 1 };
      case 'left': return { x: -36, y: -8, rotate: -5, scale: 0.88, zIndex: 10, opacity: 0.35 };
      case 'right': return { x: 36, y: -8, rotate: 5, scale: 0.88, zIndex: 10, opacity: 0.35 };
      case 'bottomRight': return { x: 0, y: 20, rotate: 0, scale: 0.80, zIndex: 5, opacity: 0.15 };
      default: return { x: 0, y: 25, rotate: 0, scale: 0.75, zIndex: 0, opacity: 0 };
    }
  }
  // Desktop
  switch (pos) {
    case 'center': return { x: 0, y: 0, rotate: -1, scale: 1, zIndex: 30, opacity: 1 };
    case 'left': return { x: -310, y: -45, rotate: -10, scale: 0.60, zIndex: 10, opacity: 0.95 };
    case 'right': return { x: 330, y: -25, rotate: 12, scale: 0.64, zIndex: 10, opacity: 0.95 };
    case 'bottomRight': return { x: 230, y: 190, rotate: -5, scale: 0.54, zIndex: 20, opacity: 0.9 };
    default: return { x: 0, y: 50, rotate: 0, scale: 0.5, zIndex: 0, opacity: 0 };
  }
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState({});
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Safe touch swipe handling
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);
  const justSwiped = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const d = await apiClient('/events?tab=upcoming');
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          setEvents(d.data);
        }
      } catch (err) {
        console.error(err);
      }
    })();

    // GSAP Scroll Reveal for Events Header only
    const section = document.getElementById('events');
    const ctx = gsap.context(() => {
      const header = document.querySelector('.ev-header');
      if (header) {
        gsap.fromTo(
          header,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  const displayEvents = Array.isArray(events) ? events : [];
  
  if (displayEvents.length === 0) {
    return (
      <section id="events" className="relative w-full min-h-[100dvh] bg-gradient-to-b from-ivory via-[#F5F0E8] to-cream flex flex-col items-center justify-center py-12 xs:py-14 sm:py-16 px-4 md:px-12 overflow-hidden font-sans select-none">
        <h2 className="text-[28px] md:text-[54px] font-bold text-charcoal tracking-tight">Stay tuned for events!</h2>
      </section>
    );
  }

  const handleNext = () => {
    if (displayEvents.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % displayEvents.length);
  };

  const handlePrev = () => {
    if (displayEvents.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + displayEvents.length) % displayEvents.length);
  };

  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = true;
  };

  const handleTouchEnd = (e) => {
    if (!isSwiping.current) return;
    isSwiping.current = false;

    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const diffX = touchStartX.current - endX;
    const diffY = touchStartY.current - endY;

    // Only swipe if horizontal swipe is clearly dominant
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
      justSwiped.current = true;
      setTimeout(() => { justSwiped.current = false; }, 300);

      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const getPosition = (index) => {
    const len = displayEvents.length;
    if (len <= 1) return 'center';
    const diff = (index - activeIndex + len) % len;
    if (diff === 0) return 'center';
    if (len === 2) {
      return diff === 1 ? 'right' : 'hidden';
    }
    if (len === 3) {
      if (diff === 1) return 'right';
      if (diff === 2) return 'left';
      return 'hidden';
    }
    if (diff === 1) return 'right';
    if (diff === 2) return 'bottomRight';
    if (diff === len - 1) return 'left';
    return 'hidden';
  };

  return (
    <section 
      id="events" 
      className="relative w-full min-h-[100dvh] bg-gradient-to-b from-ivory via-[#F5F0E8] to-cream flex flex-col items-center justify-between py-10 xs:py-12 sm:py-16 px-4 md:px-12 overflow-hidden font-sans select-none"
      style={{ touchAction: 'pan-y' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Subtle Ambient Background Gradient (Zero GPU Overhead) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent" />

      {/* Top Bar Branding */}
      <div className="ev-header w-full max-w-6xl flex justify-between items-center z-40 mb-4 sm:mb-6">
        <div>
          <span className="font-sideheading font-bold text-[12px] md:text-[14px] tracking-[0.24em] text-neutral-500 uppercase block">
            Upcoming Gatherings
          </span>
          <h2 className="text-charcoal font-bold text-xl md:text-3xl tracking-tight uppercase">
            VIP &amp; Featured Events
          </h2>
        </div>

        <div className="text-right hidden sm:block">
          <h3 className="font-logo text-charcoal font-bold text-lg md:text-2xl tracking-widest uppercase">
            R SPORTS <span className="opacity-60">&amp; CAFE</span>
          </h3>
          <p className="font-sideheading text-charcoal/60 font-bold tracking-[0.2em] text-[12px] uppercase">Thoothukudi</p>
        </div>
      </div>

      {/* Interactive Card Canvas Area (Compact & Optimized size) */}
      <div className="relative w-full max-w-5xl h-[400px] xs:h-[430px] sm:h-[520px] md:h-[600px] flex items-center justify-center my-auto z-10">
        
        {displayEvents.map((event, idx) => {
          const pos = getPosition(idx);
          if (pos === 'hidden') return null;
          const isCenter = pos === 'center';
          const { day, month, year, weekday } = formatDate(event.date);
          const hasPhoto = event.photo && !imgErrors[event._id || idx];

          return (
            <motion.div
              key={event._id || `event-${idx}`}
              onClick={() => {
                if (!isCenter && !justSwiped.current) {
                  setActiveIndex(idx);
                }
              }}
              className={`absolute ev-stamp-shadow flex flex-col ${!isCenter ? 'cursor-pointer' : ''} w-[80vw] xs:w-[76vw] sm:w-[350px] md:w-[410px] max-w-[410px] aspect-[4/5] rounded-2xl md:rounded-none`}
              style={{
                zIndex: isCenter ? 30 : pos === 'bottomRight' ? 20 : 10,
                willChange: 'transform, opacity',
                transform: 'translateZ(0)',
              }}
              animate={getVariant(pos, isMobile)}
              transition={
                isMobile
                  ? { duration: 0.28, ease: 'easeOut' }
                  : { type: 'spring', damping: 28, stiffness: 280, mass: 0.6 }
              }
            >
              <div className="ev-stamp-mask bg-black w-full h-full flex flex-col relative overflow-hidden rounded-2xl md:rounded-none border border-white/10 md:border-none shadow-2xl md:shadow-none">
                
                {/* Full Background Image */}
                <div className="absolute inset-0 w-full h-full bg-gray-900">
                  {hasPhoto ? (
                    <>
                      <img 
                        src={event.photo.startsWith('http') ? event.photo : `${BASE_URL}${event.photo}`} 
                        className="w-full h-full object-cover" 
                        alt={event.title || 'Event image'} 
                        loading="lazy" 
                        decoding="async" 
                        onError={() => setImgErrors(prev => ({ ...prev, [event._id || idx]: true }))}
                      />
                      <div className="absolute inset-0 bg-black/25 pointer-events-none" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-black flex flex-col items-center justify-center p-6 text-center">
                      <span className="font-logo text-3xl font-bold tracking-widest text-[#D4AF37] mb-1">R SPORTS</span>
                      <span className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs">VIP &amp; Featured Event</span>
                    </div>
                  )}
                </div>

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10 pointer-events-none" />

                {/* Category badge */}
                {isCenter && (
                  <div className="absolute top-3.5 right-3.5 bg-ev-accent text-white px-2.5 py-1 rounded uppercase font-bold text-[9px] sm:text-[10px] tracking-widest shadow-md z-20">
                    {event.category || 'Special Event'}
                  </div>
                )}

                {/* Card Content - Center Only */}
                {isCenter && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col justify-end flex-1 p-5 sm:p-7 relative z-10 w-full h-full"
                  >
                    <div className="flex justify-between items-end mb-2.5">
                      <div>
                        <h3 className="font-sans font-black text-lg sm:text-xl uppercase text-white/90 tracking-tight leading-none mb-1 drop-shadow-md">
                          {weekday}
                        </h3>
                        <h4 className="font-sans font-black text-xl sm:text-2xl text-ev-accent tracking-tighter leading-none shadow-sm drop-shadow-md">
                          {day}/{month}/{year}
                        </h4>
                      </div>
                      
                      <div className="border border-white/20 rounded px-2 py-0.5 flex items-center gap-1.5 bg-black/60 shadow-md">
                        <svg className="w-3 h-3 text-white/90 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        <span className="font-bold text-[8px] sm:text-[9px] tracking-[0.1em] uppercase text-white drop-shadow-sm">Thoothukudi</span>
                      </div>
                    </div>

                    <h2 className="font-sans font-black text-xl sm:text-3xl leading-[1.08] text-white uppercase tracking-tighter line-clamp-2 mb-1.5 drop-shadow-lg">
                      {event.title}
                    </h2>

                    {event.description && (
                      <div className="mt-1.5 border-t border-white/10 pt-2">
                        <p className="text-white/80 font-medium text-xs leading-relaxed line-clamp-2 drop-shadow-sm">
                          {event.description}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Title for non-center cards */}
                {!isCenter && (
                  <div className="absolute inset-0 p-4 flex flex-col justify-end z-10">
                    <h3 className="font-sans font-black text-xs uppercase text-white leading-tight line-clamp-1 drop-shadow-md">{event.title}</h3>
                    <p className="text-ev-accent font-bold text-[10px] mt-0.5 drop-shadow-md">{day} {month}</p>
                  </div>
                )}
              </div>

              {/* Ink Stamp Overlay */}
              <AnimatePresence>
                {isCenter && (
                  <motion.div 
                    key="stamp"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1, rotate: -16 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
                    className="ev-ink-stamp absolute flex flex-col items-center justify-center w-16 h-16 sm:w-24 sm:h-24 -top-3 -left-3 sm:-top-5 sm:-left-6 origin-center bg-black border-2 border-[#EFE7DB] text-[#EFE7DB] rounded-full z-40 shadow-xl"
                  >
                    <span className="text-[6px] sm:text-[8px] tracking-widest">JOIN US</span>
                    <span className="text-[20px] sm:text-[28px] font-bold font-sans leading-none my-0.5 text-[#D4AF37] drop-shadow-md">R</span>
                    <span className="text-[6px] sm:text-[8px] tracking-widest">SPORTS</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* ── Navigation Slider Controls (Arrows + Dot Indicators) ── */}
      <div className="relative z-40 flex flex-col items-center gap-3 mt-2 w-full max-w-md">
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={handlePrev}
            aria-label="Previous Event"
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/85 border border-black/10 text-charcoal flex items-center justify-center shadow-md hover:bg-black hover:text-white transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
                  width: i === activeIndex ? '24px' : '7px',
                  height: '7px',
                  background: i === activeIndex ? '#C50337' : 'rgba(26,26,26,0.25)',
                }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            aria-label="Next Event"
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-charcoal text-white flex items-center justify-center shadow-md hover:bg-[#C50337] transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <span className="text-[10px] font-semibold tracking-widest text-charcoal/50 uppercase">
          {isMobile ? 'Swipe left / right to browse' : 'Use controls or click side cards to browse'}
        </span>
      </div>
    </section>
  );
}
