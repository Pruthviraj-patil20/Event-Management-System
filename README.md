# ✦ EventSphere — Premium Event Management System

> **Plan. Discover. Experience.**
> An enterprise-grade, full-stack event discovery, SaaS management, and cryptographic QR ticketing platform built with modern web standards, Node.js, Express, MongoDB, and Chart.js.

---

## 🌟 Key Highlights & Features

### 🎟️ Attendee Experience
- **Smart Discovery**: Real-time keyword search, multi-category filtering, location and price range filters.
- **Dynamic QR Passes**: Instant cryptographic QR code generation for digital tickets.
- **Ticket Wallet**: Access, view, print, and download digital tickets anytime.
- **Interactive Reviews**: Post ratings and attendee feedback with real-time score aggregation.
- **Favorites & Bookmarking**: Save events for later with personalized feeds.

### ⚡ Organizer Command Center
- **Executive SaaS Dashboard**: Live KPI metrics (Active Events, Tickets Sold, Attendance, Gross Revenue).
- **Chart.js Analytics**: Monthly revenue trends, sales velocity by ticket tier (Standard, VIP, Premium).
- **Event Lifecycle Management**: Create, edit, publish, or draft events with multi-tier ticket pricing.
- **Attendee Roster & CSV Export**: Searchable attendee directory with live QR check-in status and single-click CSV export.

### 🛡️ System Administration & Moderation
- **Moderation Queue**: One-click approve or reject event submissions with structured feedback.
- **Global Directory**: Manage user roles (Admin, Organizer, Attendee), toggle verification, and purge records.
- **Financial Ledger**: Inspect processed platform transactions, gateway references, and GMV volume.
- **Platform Health Monitoring**: System uptime and database status telemetry.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System with CSS variables), Vanilla JavaScript ES6+ (Modular architecture, No bulky frameworks).
- **Backend**: Node.js, Express.js REST API.
- **Database**: MongoDB with Mongoose ODM (Zero-config automatic failover to `mongodb-memory-server` if local MongoDB is not running).
- **Security**: JWT authentication, bcrypt password hashing, Helmet, CORS, Rate Limiting.
- **Data Visualizations**: Chart.js.
- **Ticketing & QR Engine**: `qrcode` base64 cryptographic generator.

---

## 🔑 Demo Accounts

The database comes pre-seeded with 3 fully configured demo accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Admin123!` | Global Admin Command Center & Moderation |
| **Organizer** | `organizer@example.com` | `Organizer123!` | Host Dashboard, Create Events, Analytics, Attendees |
| **Attendee** | `attendee@example.com` | `Attendee123!` | Browse, Book Passes, Ticket Wallet, Reviews |

---

## 🚀 Quick Start & Installation

### 1. Clone & Install Dependencies
```bash
# Clone repository
git clone https://github.com/your-username/eventsphere.git
cd eventsphere

# Install dependencies
npm install
```

### 2. Configure Environment Variables
A default `.env` file is already provided. You can inspect `.env.example` to customize settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/eventsphere
JWT_SECRET=eventsphere_super_secret_jwt_key_2026
```

### 3. Seed Realistic Database Data
Populate 12+ realistic events, venues, bookings, tickets with QR codes, and notifications:
```bash
npm run seed
```

### 4. Start Server
```bash
npm start
```
Open your browser and navigate to:
```
http://localhost:5000
```

---

## 📁 Modular Project Structure

```
event-management-system/
├── backend/
│   ├── app.js
│   ├── server.js
│   ├── config/ (constants, database, environment)
│   ├── controllers/ (auth, event, ticket, user, venue, payment, attendee, notification, analytics)
│   ├── middleware/ (auth, role, error, validation, upload)
│   ├── models/ (User, Event, Venue, Ticket, Registration, Payment, Notification, Review)
│   ├── routes/ (auth, event, ticket, user, venue, payment, attendee, notification, analytics)
│   ├── services/ (ticket, email, notification)
│   ├── utils/ (generateQRCode, generateTicket, generateToken, logger)
│   └── validators/
├── database/
│   └── seed.js
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DATABASE.md
├── frontend/
│   ├── index.html
│   ├── events.html
│   ├── event-details.html
│   ├── about.html
│   ├── contact.html
│   ├── admin/ (admin-dashboard, users, events, venues, payments, reports, settings)
│   ├── auth/ (login, register, forgot-password, reset-password)
│   ├── dashboard/ (dashboard, my-events, create-event, edit-event, attendees, tickets, analytics, notifications, settings)
│   ├── css/ (variables, reset, global, navbar, footer, hero, events, event-details, dashboard, forms, tables, modal, notifications, responsive, themes, animations)
│   └── js/ (main, api, auth, events, event-details, dashboard, admin, tickets, analytics, notifications, theme, components, utils)
├── .env.example
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
# Event-Management-System
