import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

/**
 * MagneticButton
 * ──────────────
 * Wraps any child element in a magnetic hover effect.
 * When the mouse enters, the element subtly "pulls" towards the cursor,
 * creating a premium, tactile interaction feel.
 */
export default function MagneticButton({ children, strength = 0.3, className = '' }) {
  const ref = useRef(null);
  const ease = useRef(null);

  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;

    gsap.to(el, {
      x: dx,
      y: dy,
      duration: 0.4,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  }, [strength]);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: 'elastic.out(1, 0.4)',
      overwrite: 'auto',
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);

    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [handleMove, handleLeave]);

  return (
    <div ref={ref} className={`inline-block ${className}`} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
