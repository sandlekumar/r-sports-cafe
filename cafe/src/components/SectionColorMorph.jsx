import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * SectionColorMorph
 * ─────────────────
 * Seamlessly transitions the wrapper background color as the user scrolls
 * between sections. Each section defines its own palette, creating a 
 * living, breathing atmosphere that shifts with content.
 */

const SECTION_COLORS = [
  { selector: '#hero-section',  bg: '#F7F3EC' }, // Warm cream
  { selector: '#philosophy',    bg: '#F7F3EC' }, // Warm cream continuity
  { selector: '#events',        bg: '#FAFAF7' }, // Soft ivory (light events)
  { selector: '#menu',          bg: '#0A0A0A' }, // Night black
  { selector: '#turf',          bg: '#0A0A0A' }, // Night black continuity
  { selector: '#gallery',       bg: '#F7F3EC' }, // Warm cream
  { selector: '#reviews',       bg: '#F7F3EC' }, // Warm cream
  { selector: '#booking',       bg: '#0A0A0A' }, // Night black
];

export default function SectionColorMorph() {
  useEffect(() => {
    const wrapper = document.querySelector('.app-wrapper');
    if (!wrapper) return;

    const ctx = gsap.context(() => {
      SECTION_COLORS.forEach(({ selector, bg }) => {
        const section = document.querySelector(selector);
        if (!section) return;

        ScrollTrigger.create({
          trigger: section,
          start: 'top 60%',
          end: 'bottom 40%',
          onEnter: () => {
            gsap.to(wrapper, {
              backgroundColor: bg,
              duration: 0.8,
              ease: 'power2.inOut',
              overwrite: 'auto',
            });
          },
          onEnterBack: () => {
            gsap.to(wrapper, {
              backgroundColor: bg,
              duration: 0.8,
              ease: 'power2.inOut',
              overwrite: 'auto',
            });
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
