import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MARQUEE_WORDS = [
  'LIVE SCREENING',
  '✦',
  'SPORTS TOURNAMENTS',
  '✦',
  'FOOD FESTIVALS',
  '✦',
  'WEEKEND LEAGUES',
  '✦',
  'CORPORATE EVENTS',
  '✦',
  'PRIVATE PARTIES',
  '✦',
];

export default function Marquee() {
  const sectionRef = useRef(null);
  const track1Ref = useRef(null);
  const track2Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      let tween1, tween2;
      /* ── Continuous right-to-left scroll on track 1 ── */
      if (track1Ref.current) {
        tween1 = gsap.to(track1Ref.current, {
          xPercent: -50,
          duration: 40,
          ease: 'none',
          repeat: -1,
        });
      }

      /* ── Slightly faster left-to-right on track 2 (outlined text) ── */
      if (track2Ref.current) {
        tween2 = gsap.fromTo(
          track2Ref.current,
          { xPercent: -50 },
          {
            xPercent: 0,
            duration: 50,
            ease: 'none',
            repeat: -1,
          },
        );
      }

      /* ── Speed boost tied to scroll velocity ── */
      let currentScale = 1;
      if (sectionRef.current) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const v = Math.abs(self.getVelocity()) / 1000;
            const targetScale = 1 + Math.min(v * 0.15, 3);
            currentScale += (targetScale - currentScale) * 0.1;
            if (tween1) tween1.timeScale(currentScale);
            if (tween2) tween2.timeScale(currentScale);
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* Build the text twice for seamless loop */
  const renderWords = (outlined = false) => (
    <>
      {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((word, i) => (
        <span
          key={i}
          className={`inline-block whitespace-nowrap mx-4 md:mx-8 ${
            word === '✦'
              ? 'text-[24px] md:text-[36px] text-[#D4AF37] align-middle drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]'
              : ''
          }`}
          style={
            outlined && word !== '✦'
              ? {
                  color: '#050505', // Dark black text
                  WebkitTextStroke: '1.5px #D4AF37', // Gold shine stroke
                  textShadow: '0 0 20px rgba(212,175,55,0.4)',
                }
              : undefined
          }
        >
          {word}
        </span>
      ))}
    </>
  );

  return (
    <section
      id="marquee"
      ref={sectionRef}
      className="relative bg-sandalBg overflow-hidden select-none py-10 md:py-16 border-t border-b border-[#D4AF37]/20"
    >
      {/* Track 1: Solid text → moves right to left */}
      <div className="overflow-hidden mb-3 md:mb-5 relative z-10">
        <div
          ref={track1Ref}
          className="flex items-center font-sans font-bold text-[48px] sm:text-[64px] md:text-[88px] lg:text-[110px] leading-none tracking-[-0.03em] uppercase whitespace-nowrap will-change-transform"
        >
          <div className="bg-gradient-to-r from-[#AA771C] via-[#F4E27C] to-[#AA771C] bg-clip-text text-transparent opacity-100 drop-shadow-[0_0_25px_rgba(212,175,55,0.45)]">
            {renderWords(false)}
          </div>
        </div>
      </div>

      {/* Track 2: Outlined text → moves left to right (counter-direction) */}
      <div className="overflow-hidden relative z-10">
        <div
          ref={track2Ref}
          className="flex items-center font-sans font-bold text-[40px] sm:text-[52px] md:text-[72px] lg:text-[88px] leading-none tracking-[-0.02em] uppercase whitespace-nowrap will-change-transform"
        >
          <div style={{ opacity: 0.8 }}>
            {renderWords(true)}
          </div>
        </div>
      </div>
    </section>
  );
}
