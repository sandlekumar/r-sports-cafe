import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import turfVideo from '../assets/turf.mp4';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Turf() {
  const containerRef = useRef(null);
  const word1Ref = useRef(null);
  const word2Ref = useRef(null);
  const word3Ref = useRef(null);
  const ctaRef = useRef(null);
  const videoRef = useRef(null);
  const headingRef = useRef(null);

  useGSAP(() => {
    const container = containerRef.current;
    if (!container) return;

    // Section wipe-up transition
    gsap.fromTo(
      container,
      { clipPath: 'inset(100% 0 0 0)' },
      {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.4,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );

    const splitToSpans = (element) => {
      if (!element) return;
      const text = element.textContent;
      element.innerHTML = '';
      text.split('').forEach((char) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char; // Preserve spaces with non-breaking space
        span.style.display = 'inline-block';
        span.className = 'char';
        element.appendChild(span);
      });
    };

    // Split words into spans for letter animation
    splitToSpans(word1Ref.current);
    splitToSpans(word2Ref.current);
    splitToSpans(word3Ref.current);

    const chars1 = word1Ref.current?.querySelectorAll('.char') || [];
    const chars2 = word2Ref.current?.querySelectorAll('.char') || [];
    const chars3 = word3Ref.current?.querySelectorAll('.char') || [];
    const allChars = [...chars1, ...chars2, ...chars3];

    // GSAP ScrollTrigger for split-letter reveal using autoAlpha
    if (allChars.length > 0) {
      gsap.fromTo(
        allChars,
        {
          yPercent: 100,
          autoAlpha: 0,
        },
        {
          yPercent: 0,
          autoAlpha: 1,
          stagger: 0.03,
          duration: 1.4,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 75%',
            end: 'bottom 25%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // Fade-in the CTA button
    if (ctaRef.current) {
      gsap.fromTo(
        ctaRef.current,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          delay: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 75%',
          },
        }
      );
    }

    // Scroll-triggered video playback control
    if (videoRef.current) {
      gsap.to(videoRef.current, {
        scrollTrigger: {
          trigger: container,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => videoRef.current && videoRef.current.play().catch(() => {}),
          onLeave: () => videoRef.current && videoRef.current.pause(),
          onEnterBack: () => videoRef.current && videoRef.current.play().catch(() => {}),
          onLeaveBack: () => videoRef.current && videoRef.current.pause(),
        },
      });
    }

    // Heading scaling illusion on scroll
    if (headingRef.current) {
      gsap.fromTo(
        headingRef.current,
        { scale: 1.2 },
        {
          scale: 1,
          scrollTrigger: {
            trigger: container,
            start: 'top 70%',
            end: 'top 30%',
            scrub: true,
          },
        }
      );
    }
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[100dvh] flex flex-col justify-center items-center py-32 px-6 overflow-hidden select-none"
      id="turf"
    >
      {/* Background Cinematic Video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={turfVideo} type="video/mp4" />
        </video>
      </div>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
      </div>

      {/* Main Campaign Message */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl w-full">
        <span className="font-inter font-medium text-[12px] tracking-[0.24em] text-white/60 mb-8 uppercase">
          TURF & SPORTS BOOKING
        </span>

        <h2 ref={headingRef} className="flex flex-col items-center justify-center font-sans font-bold text-[clamp(44px,12vw,88px)] leading-[1.05] tracking-[-0.03em] text-white mb-8 uppercase">
          <div className="overflow-hidden pb-4" ref={word1Ref}>GAME ON.</div>
          <div className="overflow-hidden pb-4 text-white/60" ref={word2Ref}>PLAY HARD.</div>
          <div className="overflow-hidden pb-4" ref={word3Ref}>CHILL AFTER.</div>
        </h2>

        <div className="max-w-2xl text-center mb-12 opacity-90">
          <p className="font-inter text-white text-lg md:text-xl leading-relaxed mb-4 font-medium">Get your team together and book your time on the turf.</p>
          <p className="font-inter text-white/70 text-sm md:text-base leading-relaxed">
            Perfect for friendly matches, regular games and weekend sessions with your crew. Once the game is over, the cafe is right there waiting.
          </p>
        </div>

        {/* Minimal CTA button */}
        <div ref={ctaRef} className="opacity-0 w-full sm:w-auto flex justify-center">
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

