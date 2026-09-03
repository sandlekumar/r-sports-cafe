import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import heroVideo from '../assets/hero-video-opt.mp4';
import nightImage from '../assets/night.png';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Hero({ setShowLogo }) {
  const containerRef = useRef(null);
  const pinRef = useRef(null);
  const videoRef = useRef(null);
  const imageFrameRef = useRef(null);
  const nightImageRef = useRef(null);
  const brandLettersRef = useRef([]);
  const scrollIndicatorRef = useRef(null);

  const brandLetters = [
    { char: 'R', gap: false },
    { char: 'S', gap: false },
    { char: 'P', gap: false },
    { char: 'O', gap: false },
    { char: 'R', gap: false },
    { char: 'T', gap: false },
    { char: 'S', gap: true },
    { char: '&', gap: true },
    { char: 'C', gap: false },
    { char: 'A', gap: false },
    { char: 'F', gap: false },
    { char: 'E', gap: false }
  ];

  const handleVideoEnded = () => {
    // Fade in the night image once the video finishes using autoAlpha
    gsap.to(imageFrameRef.current, {
      autoAlpha: 1,
      duration: 1,
      ease: 'power2.inOut'
    });
  };

  useGSAP(() => {
    // Initial load animation for vertical brand text - fade in and subtle slide in
    gsap.fromTo(
      brandLettersRef.current,
      { autoAlpha: 0, y: 30 },
      { autoAlpha: 1, y: 0, duration: 1.5, stagger: 0.05, ease: 'power3.out', delay: 0.5 }
    );

    // Initial load animation for scroll indicator
    gsap.fromTo(
      scrollIndicatorRef.current,
      { autoAlpha: 0, y: 15 },
      { autoAlpha: 1, y: 0, duration: 1, ease: 'power2.out', delay: 1.8 }
    );

    // 2. Scroll-Linked Animation Timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        pin: pinRef.current,
        anticipatePin: 1, // Smooth out pin start
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Pause video on scroll to free up resources
          if (self.progress > 0.02 && videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
          }
        }
      }
    });

    // A. Brand letters stagger-scroll upwards and fade out quickly (within 20% scroll)
    tl.to(
      brandLettersRef.current,
      {
        y: -150,
        autoAlpha: 0,
        stagger: 0.01,
        duration: 0.2,
        ease: 'power2.out',
      },
      0
    );

    // Sync showing the navbar logo as the vertical letters vanish (over 300px scroll)
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=300',
      scrub: true,
      onUpdate: (self) => {
        setShowLogo(self.progress);
      }
    });

    // B. Fade out scroll indicator extremely quickly
    tl.to(
      scrollIndicatorRef.current,
      {
        autoAlpha: 0,
        y: -30,
        duration: 0.05,
        ease: 'power1.out',
      },
      0
    );

    // C. High-Performance Shrink Effect using scale and borderRadius
    tl.to(
      imageFrameRef.current,
      {
        scale: 0.75,
        borderRadius: '32px',
        ease: 'power2.inOut',
      },
      0
    );

    // D. Subtle cinematic parallax on the image
    tl.to(
      nightImageRef.current,
      {
        scale: 1.05,
        ease: 'none',
      },
      0
    );
  }, { scope: containerRef, dependencies: [setShowLogo] });

  return (
    <div ref={containerRef} className="relative h-[250vh] bg-black">
      {/* Pinned Hero Viewport */}
      <div ref={pinRef} className="w-full h-screen relative overflow-hidden bg-black flex items-center justify-center">
        
        {/* Fullscreen Video (Stays Fullscreen) */}
        <video
          ref={videoRef}
          src={heroVideo}
          autoPlay
          muted
          playsInline
          preload="metadata"
          onEnded={handleVideoEnded}
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Shrinking Frame Container for Image */}
        <div
          ref={imageFrameRef}
          className="absolute top-0 left-0 w-full h-full overflow-hidden flex items-center justify-center transform-gpu will-change-transform opacity-0"
        >
          <img
            ref={nightImageRef}
            src={nightImage}
            alt="Night View"
            className="absolute top-0 left-0 w-full h-full object-cover select-none pointer-events-none transform-gpu will-change-transform"
            style={{ scale: 1.15 }}
          />

          {/* Elegant Dark Subtle Overlay to keep text legible */}
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        </div>

        {/* Brand Text: Left Side Center Vertical arrangement */}
        <div className="fixed left-6 md:left-14 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center select-none pointer-events-none z-20">
          {brandLetters.map((item, idx) => (
            <div
              key={idx}
              ref={(el) => (brandLettersRef.current[idx] = el)}
              className={`font-logo font-light text-2xl md:text-[38px] text-black tracking-widest leading-none text-center ${
                item.gap ? 'my-3 md:my-5 opacity-75' : 'my-0.5 md:my-1'
              }`}
              style={{ textShadow: '0 0 1px rgba(255,255,255,0.1)' }}
            >
              {item.char}
            </div>
          ))}
        </div>

        {/* Scroll Indicator: Bottom Center */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none z-30 opacity-0"
        >
          <span className="font-sans text-[9px] tracking-extreme text-white opacity-60 mb-3 select-none">
            SCROLL
          </span>
          {/* Animated line indicator */}
          <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white animate-scroll-line" />
          </div>
        </div>

      </div>
    </div>
  );
}
