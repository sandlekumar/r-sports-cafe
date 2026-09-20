import React, { useRef, useState, useEffect } from 'react';
import { FootballSketch } from './decor/SketchMotifs';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';

// Use string path instead of import to prevent Vite from bundling the 5.7MB video
const TURF_VIDEO_PATH = new URL('../assets/turf.mp4', import.meta.url).href;
const TURF_POSTER_PATH = new URL('../assets/turf-poster.webp', import.meta.url).href;

export default function Turf() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [videoInView, setVideoInView] = useState(false);

  // IntersectionObserver lazy loading: mount and play only when in view, pause when out
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVideoInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          setVideoSrc(TURF_VIDEO_PATH);
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { rootMargin: '400px', threshold: 0.2 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    if (videoInView) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [videoInView, videoSrc]);

  const eyebrowRef = useRevealOnScroll();
  const headingRef = useRevealOnScroll();
  const descriptionRef = useRevealOnScroll();
  const ctaRevealRef = useRevealOnScroll();

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[100dvh] flex flex-col justify-center items-center py-32 px-6 overflow-hidden select-none"
      id="turf"
    >
      <FootballSketch className="absolute bottom-8 left-8 w-20 h-20 text-white/10 pointer-events-none select-none hidden md:block z-10" />
      {/* Background Cinematic Video — lazy loaded */}
      <div className="absolute inset-0 z-0">
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            loop
            playsInline
            preload="none"
            poster={TURF_POSTER_PATH}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-neutral-900 to-black" />
        )}
      </div>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
      </div>

      {/* Main Campaign Message */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl w-full">
        <span ref={eyebrowRef} className="reveal-up font-inter font-medium text-[12px] tracking-[0.24em] text-white/60 mb-8 uppercase" style={{ '--delay': '0s' }}>
          TURF & SPORTS BOOKING
        </span>

        <h2 ref={headingRef} className="reveal-up flex flex-col items-center justify-center font-sans font-bold text-[clamp(44px,12vw,88px)] leading-[1.05] tracking-[-0.03em] text-white mb-8 uppercase" style={{ '--delay': '0.15s' }}>
          <div>GAME ON.</div>
          <div className="text-white/60">PLAY HARD.</div>
          <div>CHILL AFTER.</div>
        </h2>

        <div ref={descriptionRef} className="reveal-up max-w-2xl text-center mb-12 opacity-90" style={{ '--delay': '0.3s' }}>
          <p className="font-inter text-white text-lg md:text-xl leading-relaxed mb-4 font-medium">Get your team together and book your time on the turf.</p>
          <p className="font-inter text-white/70 text-sm md:text-base leading-relaxed">
            Perfect for friendly matches, regular games and weekend sessions with your crew. Once the game is over, the cafe is right there waiting.
          </p>
        </div>

        {/* Minimal CTA button */}
        <div ref={ctaRevealRef} className="reveal-up w-full sm:w-auto flex justify-center" style={{ '--delay': '0.45s' }}>
          <a 
            href="https://book.playspots.in/venues/r-sports-cafe-tiruchendur-main-road-tuticorin"
            target="_blank" rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center border border-white px-8 sm:px-10 py-4 sm:py-5 w-full sm:w-auto rounded-full font-sans text-[13px] sm:text-[15px] font-medium tracking-[0.08em] text-white transition-colors duration-500 overflow-hidden uppercase hover:bg-white hover:text-black"
          >
            <span className="relative z-10 flex items-center gap-3">
              BOOK YOUR TURF
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-500"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </a>
        </div>
      </div>

      {/* Secondary technical markings */}
      <div className="absolute bottom-12 left-10 right-10 flex justify-between items-center font-inter text-[12px] font-medium text-white/60 tracking-[0.24em] pointer-events-none z-10 hidden md:flex uppercase">
        <span>BOOK YOUR GAME IN THOOTHUKUDI</span>
        <span>CASUAL GAMES // PRACTICE // WEEKEND PLANS</span>
      </div>
    </section>
  );
}
