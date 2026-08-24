# ✦ EventSphere — Premium Event Discovery & Ticketing Platform

> **The Next Generation Event Experience.** Built with Apple-level cleanliness, Linear-style SaaS UI polish, and Stripe-grade typography & spacing.

---

## 🌟 Overview

**EventSphere** is a modern, production-grade event discovery and digital ticketing web platform built exclusively with **HTML5, CSS3, and Vanilla JavaScript (ES6+)**. It is engineered without heavy frameworks to deliver sub-second performance, fluid micro-interactions, responsive design across all devices, and an ultra-clean user experience.

---

## 📂 Project Architecture

```
eventsphere/
│
├── index.html               # Elevates homepage with hero, floating preview cards, search & categories
├── explore.html             # Full-featured event discovery catalog with live multi-criteria sidebar & sorting
├── event-details.html       # Rich event detail page with dynamic ID loading, schedule timeline & ticket booking
├── about.html               # Mission, origin story, interactive value pillars & animated stat counters
├── contact.html             # Support channels, inquiry form with real-time validation & interactive FAQ
│
├── css/
│   ├── style.css            # Complete design system tokens, typography, glassmorphism, components & layouts
│   ├── responsive.css       # Mobile-first & fluid breakpoint rules (375px, 480px, 768px, 1024px, 1200px, 1440px)
│   └── animations.css       # Micro-interactions, ambient mesh floaters, skeleton loaders & keyframe animations
│
├── js/
│   ├── events.js            # 12+ realistic curated Indian/Global tech, music, startup events dataset + card builder
│   ├── filters.js           # Real-time multi-criteria filtering (search, state/city cascade, category, price, wishlist)
│   ├── ui.js                # Modals, quick-view popup, booking checkout flow with instant QR ticket simulation, toasts
│   └── main.js              # Global initialization, sticky frosted glass navbar, dark/light mode toggle, bookmarks
│
├── assets/
│   ├── icons/               # Category & utility iconography
│   ├── logos/               # EventSphere gradient spark logo SVG
│   └── images/              # High-resolution event visual assets
│
└── README.md                # Project documentation and developer guide
```

---

## 🎨 Visual Design System

- **Color Palettes**:
  - **Light Mode**: Pure White (`#ffffff`), Soft Slate (`#f8fafc`, `#f1f5f9`), Deep Navy Typography (`#0a0d14`), Electric Blue (`#2563eb`), Indigo (`#6366f1`), Purple Gradient (`#8b5cf6`), Pink Accent (`#ec4899`).
  - **Dark Mode**: OLED Obsidian (`#08090d`), Dark Slate Cards (`#10131e`), Luminous Glass Borders (`rgba(255,255,255,0.08)`), Ambient Neon Mesh Glow.
- **Glassmorphism**: Layered backdrop blurs (`backdrop-filter: blur(20px)`), frosted specular edges, and soft multi-layered drop shadows.
- **Typography**: Google Fonts `Plus Jakarta Sans` (headings) and `Inter` (body).

---

## 🚀 Key Functional Features

1. **Sticky Glass Navbar**:
   - Transparent at page top, smoothly transitions to blurred frosted glass on scroll.
   - Light/Dark mode switcher persisted in `localStorage`.
   - Live bookmark counter badge.
   - User profile dropdown and slide-in mobile hamburger drawer.

2. **Advanced Hero & Floating Cards**:
   - Radiant ambient gradient glow.
   - 3 floating live preview event cards (Music Festival, AI Summit, Startup Meetup) with subtle keyframe physics.
   - Advanced floating glass search bar with Keyword input, Indian State/UT dropdown, cascading City selector, Date picker, and Category selector.

3. **Multi-Criteria Filter Engine (`filters.js`)**:
   - Instant real-time filtering without page reloads.
   - Keyword search across titles, descriptions, and venues.
   - Cascading Indian States to Cities (Mumbai, Pune, Bengaluru, New Delhi, Hyderabad, Goa, Chennai, Jaipur, etc.).
   - Price range slider with live currency formatting (`₹0 – ₹5,000`).
   - Free vs. Paid pass toggles.
   - Saved wishlist filter mode.
   - Multi-way sorting (Upcoming date, Price low-to-high, Price high-to-low).

4. **Interactive Modals & Digital Ticketing (`ui.js`)**:
   - **Quick View Modal**: Instant snapshot of any event without leaving the current catalog.
   - **Interactive Booking Flow**: Select pass tiers (General, VIP Lounge, All-Access), choose quantities with real-time price calculation, and instantly generate a cryptographically styled digital QR pass with print options.
   - Accessible dismissal via Close button, Backdrop click, or <kbd>ESC</kbd> key.

5. **Saved Events Wishlist**:
   - 1-click heart bookmarking on any event card with pop micro-animation.
   - Saved items persist across sessions via `localStorage`.

6. **Animated Statistics**:
   - IntersectionObserver animated count-up numbers on the About page (`10,000+ Events`, `500,000+ Attendees`, `120+ Cities`, `98% Satisfaction`).

7. **Validated Contact Form**:
   - Real-time client-side validation with email regex checks and error hints.
   - Toast notification alerts for user actions.

---

## 🛠️ How to Run Locally

Because EventSphere is built with pure standard web technologies, you can open and run it using any static server or directly in modern web browsers:

### Option 1: Using Python Built-in Server
```bash
cd eventsphere
python3 -m http.server 3000
```
Then visit: `http://localhost:3000`

### Option 2: Using Node.js `serve` / `npx`
```bash
npx serve eventsphere
```

---

## 📱 Responsive Testing

Tested and verified across all standard viewports:
- 🖥️ **Desktop**: `1440px` and `1200px` (4-column event grid, floating hero cards, single-line horizontal search bar)
- 💻 **Laptop / Small Desktop**: `1024px` (2-column search layout, 3-column event grid)
- 📱 **Tablet**: `768px` (2-column event grid, stacked search filters, mobile navigation drawer)
- 📱 **Mobile**: `480px` and `375px` (1-column fluid grid, optimized typography, zero horizontal scrolling)

---

## 📄 License
MIT © 2026 EventSphere Technologies Inc.
