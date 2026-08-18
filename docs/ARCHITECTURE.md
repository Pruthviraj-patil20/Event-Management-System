# EventSphere Architecture Document

EventSphere is architected following separation of concerns, modular client layers, and resilient backend design patterns.

---

## Architectural Data Flow

```
+-------------------------------------------------------------+
|                     FRONTEND CLIENT                         |
|  Multi-Page HTML5  |  Modular CSS3  |  Vanilla ES6+ Modules |
+-------------------------------------------------------------+
                              |  HTTP / JSON (REST + JWT)
                              v
+-------------------------------------------------------------+
|                   EXPRESS APPLICATION LAYER                 |
|  Helmet Security  |  CORS  |  Rate Limiting  |  Morgan Logs |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                      ROUTING & MIDDLEWARE                   |
|  authMiddleware   |  roleMiddleware  | validationMiddleware |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                     CONTROLLER LAYER                        |
|  authController  |  eventController  |  ticketController    |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                      SERVICE LAYER                          |
|  ticketService   |  emailService    |  notificationService  |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                     DATABASE LAYER                          |
|  Mongoose ODM (MongoDB Atlas / In-Memory Failover Fallback) |
+-------------------------------------------------------------+
```

---

## Design System Tokens
- **Font Stack**: `Plus Jakarta Sans` (editorial headings) & `Inter` (high legibility body text).
- **Color Identity**: Deep Midnight (`#0B0F19`), Electric Indigo (`#6366F1`), Violet (`#8B5CF6`), and Emerald (`#10B981`).
- **Responsive Layout**: Fluid breakpoints spanning 390px, 576px, 768px, 992px, 1200px, 1440px.
- **Theme Persistence**: Instant light/dark switching persisted in `localStorage`.
