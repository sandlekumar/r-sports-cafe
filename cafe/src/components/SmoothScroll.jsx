import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }) {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();

    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh);
    }

    const imgs = document.querySelectorAll('img[loading="lazy"]');
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener('load', refresh, { once: true });
    });

    window.addEventListener('resize', refresh);
    window.addEventListener('orientationchange', refresh);

    const timers = [100, 500, 1000, 2000].map((ms) => setTimeout(refresh, ms));

    return () => {
      window.removeEventListener('resize', refresh);
      window.removeEventListener('orientationchange', refresh);
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1,
      wheelMultiplier: 1.2,
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

    // Expose lenis and ScrollTrigger globally
    window.__lenis = lenis;
    window.ScrollTrigger = ScrollTrigger;
    window.gsap = gsap;

    return () => {
      window.__lenis = null;
      lenis.destroy();
      gsap.ticker.remove(updateGsap);
    };
  }, []);

  useEffect(() => {
    const syncScrollTrigger = () => ScrollTrigger.update();
    const onTouchEnd = () => ScrollTrigger.refresh();

    window.addEventListener('scroll', syncScrollTrigger, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('scroll', syncScrollTrigger);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return <>{children}</>;
}
