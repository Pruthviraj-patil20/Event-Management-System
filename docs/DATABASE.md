# EventSphere Database Architecture

EventSphere uses **MongoDB** with **Mongoose ODM**. It incorporates automated in-memory server fallback (`mongodb-memory-server`) to ensure instant zero-setup execution while seamlessly connecting to standard MongoDB Atlas or local MongoDB instances.

---

## Entity Relationship Diagram

```
 +----------------+           +-------------------+          +----------------+
 |     User       | 1       * |      Event        | 1      * |     Venue      |
 |----------------|-----------|-------------------|----------|----------------|
 | _id            |           | _id               |          | _id            |
 | name           |           | title, slug       |          | name           |
 | email          |           | category          |          | address, city  |
 | password       |           | organizer (ref)   |          | capacity       |
 | role           |           | venue (ref)       |          | amenities      |
 | favorites []   |           | ticketTypes []    |          +----------------+
 +----------------+           | capacity          |
         |                    | availableSeats    |
         |                    +-------------------+
         | 1                            | 1
         |                              |
         | *                            | *
 +----------------+           +-------------------+
 |  Registration  | 1       * |     Ticket        |
 |----------------|-----------|-------------------|
 | registrationNo |           | ticketNumber      |
 | user (ref)     |           | event (ref)       |
 | event (ref)    |           | user (ref)        |
 | totalAmount    |           | registration (ref)|
 | items []       |           | qrCodeData        |
 | paymentStatus  |           | status            |
 +----------------+           | checkedInAt       |
                              +-------------------+
```

---

## Key Collections & Indexes

1. **User**: Indexed on `email` (unique).
2. **Event**: Text indexes on `title, description, tags`. Compound index on `{ category: 1, date: 1, status: 1 }`.
3. **Venue**: Index on `city`.
4. **Ticket**: Indexed on `ticketNumber` (unique), `event`, `user`, `status`.
5. **Registration**: Indexed on `registrationNumber` (unique), `user`, `event`.
6. **Payment**: Indexed on `transactionId` (unique).
7. **Notification**: Indexed on `recipient`, `isRead`.
8. **Review**: Compound unique index on `{ event: 1, user: 1 }`.
