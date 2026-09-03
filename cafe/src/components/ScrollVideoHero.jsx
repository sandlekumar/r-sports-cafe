import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import muralPng from '../assets/architectural-sketch-collage.png.png';

gsap.registerPlugin(ScrollTrigger);

/* ─── Dust particles ────────────────────────────────────────────────────── */
const DUST_PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  w: 1 + (i % 3) * 0.6,
  left: ((5 + i * 7.7) % 90).toFixed(2),
  top:  ((8 + i * 9.3) % 88).toFixed(2),
  delay: (i * 0.55).toFixed(2),
  animClass: `animate-dust-${(i % 3) + 1}`,
}));

/* ─── Title character data ──────────────────────────────────────────────── */
const TITLE_STR   = 'R SPORTS & CAFE';
const TITLE_CHARS = TITLE_STR.split('');

export default function ScrollVideoHero() {
  const containerRef  = useRef(null);
  const pinRef        = useRef(null);
  const imageFrameRef = useRef(null);
  const artworkRef    = useRef(null);
  const ctaBoxRef     = useRef(null);
  const sweepRef      = useRef(null);
  const titleGlowRef  = useRef(null);
  const videoRef      = useRef(null);
  const scrollIndicatorRef = useRef(null);

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  /* ── Mouse parallax (desktop only) ───────────────────────────────────── */
  useEffect(() => {
    if (isMobile) return;
    let rafId = null;
    let nx = 0, ny = 0;
    const onMove = (e) => {
      nx = ((e.clientX / window.innerWidth)  - 0.5) * 2;
      ny = ((e.clientY / window.innerHeight) - 0.5) * 2;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        containerRef.current?.style.setProperty('--mx', nx.toFixed(3));
        containerRef.current?.style.setProperty('--my', ny.toFixed(3));
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  /* ── Frame scrub + GSAP timeline ─────────────────────────────────────── */
  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    const video = videoRef.current;
    if (!video) return;
    const ctxCanvas = video.getContext('2d');

    video.width = mobile ? 960 : 1920;
    video.height = mobile ? 540 : 1080;
    ctxCanvas.imageSmoothingEnabled = true;
    ctxCanvas.imageSmoothingQuality = mobile ? 'medium' : 'high';

    // On mobile load every 15th frame for performance (~60 frames total)
    const totalFrames = 903;
    const frameStep = mobile ? 15 : 1;
    const images = [];

    for (let i = 1; i <= totalFrames; i += frameStep) {
      const img = new Image();
      img.src = `/assets/hero-frames/frame_${i.toString().padStart(5, '0')}.jpg`;
      images.push(img);
    }

    const frameCount = images.length;
    const imageObj = { frame: 0 };

    images[0].onload = () => {
      ctxCanvas.drawImage(images[0], 0, 0, video.width, video.height);
    };

    const renderFrame = () => {
      const idx = Math.min(Math.round(imageObj.frame), frameCount - 1);
      const img = images[idx];
      if (img && img.complete) {
        ctxCanvas.drawImage(img, 0, 0, video.width, video.height);
      } else if (img) {
        img.onload = () => ctxCanvas.drawImage(img, 0, 0, video.width, video.height);
      }
    };

    // Scroll indicator entrance
    if (scrollIndicatorRef.current) {
      gsap.fromTo(scrollIndicatorRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 1.8 }
      );
    }

    const ctx = gsap.context(() => {
      if (imageFrameRef.current) {
        gsap.set(imageFrameRef.current, { xPercent: -50, yPercent: -50 });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: mobile ? 0.3 : 0.5,
          pin: pinRef.current,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // ── PHASE 1 (0–0.60): Frame sequence scrub ──────────────────────────
      tl.to(scrollIndicatorRef.current, {
        opacity: 0, y: -30, duration: 0.05, ease: 'power1.out',
      }, 0);

      tl.to(imageObj, {
        frame: frameCount - 1,
        snap: 'frame',
        ease: 'none',
        duration: 0.60,
        onUpdate: renderFrame,
      }, 0);

      // ── PHASE 2 (0.60–0.72): Video shrinks to cinematic box ─────────────
      const shrinkW = mobile ? '92vw' : '75vw';
      const shrinkH = mobile ? '42vh' : '45vh';
      const shrinkR = mobile ? '16px' : '28px';

      tl.to(imageFrameRef.current, {
        width: shrinkW,
        height: shrinkH,
        borderRadius: shrinkR,
        border: '1px solid rgba(17,17,17,0.12)',
        boxShadow: mobile
          ? '0 15px 40px rgba(0,0,0,0.12)'
          : '0 30px 80px rgba(0,0,0,0.22), 0 10px 30px rgba(0,0,0,0.14)',
        duration: 0.12, ease: 'power4.inOut',
      }, 0.60);

      // ── PHASE 3 (0.72–0.82): Architectural mural bleeds in ──────────────
      tl.fromTo(artworkRef.current,
        { opacity: 0, scale: 1.05 },
        { opacity: 0.5, scale: 1, duration: 0.10, ease: 'power4.out' },
        0.72
      );

      // ── PHASE 4 (0.82–0.92): Title + CTA box reveal ────────────────────
      tl.fromTo(titleGlowRef.current,
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 0.06, ease: 'power3.out' },
        0.82
      );

      tl.fromTo('.svh-energy-line',
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.05, ease: 'expo.out' },
        0.82
      );

      tl.fromTo('.svh-title-char',
        { opacity: 0, rotationX: 40, scale: 0.78, y: 12 },
        {
          opacity: 1, rotationX: 0, scale: 1, y: 0,
          stagger: 0.002, duration: 0.05, ease: 'power4.out',
          transformOrigin: '50% 100%',
        },
        0.83
      );

      tl.fromTo(sweepRef.current,
        { left: '-50%', x: 0, opacity: 0, skewX: -20 },
        { left: '150%', x: 0, opacity: 1, skewX: -20, duration: 0.06, ease: 'power3.inOut' },
        0.835
      );

      tl.to('.svh-title-char', {
        keyframes: [
          { color: '#F0D080', textShadow: '0 0 20px rgba(240,200,100,0.8)', duration: 0.02 },
          { color: '#111111', textShadow: '0 0 0px transparent', duration: 0.02 },
        ],
        stagger: 0.003,
      }, 0.84);

      // Mobile/Desktop CTA box fade in
      tl.fromTo(ctaBoxRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.05, ease: 'power3.out' },
        0.86
      );

      // Golden border on video frame
      tl.to(imageFrameRef.current, {
        border: '1px solid rgba(235,203,139,0.6)',
        boxShadow: '0 0 50px rgba(235,203,139,0.3), 0 30px 80px rgba(0,0,0,0.22)',
        duration: 0.04, ease: 'power2.inOut',
      }, 0.87);

      // ── PHASE 5 (0.92–1.0): Exit — dissolve & lift ──────────────────────
      tl.to(
        [artworkRef.current, '.svh-title-char', titleGlowRef.current,
         '.svh-energy-line', ctaBoxRef.current],
        { opacity: 0, y: -10, duration: 0.04, ease: 'power3.in', stagger: 0.002 },
        0.92
      );
      tl.to(imageFrameRef.current,
        { yPercent: -175, scale: 0.96, opacity: 0, duration: 0.08, ease: 'power3.inOut' },
        0.92
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      id="hero-section"
      ref={containerRef}
      className="relative bg-cream text-darkText"
      style={{
        '--mx': 0,
        '--my': 0,
        height: isMobile ? '180vh' : '500vh',
      }}
    >
      <div ref={pinRef} className="w-full h-[100dvh] relative overflow-hidden bg-cream">

        {/* ── Ambient dust particles ───────────────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
          style={{ transform: isMobile ? 'none' : 'translate3d(calc(var(--mx)*5px),calc(var(--my)*5px),0)' }}
        >
          {DUST_PARTICLES.map(({ id, w, left, top, delay, animClass }) => (
            <div key={id}
              className={`absolute rounded-full bg-darkText ${animClass}`}
              style={{
                width: `${w}px`, height: `${w}px`,
                left: `${left}vw`, top: `${top}vh`,
                animationDelay: `${delay}s`, opacity: 0.10,
                willChange: 'transform, opacity',
              }}
            />
          ))}
        </div>

        {/* ── Architectural mural ─────────────────────────────────────────── */}
        <div
          className="absolute inset-0 w-full h-full z-0 pointer-events-none"
          style={{ transform: isMobile ? 'none' : 'translate3d(calc(var(--mx)*9px),calc(var(--my)*9px),0)' }}
        >
          <div
            ref={artworkRef}
            className="absolute inset-0 w-full h-full"
            style={{ transformOrigin: 'center center', opacity: 0, willChange: 'opacity, transform' }}
          >
            <img src={muralPng} alt="" className="w-full h-full pointer-events-none" style={{ objectFit: 'cover' }} />
          </div>
        </div>

        {/* ── Main video frame ────────────────────────────────────────────── */}
        <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
          <div
            ref={imageFrameRef}
            className="absolute left-1/2 top-1/2 overflow-hidden pointer-events-none"
            style={{
              width: '100vw', height: '100dvh',
              borderRadius: '0px', boxShadow: 'none',
              border: '1px solid transparent',
              willChange: 'transform, opacity, border-radius, width, height',
            }}
          >
            <canvas
              ref={videoRef}
              className="w-full h-full object-cover object-center brightness-[1.15] contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          </div>
        </div>

        {/* ── DESKTOP: Title + CTA BELOW the video box ─────────────────── */}
        {!isMobile && (
          <div
            className="absolute inset-0 w-full h-full z-20 pointer-events-none"
            style={{ transform: 'translate3d(calc(var(--mx)*2px),calc(var(--my)*2px),0)' }}
          >
            {/* Positioned below the video frame: video is at 50%/50% with 45vh height, 
                so bottom edge is ~72.5vh. We start title area just below that. */}
            <div
              className="absolute left-0 w-full flex flex-col items-center text-center select-none px-4"
              style={{ top: '74vh' }}
            >
              
              {/* Warm amber halo */}
              <div
                ref={titleGlowRef}
                className="absolute pointer-events-none opacity-0"
                style={{
                  width: '600px', height: '200px',
                  left: '50%', top: '0',
                  transform: 'translateX(-50%)',
                  background: 'radial-gradient(ellipse, rgba(231,201,138,0.22) 0%, rgba(231,201,138,0.05) 50%, transparent 70%)',
                  zIndex: 0,
                }}
              />

              {/* Title with sweep */}
              <div
                className="relative inline-block pb-4 pt-2 px-10 z-10 overflow-hidden"
                style={{ perspective: '800px' }}
              >
                <div
                  ref={sweepRef}
                  className="absolute top-0 bottom-0 pointer-events-none z-30"
                  style={{
                    width: '280px', left: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,248,220,0.7) 35%, rgba(255,230,140,0.95) 50%, rgba(255,248,220,0.7) 65%, transparent 100%)',
                  }}
                />

                <h1
                  className="font-sans font-semibold uppercase relative z-10 flex flex-wrap justify-center text-[#111111]"
                  style={{
                    fontSize: 'clamp(28px, 4vw, 52px)',
                    letterSpacing: 'clamp(0.08em, 1vw, 0.3em)',
                    lineHeight: 1.15,
                    filter: 'drop-shadow(0 0 28px rgba(231,201,138,0.3))',
                  }}
                >
                  {TITLE_CHARS.map((char, i) => (
                    <span
                      key={i}
                      className="svh-title-char inline-block opacity-0"
                      style={{
                        whiteSpace: char === ' ' ? 'pre' : 'normal',
                        willChange: 'opacity, transform, filter, color',
                        transformOrigin: '50% 100%',
                        display: 'inline-block',
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </h1>

                <div
                  className="svh-energy-line absolute left-[4%] right-[4%] bottom-2 h-px opacity-0 z-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(231,201,138,0.9) 50%, transparent 100%)',
                    boxShadow: '0 0 12px 1px rgba(231,201,138,0.6)',
                    transformOrigin: 'center center',
                  }}
                />
              </div>

              {/* Desktop CTA below title */}
              <div
                ref={ctaBoxRef}
                className="opacity-0 mt-4 flex flex-col items-center gap-4 pointer-events-auto z-20"
              >
                <p
                  className="font-inter font-medium uppercase text-[11px] text-center"
                  style={{ color: 'rgba(17,17,17,0.6)', letterSpacing: '0.15em' }}
                >
                  SPORTS, FOOD & GOOD TIMES IN THOOTHUKUDI
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── MOBILE: Glassmorphism CTA card below video ──────────────────── */}
        {isMobile && (
          <div className="absolute inset-0 w-full h-full z-20 pointer-events-none">
            {/* Hidden refs for GSAP (still needed for timeline targets) */}
            <div ref={titleGlowRef} className="hidden" />
            <div ref={sweepRef} className="hidden" />
            <span className="svh-title-char hidden" />
            <div className="svh-energy-line hidden" />

            {/* Glass CTA card — positioned in bottom third of viewport */}
            <div
              ref={ctaBoxRef}
              className="absolute left-1/2 -translate-x-1/2 opacity-0 pointer-events-auto"
              style={{ bottom: '8vh', width: '88vw', maxWidth: '400px' }}
            >
              <div
                className="rounded-[24px] px-6 py-7 flex flex-col items-center gap-4 text-center"
                style={{
                  background: 'rgba(255, 253, 248, 0.55)',
                  backdropFilter: 'blur(20px) saturate(1.4)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
                  border: '1px solid rgba(181, 138, 85, 0.25)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.3) inset',
                }}
              >
                {/* Brand name */}
                <h2
                  className="font-sans font-bold uppercase tracking-[0.12em] text-[18px]"
                  style={{ color: '#1B1B1B' }}
                >
                  R SPORTS & CAFE
                </h2>

                {/* Thin gold line */}
                <div
                  className="w-12 h-[1px] rounded-full"
                  style={{ background: 'linear-gradient(90deg, transparent, #B58A55, transparent)' }}
                />

                {/* Tagline */}
                <p
                  className="font-inter font-medium uppercase text-[8px] tracking-[0.18em]"
                  style={{ color: 'rgba(27,27,27,0.55)' }}
                >
                  PLAY &bull; EAT &bull; CHILL &bull; REPEAT
                </p>

                {/* Location */}
                <p
                  className="font-inter text-[10px]"
                  style={{ color: 'rgba(27,27,27,0.5)' }}
                >
                  Thoothukudi, Tamil Nadu
                </p>

                {/* Reserve Table Button */}
                <Link
                  to="/booking"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-sans font-semibold text-[11px] uppercase tracking-[0.15em] transition-all duration-300 active:scale-95"
                  style={{
                    background: '#1B1B1B',
                    color: '#FFF8E7',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.2), 0 0 0 1px rgba(181,138,85,0.3)',
                  }}
                >
                  <span>Reserve Your Table</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Scroll Indicator */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none z-30 opacity-0"
        >
          <span className="font-sans text-[9px] tracking-extreme text-white opacity-60 mb-3 select-none">
            SCROLL
          </span>
          <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white animate-scroll-line" />
          </div>
        </div>

      </div>
    </div>
  );
}
