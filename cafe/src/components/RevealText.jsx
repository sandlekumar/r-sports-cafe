import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * RevealText
 * Splits text into individual characters and provides a signature 3D rotation/scale reveal.
 * Uses IntersectionObserver for 100% reliable triggering across all mobile & desktop viewports.
 */
export default function RevealText({
  text,
  className = '',
  style = {},
  charClassName = 'reveal-text-char',
  charStyle = {},
  standalone = true,
  stagger = 0.03,
  duration = 0.8,
  delay = 0,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!standalone || !el) return;

    const chars = el.querySelectorAll(`.${charClassName}`);
    if (chars.length === 0) return;

    let animated = false;

    const triggerAnimation = () => {
      if (animated) return;
      animated = true;

      gsap.fromTo(
        chars,
        { opacity: 0, rotationX: 35, scale: 0.85, y: 10 },
        {
          opacity: 1,
          rotationX: 0,
          scale: 1,
          y: 0,
          stagger: stagger,
          duration: duration,
          ease: 'power3.out',
          transformOrigin: '50% 100%',
          delay: delay,
          onComplete: () => {
            chars.forEach((c) => {
              c.style.opacity = '1';
              c.style.transform = 'none';
            });
          },
        }
      );
    };

    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            triggerAnimation();
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '50px 0px 0px 0px' }
      );
      observer.observe(el);

      // Failsafe: After 1.5s, if not yet animated, ensure text is fully visible
      const fallbackTimer = setTimeout(() => {
        if (!animated) {
          triggerAnimation();
        }
      }, 1500);

      return () => {
        observer.disconnect();
        clearTimeout(fallbackTimer);
      };
    } else {
      triggerAnimation();
    }
  }, [standalone, stagger, duration, delay, charClassName]);

  return (
    <span ref={containerRef} className={`inline-block ${className}`} style={style}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className={`${charClassName} inline-block`}
          style={{
            whiteSpace: char === ' ' ? 'pre' : 'normal',
            willChange: 'opacity, transform',
            transformOrigin: '50% 100%',
            opacity: 1, // Fallback default visible so never blank
            ...charStyle,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
