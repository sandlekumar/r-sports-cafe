/**
 * Belt-and-suspenders fallback for scroll-reveal elements.
 * GSAP ScrollTrigger handles the normal staggered reveal. This watches
 * the same elements independently and forces them visible if they're
 * in the viewport but still at opacity 0 after a grace period —
 * guaranteeing content is never permanently stuck invisible.
 */
export function installRevealSafetyNet(selector = '.fade-up-element, [style*="opacity: 0"]') {
  if (typeof IntersectionObserver === 'undefined') return () => {};

  const forceVisible = (el) => {
    if (getComputedStyle(el).opacity === '0') {
      el.style.opacity = '1';
      el.style.transform = 'none';
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        // Grace period: give GSAP's own animation a chance first
        setTimeout(() => forceVisible(entry.target), 2500);
      });
    },
    { threshold: 0.1 }
  );

  const els = document.querySelectorAll(selector);
  els.forEach((el) => observer.observe(el));

  return () => observer.disconnect();
}
