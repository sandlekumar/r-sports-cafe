import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Lock scroll native
    document.body.style.overflow = 'hidden';
    
    // Pause Lenis if available
    if (window.__lenis) {
      window.__lenis.stop();
    }

    // Counter: 0 → 100 over ~2.4s (100 steps × 24ms)
    const counterInterval = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(counterInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 24);
    
    // Simulate loading time to let video buffer and GSAP calculate (min 2 seconds)
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = '';
      if (window.__lenis) {
        window.__lenis.start();
        window.__lenis.scrollTo(0, { immediate: true });
      }
    }, 2400);

    return () => {
      clearTimeout(timer);
      clearInterval(counterInterval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center pointer-events-auto"
          style={{ background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #050505 70%)' }}
        >
          {/* Glowing luxury text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(5px)' }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            <span className="font-sans font-bold text-[32px] md:text-[48px] text-transparent bg-clip-text bg-gradient-to-r from-[#AA771C] via-[#F4E27C] to-[#AA771C] tracking-[0.3em] uppercase drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              R SPORTS
            </span>
            <span className="font-inter font-medium text-[10px] md:text-[12px] tracking-[0.4em] text-[#D4AF37]/60 mt-4 uppercase">
              Taste & Play
            </span>
          </motion.div>

          {/* Loading bar line */}
          <div className="mt-12 w-48 h-[1px] bg-white/10 relative overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-full h-full"
            />
          </div>

          {/* Counter */}
          <span
            className="mt-4 font-inter font-medium"
            style={{
              fontSize: '11px',
              color: '#D4AF37',
              letterSpacing: '0.3em',
            }}
          >
            {count}%
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
