# ✦ EventSphere — Premium Live & Upcoming Event Discovery Platform

> **The Next Generation Event Experience.** Built with Apple-level cleanliness, Linear-style SaaS UI polish, and Stripe-grade typography & spacing.

---

## 🌟 Overview

**EventSphere** is a modern, production-grade event discovery and digital ticketing web platform built exclusively with **HTML5, CSS3, and Vanilla JavaScript (ES6+)**. It is engineered without heavy frameworks to deliver sub-second performance, fluid micro-interactions, responsive design across all devices, and an ultra-clean user experience.

---

## 🔴 Live & Upcoming Events Discovery System

EventSphere features a real-time event discovery engine across India (Pune, Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Kolkata, Ahmedabad, Jaipur, Goa, and more):

1. **Dynamic Real-Time Status Computation**:
   - `🔴 LIVE NOW`: Computed dynamically using `isEventLive(event)` based on `startDateTime` and `endDateTime`. Features an animated pulsing red dot.
   - `⏰ STARTING SOON`: Automatically generates time-remaining countdowns ("Starts in 25 mins", "Starts in 2 hours", "Starts tomorrow", "Starts in 3 days").
   - `ENDED`: Computed when current time passes event end time.

2. **India-Wide Location Filtering**:
   - Location selector with **All India**, **Pune**, **Mumbai**, **Delhi**, **Bengaluru**, **Hyderabad**, **Chennai**, **Kolkata**, **Ahmedabad**, **Jaipur**, **Goa**, **Lucknow**, **Chandigarh**, **Indore**, **Nagpur**, **Surat**, and **Use My Location**.

3. **18 Event Categories**:
   - Technology, AI, Startups, Business, Music, Concerts, Festivals, Sports, Education, Workshops, Conferences, Networking, Design, Comedy, Food, Art & Culture, Movies, Entertainment.

4. **Future-Proof API Architecture**:
   - Clean data access layer via `async function getEvents()` with toggleable `API_CONFIG`:
   ```javascript
   const API_CONFIG = {
     enabled: false,
     baseURL: "https://api.eventsphere.io/v1",
     eventsEndpoint: "/events"
   };
   ```
   - When `enabled: false`, serves 28+ rich mock events. When `enabled: true`, seamlessly switches to real backend endpoints without modifying the UI.

5. **Mobile Bottom Sheet Filter Experience**:
   - Dedicated sliding filter bottom-sheet on mobile devices with search, category, location, date, and price filters.

---

## 📂 Project Architecture

```
eventsphere/
│
├── index.html               # Elevated homepage with Live Now spotlight, floating cards, search & categories
├── explore.html             # Multi-filter event discovery catalog with live tabs, city chips & mobile drawer
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
│   ├── events.js            # 28+ realistic curated Indian/Global events dataset, API layer, & status calculators
│   ├── filters.js           # Real-time multi-criteria filtering (search, city chips, category, date, price, wishlist)
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

## 🛠️ How to Run Locally

Because EventSphere is built with pure standard web technologies, you can open and run it using any static server or directly in modern web browsers:

```bash
cd eventsphere
python3 -m http.server 4321
```
Then visit: `http://localhost:4321`

---

## 📄 License
MIT © 2026 EventSphere Technologies Inc.
