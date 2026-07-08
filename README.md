# FixItNow - On-Demand Service Marketplace Backend

FixItNow is a production-ready, highly secure, and scalable on-demand service marketplace backend. It enables customers to find and book professional technicians for various services, allows technicians to manage their availability and bookings, and provides an admin dashboard for full platform oversight.

---

## 🚀 Tech Stack

*   **Runtime:** Node.js (v18+ or v20+)
*   **Framework:** Express.js with TypeScript
*   **Database:** PostgreSQL
*   **ORM:** Prisma ORM
*   **Security:** Helmet, CORS, bcrypt, JSON Web Token (JWT)
*   **Validation:** Zod
*   **Logger:** Morgan

---
# 📂 Project Architecture
The project follows a Modular Architecture for scalability and clean separation of concerns:
```
src/
├── app.ts                  # Express application setup
├── server.ts               # Server listener configuration
├── config/                 # Environment and global configs
├── middleware/             # Global Error Handler, Auth & Role Guard, Validator
├── utils/                  # Helper utilities (e.g., sendEmail)
├── routes/                 # Global API router splitter
└── modules/                # Feature-based modular directories
    ├── auth/               # Register, Login, Token management
    ├── users/              # User management
    ├── technician/         # Profiles, schedules, skills
    ├── category/           # Service categories
    ├── service/            # Core services listing
    ├── booking/            # Booking management logic
    ├── payment/            # Stripe integration and history
    ├── review/             # Feedback and rating system
    └── admin/              # User control and system parameters
```
---
# Security Features Implemented
- Helmet: Secure HTTP headers to prevent common vulnerabilities.

- CORS: Configured cross-origin resource sharing.

- Data Validation: Runtime request schema validation enforced via Zod.

- Password Hashing: Secure cryptography with bcrypt.

- Role-Based Access Control (RBAC): Strict endpoint protection based on authorization roles (Admin, Customer, Technician).

---

