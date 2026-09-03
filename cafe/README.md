# R Sports & Cafe — Premium Landing Page

> A cinematic, scroll-driven luxury landing page for **R Sports & Cafe**, Thoothukudi's elite sports and gastronomy destination.

---

## Tech Stack

| Layer            | Technology                                          |
| ---------------- | --------------------------------------------------- |
| **Framework**    | React 19 + Vite 8                                   |
| **Styling**      | TailwindCSS 4 (custom design tokens)                |
| **Animations**   | GSAP 3.15 (ScrollTrigger) + Framer Motion 12        |
| **Smooth Scroll**| Lenis 1.3                                           |
| **3D Cursor**    | Three.js 0.184 (WebGL football follower)             |
| **Typography**   | Satoshi (headings), Inter (body/UI)                  |

---

## Project Structure

```
cafe/
├── public/
│   └── models/
│       └── football.glb          # 3D football model for cursor
├── src/
│   ├── assets/                   # All images, videos & media
│   ├── components/
│   │   ├── cursor/
│   │   │   └── Cursor3D.jsx      # Three.js 3D football cursor
│   │   ├── Preloader.jsx         # Cinematic page entry overlay
│   │   ├── SmoothScroll.jsx      # Lenis + GSAP ticker bridge
│   │   ├── Navbar.jsx            # Fixed glassmorphic navigation
│   │   ├── ScrollVideoHero.jsx   # Scroll-scrubbed video hero
│   │   ├── Menu.jsx              # Interactive menu carousel
│   │   ├── Turf.jsx              # Sports turf campaign section
│   │   ├── Gallery.jsx           # Horizontal-scrolling visual index
│   │   ├── Reviews.jsx           # Heart-shaped image mosaic
│   │   ├── Booking.jsx           # Glassmorphic reservation form
│   │   └── Philosophy.jsx        # Editorial brand story
│   ├── App.jsx                   # Root layout & section ordering
│   ├── index.css                 # Global styles, keyframes & utilities
│   └── main.jsx                  # React DOM entry point
├── tailwind.config.js            # Custom design tokens & colors
├── vite.config.js                # Vite bundler configuration
└── package.json
```

---

## Design System

### Color Palette

| Token          | Hex         | Usage                              |
| -------------- | ----------- | ---------------------------------- |
| `sandalBg`     | `#F7F3EC`   | Primary warm background            |
| `darkText`     | `#111111`   | Headlines & body text              |
| `sandalAccent` | `#D8C3A5`   | Accent lines, dividers, highlights |
| `coffeeAccent` | `#3A2A20`   | Deep coffee brown accents          |
| `darkBg`       | `#0F0F11`   | Menu & dark section backgrounds    |
| `lightText`    | `#F5F5F0`   | Text on dark backgrounds           |
| `menuAccent`   | `#D4AF37`   | Luxury gold for premium elements   |

### Typography

- **Headings:** Satoshi Bold, 64–88px, tracking `[-0.03em]`, uppercase
- **Body:** Inter Regular, 16–18px, tracking `[-0.01em]`, line-height 1.8
- **Labels:** Inter Medium, 11–12px, tracking `[0.24em]`, uppercase

---

## Component Architecture & Animations

### 1. Preloader (`Preloader.jsx`)
**Purpose:** Cinematic page entry — locks scroll, shows luxury gold branding, then slides away.

| Property       | Detail                                                |
| -------------- | ----------------------------------------------------- |
| **Library**    | Framer Motion `AnimatePresence`                       |
| **Duration**   | 2.4s loading → 1.2s slide-up exit                     |
| **Easing**     | `[0.76, 0, 0.24, 1]` (custom cubic-bezier)           |
| **Effects**    | Gold gradient text, animated loading bar, blur reveal |
| **Scroll Lock**| Pauses Lenis during load, resets to top on exit       |

---

### 2. Smooth Scroll (`SmoothScroll.jsx`)
**Purpose:** Wraps the entire app in Lenis for buttery-smooth inertial scrolling.

| Property          | Detail                                     |
| ----------------- | ------------------------------------------ |
| **Library**       | Lenis + GSAP ticker sync                   |
| **Duration**      | 1.1s scroll easing                          |
| **Wheel Speed**   | 1.2× multiplier                             |
| **Touch Speed**   | 2.0× multiplier                             |
| **Lag Smoothing** | Disabled (`gsap.ticker.lagSmoothing(0)`)   |

---

### 3. Navbar (`Navbar.jsx`)
**Purpose:** Fixed top navigation with a glassmorphic pill and floating brand logo.

| Property       | Detail                                              |
| -------------- | --------------------------------------------------- |
| **Style**      | `backdrop-filter: blur(18px)` glass pill            |
| **Border**     | `1px solid rgba(17,17,17,0.12)`                     |
| **CTA**        | "BOOK NOW" with border → filled hover transition    |

---

### 4. Scroll Video Hero (`ScrollVideoHero.jsx`)
**Purpose:** The crown jewel — a **6-screen-tall** pinned section where vertical scrolling scrubs through a video and triggers a multi-phase cinematic title reveal.

#### Animation Phases (GSAP ScrollTrigger Timeline)

| Phase | Scroll % | Animation                                                      |
| ----- | -------- | -------------------------------------------------------------- |
| 1     | 0–65%    | Video scrubs from 0 to 100% of its duration                   |
| 2     | 65–78%   | Video frame shrinks from fullscreen → `58vw × 45vh` rounded   |
| 3     | 78–88%   | Architectural mural fades in with blur-to-sharp + scale        |
| 4     | 88–94%   | **Title Forge:** Characters fly in with 3D rotateX, gold sweep wipes across, sparkle constellation appears, golden energy line draws |
| 5     | 94–100%  | Everything dissolves upward, frame lifts off-screen            |

#### Key Technical Details
- **Video scrub:** Uses `requestAnimationFrame` lerp loop (`0.12` lerp factor) for smooth frame interpolation
- **Mouse parallax:** CSS custom properties `--mx`/`--my` drive dust particles and title layers at different depths
- **Dust particles:** 22 ambient dots with 3 different float keyframes
- **Title sparkles:** 7 radial-gradient dots positioned around the text

---

### 5. Menu (`Menu.jsx`)
**Purpose:** A dark-themed interactive showcase carousel for signature dishes.

#### Animation Breakdown

| Element         | Library        | Animation                                               |
| --------------- | -------------- | ------------------------------------------------------- |
| Section entrance| GSAP           | `clipPath: inset(100% 0 0 0) → inset(0% 0 0 0)` wipe  |
| Image swap      | Framer Motion  | 3D perspective (`rotateY: ±18°`) + blur + scale exit/enter |
| Text cascade    | Framer Motion  | Staggered `y: 30 → 0` + blur fade per line             |
| Product float   | CSS keyframes  | `sigFloat` — 7s ease-in-out infinite bob                |
| Accent glow     | CSS keyframes  | `accentGlow` — radial gradient pulse behind product     |
| Pulse ring      | CSS keyframes  | `ringPulse` — expanding concentric rings                |
| CTA button      | CSS            | `scale-x-0 → scale-x-100` background fill on hover     |

---

### 6. Philosophy (`Philosophy.jsx`)
**Purpose:** Editorial brand story with split-text character animations and a parallax image.

| Element           | Animation                                                    |
| ----------------- | ------------------------------------------------------------ |
| Title characters  | `yPercent: 100 → 0` stagger `0.03s` per char                |
| Interior image    | Scale `1.25 → 1.0` on enter + `yPercent: 0 → -15` parallax |
| Sketch background | Fade `0 → 0.15` + `yPercent: 0 → -18` slow drift           |
| Metadata          | Staggered `y: 40 → 0` fade-up sequence                      |

---

### 7. Turf (`Turf.jsx`)
**Purpose:** Full-screen sports campaign section with background video and split-letter typography.

| Element         | Animation                                                    |
| --------------- | ------------------------------------------------------------ |
| Section entrance| `clipPath: inset(100% 0 0 0) → inset(0% 0 0 0)` wipe       |
| Title letters   | DOM-split into `<span>` → `yPercent: 100 → 0` stagger       |
| Heading         | `scale: 1.2 → 1.0` scrub parallax on scroll                 |
| Background video| Auto-play/pause on scroll enter/leave via ScrollTrigger      |
| CTA             | `opacity: 0, y: 30 → opacity: 1, y: 0` delayed fade-up     |

---

### 8. Gallery / Visual Index (`Gallery.jsx`)
**Purpose:** Horizontal-scrolling film-strip gallery pinned to the viewport.

| Element            | Animation                                              |
| ------------------ | ------------------------------------------------------ |
| Horizontal scroll  | GSAP `x: -scrollWidth` mapped to vertical scroll       |
| Image parallax     | Each image: `xPercent: -15 → 15` independent scrub     |
| Text column        | `opacity: 0, y: 40 → opacity: 1, y: 0` on pin         |
| Image hover        | `scale: 1 → 1.05` CSS transition on hover              |
| Scroll recalc      | `ScrollTrigger.refresh()` on each image `onLoad`        |

---

### 9. Reviews (`Reviews.jsx`)
**Purpose:** Heart-shaped image mosaic that assembles as you scroll.

| Element           | Animation                                                  |
| ----------------- | ---------------------------------------------------------- |
| Heart formation   | 24 images fly from center to parametric heart coordinates  |
| Heart math        | `x = 16sin³(t)`, `y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)` |
| Image rotation    | Each image rotates to align with the heart's tangent angle |
| Heart wrapper     | `rotation: -5 → 0`, `scale: 0.95 → 1` for drama          |
| Side text         | `opacity: 0, y: 30 → opacity: 1, y: 0` staggered reveal  |
| Responsive        | `gsap.matchMedia()` — scale adapts: Desktop 23, Tablet 15, Mobile 9 |

---

### 10. Booking (`Booking.jsx`)
**Purpose:** Glassmorphic reservation form with a dark cinematic background.

| Element          | Animation                                                  |
| ---------------- | ---------------------------------------------------------- |
| Form entrance    | `opacity: 0, y: 50 → opacity: 1, y: 0` GSAP fade-up      |
| Input focus      | Label float-up + white underline `scale-x-0 → scale-x-100`|
| Submit success   | Framer Motion `scale: 0.95 → 1` + checkmark fade-in       |
| Background       | `brightness(0.35) contrast(1.15) sepia(0.1)` overlay       |

---

### 11. 3D Cursor (`Cursor3D.jsx`)
**Purpose:** WebGL-rendered 3D football that follows the mouse with physics-based rolling, hover effects, and click interactions.

| Feature            | Detail                                                  |
| ------------------ | ------------------------------------------------------- |
| **Rendering**      | Three.js WebGL, capped at 1.0 DPR for performance      |
| **Model**          | GLTF/Draco compressed `football.glb`                    |
| **Following**      | Dynamic lerp: faster at high speed, laggier when slow   |
| **Rolling**        | Perpendicular-axis rotation proportional to mouse speed |
| **Idle**           | Gentle float + slow Y-axis spin after 1s of no movement|
| **Hover**          | Gold emissive glow + double concentric pulse rings      |
| **Click**          | Bounce (squash & stretch) + shockwave ring + sparkle burst |
| **Trail**          | Golden dot particles spawned behind movement direction  |
| **Performance**    | Auto-kills if FPS drops below 20 for 3 consecutive seconds |
| **Hero hide**      | Opacity → 0 when hovering over `#hero-section`          |

---

## Global CSS Effects (`index.css`)

| Effect               | Implementation                                         |
| -------------------- | ------------------------------------------------------ |
| Paper grain noise    | SVG `feTurbulence` overlay at 3.5% opacity, GPU-composited |
| Scrollbar            | Completely hidden (Lenis handles scroll)               |
| Shimmer text         | `background-position` animation on clipped gradient    |
| Dust particles       | 3 keyframe variants (18s, 23s, 20s cycles)             |
| Glass panel float    | 3 drift keyframes (20s, 24s, 28s cycles)               |
| Light sweep          | 10s diagonal wipe across elements                      |
| Premium shadow       | 4-layer `box-shadow` for depth illusion                |

---

## Section Flow & Scroll Journey

```
┌─────────────────────────────────────────┐
│  PRELOADER (2.4s cinematic gold entry)  │
├─────────────────────────────────────────┤
│  NAVBAR (fixed, glassmorphic, z-50)     │
├─────────────────────────────────────────┤
│  SCROLL VIDEO HERO (600vh pinned)       │
│  ├── Phase 1: Video scrub               │
│  ├── Phase 2: Frame shrinks             │
│  ├── Phase 3: Mural bleeds in           │
│  ├── Phase 4: Title forge               │
│  └── Phase 5: Exit dissolve             │
├─────────────────────────────────────────┤
│  MENU (dark, carousel, clip-path wipe)  │
├─────────────────────────────────────────┤
│  TURF (fullscreen video, split-text)    │
├─────────────────────────────────────────┤
│  GALLERY (horizontal pin scroll)        │
├─────────────────────────────────────────┤
│  REVIEWS (heart-shaped image scatter)   │
├─────────────────────────────────────────┤
│  BOOKING (glassmorphic form, dark)      │
├─────────────────────────────────────────┤
│  FOOTER (black, huge watermark text)    │
└─────────────────────────────────────────┘
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Performance Notes

- **Video optimization:** Hero video (`hero-video-opt.mp4`, 3.5MB) is a compressed version of the full-quality source
- **Cursor DPR cap:** Three.js pixel ratio is capped at `1.0` to prevent GPU fill-rate bottleneck on HiDPI displays
- **Image loading:** Gallery images trigger `ScrollTrigger.refresh()` on load to ensure accurate scroll math
- **Preloader:** 2.4s buffer ensures all GSAP layouts are calculated before user interaction begins
- **Frame skip:** Cursor3D skips render frames (not physics) when FPS drops below 35

---

## Design Philosophy

The site follows an **"Editorial Luxury"** design language:

1. **Asymmetric grids** — 7/5 column splits, offset layouts
2. **Cinematic pacing** — Scroll-scrubbed reveals create a film-like experience
3. **Muted palette with gold accents** — Sandal beige + dark charcoal + luxury gold
4. **Generous whitespace** — Content breathes with `py-32` to `py-48` padding
5. **Micro-typography** — 11px uppercase tracked labels create a technical, fashion-editorial feel
6. **Parallax depth** — Multiple layers moving at different rates simulate physical depth

---

*Built for R Sports & Cafe, Thoothukudi — EST. 2026*
