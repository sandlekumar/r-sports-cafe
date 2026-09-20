import { useCallback, useRef } from 'react';

export function useRevealOnScroll({ threshold = 0.15, rootMargin = '0px 0px -10% 0px' } = {}) {
  const observer = useRef(null);

  const ref = useCallback((node) => {
    if (observer.current) {
      observer.current.disconnect();
    }
    
    if (node) {
      if (typeof IntersectionObserver === 'undefined') {
        node.classList.add('is-revealed');
        return;
      }
      
      observer.current = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('is-revealed');
          observer.current.disconnect();
        }
      }, { threshold, rootMargin });
      
      observer.current.observe(node);
    }
  }, [threshold, rootMargin]);

  return ref;
}
