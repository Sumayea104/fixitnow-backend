# FixItNow - On-Demand Service Marketplace Backend

FixItNow is a production-ready, highly secure, and scalable on-demand service marketplace backend. It enables customers to find and book professional technicians for various services, allows technicians to manage their availability and bookings, and provides an admin dashboard for full platform oversight.

---

## 🚀 Tech Stack

* **Runtime:** Node.js (v18+ or v20+)
* **Framework:** Express.js with TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma ORM
* **Security:** Helmet, CORS, bcrypt, JSON Web Token (JWT)
* **Validation:** Zod
* **Logger:** Morgan

---

# 📂 Project Architecture

The project follows a Modular Architecture for scalability and clean separation of concerns:

```
fixitnow-backend/
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   └── prisma.ts
│   ├── constants/
│   │   └── index.ts
│   ├── errors/
│   │   └── AppError.ts
│   ├── interfaces/
│   │   └── index.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── role.ts
│   │   └── validate.ts
│   ├── modules/
│   │   ├── admin/
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.route.ts
│   │   │   ├── admin.service.ts
│   │   │   └── admin.validation.ts
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.route.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.validation.ts
│   │   ├── booking/
│   │   │   ├── booking.constant.ts
│   │   │   ├── booking.controller.ts
│   │   │   ├── booking.interface.ts
│   │   │   ├── booking.route.ts
│   │   │   ├── booking.service.ts
│   │   │   └── booking.validation.ts
│   │   ├── category/
│   │   │   ├── category.controller.ts
│   │   │   ├── category.route.ts
│   │   │   ├── category.service.ts
│   │   │   └── category.validation.ts
│   │   ├── payment/
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.route.ts
│   │   │   ├── payment.service.ts
│   │   │   └── payment.validation.ts
│   │   ├── review/
│   │   │   ├── review.controller.ts
│   │   │   ├── review.route.ts
│   │   │   ├── review.service.ts
│   │   │   └── review.validation.ts
│   │   ├── service/
│   │   │   ├── service.controller.ts
│   │   │   ├── service.route.ts
│   │   │   ├── service.service.ts
│   │   │   └── service.validation.ts
│   │   ├── technician/
│   │   │   ├── technician.controller.ts
│   │   │   ├── technician.route.ts
│   │   │   ├── technician.service.ts
│   │   │   └── technician.validation.ts
│   │   └── user/
│   │       ├── user.controller.ts
│   │       ├── user.route.ts
│   │       ├── user.service.ts
│   │       └── user.validation.ts
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   └── prisma.config.ts
├── .env
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```

---

# Security Features Implemented

* Helmet: Secure HTTP headers to prevent common vulnerabilities.

* CORS: Configured cross-origin resource sharing.

* Data Validation: Runtime request schema validation enforced via Zod.

* Password Hashing: Secure cryptography with bcrypt.

* Role-Based Access Control (RBAC): Strict endpoint protection based on authorization roles (Admin, Customer, Technician).

---

## 📚 API Documentation

* **Swagger UI:** <http://localhost:5000/api-docs>
* **Postman Collection:** `/postman/FixItNow.postman_collection.json`

## 🔑 Admin Credentials

* **Email:** <admin@fixitnow.com>
* **Password:** admin123
