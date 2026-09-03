# Project Rules & GSAP Guidelines

When writing or modifying animation code in this codebase:

## GSAP & React Guidelines

1. **Plugin Registration**: Always register plugins once at top-level or component scope:
   ```javascript
   import gsap from 'gsap';
   import { ScrollTrigger } from 'gsap/ScrollTrigger';
   import { useGSAP } from '@gsap/react';

   gsap.registerPlugin(ScrollTrigger, useGSAP);
   ```

2. **React Hooks**: Prefer `useGSAP()` hook from `@gsap/react` for component setup. Scope selectors with `scope: containerRef` to ensure cleanup and avoid target leaks:
   ```javascript
   useGSAP(() => {
     gsap.to('.animate-me', { x: 100, autoAlpha: 1 });
   }, { scope: containerRef });
   ```

3. **Performance Best Practices**:
   - Animate `x`, `y`, `scale`, `rotation`, `autoAlpha` rather than `left`, `top`, `width`, `height`, or `opacity`.
   - Use `autoAlpha` instead of `opacity` to automatically toggle `visibility: hidden` when `opacity` hits 0.
   - For scroll animations, use `ScrollTrigger.batch()` or `gsap.matchMedia()` for responsive layouts and reduced motion preferences.

4. **GSAP Skills Installed**:
   - `gsap-core`: Tweens, easing, duration, stagger, defaults.
   - `gsap-react`: `useGSAP` hook, context, refs, cleanup.
   - `gsap-scrolltrigger`: Scroll-linked animations, pinning, scrub.
   - `gsap-timeline`: Complex sequence control & position parameter.
   - `gsap-plugins`: ScrollTo, SplitText, Observer, Draggable, Flip.
   - `gsap-utils`: clamp, mapRange, interpolate, random, snap.
   - `gsap-performance`: Hardware acceleration, transform optimizations.
