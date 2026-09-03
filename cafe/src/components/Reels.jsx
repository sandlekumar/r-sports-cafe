import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import reel1 from '../assets/reels/AQNzVLhQTdWKCShaaaWlnvQOT_4tt9gK0FdvK5S2bYdMoh03GqEckpE67yg1tL1JPKODukbUGq9BFEwpCuwJlPFXMdW_v2XdW-I0cDE.mp4';
import reel2 from '../assets/reels/AQOLp1N__PVA7dZLkBpvZmIduLLNp0RyYX6A5CiLnkTpdJ0sQqm966i_ViFWEaSu-SxFcRAqKuntLh6aJkY_aYLZvZ1Ch06jjeZMHF0.mp4';
import reel3 from '../assets/reels/AQOokh-zcmZeKyqmRUcP_hou1Xx3Fgdgf3UZsLEF0CoQf0h6rK8y12LrqWQ01ekXngZAcTAN441zvitWtRO65HjexiarNScpg5NDfaQ.mp4';
import reel4 from '../assets/reels/AQPF4qzhN5QzQa4gIIuBCuY3GaORcmO4P8KLUwyMw9LlFQvrYqe5clVRd6wiouHNW5g98wNcI5YLwVDrq0_okQwmfyRsNhLrc3ko9g0.mp4';
import reel5 from '../assets/reels/AQPSAUoTHL4yeDZQyGTBGWHyVR1mx6UkTra8ooj3HE5A0EO9sR1UY7Jat-yFy7sVEBcRuLtCYMfkI0GsP98q4s1s9ls8ZhLenrgns0I.mp4';
import './Reels.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ─── Reels Data ─────────────────────────────────────────────────────────── */
const DEFAULT_REELS = [
  {
    id: 1,
    src: reel1,
    handle: '@rsports.cafe',
    caption: 'Match day energy hits different ⚡',
    likes: '2.4K',
    comments: '186',
    tag: 'MATCH DAY',
  },
  {
    id: 2,
    src: reel2,
    handle: '@rsports.cafe',
    caption: 'Night sessions under the lights 🌙',
    likes: '3.1K',
    comments: '224',
    tag: 'NIGHT GAME',
  },
  {
    id: 3,
    src: reel3,
    handle: '@rsports.cafe',
    caption: 'From the kitchen to the pitch 🍕⚽',
    likes: '1.8K',
    comments: '142',
    tag: 'LIFESTYLE',
  },
  {
    id: 4,
    src: reel4,
    handle: '@rsports.cafe',
    caption: 'Weekend vibes at R Sports 🔥',
    likes: '4.2K',
    comments: '318',
    tag: 'WEEKEND',
  },
  {
    id: 5,
    src: reel5,
    handle: '@rsports.cafe',
    caption: 'Action-packed moments ⚽🔥',
    likes: '5.1K',
    comments: '402',
    tag: 'HIGHLIGHTS',
  },
];

export default function Reels() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const [reelsList, setReelsList] = useState(DEFAULT_REELS);
  const [activeReel, setActiveReel] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const videoRefs = useRef([]);
  const [mutedStates, setMutedStates] = useState(() => DEFAULT_REELS.map(() => true));
  const [playingStates, setPlayingStates] = useState(() => DEFAULT_REELS.map(() => false));
  const [progressStates, setProgressStates] = useState(() => DEFAULT_REELS.map(() => 0));
  const progressIntervals = useRef([]);

  // Fetch live reels from backend API
  useEffect(() => {
    let cancelled = false;
    const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
    fetch(`${SERVER_URL}/api/reels`)
      .then((res) => res.json())
      .then((d) => {
        if (!cancelled && d.success && d.data.length > 0) {
          const formatted = d.data.map((r, idx) => ({
            id: r._id || idx + 1,
            src: r.videoUrl.startsWith('http') || r.videoUrl.startsWith('/src') ? r.videoUrl : `${SERVER_URL}${r.videoUrl}`,
            handle: r.handle || '@rsports.cafe',
            caption: r.caption,
            likes: r.likes || '1.2K',
            comments: r.comments || '45',
            tag: r.tag || 'HIGHLIGHTS',
          }));
          setReelsList(formatted);
          setCarouselIndex(Math.floor(formatted.length / 2));
          setMutedStates(formatted.map(() => true));
          setPlayingStates(formatted.map(() => false));
          setProgressStates(formatted.map(() => 0));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── GSAP entrance animations using useGSAP hook ────────────────────── */
  useGSAP(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );
    }

    const carousel = sectionRef.current?.querySelectorAll('.reels-carousel-container');
    if (carousel && carousel.length > 0) {
      gsap.fromTo(
        carousel,
        { autoAlpha: 0, y: 60 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        }
      );
    }
  }, { scope: sectionRef });

  /* ── Scroll-based video play/pause ──────────────────────────────────── */
  useEffect(() => {
    const observers = videoRefs.current.map((video, i) => {
      if (!video) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            setPlayingStates(prev => { const n = [...prev]; n[i] = true; return n; });
          } else {
            video.pause();
            setPlayingStates(prev => { const n = [...prev]; n[i] = false; return n; });
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(video);
      return observer;
    });

    return () => {
      observers.forEach(obs => obs?.disconnect());
    };
  }, []);

  /* ── Progress tracking ──────────────────────────────────────────────── */
  useEffect(() => {
    const intervals = videoRefs.current.map((video, i) => {
      if (!video) return null;
      return setInterval(() => {
        if (video.duration) {
          setProgressStates(prev => {
            const n = [...prev];
            n[i] = (video.currentTime / video.duration) * 100;
            return n;
          });
        }
      }, 100);
    });
    progressIntervals.current = intervals;
    return () => intervals.forEach(id => id && clearInterval(id));
  }, []);

  const toggleMute = (index) => {
    const video = videoRefs.current[index];
    if (!video) return;
    video.muted = !video.muted;
    setMutedStates(prev => { const n = [...prev]; n[index] = video.muted; return n; });
  };

  const togglePlay = (index) => {
    const video = videoRefs.current[index];
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPlayingStates(prev => { const n = [...prev]; n[index] = true; return n; });
    } else {
      video.pause();
      setPlayingStates(prev => { const n = [...prev]; n[index] = false; return n; });
    }
  };

  const handleNext = () => {
    setCarouselIndex(prev => Math.min(prev + 1, reelsList.length - 1));
  };

  const handlePrev = () => {
    setCarouselIndex(prev => Math.max(prev - 1, 0));
  };

  const handleCardClick = (index) => {
    if (index === carouselIndex) {
      openFullscreen(index);
    } else {
      setCarouselIndex(index);
    }
  };

  const getCardClass = (index) => {
    if (index === carouselIndex) return 'center';
    if (index === carouselIndex - 1) return 'left';
    if (index === carouselIndex + 1) return 'right';
    if (index < carouselIndex - 1) return 'hidden-left';
    if (index > carouselIndex + 1) return 'hidden-right';
    return '';
  };

  /* ── Fullscreen Reel Viewer ─────────────────────────────────────────── */
  const openFullscreen = (index) => {
    setActiveReel(index);
    const video = videoRefs.current[index];
    if (video) {
      video.muted = false;
      setMutedStates(prev => { const n = [...prev]; n[index] = false; return n; });
    }
    // Stop Lenis while modal is open
    window.__lenis?.stop();
  };

  const closeFullscreen = () => {
    if (activeReel !== null) {
      const video = videoRefs.current[activeReel];
      if (video) {
        video.muted = true;
        setMutedStates(prev => { const n = [...prev]; n[activeReel] = true; return n; });
      }
    }
    setActiveReel(null);
    window.__lenis?.start();
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-28 md:py-40 px-6 md:px-20 overflow-hidden"
      id="reels"
      style={{ background: 'linear-gradient(180deg, #F7F3EC 0%, #F0EDE6 50%, #F7F3EC 100%)' }}
    >
      {/* ── Section Header ────────────────────────────────────────────── */}
      <div ref={headerRef} className="max-w-7xl mx-auto mb-16 md:mb-24 opacity-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-[2px] bg-gradient-to-r from-[#D4AF37] to-transparent" />
              <span className="font-inter font-medium text-[11px] tracking-[0.25em] text-neutral-400 uppercase">
                REELS • HIGHLIGHTS
              </span>
            </div>
            <h2 className="font-sans font-bold text-[clamp(40px,10vw,72px)] text-darkText leading-[0.95] tracking-[-0.03em] uppercase">
              Behind<br />The Scenes.
            </h2>
          </div>
          <p className="font-inter text-[15px] text-neutral-500 leading-[1.7] max-w-[360px]">
            Catch the energy, the food, the games — raw, unfiltered moments from R Sports & Cafe captured in motion.
          </p>
        </div>
      </div>

      {/* ── Reels 3D Carousel ─────────────────────────────────────────── */}
      <div className="max-w-[100vw] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="reels-carousel-container">
            <button 
              className="carousel-nav-btn prev"
              onClick={handlePrev}
              disabled={carouselIndex === 0}
              style={{ opacity: carouselIndex === 0 ? 0.3 : 1, cursor: carouselIndex === 0 ? 'not-allowed' : 'pointer' }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <motion.div 
              className="reels-carousel-track cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -500 || offset.x < -60) {
                  if (carouselIndex < reelsList.length - 1) handleNext();
                } else if (swipe > 500 || offset.x > 60) {
                  if (carouselIndex > 0) handlePrev();
                }
              }}
            >
              {reelsList.map((reel, index) => {
                const positionClass = getCardClass(index);
                return (
                  <div
                    key={reel.id}
                    className={`reels-carousel-card group relative bg-white border-[6px] md:border-[8px] border-white overflow-hidden ${positionClass}`}
                    onClick={() => handleCardClick(index)}
                  >
              {/* Video */}
              <video
                ref={el => videoRefs.current[index] = el}
                src={reel.src}
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Cinematic overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none z-10" />

              {/* Progress bar */}
              <div className="absolute top-3 left-3 right-3 z-30">
                <div className="w-full h-[2px] bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/80 rounded-full transition-all duration-100"
                    style={{ width: `${progressStates[index]}%` }}
                  />
                </div>
              </div>

              {/* Tag badge */}
              <div className="absolute top-5 left-3 z-20">
                <span className="px-3 py-1 rounded-full text-[9px] font-inter font-semibold tracking-[0.12em] uppercase text-white/90"
                  style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
                  {reel.tag}
                </span>
              </div>

              {/* Play/Pause indicator */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                  <svg className="w-6 h-6 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                {/* Handle */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white/40 flex items-center justify-center bg-gradient-to-br from-[#D4AF37] to-[#B8860B]">
                    <span className="text-[9px] font-bold text-white">R</span>
                  </div>
                  <span className="font-inter font-semibold text-[11px] text-white">
                    {reel.handle}
                  </span>
                </div>

                {/* Caption */}
                <p className="font-inter text-[12px] text-white/80 leading-[1.4] mb-3 line-clamp-2">
                  {reel.caption}
                </p>

                {/* Engagement */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="font-inter text-[11px] font-medium text-white/70">{reel.likes}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    <span className="font-inter text-[11px] font-medium text-white/70">{reel.comments}</span>
                  </div>
                </div>
              </div>

              {/* Sound control */}
              <button
                className="absolute top-5 right-3 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}
                onClick={(e) => { e.stopPropagation(); toggleMute(index); }}
              >
                {mutedStates[index] ? (
                  <svg className="w-3.5 h-3.5 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                  </svg>
                )}
              </button>

              {/* Inner bezel shadow for depth */}
              <div className="absolute inset-0 rounded-[30px] md:rounded-[32px] shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] pointer-events-none z-10" />

              {/* Hover glow border */}
              <div className="absolute inset-0 rounded-[30px] md:rounded-[32px] border-2 border-transparent group-hover:border-[#D4AF37]/50 transition-all duration-500 z-10 pointer-events-none" />
                  </div>
                );
              })}
            </motion.div>

            <button 
              className="carousel-nav-btn next"
              onClick={handleNext}
              disabled={carouselIndex === reelsList.length - 1}
              style={{ opacity: carouselIndex === reelsList.length - 1 ? 0.3 : 1, cursor: carouselIndex === reelsList.length - 1 ? 'not-allowed' : 'pointer' }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Fullscreen Reel Viewer ─────────────────────────────────────── */}
      <AnimatePresence>
        {activeReel !== null && (
          <motion.div
            className="fixed inset-0 z-[99999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              onClick={closeFullscreen}
            />

            {/* Reel container */}
            <motion.div
              className="relative z-10 w-[85vw] max-w-[400px] max-h-[85dvh] aspect-[9/16] rounded-[28px] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.8)] cursor-grab active:cursor-grabbing"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(e, { offset }) => {
                if (offset.x < -60) {
                  setActiveReel(prev => (prev + 1) % reelsList.length);
                } else if (offset.x > 60) {
                  setActiveReel(prev => (prev - 1 + reelsList.length) % reelsList.length);
                }
              }}
            >
              <video
                src={reelsList[activeReel].src}
                autoPlay
                loop
                playsInline
                muted={mutedStates[activeReel]}
                className="w-full h-full object-cover"
              />

              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              {/* Close button */}
              <button
                onClick={closeFullscreen}
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-30"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}
              >
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Full info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full border-2 border-white/50 flex items-center justify-center bg-gradient-to-br from-[#D4AF37] to-[#B8860B]">
                    <span className="text-[11px] font-bold text-white">R</span>
                  </div>
                  <div>
                    <span className="block font-inter font-semibold text-[13px] text-white">
                      {reelsList[activeReel].handle}
                    </span>
                    <span className="block font-inter text-[10px] text-white/50">R Sports & Cafe</span>
                  </div>
                </div>
                <p className="font-inter text-[14px] text-white/85 leading-[1.5] mb-4">
                  {reelsList[activeReel].caption}
                </p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="font-inter text-[13px] font-medium text-white/80">{reelsList[activeReel].likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    <span className="font-inter text-[13px] font-medium text-white/80">{reelsList[activeReel].comments}</span>
                  </div>
                  <button
                    onClick={() => toggleMute(activeReel)}
                    className="ml-auto w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  >
                    {mutedStates[activeReel] ? (
                      <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Navigation arrows */}
            <button
              onClick={() => setActiveReel(prev => (prev - 1 + reelsList.length) % reelsList.length)}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center z-20 transition-all duration-300 hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => setActiveReel(prev => (prev + 1) % reelsList.length)}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center z-20 transition-all duration-300 hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
