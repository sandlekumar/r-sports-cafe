import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 1.2,
      infinite: false,
    });

    // Synchronize ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);

    // Coordinate GSAP ticker with Lenis raf
    const updateGsap = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateGsap);

    // Disable lag smoothing to prevent visual jumps
    gsap.ticker.lagSmoothing(0);

    // Expose lenis globally so ScrollVideoHero can stop/start it
    window.__lenis = lenis;

    return () => {
      window.__lenis = null;
      lenis.destroy();
      gsap.ticker.remove(updateGsap);
    };
  }, []);

  return <>{children}</>;
}
