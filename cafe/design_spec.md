# R Sports & Cafe — Design Specification (Figma-Ready)

> Extracted from source code analysis. All values are exact as implemented.  
> **Date:** 2026-07-24

---

## 1. Design Tokens

### 1.1 Color Palette

#### Light Theme (Home Page — Default)

| Token Name | Hex / Value | Usage |
|------------|-------------|-------|
| `sandalBg` | `#F7F3EC` | Primary page background |
| `darkText` | `#111111` | Primary text color |
| `sandalAccent` | `#D8C3A5` | Accent (brand sandal), Philosophy highlights |
| `coffeeAccent` | `#3A2A20` | Secondary accent |
| `borderGlass` | `rgba(17,17,17,0.12)` | Glass panel borders |
| `bgGlass` | `rgba(255,255,255,0.45)` | Glass panel backgrounds |
| `primaryWhite` | `#FFFFFF` | Pure white |

#### Dark Theme (Events, Menu, Booking)

| Token Name | Hex / Value | Usage |
|------------|-------------|-------|
| `darkBg` | `#0F0F11` | Menu section background |
| `lightText` | `#F5F5F0` | Text on dark backgrounds |
| `menuAccent` | `#D4AF37` | Gold accent (primary brand gold) |
| `menuBorder` | `rgba(245,245,240,0.12)` | Border on dark sections |
| `menuBgGlass` | `rgba(15,15,17,0.45)` | Glass on dark bg |
| Events bg | `#050505` | Events section background |
| Booking bg | `#0A0A0A` | Booking section background |
| Footer bg | `#050505` | Footer background |

#### Turf Page Theme

| Token Name | Hex / Value | Usage |
|------------|-------------|-------|
| `turf.bg` | `#070707` | Page background |
| `turf.forest` | `#0E1D13` | Dark forest green sections |
| `turf.green` | `#2E8B57` | Primary green accent |
| `turf.lime` | `#7CFC00` | Lime highlight accent |
| `turf.gold` | `#D4AF37` | Gold (shared with main) |
| `turf.warm` | `#F7F5EF` | Warm light text |
| `turf.muted` | `#4A5A50` | Muted green text |
| `turf.red` | `#8B2500` | Red accent |

#### Gold Gradients (Used Frequently)

| Name | CSS Value | Usage |
|------|-----------|-------|
| Gold Gradient Text | `linear-gradient(135deg, #D4AF37 0%, #F5E6A3 40%, #D4AF37 70%, #B8860B 100%)` | `.text-gradient-gold` — headings |
| Gold Shimmer Text | `linear-gradient(90deg, #D4AF37 0%, #D4AF37 40%, #FFF8DC 50%, #D4AF37 60%, #D4AF37 100%)` | `.shimmer-gold` — animated text |
| Gold Button | `linear-gradient(135deg, #D4AF37, #B8860B)` | CTA buttons |
| Gold Underline | `linear-gradient(90deg, #D4AF37, #F5E6A3)` | `.hover-underline-gold` |
| Preloader Title | `linear-gradient(→ #AA771C, #F4E27C, #AA771C)` | Preloader brand text |
| Menu Item Accents | `#C8956C`, `#D4A574`, `#B07D9E`, `#8B7355` | Per-item glow colors |
| Lime Gradient Text | `linear-gradient(135deg, #7CFC00 0%, #ADFF2F 50%, #7CFC00 100%)` | Turf lime text |

#### Neutral Grays (Hard-coded)

| Value | Usage |
|-------|-------|
| `#FAFAF7` | Review card bg (default) |
| `#F0EDE6` | Review card bg (expanded gradient end) |
| `neutral-200` | Rating bar bg |
| `neutral-300` | Empty star color |
| `neutral-400` | Subtitle/meta text color |
| `neutral-500` | Body text secondary |
| `neutral-900` | Background watermark text |

---

### 1.2 Typography

#### Font Families

| Token | Stack | Source |
|-------|-------|--------|
| `font-sans` | `Satoshi, Inter, Neue Haas Grotesk, Helvetica Neue, Arial, sans-serif` | Fontshare CDN |
| `font-inter` | `Inter, sans-serif` | Google Fonts CDN |
| `font-oswald` | `Oswald, sans-serif` | Google Fonts CDN |

#### Font Weights Used

| Weight | Tailwind Class | Usage |
|--------|---------------|-------|
| 400 | `font-normal` | Body text, descriptions |
| 500 | `font-medium` | Labels, meta text, nav links, CTA text |
| 600 | `font-semibold` | Navbar brand, handles |
| 700 | `font-bold` | Headings, stats, prices, buttons |
| 900 | — | Not used in components (loaded in CSS) |

#### Type Scale (Exact Sizes Used)

| Size | Tailwind / CSS | Usage |
|------|---------------|-------|
| 9px | `text-[9px]` | Scroll indicator, review tags |
| 10px | `text-[10px]` | Event status badges, stat labels, footer sub-text |
| 11px | `text-[11px]` | Section labels, category tags, footer copyright |
| 12px | `text-[12px]` | Section indicators, gallery metadata, event RSVP |
| 13px | `text-[13px]` | Nav links, CTA buttons, form labels |
| 14px | `text-[14px]` | Footer links, review author names, review body CTA |
| 15px | `text-[15px]` | Nav items, body text, menu descriptions |
| 16px | `text-[16px]` | Body paragraphs, form inputs |
| 18px | `text-[18px]` | Body text (md), philosophy story |
| 20px | `text-[20px]` | Gallery counters, philosophy statement |
| 22px | `text-[22px]` | Navbar brand (md), event card titles |
| 24px | `text-[24px]` | Gallery card titles, philosophy quote |
| 28px | `text-[28px]` | Event card titles (md), footer brand, stat values |
| 32px | `text-[32px]` | Preloader title, menu name (base), stat values |
| 36px | `text-[36px]` | Menu price |
| 40px | `text-[40px]` | Event date number (md), stat values (md) |
| 42px | `text-[42px]` | Menu price (sm) |
| 48px | `text-[48px]` | Preloader title (md), item counter |
| 64px | `text-[64px]` | Item counter (lg) |

#### Responsive Heading Scale (clamp)

| Usage | CSS Value |
|-------|-----------|
| Events heading | `clamp(40px, 8vw, 88px)` |
| Menu item name | `clamp(32px, 8vw, 68px)` |
| Turf campaign | `clamp(44px, 12vw, 88px)` |
| Gallery heading | `clamp(44px, 12vw, 88px)` |
| Reels heading | `clamp(40px, 10vw, 72px)` |
| Reviews heading | `clamp(40px, 10vw, 88px)` |
| Booking heading | `clamp(40px, 10vw, 72px)` |
| Hero title | `clamp(26px, 5vw, 66px)` |
| Background watermark | `clamp(100px, 20vw, 300px)` |
| Philosophy heading | `clamp(44px, 12vw, 88px)` |

#### Letter Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `tracking-widest` | `0.25em` | — |
| `tracking-luxury` | `0.4em` | — |
| `tracking-extreme` | `0.6em` | Scroll indicator label |
| `tracking-signature` | `0.35em` | — |
| `tracking-[-0.03em]` | `-0.03em` | Large headings |
| `tracking-[0.08em]` | `0.08em` | Nav links, CTA buttons |
| `tracking-[0.1em]` | `0.1em` | Form labels, button text |
| `tracking-[0.12em]` | `0.12em` | Menu CTA |
| `tracking-[0.15em]` | `0.15em` | Footer join button, tags |
| `tracking-[0.2em]` | `0.2em` | Footer headings, stat labels |
| `tracking-[0.24em]` | `0.24em` | Section indicator labels |
| `tracking-[0.25em]` | `0.25em` | Review testimonial label |
| `tracking-[0.28em]` | `0.28em` | Menu category label |
| `tracking-[0.3em]` | `0.3em` | Preloader counter |

---

### 1.3 Spacing Patterns

| Pattern | Value | Usage |
|---------|-------|-------|
| Section padding (y) | `py-24 md:py-32` to `py-32 md:py-48` | Standard section vertical padding |
| Section padding (x) | `px-6 md:px-20` to `px-6 md:px-16 lg:px-24` | Standard section horizontal padding |
| Content max-width | `max-w-7xl` (1280px) | Primary content container |
| Menu max-width | `max-w-[1400px]` | Menu section wider container |
| Grid gap | `gap-6` to `gap-16 md:gap-24` | Between grid columns |
| Card internal padding | `p-6 sm:p-8 md:p-10` | Event cards, review cards |
| Card gap (stacked) | `gap-6 sm:gap-8 md:gap-12` | Between event cards |
| Gallery card gap | `gap-16 md:gap-24` | Between horizontal gallery cards |
| Heading margin-bottom | `mb-8` to `mb-16 md:mb-24` | After section headings |
| Section label margin | `mb-4` to `mb-6` | After label indicators |
| Footer padding | `pt-32 pb-12 px-6 md:px-20` | Footer wrapper |

---

### 1.4 Border Radius Tokens

| Value | Usage |
|-------|-------|
| `rounded-full` | Pill buttons, nav pill, avatars, pagination dots |
| `rounded-[12px]` | Submit button |
| `rounded-[20px]` | Gallery image cards (md) |
| `rounded-[24px]` | Event cards |
| `rounded-[28px]` | Review cards, fullscreen reel |
| `rounded-[32px]` | Booking form panel, philosophy image |
| `rounded-[36px]` | Reels carousel cards (CSS) |
| `rounded-[40px]` | Booking bg image frame |
| `rounded-l-full` / `rounded-r-full` | Split email input + button |

---

### 1.5 Shadow Tokens

| Name | CSS Value | Usage |
|------|-----------|-------|
| `shadow-premium-depth` | Multi-layer: 4px / 20px / 50px / 120px rgba black | Glass panels |
| Nav pill | `0 4px 20px rgba(0,0,0,0.01)` | Navbar center pill |
| Nav scrolled | `0 4px 30px rgba(0,0,0,0.04)` | Navbar on scroll |
| Event card hover | `0 20px 60px rgba(212,175,55,0.15)` | Event card hover state |
| Booking form | `0 30px 60px rgba(0,0,0,0.8)` | Glassmorphic form |
| Gallery cards | `shadow-2xl` (Tailwind default) | Gallery image cards |
| Reels center card | `0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(212,175,55,0.3)` | Active carousel reel |
| Reels side cards | `0 10px 30px rgba(0,0,0,0.3)` | Left/right carousel reels |
| Philosophy image | `0 30px 100px -20px rgba(26,26,26,0.06)` | Interior image card |
| CTA gold hover | `0 0 50px rgba(212,175,55,0.4)` | Gold button hover glow |
| Video frame (phase 2) | `0 30px 80px rgba(0,0,0,0.22), 0 10px 30px rgba(0,0,0,0.14)` | Hero video shrink phase |

---

### 1.6 Animation Tokens

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Preloader exit | 1.2s | `[0.76, 0, 0.24, 1]` | Slide-up exit |
| Preloader counter | 2.4s | Linear 24ms steps | 0→100 counter |
| Scroll indicator | 2.2s | `[0.16, 1, 0.3, 1]` infinite | Vertical line pulse |
| MagneticButton enter | 0.4s | `power3.out` | Toward cursor |
| MagneticButton leave | 0.7s | `elastic.out(1, 0.4)` | Spring return |
| Section color morph | 0.8s | `power2.inOut` | Background transitions |
| Float animations | 20s / 24s / 28s | ease-in-out infinite | Glass panel drift |
| Dust particles | 18s / 23s / 20s | ease-in-out infinite | Ambient dust |
| Gold shimmer | 6s | ease-in-out infinite | Gold text shimmer |
| Light sweep | 10s | `[0.25, 1, 0.5, 1]` infinite | Cinematic light beam |
| Logo shimmer | 20s | ease-in-out infinite | Brand text shimmer |
| Gold pulse | 4s | ease-in-out infinite | Gold glow pulse |
| Reels carousel transition | 0.4s | `[0.25, 1, 0.5, 1]` | Card position switch |
| Review card layout | spring stiffness=300 damping=30 | Spring | Card expand/collapse |
| GSAP entrance | 0.8s–1.4s | `power3.out` / `power4.out` | Scroll-triggered reveals |
| Wipe-up clip | 1.4s | `power3.inOut` | Section entrance clip-path |
| Sig float | 7s | ease-in-out infinite | Menu item floating |

---

## 2. Per-Page Section Breakdown

### Page 1: Home (`/`)

---

#### S0: Preloader (Fullscreen Overlay)

```
┌──────────────────────────────────────────────────────────────────┐
│                     BG: radial-gradient(#0a0a0a → #050505)      │
│                                                                  │
│                                                                  │
│                     ┌───────────────────┐                        │
│                     │   R SPORTS         │ font-sans 32px/48px   │
│                     │   gold gradient    │ tracking-[0.3em]      │
│                     └───────────────────┘                        │
│                     Taste & Play          font-inter 10px/12px   │
│                                           tracking-[0.4em]       │
│                     ┌─ loading bar ─────┐ w-48 h-[1px]          │
│                     │  gold sweep →→→   │                        │
│                     └───────────────────┘                        │
│                           47%             font-inter 11px gold   │
│                                                                  │
│                     z-index: 99999                               │
└──────────────────────────────────────────────────────────────────┘
```

---

#### S0: Navbar (Fixed, z-50)

```
Desktop (≥md):
┌──────────────────────────────────────────────────────────────────┐
│  [R] R SPORTS & CAFE    [HOME EVENTS MENU TURF GALLERY ...]    [BOOK NOW] │
│  px-4→12 py-6→8         Glass pill: bg rgba(255,255,255,0.45)   rounded-full │
│                          backdrop-blur(18px)                      │
│                          border: 1px solid rgba(17,17,17,0.12)   │
└──────────────────────────────────────────────────────────────────┘

Mobile (<md):
┌──────────────────────────────────────────────────────────────────┐
│  [R] R SPORTS            [BOOK NOW hidden<sm]  [☰ hamburger]     │
└──────────────────────────────────────────────────────────────────┘
  → Hamburger opens fullscreen overlay (z-55) with staggered menu items
    bg-sandalBg, text-[32px] bold, active item = gold #D4AF37
```

---

#### S1: ScrollVideoHero (`#hero-section`) — h-[600dvh] pinned

```
Pinned viewport (100dvh):
┌──────────────────────────────────────────────────────────────────┐
│                   BG: #F7F3EC                                    │
│                                                                  │
│         ┌─ Dust particles (22 dots, parallax mouse) ─┐          │
│         │                                             │          │
│         │   ┌── Canvas (903 frames) ──────────┐      │          │
│         │   │   1920×1080 backing              │      │          │
│         │   │   Scrubs 0→65% of section        │      │          │
│         │   │   Shrinks to 75vw×45vh (md)      │      │          │
│         │   │   or 90vw×55dvh (mobile)         │      │          │
│         │   │   border-radius: 28px/20px       │      │          │
│         │   └──────────────────────────────────┘      │          │
│         │                                             │          │
│         │   ┌── Architectural mural (phase 3) ──┐    │          │
│         │   │   opacity: 0→0.5 at 78% scroll    │    │          │
│         │   └───────────────────────────────────┘    │          │
│         │                                             │          │
│         │         R SPORTS & CAFE  (title chars)      │          │
│         │         clamp(26px,5vw,66px) semibold       │          │
│         │         letter-by-letter 3D forge animation  │          │
│         │         THOOTHUKUDI • EST. 2026 (10px)      │          │
│         │         PLAY • RELAX • DINE (11px)          │          │
│         │                                             │          │
│         │         [SCROLL] indicator (bottom center)  │          │
│         └─────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────────┘
```

---

#### S2: Events (`#events`) — min-h-screen, bg-[#050505]

```
┌──────────────────────────────────────────────────────────────────┐
│  BG: #050505  |  Gold ambient blurs (50vw/40vw circles)         │
│                                                                  │
│  ┌─ Left 5/12 ──────────────┐  ┌─ Right 7/12 ────────────────┐ │
│  │ p-8→20, border-r         │  │ p-8→20                       │ │
│  │                          │  │                               │ │
│  │ ── gold line ──          │  │ ┌── Event Card 01 ─────────┐ │ │
│  │ THE VELVET ROPE          │  │ │ rounded-[24px]            │ │ │
│  │ 12px tracking-[0.24em]   │  │ │ border white/10           │ │ │
│  │                          │  │ │ bg white/5 backdrop-blur   │ │ │
│  │ ┌─ sticky top-1/3 ──┐   │  │ │                           │ │ │
│  │ │ Upcoming           │   │  │ │ [24] OCT  |  VIP CHAMP...│ │ │
│  │ │ Exclusive.         │   │  │ │ gold dot  LIMITED AVAIL  │ │ │
│  │ │ 8vw/88px bold      │   │  │ │ desc text 15px           │ │ │
│  │ │ gold gradient       │   │  │ │          [RSVP circle →]│ │ │
│  │ │                    │   │  │ └───────────────────────────┘ │ │
│  │ │ Desc 16px/18px     │   │  │                               │ │
│  │ │ white/50           │   │  │ ┌── Event Card 02 ─────────┐ │ │
│  │ │                    │   │  │ │ (same structure)          │ │ │
│  │ │ [→ View Calendar]  │   │  │ └───────────────────────────┘ │ │
│  │ └────────────────────┘   │  │                               │ │
│  │                          │  │ ┌── Event Card 03 ─────────┐ │ │
│  │                          │  │ │ (same structure)          │ │ │
│  └──────────────────────────┘  │ └───────────────────────────┘ │ │
│                                 └───────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

#### S3: Menu (`#menu`) — min-h-screen, bg-black

```
max-w-[1400px] 3-column flex (lg)
┌──────────────────────────────────────────────────────────────────┐
│  BG: black  |  "SIGNATURE" watermark 14vw opacity-1.5%         │
│  Radial accent glow behind product (per-item color)             │
│                                                                  │
│  ┌─ Left 38% ─────┐  ┌─ Center 38% ──┐  ┌─ Right 24% ────┐   │
│  │                 │  │                │  │                 │   │
│  │ SIGNATURE BURGER│  │   ┌────────┐   │  │ Signature Coll. │   │
│  │ 11px accent     │  │   │        │   │  │ Season — 2026   │   │
│  │                 │  │   │ video  │   │  │ 11px muted      │   │
│  │ THE ROYAL SMASH │  │   │ float  │   │  │                 │   │
│  │ clamp(32,8vw,68)│  │   │ anim   │   │  │ ● ━━ ● ●       │   │
│  │ bold uppercase   │  │   │        │   │  │ pagination dots │   │
│  │                 │  │   └────────┘   │  │                 │   │
│  │ Desc 15px/16px  │  │                │  │     01          │   │
│  │ lightText/55    │  │ [◁]       [▷]  │  │  64px counter   │   │
│  │                 │  │  56px circle   │  │  opacity-6%     │   │
│  │ ₹349   incl tax │  │  glass btns    │  │                 │   │
│  │ 36px/42px bold  │  │                │  │                 │   │
│  │                 │  │ Ring pulse     │  │ [Order Now]     │   │
│  │ ── line ──      │  │ behind image   │  │ lg:hidden       │   │
│  │ [Explore Menu →]│  │                │  │                 │   │
│  └─────────────────┘  └────────────────┘  └─────────────────┘   │
│                                                                  │
│  Mobile: stacks column, image first, text center-aligned         │
└──────────────────────────────────────────────────────────────────┘
```

---

#### S4: Turf Campaign (`#turf`) — min-h-[100dvh], video bg

```
┌──────────────────────────────────────────────────────────────────┐
│  BG: Cinematic video (turf.mp4) fullscreen                      │
│  Overlays: gradient-to-b black/40→transparent→black/50          │
│            gradient-to-r black/20→transparent→black/20           │
│                                                                  │
│              max-w-5xl centered                                  │
│                                                                  │
│      R SPORTS FIELD DEPT. // HIGH-END CAMPAIGN                   │
│      12px inter medium tracking-[0.24em] white/60                │
│                                                                  │
│                  PLAY                                            │
│                WITHOUT                                           │
│                 LIMITS                                            │
│      clamp(44px,12vw,88px) bold, split-letter GSAP reveal        │
│      "WITHOUT" = white/60                                        │
│                                                                  │
│              [TURF BOOKING →]                                    │
│              rounded-full border-white, 13px/15px                │
│              href="/turf" (navigates to TurfPage)                │
│                                                                  │
│  ── bottom bar (md:flex) ──                                      │
│  FACILITY // INDOOR HYBRID CONCRETE    LAT 48.8566 // LONG...   │
│  12px inter white/60                                             │
└──────────────────────────────────────────────────────────────────┘
```

---

#### S5: Gallery (`#gallery`) — h-[100dvh] pinned, bg-sandalBg

```
Horizontal scroll: pinned viewport, track translates -X
┌──────────────────────────────────────────────────────────────────┐
│  BG: #F7F3EC                                                    │
│  Top-left: "ARCHIVE // HORIZONTAL PAN SEQUENCE" 12px            │
│  Bottom-right: "SCROLL TO SCRUB • SCALE 1:1.2" 12px            │
│                                                                  │
│  ┌─ Sticky Left Text ─────────────────────────────────────┐     │
│  │ pl-8/32, w-[95vw] md:w-[55vw]                         │     │
│  │ bg-gradient-to-r from-sandalBg → transparent           │     │
│  │                                                         │     │
│  │ ── gold line ── VISUAL INDEX                           │     │
│  │ Taste &                                                │     │
│  │ Play.     clamp(44px,12vw,88px) bold                   │     │
│  │ Description 16px/18px darkText/70                      │     │
│  │ ── thin line ──                                         │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌─ Scrolling Track ──────────────────────────────────────────┐  │
│  │ [Spacer 80vw/32vw]                                        │  │
│  │                                                            │  │
│  │ ┌─ Card ────────┐  ┌─ Card ────────┐  ┌─ Card ───────┐  │  │
│  │ │ MEMBER ARCHIVE │  │ MEMBER ARCHIVE │  │ MEMBER ARC.. │  │  │
│  │ │ // 01          │  │ // 02          │  │ // 03        │  │  │
│  │ │ w-[85vw]       │  │ w-[48vw] md    │  │              │  │  │
│  │ │ aspect-[16/10] │  │ aspect-[16/10] │  │              │  │  │
│  │ │ rounded-[20px] │  │ rounded-[20px] │  │              │  │  │
│  │ │ [image]        │  │ [image]        │  │ [image]      │  │  │
│  │ │                │  │                │  │              │  │  │
│  │ │ GASTRONOMY     │  │ PERFORMANCE    │  │ ATMOSPHERE   │  │  │
│  │ │ Sensory Elev.  │  │ Elite Facil.   │  │ The Sanctu.  │  │  │
│  │ └────────────────┘  └────────────────┘  └──────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
Total gallery items: 5 cards
```

---

#### S6: Reels (`#reels`) — bg gradient sandalBg variants

```
┌──────────────────────────────────────────────────────────────────┐
│  BG: gradient(#F7F3EC → #F0EDE6 → #F7F3EC)                     │
│  py-28 md:py-40 px-6 md:px-20                                   │
│                                                                  │
│  ┌─ Header max-w-7xl ──────────────────────────────────────┐    │
│  │ ── gold line ── REELS • HIGHLIGHTS                      │    │
│  │ Behind             Description 15px                      │    │
│  │ The Scenes.        max-w-[360px]                         │    │
│  │ clamp(40px,10vw,72px)                                    │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ 3D Carousel (perspective: 1200px) ──────────────────────┐   │
│  │ h-600px                                                   │   │
│  │                                                           │   │
│  │   [◁]                                              [▷]   │   │
│  │          ┌──────┐  ┌────────┐  ┌──────┐                  │   │
│  │          │ left │  │ center │  │ right│                  │   │
│  │          │ -12° │  │  1.05x │  │ +12° │                  │   │
│  │          │ 0.88x│  │  z:10  │  │ 0.88x│                  │   │
│  │          │ blur │  │ glow   │  │ blur │                  │   │
│  │          │ 3px  │  │ 0px    │  │ 3px  │                  │   │
│  │          └──────┘  └────────┘  └──────┘                  │   │
│  │                                                           │   │
│  │ Card dimensions: 260px (base) / 290px (md)               │   │
│  │ Aspect ratio: 9:16, border-radius: 36px                  │   │
│  │ White border: 6px (base) / 8px (md)                      │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Fullscreen modal: z-[99999], 85vw max-w-[400px] 9:16          │
│  rounded-[28px], drag-x navigation                              │
└──────────────────────────────────────────────────────────────────┘
Total reels: 5 video cards
```

---

#### S7: Reviews (`#reviews`) — bg #F7F3EC

```
┌──────────────────────────────────────────────────────────────────┐
│  BG: #F7F3EC  |  "REVIEWS" watermark clamp(100px,20vw,300px)   │
│  py-32 md:py-48 px-6 md:px-20                                   │
│                                                                  │
│  ┌─ max-w-7xl ─────────────────────────────────────────────┐    │
│  │ grid 12-col                                              │    │
│  │                                                          │    │
│  │ ┌─ Left 7/12 ──────────┐  ┌─ Right 5/12 ────────────┐  │    │
│  │ │ TESTIMONIALS • VERIFY │  │ ┌ 4.9 ┐ ┌ 500+┐ ┌ 98% ┐│  │    │
│  │ │ WHAT THEY SAY         │  │ │RATING│ │REVWS│ │RETRN││  │    │
│  │ │ clamp(40px,10vw,88px) │  │ └──────┘ └─────┘ └─────┘│  │    │
│  │ │ 3D word reveal        │  │                          │  │    │
│  │ │                      │  │ ★★★★★ Google Reviews     │  │    │
│  │ │ Description 16px/18px │  │ ── gradient bar 98% ──  │  │    │
│  │ └──────────────────────┘  └──────────────────────────┘  │    │
│  │                                                          │    │
│  │ ┌─ Cards Grid: 1→2→3 cols ────────────────────────────┐ │    │
│  │ │ ┌─ ReviewCard ──┐ ┌─ ReviewCard ──┐ ┌─ ReviewCard─┐│ │    │
│  │ │ │ rounded-[28px]│ │ [CAFE]  MAY  │ │              ││ │    │
│  │ │ │ p-6/8/10     │ │ ❝ quote icon │ │              ││ │    │
│  │ │ │ [TURF] JUN   │ │ "Review..."  │ │              ││ │    │
│  │ │ │ ❝ quote icon │ │ ★★★★★        │ │              ││ │    │
│  │ │ │ "Review..."  │ │ [AV] Name    │ │              ││ │    │
│  │ │ │ ★★★★★        │ │    Role      │ │              ││ │    │
│  │ │ │ [AV] Name    │ └──────────────┘ └──────────────┘│ │    │
│  │ │ │    Role      │                                   │ │    │
│  │ │ └──────────────┘  + 2 more cards                   │ │    │
│  │ └────────────────────────────────────────────────────┘ │    │
│  │                                                          │    │
│  │        JOIN 500+ HAPPY MEMBERS                          │    │
│  │        [BECOME A MEMBER →]  gold gradient button         │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
Total reviews: 5 cards (expandable on click)
```

---

#### S8: Booking (`#booking`) — min-h-[90vh], bg-[#0A0A0A]

```
┌──────────────────────────────────────────────────────────────────┐
│  BG: #0A0A0A + bg image (brightness 0.35, sepia 0.1)           │
│  Gradient overlays: to-t + to-r from #0A0A0A                    │
│  py-24 md:py-32 px-6 md:px-16                                   │
│                                                                  │
│  ┌─ max-w-7xl flex lg:row ─────────────────────────────────┐    │
│  │                                                          │    │
│  │ ┌─ Left 1/2 ──────────┐  ┌─ Right 1/2 ────────────────┐│    │
│  │ │ RESERVATIONS         │  │ bg-black/40 backdrop-blur   ││    │
│  │ │ 12px gold            │  │ border white/10             ││    │
│  │ │                     │  │ border-l-[#D4AF37]/30 2px   ││    │
│  │ │ Secure               │  │ rounded-[32px] p-8/12       ││    │
│  │ │ Your Spot.           │  │                             ││    │
│  │ │ clamp(40,10vw,72)   │  │ ┌─ Form ──────────────────┐││    │
│  │ │                     │  │ │ FULL NAME    ___________│││    │
│  │ │ Description 16/18px │  │ │ EMAIL        ___________│││    │
│  │ │ white/60            │  │ │ SERVICE      [dropdown] │││    │
│  │ │                     │  │ │ DATE │ TIME  _____|_____│││    │
│  │ │ ── gold line ──     │  │ │                         │││    │
│  │ │ Priority Access      │  │ │ [══ SUBMIT REQUEST ══→]│││    │
│  │ │                     │  │ │ gold gradient 135°      │││    │
│  │ │ 500+ │ 4 │ 24/7     │  │ │ rounded-[12px]          │││    │
│  │ │ Members Venues       │  │ └─────────────────────────┘││    │
│  │ └──────────────────────┘  └─────────────────────────────┘│    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Form submit → success state: checkmark + "Request Received."   │
│  Auto-resets after 4 seconds                                     │
└──────────────────────────────────────────────────────────────────┘
```

---

#### S9: Footer — bg-[#050505]

```
┌──────────────────────────────────────────────────────────────────┐
│  BG: #050505  |  border-t-2 border-[#D4AF37]/20                │
│  pt-32 pb-12 px-6 md:px-20                                      │
│  "R SPORTS" watermark 15vw opacity-6%                            │
│                                                                  │
│  ┌─ max-w-7xl grid 12-col ─────────────────────────────────┐    │
│  │                                                          │    │
│  │ ┌─ 5/12 ──────────┐┌─ 3/12 ──┐┌─ 2/12 ──┐┌─ 2/12 ──┐ │    │
│  │ │ [R] R SPORTS &   ││ LOCATIONS ││ SOCIAL   ││ LEGAL    │ │    │
│  │ │ CAFE             ││ Paris    ││ Instagram││ Privacy  │ │    │
│  │ │ 28px bold        ││ Tokyo    ││ Twitter  ││ Terms    │ │    │
│  │ │                  ││ New York ││ LinkedIn ││          │ │    │
│  │ │ Description 16px ││ 14px    ││ 14px    ││ 14px    │ │    │
│  │ │ white/50         ││ white/70 ││ white/70 ││ white/70 │ │    │
│  │ │                  ││          ││          ││          │ │    │
│  │ │ [email input]    ││          ││          ││          │ │    │
│  │ │ [Join] button    ││          ││          ││          │ │    │
│  │ └──────────────────┘└──────────┘└──────────┘└──────────┘ │    │
│  │                                                          │    │
│  │ ── border-t white/10 ──                                  │    │
│  │ © 2026 R SPORTS    [↑ Back to top]    ● Systems Online   │    │
│  │ 11px white/40       11px white/40      green pulse dot    │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

### Page 2: Turf (`/turf`)

| Section | Component | Key Layout | Bg Color |
|---------|-----------|------------|----------|
| Navbar | TurfNavbar | Fixed sticky, dark glass, lime accents | transparent |
| S1 Hero | TurfVideoHero | Scroll-controlled frames, "PLAY BEYOND LIMITS" type | `#070707` |
| S2 Intro | TurfIntro | Editorial 2-col, stats grid | `#070707` → forest gradient |
| S3 Schedule | TurfSchedule | Scoreboard-style slot picker, date/time grid | `#070707` |
| S4 Sports | TurfSports | 4 sport cards (Football, Cricket, Badminton, Fitness) | forest gradient |
| S5 Features | TurfFeatures | Feature cards grid, lime glow effects | `#070707` |
| S6 Match | TurfMatchExperience | Immersive stats display, ambient particles | `#070707` |
| S7 CTA | TurfCTA | Full-width CTA, gold/lime gradients | `#070707` |
| S8 Footer | TurfFooter | 4-col dark footer, similar structure to home footer | `#050505` |

**Turf page color scheme:** Entirely dark (`#070707`) with `#7CFC00` lime and `#D4AF37` gold accents.  
**Typography:** Same `font-sans` (Satoshi) + `font-inter` + `font-oswald` for scoreboard numbers.

---

## 3. Glassmorphism Specifications

| Context | Background | Backdrop Blur | Border |
|---------|------------|---------------|--------|
| Navbar pill | `rgba(255,255,255,0.45)` | `blur(18px)` | `1px solid rgba(17,17,17,0.12)` |
| Event card | `rgba(255,255,255,0.05)` | `backdrop-blur-md` | `1px solid rgba(255,255,255,0.1)` |
| Menu nav buttons | `rgba(255,255,255,0.55)` | `blur(18px)` | `1.5px solid rgba(245,245,240,0.15)` |
| Booking form | `rgba(0,0,0,0.4)` | `blur(48px)` (2xl) | `1px solid rgba(255,255,255,0.1)` + left accent |
| Reel tag badges | `rgba(0,0,0,0.35)` | `blur(8px)` | none |
| Reel controls | `rgba(0,0,0,0.35)` / `(255,255,255,0.15)` | `blur(8px)` / `blur(10px)` | none |
| Mobile menu | `bg-sandalBg` | `blur(72px)` (3xl) | none |
| Turf glass | `rgba(14,29,19,0.4)` | `blur(16px)` | `1px solid rgba(124,252,0,0.06)` |

---

## 4. Responsive Breakpoints

| Breakpoint | Tailwind Prefix | Key Changes |
|------------|----------------|-------------|
| < 640px | default | Single column, smaller type, hamburger menu |
| ≥ 640px | `sm:` | Multi-column event cards, larger CTA buttons |
| ≥ 768px | `md:` | Desktop navbar visible, 2-col layouts, larger padding |
| ≥ 1024px | `lg:` | Full 3-col menu layout, 3-col review grid, 12-col footer grid |

---

> [!TIP]
> To recreate in Figma: set up a 1440px desktop frame and 375px mobile frame. Use the exact color tokens above as Figma styles, the clamp sizes as responsive variants, and the ASCII layouts as section wireframes.
