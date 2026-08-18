# EventSphere REST API Documentation

EventSphere provides a RESTful API with JSON payloads, JWT authentication, and standardized HTTP status codes.

---

## Base URL
```
http://localhost:5000/api
```

---

## Authentication Endpoints

### 1. Register User
`POST /api/auth/register`

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!",
  "phone": "+91 98765 43210",
  "role": "attendee",
  "organizationName": ""
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67b49ef88219...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "attendee",
    "profileImage": "https://..."
  }
}
```

### 2. Login User
`POST /api/auth/login`

**Request Body:**
```json
{
  "email": "attendee@example.com",
  "password": "Attendee123!"
}
```

---

## Events Endpoints

### 1. List & Filter Events
`GET /api/events`

**Query Parameters:**
- `search` (string): Keyword in title or description
- `category` (string): `Technology`, `Music`, `Business`, `Workshop`, `Conference`, `Festival`, `Sports`, `Education`
- `city` (string): Filter by city
- `minPrice` / `maxPrice` (number): Price range
- `sort` (string): `upcoming`, `newest`, `price-asc`, `price-desc`, `popular`
- `page` (number): Default `1`
- `limit` (number): Default `12`

### 2. Get Event by ID
`GET /api/events/:id`

### 3. Create Event (Organizer / Admin)
`POST /api/events` (Protected)

### 4. Moderate Event (Admin)
`PUT /api/events/:id/moderate` (Admin only)
```json
{
  "status": "published",
  "rejectionReason": ""
}
```

---

## Tickets & QR Passes

### 1. Book / Purchase Tickets
`POST /api/tickets/purchase` (Protected)
```json
{
  "eventId": "67b49ef88219...",
  "items": [
    { "ticketType": "VIP", "quantity": 2 }
  ],
  "attendeeInfo": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+91 98765 43210"
  },
  "paymentMethod": "Credit Card"
}
```

### 2. Get My Tickets Wallet
`GET /api/tickets/my` (Protected)

### 3. Check-In Ticket via Scanner
`POST /api/tickets/:id/checkin` (Protected: Organizer / Admin)

---

## Analytics Endpoints

### 1. Organizer Metrics
`GET /api/analytics/overview` (Protected)

### 2. Revenue & Tier Distribution
`GET /api/analytics/revenue` (Protected)

### 3. Admin Platform Metrics
`GET /api/analytics/admin` (Admin only)
