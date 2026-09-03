import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import video1 from '../assets/hero-video-opt.mp4';
import video2 from '../assets/turf.mp4';
import video3 from '../assets/hero-video-opt.mp4';
import video4 from '../assets/turf.mp4';

import burgerImg from '../assets/signature_burger.png';
import pizzaImg from '../assets/signature_pizza.png';
import juiceImg from '../assets/signature_juice.png';
import coffeeImg from '../assets/signature_coffee.png';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_MENU_ITEMS = [
  {
    id: 1,
    category: 'SPECIALTY COFFEE',
    name: 'RED VELVET CLOUD COFFEE',
    desc: 'Smooth coffee finished with rich red velvet cream for a sweet, signature R experience.',
    price: '₹249',
    image: coffeeImg,
    video: video1,
    video_loop_url: video1,
    is_trending: true,
    accent: '#C8956C',
  },
  {
    id: 2,
    category: 'ARTISAN PIZZA',
    name: 'SPICY PERI PERI CHICKEN PIZZA',
    desc: 'Crispy thin crust, juicy chicken and bold peri peri flavour.',
    price: '₹349',
    image: pizzaImg,
    video: video2,
    video_loop_url: video2,
    is_trending: true,
    accent: '#D4A574',
  },
  {
    id: 3,
    category: 'ICED LATTE',
    name: 'SPANISH ICED LATTE',
    desc: 'Smooth, chilled and made for coffee lovers.',
    price: '₹229',
    image: juiceImg, // Normally this would be a coffee image, keeping juice image to prevent broken links
    video: video3,
    video_loop_url: video3,
    is_trending: true,
    accent: '#B07D9E',
  },
  {
    id: 4,
    category: 'FRESH PLATTERS',
    name: 'FRESH PLATTERS',
    desc: 'Fresh, satisfying plates made for sharing around the table.',
    price: '₹449',
    image: burgerImg,
    video: video4,
    video_loop_url: video4,
    is_trending: true,
    accent: '#8B7355',
  },
];

/* ─── Animation variants ─── */
const imageVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 120 : -120,
    opacity: 0,
    scale: 0.82,
    rotateY: dir > 0 ? 18 : -18,
    filter: 'blur(12px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: (dir) => ({
    x: dir > 0 ? -120 : 120,
    opacity: 0,
    scale: 0.82,
    rotateY: dir > 0 ? -18 : 18,
    filter: 'blur(12px)',
    transition: {
      duration: 0.45,
      ease: [0.55, 0, 1, 0.45],
    },
  }),
};

const textVariants = {
  enter: { y: 30, opacity: 0, filter: 'blur(6px)' },
  center: (i) => ({
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.55,
      delay: i * 0.08,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
  exit: {
    y: -20,
    opacity: 0,
    filter: 'blur(6px)',
    transition: { duration: 0.3, ease: [0.55, 0, 1, 0.45] },
  },
};

// ─── Menu Card Media Sub-Component with IntersectionObserver & Guardrails ────
function MenuCardMedia({ item, direction, activeIndex }) {
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  // Check connection speed guardrail
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.connection) {
      const conn = navigator.connection;
      if (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') {
        setIsSlowConnection(true);
      }
    }
  }, []);

  // IntersectionObserver lazy loading: play only when in view, pause when out
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (videoRef.current) {
            if (entry.isIntersecting) {
              videoRef.current.play().catch(() => {});
            } else {
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [item]);

  const rawVideo = item.video_loop_url || item.video;
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  const videoUrl = rawVideo
    ? (rawVideo.startsWith('http') || rawVideo.startsWith('data:') || rawVideo.startsWith('blob:') || rawVideo.startsWith('/src')
        ? rawVideo
        : `${SERVER_URL}${rawVideo}`)
    : null;

  const rawPhoto = item.photo || item.image;
  const photoUrl = rawPhoto
    ? (typeof rawPhoto === 'string' && rawPhoto.startsWith('/uploads') ? `${SERVER_URL}${rawPhoto}` : rawPhoto)
    : null;

  const canPlayVideo =
    Boolean(videoUrl) &&
    Boolean(item.is_trending) &&
    !shouldReduceMotion &&
    !isSlowConnection;

  return (
    <div
      ref={containerRef}
      className="sig-float w-[70vw] h-[80vw] max-w-[280px] max-h-[320px] sm:max-w-[340px] sm:max-h-[380px] md:max-w-[400px] md:max-h-[440px] relative z-10 mx-auto"
    >
      <AnimatePresence mode="wait" custom={direction}>
        {canPlayVideo ? (
          <motion.video
            ref={videoRef}
            key={`video-${item.id || activeIndex}`}
            src={videoUrl}
            poster={photoUrl}
            autoPlay
            loop
            muted
            playsInline
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl select-none will-change-transform rounded-2xl"
            draggable={false}
          />
        ) : (
          <motion.img
            key={`img-${item.id || activeIndex}`}
            src={photoUrl || burgerImg}
            alt={item.name}
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl select-none will-change-transform rounded-2xl"
            draggable={false}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

export default function Menu() {
  const [[activeIndex, direction], setPage] = useState([0, 0]);
  const [menuItems, setMenuItems] = useState(DEFAULT_MENU_ITEMS);

  const sectionRef = useRef(null);
  const catRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const priceRef = useRef(null);
  const decorLineRef = useRef(null);
  const ctaRef = useRef(null);

  // Fetch backend menu items if available
  useEffect(() => {
    let cancelled = false;
    const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
    fetch(`${SERVER_URL}/api/menu`)
      .then((res) => res.json())
      .then((d) => {
        if (!cancelled && d.success && d.data.length > 0) {
          setMenuItems(
            d.data.map((m, i) => ({
              id: m._id || i,
              category: m.category,
              name: m.name,
              desc: m.desc,
              price: m.price,
              photo: m.photo,
              image: m.photo ? `${SERVER_URL}${m.photo}` : DEFAULT_MENU_ITEMS[i % DEFAULT_MENU_ITEMS.length].image,
              video: m.video_loop_url || DEFAULT_MENU_ITEMS[i % DEFAULT_MENU_ITEMS.length].video,
              video_loop_url: m.video_loop_url,
              is_trending: Boolean(m.is_trending),
              accent: m.accent || '#C8956C',
            }))
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const paginate = useCallback(
    (dir) => {
      setPage(([prev]) => {
        const next = (prev + dir + menuItems.length) % menuItems.length;
        return [next, dir];
      });
    },
    [menuItems.length]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') paginate(1);
      if (e.key === 'ArrowLeft') paginate(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paginate]);

  const item = menuItems[activeIndex] || DEFAULT_MENU_ITEMS[0];

  return (
    <section
      ref={sectionRef}
      id="menu"
      className="relative w-full min-h-screen bg-black text-lightText overflow-hidden flex flex-col justify-center py-20 lg:py-0"
      style={{ backgroundColor: 'black' }}
    >
      <style>{`
        .menu-showcase-nav {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(245,245,240,.04);
          border: 1px solid rgba(245,245,240,.12);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all .35s cubic-bezier(0.16,1,0.3,1);
          backdrop-filter: blur(12px);
        }
        .menu-showcase-nav:hover {
          background: rgba(245,245,240,.15);
          border-color: rgba(245,245,240,.35);
          transform: scale(1.08);
        }
        .menu-showcase-nav:active { transform: scale(.95); }
        .ring-pulse {
          animation: ringPulse 4s cubic-bezier(0.16,1,0.3,1) infinite;
        }
        @keyframes ringPulse {
          0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.3; }
          50%      { transform: translate(-50%,-50%) scale(1.08); opacity: 0.7; }
        }
        .sig-float {
          animation: sigFloat 6s ease-in-out infinite;
        }
        @keyframes sigFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 mb-12 lg:mb-16 mt-20 text-center lg:text-left flex flex-col lg:flex-row items-center lg:items-end justify-between">
        <div className="max-w-2xl">
          <span className="font-inter font-medium text-[12px] tracking-[0.24em] text-orange-400 mb-4 uppercase block">Stay for the Food.</span>
          <h2 className="font-sans font-bold text-3xl md:text-5xl lg:text-6xl text-lightText mb-6 uppercase tracking-tight">Worth Coming Back For.</h2>
          <p className="font-inter text-lightText/60 text-base leading-relaxed">
            Fresh flavours. Good coffee. Comfortable spaces.
            <br />
            From casual meals and pizzas to refreshing drinks, coffee and desserts, R Sports & Cafe is made for slow evenings and good conversations.
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 min-h-[500px]">
        {/* ════ LEFT: text metadata ════ */}
        <div className="showcase-text-col lg:w-[38%] flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`text-${activeIndex}`}
              initial="enter"
              animate="center"
              exit="exit"
              custom={direction}
              className="space-y-4"
            >
              {/* Category pill */}
              <motion.div custom={0} variants={textVariants} ref={catRef} className="flex items-center gap-3">
                <span
                  className="inline-block px-4 py-1.5 rounded-full font-inter text-[11px] font-semibold tracking-[0.2em] uppercase border backdrop-blur-md"
                  style={{
                    backgroundColor: `${item.accent}18`,
                    color: item.accent,
                    borderColor: `${item.accent}40`,
                  }}
                >
                  {item.category}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h2
                custom={1}
                variants={textVariants}
                ref={titleRef}
                className="font-sans font-bold text-[clamp(32px,5vw,64px)] leading-[0.98] tracking-tight uppercase text-lightText"
              >
                {item.name}
              </motion.h2>

              {/* Description */}
              <motion.p
                custom={2}
                variants={textVariants}
                ref={descRef}
                className="font-inter font-normal text-[15px] sm:text-[16px] text-lightText/60 leading-[1.75] max-w-md"
              >
                {item.desc}
              </motion.p>

              {/* Price */}
              <motion.div custom={3} variants={textVariants} ref={priceRef} className="pt-2">
                <span
                  className="font-sans font-bold text-[36px] sm:text-[44px] leading-none"
                  style={{ color: item.accent }}
                >
                  {item.price}
                </span>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* decorative line */}
          <div
            ref={decorLineRef}
            className="hidden lg:block w-full h-[1px] bg-lightText/10 origin-left mt-2"
          />

          {/* CTA */}
          <div ref={ctaRef}>
            <Link
              to="/menu"
              className="group relative inline-flex items-center gap-3 border border-lightText px-10 py-4 rounded-full font-sans text-[13px] font-medium tracking-[0.12em] text-lightText hover:text-darkBg transition-colors duration-500 overflow-hidden uppercase"
            >
              <span className="absolute inset-0 w-full h-full bg-lightText scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-0" />
              <span className="relative z-10">Explore Menu</span>
              <svg className="relative z-10 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* ════ CENTER: Media Carousel (Video Loop / Photo) ════ */}
        <div
          className="showcase-image-col lg:w-[38%] flex justify-center items-center relative"
          style={{ perspective: '1200px' }}
        >
          {/* decorative ring behind image */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none"
            style={{
              width: 'min(90vw, 380px)',
              height: 'min(90vw, 380px)',
              borderColor: `${item.accent}18`,
              transition: 'border-color 0.8s',
            }}
          />
          <div
            className="ring-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none"
            style={{
              width: 'min(90vw, 380px)',
              height: 'min(90vw, 380px)',
              borderColor: `${item.accent}10`,
            }}
          />

          {/* navigation arrows */}
          <button
            onClick={() => paginate(-1)}
            aria-label="Previous menu item"
            className="menu-showcase-nav absolute left-0 md:-left-7 z-30 text-lightText"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            onClick={() => paginate(1)}
            aria-label="Next menu item"
            className="menu-showcase-nav absolute right-0 md:-right-7 z-30 text-lightText"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Card Media Container */}
          <MenuCardMedia item={item} direction={direction} activeIndex={activeIndex} />
        </div>

        {/* ════ RIGHT: meta + pagination ════ */}
        <div className="showcase-cta-col lg:w-[24%] flex flex-col items-center lg:items-end justify-center gap-10">
          
          {/* pagination dots */}
          <div className="flex lg:flex-col gap-3">
            {menuItems.map((mi, i) => (
              <button
                key={mi.id}
                onClick={() => setPage(([prev]) => [i, i > prev ? 1 : -1])}
                aria-label={`Go to ${mi.name}`}
                className="group relative flex items-center justify-center"
              >
                <span
                  className="block rounded-full transition-all duration-500"
                  style={{
                    width: i === activeIndex ? '32px' : '8px',
                    height: '8px',
                    backgroundColor: i === activeIndex ? item.accent : 'rgba(245,245,240,.15)',
                  }}
                />
                {/* tooltip */}
                <span className="absolute right-full mr-3 whitespace-nowrap font-inter text-[11px] tracking-[0.1em] text-lightText/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden lg:block uppercase">
                  {mi.category}
                </span>
              </button>
            ))}
          </div>

          {/* item counter */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`counter-${activeIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="font-sans font-bold text-[48px] lg:text-[64px] leading-none text-lightText/[0.06] lg:text-right w-full select-none"
            >
              {String(activeIndex + 1).padStart(2, '0')}
            </motion.div>
          </AnimatePresence>

          {/* order now mobile CTA */}
          <Link
            to="/menu"
            className="lg:hidden group relative inline-flex items-center gap-3 bg-lightText text-darkBg px-10 py-4 rounded-full font-sans text-[13px] font-medium tracking-[0.12em] uppercase overflow-hidden transition-all duration-300 hover:bg-lightText/90 active:scale-95"
          >
            <span>Order Now</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
