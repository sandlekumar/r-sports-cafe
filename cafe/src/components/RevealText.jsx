import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * RevealText
 * Splits text into individual characters and provides a signature 3D rotation/scale flash reveal.
 * Can be run standalone via its own ScrollTrigger, or driven by a parent GSAP timeline if standalone={false}.
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
    if (!standalone || !containerRef.current) return;

    const chars = containerRef.current.querySelectorAll(`.${charClassName}`);
    if (chars.length === 0) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
        },
      });

      // Signature Reveal (matches Hero)
      tl.fromTo(
        chars,
        { opacity: 0, rotationX: 40, scale: 0.78, y: 12 },
        {
          opacity: 1,
          rotationX: 0,
          scale: 1,
          y: 0,
          stagger: stagger,
          duration: duration,
          ease: 'power4.out',
          transformOrigin: '50% 100%',
        },
        delay
      );

      // Flash effect
      tl.to(
        chars,
        {
          keyframes: [
            { color: '#F0D080', textShadow: '0 0 20px rgba(240,200,100,0.8)', duration: 0.1 },
            { color: 'inherit', textShadow: '0 0 0px transparent', duration: 0.2 },
          ],
          stagger: stagger * 1.5,
        },
        delay + 0.1
      );
    }, containerRef);

    return () => ctx.revert();
  }, [standalone, stagger, duration, delay, charClassName]);

  return (
    <span ref={containerRef} className={`inline-block ${className}`} style={style}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className={`${charClassName} inline-block opacity-0`}
          style={{
            whiteSpace: char === ' ' ? 'pre' : 'normal',
            willChange: 'opacity, transform, filter, color',
            transformOrigin: '50% 100%',
            ...charStyle,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
