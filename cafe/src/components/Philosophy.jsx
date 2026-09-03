import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import luxuryInterior from '../assets/tasteandplay/APNQkAF6krmLyqu1qzbpviSLO_qotKvNKHefiIctik_sxkZ2f67CFH0KvdJD6yEH34vMDiqxcPSDFy8G4biQO_OhHgOnW_KdPUkNcAHuSBaM7j_Y5WBoDDGHBn5ocmRurzlB2tTmExh_dIQmYkrxw2768-h1848-k-no.jpg';
import sketchBg from '../assets/architectural-sketch-collage.png.png';

gsap.registerPlugin(ScrollTrigger);

export default function Philosophy() {
  const sectionRef = useRef(null);
  const imageContainerRef = useRef(null);
  const imageRef = useRef(null);
  const dividerRef = useRef(null);
  const brandStoryRef = useRef(null);
  const statementRef = useRef(null);
  const footerRef = useRef(null);
  const sketchRef = useRef(null);

  const word1 = "PLAY.";
  const word2 = "EAT.";
  const word3 = "CHILL.";
  const word4 = "REPEAT.";

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Query character spans rendered by React
    const charsPlay = section.querySelectorAll('.char-play');
    const charsDine = section.querySelectorAll('.char-dine');
    const charsConnect = section.querySelectorAll('.char-connect');
    const charsRepeat = section.querySelectorAll('.char-repeat');
    const allChars = [...charsPlay, ...charsDine, ...charsConnect, ...charsRepeat];

    // Use gsap.context for scoped cleanup — only THIS component's triggers are killed on unmount
    const ctx = gsap.context(() => {
      if (allChars.length > 0) {
        gsap.fromTo(allChars,
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0, opacity: 1,
            stagger: 0.03, duration: 1.4, ease: 'power4.out',
            scrollTrigger: { trigger: section, start: 'top 75%', toggleActions: 'play none none none' },
          }
        );
      }

      // Image Entrance: zoom out from 1.25 -> 1.0 (slow zoom)
      if (imageRef.current && imageContainerRef.current) {
        gsap.fromTo(
          imageRef.current,
          { scale: 1.25 },
          {
            scale: 1.0, duration: 2.5, ease: 'power3.out',
            scrollTrigger: { trigger: imageContainerRef.current, start: 'top 85%' },
          }
        );

        // Subtle parallax scroll for the image
        gsap.to(imageRef.current, {
          yPercent: -15, ease: 'none',
          scrollTrigger: {
            trigger: imageContainerRef.current,
            start: 'top bottom', end: 'bottom top', scrub: true,
          },
        });
      }

      // Sketch background: fade in on enter + slow parallax drift
      if (sketchRef.current) {
        gsap.fromTo(
          sketchRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 0.15, y: 0, duration: 1.8, ease: 'power2.out',
            scrollTrigger: { trigger: section, start: 'top 85%' },
          }
        );

        gsap.to(sketchRef.current, {
          yPercent: -18, ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.5 },
        });
      }

      // Fade-up with stagger for metadata and story contents
      const fadeElements = [
        dividerRef.current, brandStoryRef.current,
        statementRef.current, footerRef.current,
      ].filter(Boolean);

      if (fadeElements.length > 0) {
        gsap.fromTo(
          fadeElements,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, stagger: 0.15, duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: section, start: 'top 65%' },
          }
        );
      }
    }, section); // scoped to this section — won't kill other components' triggers

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] bg-sandalBg text-darkText py-24 md:py-48 px-6 sm:px-12 md:px-24 overflow-hidden border-t border-borderGlass flex flex-col justify-center select-none"
      id="philosophy"
    >
      {/* ── Sketch Collage Background ──────────────────────────────────────── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0">
        <img
          ref={sketchRef}
          src={sketchBg}
          alt=""
          aria-hidden="true"
          className="absolute w-full h-[120%] object-cover object-center top-0 left-0 will-change-transform mix-blend-multiply"
          style={{ opacity: 0 }}
        />
      </div>
      {/* Background Watermark Faded Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
        <span className="font-sans font-bold text-[12vw] md:text-[9vw] text-neutral-900 opacity-[0.02] tracking-[0.08em] whitespace-nowrap">
          R SPORTS & CAFE
        </span>
      </div>

      {/* Large Decorative Quotation Mark in Background */}
      <div className="absolute -top-10 left-6 md:top-12 md:left-20 pointer-events-none select-none z-0">
        <span className="font-sans font-bold text-[180px] md:text-[500px] text-sandalAccent opacity-[0.06] md:opacity-[0.12] leading-none select-none">
          “
        </span>
      </div>

      {/* Main Grid Wrapper */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-24 relative z-10 items-start">
        
        {/* Left Column (Asymmetrical 7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-10 md:space-y-16">
          
          {/* Section Indicator */}
          <div className="space-y-4">
            <span className="font-inter font-medium text-[12px] tracking-[0.24em] text-sandalAccent uppercase block">
              YOUR SPORTS & CAFE DESTINATION IN THOOTHUKUDI
            </span>
            <div ref={dividerRef} className="w-16 h-[1px] bg-sandalAccent/60 opacity-0" />
          </div>

          {/* Massive Editorial Typography Heading */}
          <h2 className="font-sans font-bold text-[clamp(44px,12vw,88px)] leading-[1] tracking-[-0.03em] text-darkText flex flex-col items-start uppercase">
            <div className="overflow-hidden py-1">
              <span className="block">
                {word1.split('').map((char, i) => (
                  <span key={i} className="char-play inline-block">
                    {char}
                  </span>
                ))}
              </span>
            </div>
            <div className="overflow-hidden py-1 text-sandalAccent">
              <span className="block">
                {word2.split('').map((char, i) => (
                  <span key={i} className="char-dine inline-block">
                    {char}
                  </span>
                ))}
              </span>
            </div>
            <div className="overflow-hidden py-1">
              <span className="block">
                {word3.split('').map((char, i) => (
                  <span key={i} className="char-connect inline-block">
                    {char}
                  </span>
                ))}
              </span>
            </div>
            <div className="overflow-hidden py-1 text-sandalAccent">
              <span className="block">
                {word4.split('').map((char, i) => (
                  <span key={i} className="char-repeat inline-block">
                    {char}
                  </span>
                ))}
              </span>
            </div>
          </h2>

          {/* Short Brand Story */}
          <div ref={brandStoryRef} className="opacity-0 max-w-lg space-y-6">
            <p className="font-inter font-normal text-[18px] leading-[1.8] tracking-[-0.01em] text-darkText/80 max-w-[600px]">
              Welcome to R Sports & Cafe — where great games, good food and easy evenings come together.
            </p>
            <p className="font-inter font-normal text-[18px] leading-[1.8] tracking-[-0.01em] text-darkText/60 max-w-[600px]">
              Play with your crew. Stay for the food. End it with coffee and dessert.
            </p>
          </div>
        </div>

        {/* Right Column (Asymmetrical 5 cols, shifted layout) */}
        <div className="lg:col-span-5 flex flex-col space-y-8 lg:mt-24">
          
          {/* Luxury Interior Image Container */}
          <div 
            ref={imageContainerRef}
            className="w-full max-w-[400px] lg:max-w-none mx-auto aspect-[4/5] rounded-[32px] overflow-hidden relative group bg-neutral-200"
            style={{ boxShadow: '0 30px 100px -20px rgba(26,26,26,0.06)' }}
          >
            {/* Soft dark-warm cinematic overlay */}
            <div className="absolute inset-0 bg-[#1a1a1a]/5 mix-blend-multiply z-10 pointer-events-none" />
            <img 
              ref={imageRef}
              src={luxuryInterior}
              alt="Elite luxury sports cafe modern minimalist design interior"
              className="w-full h-[120%] object-cover absolute top-0 left-0 will-change-transform scale-125"
            />
          </div>

          {/* Short Philosophy Statement and Trust Section */}
          <div ref={statementRef} className="opacity-0 pl-4 border-l border-sandalAccent/30 space-y-8">
            <div className="space-y-4">
              <p className="font-sans font-medium text-[16px] md:text-[18px] text-darkText/95 leading-relaxed">
                Located in Caldwell Colony, Thoothukudi, R Sports & Cafe brings together a well-maintained sports turf and a premium cafe experience in one place.
              </p>
              <p className="font-sans font-medium text-[16px] md:text-[18px] text-darkText/95 leading-relaxed">
                Whether you're planning a game with friends, looking for a cafe to relax, meeting your family for dinner or celebrating something special — make it R.
              </p>
            </div>
            
            <div className="space-y-3 pt-6 border-t border-borderGlass">
              <p className="font-sans font-bold text-[18px] md:text-[20px] text-darkText">
                Loved for the Food. Remembered for the Vibe.
              </p>
              <p className="font-sans font-medium text-[14px] md:text-[16px] text-darkText/70 leading-relaxed">
                Guests love R Sports & Cafe for its food, coffee, welcoming atmosphere, friendly service and well-maintained turf.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="font-sans font-bold text-[20px] text-yellow-600">4.5 ★</span>
                <span className="font-sans font-medium text-[14px] text-darkText/60 uppercase tracking-widest">on Google</span>
              </div>
              <p className="font-sans font-medium text-[12px] md:text-[13px] text-darkText/50 leading-relaxed mt-2 uppercase tracking-[0.1em]">
                Great games. Great food. Great company.
              </p>
            </div>
          </div>

          {/* Est / Location Badge */}
          <div ref={footerRef} className="opacity-0 pl-4 pt-2">
            <span className="font-inter font-medium text-[12px] tracking-[0.24em] text-neutral-400 uppercase">
              EST. 2026 · TUTICORIN
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
