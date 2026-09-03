import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import img1 from '../assets/tasteandplay/AHRPTWlu1JR_lh5ts1vV40632tiaqc_nhb_MS8dPelsIKVfO9cRWbf8KWukivxwU5Zzge_GCqfsMnKpzbUEuzoNR9rzoSlQCPFqkKEvhc9282SoYzNnKRfe3DsRaKCqYsLYxoFcrohlAMebbJ-cw2768-h1848-k-no.jpg';
import img2 from '../assets/tasteandplay/AHRPTWmyrrvDFAlqsutszgAbh8gJ7aTwYJFhbCUWUIZkKyiLq58KozZ34fTsHPNJoKIuBU72JZajnuiSWaw7bmfHGejtuf3a8N7LQmUCKIiDNSXFF8LKkL86WRiQTliQq0F0SBpRKxJDXEVINykNw2768-h1848-k-no.jpg';
import img3 from '../assets/tasteandplay/AHRPTWneCVL46nqAjOtuJbFWajiaGMg8gEBcUh1TaK23CN93aR_UB0JND9GEM7O7gCNDc0H_2MJ8bdA41WajR7-WvCJNIY7ubKU_AM7sDSjlFzuZSlNgDc6V5kay9SiuoqmBiRrT-QxTMpQ-5Hg_w2768-h1848-k-no.jpg';
import img4 from '../assets/tasteandplay/AHRPTWnepL3dlkb8RRpoq7W3g_jCmC7eULpDijSq81ecK7UqXV7mXvhMt7wiHjRBr7Y6SaAxS2rypxiEusSoCVvQ79Tl0R-gf89wdVz4qNvIR09FeMrHEzla3AJVJNRMm7_S5gqV6QTL80A2LsGxw2768-h1848-k-no.jpg';
import img5 from '../assets/tasteandplay/APNQkAF6krmLyqu1qzbpviSLO_qotKvNKHefiIctik_sxkZ2f67CFH0KvdJD6yEH34vMDiqxcPSDFy8G4biQO_OhHgOnW_KdPUkNcAHuSBaM7j_Y5WBoDDGHBn5ocmRurzlB2tTmExh_dIQmYkrxw2768-h1848-k-no.jpg';

const galleryItems = [
  {
    id: '01',
    title: 'Sensory Elevation',
    subtitle: 'GASTRONOMY',
    technical: 'ISO 400 • F/2.8 • 1/250s',
    src: img1,
  },
  {
    id: '02',
    title: 'Elite Facilities',
    subtitle: 'PERFORMANCE',
    technical: 'ISO 800 • F/1.4 • 1/125s',
    src: img2,
  },
  {
    id: '03',
    title: 'The Sanctuary',
    subtitle: 'ATMOSPHERE',
    technical: 'ISO 200 • F/4.0 • 1/500s',
    src: img3,
  },
  {
    id: '04',
    title: 'GASTRONOMIC MINIMALISM',
    subtitle: 'CURATED RECIPES',
    technical: 'ISO 100 • F/2.0 • 1/60s',
    src: img5,
  },
  {
    id: '05',
    title: 'THE RETREAT CHAMBER',
    subtitle: 'PRIVATE LIBRARY & RECOVERY',
    technical: 'ISO 1600 • F/1.2 • 1/80s',
    src: img4,
  },
];

export default function Gallery() {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const imageRefs = useRef([]);
  const textColRef = useRef(null);
  const mobileTrackRef = useRef(null);
  const [mobileActive, setMobileActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return; // Use native snap carousel on mobile for smooth touch sliding

    const container = containerRef.current;
    const trigger = triggerRef.current;
    if (!container || !trigger) return;

    const totalWidth = container.scrollWidth;
    const viewportWidth = window.innerWidth;
    const scrollVal = totalWidth - viewportWidth;

    const mainTl = gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        start: 'top top',
        end: `+=${scrollVal * 1.2}`,
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true,
      },
    });

    mainTl.to(container, {
      x: -scrollVal,
      ease: 'none',
    });

    gsap.fromTo(
      textColRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: trigger,
          start: 'top top',
        }
      }
    );

    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      clearTimeout(timeout);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [isMobile]);

  const scrollToMobileIndex = (index) => {
    if (mobileTrackRef.current) {
      const child = mobileTrackRef.current.children[index];
      if (child) {
        child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        setMobileActive(index);
      }
    }
  };

  return (
    <section
      ref={triggerRef}
      className={`relative bg-sandalBg text-darkText select-none ${isMobile ? 'py-16 px-4' : 'h-[100dvh] overflow-hidden'}`}
      id="gallery"
    >
      {/* Background Frame Details */}
      <div className="absolute top-10 left-12 z-10 hidden md:block">
        <span className="font-inter font-medium text-[12px] tracking-[0.24em] text-neutral-400 uppercase">
          ARCHIVE // HORIZONTAL PAN SEQUENCE
        </span>
      </div>

      <div className="absolute bottom-10 right-12 z-10 hidden md:block">
        <span className="font-inter font-medium text-[12px] tracking-[0.24em] text-neutral-400 uppercase">
          SCROLL TO SCRUB • SCALE 1:1.2
        </span>
      </div>

      {/* Desktop Pinned Left Text */}
      {!isMobile && (
        <div
          ref={textColRef}
          className="absolute top-0 left-0 h-full w-[55vw] z-20 flex flex-col justify-center pl-32 bg-gradient-to-r from-sandalBg via-sandalBg via-60% to-transparent pointer-events-none opacity-0"
        >
          <div className="max-w-sm pointer-events-auto">
            <div className="w-8 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#D8C3A5] mb-4" />
            <span className="font-inter font-medium text-[12px] tracking-[0.24em] text-neutral-400 mb-6 block">
              VISUAL INDEX
            </span>
            <h2 className="font-sans font-bold text-[clamp(44px,12vw,88px)] text-darkText leading-[1] tracking-[-0.03em] mb-8 uppercase">
              Taste &amp;<br />Play.
            </h2>
            <p className="font-inter font-normal text-[18px] text-darkText/70 leading-[1.8] tracking-[-0.01em] whitespace-normal">
              A linear progression showcasing the exquisite culinary delights and premium sports facilities at R Sports &amp; Cafe.
            </p>
            <div className="w-16 h-[1px] bg-borderGlass mt-12" />
          </div>
        </div>
      )}

      {/* Mobile Header Block */}
      {isMobile && (
        <div className="mb-8 text-center max-w-sm mx-auto">
          <div className="w-8 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#D8C3A5] mx-auto mb-3" />
          <span className="font-inter font-medium text-[11px] tracking-[0.24em] text-neutral-400 mb-2 block uppercase">
            Visual Index
          </span>
          <h2 className="font-sans font-bold text-4xl text-darkText leading-none uppercase tracking-tight mb-3">
            Taste &amp; Play.
          </h2>
          <p className="font-inter font-normal text-sm text-darkText/70 leading-relaxed">
            Exquisite culinary delights and sports facilities at R Sports &amp; Cafe. Swipe left or right to explore.
          </p>
        </div>
      )}

      {/* Desktop Track Container */}
      {!isMobile ? (
        <div
          ref={containerRef}
          className="flex h-full items-center pl-32 pr-[30vw] gap-24 whitespace-nowrap will-change-transform"
        >
          <div className="flex-shrink-0 w-[32vw]" />
          {galleryItems.map((item, idx) => (
            <div key={item.id} className="flex-shrink-0 flex flex-col group relative">
              <div className="flex justify-between items-center mb-4 font-inter font-medium text-[12px] tracking-[0.24em] text-neutral-400 px-1 uppercase">
                <span>MEMBER ARCHIVE // {item.id}</span>
                <span className="font-inter font-normal text-[12px] opacity-60 normal-case">{item.technical}</span>
              </div>
              <div className="relative overflow-hidden w-[48vw] aspect-[16/10] bg-neutral-100 border border-borderGlass rounded-[20px] shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10 pointer-events-none mix-blend-multiply" />
                <img
                  ref={(el) => (imageRefs.current[idx] = el)}
                  src={item.src}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
                />
              </div>
              <div className="mt-6 flex justify-between items-start">
                <div>
                  <span className="font-inter font-medium text-[12px] tracking-[0.24em] text-neutral-400 block mb-1 uppercase">
                    {item.subtitle}
                  </span>
                  <h3 className="font-sans font-bold text-[24px] text-darkText tracking-wide leading-tight uppercase">
                    {item.title}
                  </h3>
                </div>
                <span className="font-sans text-[20px] font-bold text-neutral-400 group-hover:text-[#D4AF37] transition-colors duration-300">
                  /{item.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Mobile Touch-Responsive Carousel */
        <div className="flex flex-col gap-6 w-full">
          <div
            ref={mobileTrackRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-2 px-2"
          >
            {galleryItems.map((item, idx) => (
              <div
                key={item.id}
                className="snap-center flex-shrink-0 w-[86vw] flex flex-col bg-white/60 p-4 rounded-2xl border border-black/5 shadow-lg"
              >
                <div className="flex justify-between items-center mb-3 font-inter font-medium text-[11px] text-neutral-400 uppercase">
                  <span>ARCHIVE // {item.id}</span>
                  <span className="text-[10px] text-neutral-500">{item.subtitle}</span>
                </div>
                <div className="relative overflow-hidden w-full aspect-[16/10] bg-neutral-100 rounded-xl mb-4 shadow-md">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-sans font-bold text-lg text-darkText uppercase leading-tight">
                      {item.title}
                    </h3>
                  </div>
                  <span className="font-sans font-bold text-sm text-[#D4AF37]">
                    {item.id} / {galleryItems.length}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Arrow Controls + Dots */}
          <div className="flex items-center justify-between px-4 mt-2">
            <button
              onClick={() => scrollToMobileIndex(Math.max(0, mobileActive - 1))}
              disabled={mobileActive === 0}
              className="w-10 h-10 rounded-full bg-white border border-black/10 text-darkText flex items-center justify-center shadow-md disabled:opacity-30"
              aria-label="Previous Slide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {galleryItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToMobileIndex(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background: i === mobileActive ? '#D4AF37' : 'rgba(0,0,0,0.2)',
                    width: i === mobileActive ? '20px' : '8px',
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => scrollToMobileIndex(Math.min(galleryItems.length - 1, mobileActive + 1))}
              disabled={mobileActive === galleryItems.length - 1}
              className="w-10 h-10 rounded-full bg-darkText text-white flex items-center justify-center shadow-md disabled:opacity-30"
              aria-label="Next Slide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

