# FixItNow - On-Demand Service Marketplace Backend

FixItNow is a production-ready, highly secure, and scalable on-demand service marketplace backend. It enables customers to find and book professional technicians for various services, allows technicians to manage their availability and bookings, and provides an admin dashboard for full platform oversight.

---

## 📦 Submission Details

| Item | Value |
|------|-------|
| **Backend Repo** | <https://github.com/Sumayea104/fixitnow-backend> |
| **Live API** | <https://fixitnow-backend-m1ur.onrender.com> |
| **API Docs** | <https://fixitnow-backend-m1ur.onrender.com/api-docs> |
| **Postman Collection** | <https://github.com/Sumayea104/fixitnow-backend/blob/main/postman/FixItNow.postman_collection.json> |
| **Admin Email** | <admin@fixitnow.com> |
| **Admin Password** | admin123 |
| **Demo Video** | [🎬](https://drive.google.com/file/d/1ZnA8SPjRN09Tsbl3T71ODM8wWyxjpmQd/view?usp=sharing) |
> ⚠️ These credentials are for testing and demonstration only.
---

## 🚀 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Runtime:** | Node.js (v18+ or v20+) |
| **Framework:** | Express.js with TypeScript |
| **Database:** | PostgreSQL (Neon) |
| **ORM:** | Prisma ORM |
| **Security:** | Helmet, CORS, bcrypt, JSON Web Token (JWT) |
| **Validation:** | Zod |
| **Logger:** | Morgan |
| **Payment:** | Stripe & SSLCommerz |

---

## 📂 Project Architecture

The project follows a Modular Architecture for scalability and clean separation of concerns:

```text
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

## Security Features Implemented

- **Helmet**: Secure HTTP headers to prevent common vulnerabilities
- **CORS**: Configured cross-origin resource sharing
- **Data Validation**: Runtime request schema validation enforced via Zod
- **Password Hashing**: Secure cryptography with bcrypt
- **Role-Based Access Control (RBAC)**: Strict endpoint protection based on authorization roles (Admin, Customer, Technician)
- **JWT Authentication**: Stateless authentication with JSON Web Tokens
- **Environment Variables**: Secure configuration management

---

## 📚 API Endpoints

**Base URL:** `https://fixitnow-backend-m1ur.onrender.com`

---

### 🔑 Authentication

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/auth/me` | Get current logged-in user details |

---

### 👤 Users

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/users/profile` | Get current user profile | Private |
| `PUT` | `/api/users/profile` | Update user profile | Private |
| `PATCH` | `/api/users/change-password` | Change user password | Private |
| `GET` | `/api/users` | Get all users | Admin |
| `GET` | `/api/users/:id` | Get user by ID | Admin |
| `PATCH` | `/api/users/:id/status` | Update user status | Admin |

---

### 👑 Admin

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard/stats` | Get platform dashboard statistics |
| `GET` | `/api/admin/users` | Get all users with filters |
| `GET` | `/api/admin/users/:id` | Get user details by ID |
| `PATCH` | `/api/admin/users/:id/status` | Update user status |
| `POST` | `/api/admin/categories` | Create a new service category |
| `GET` | `/api/admin/categories` | Get all categories |
| `PATCH` | `/api/admin/categories/:id` | Update a category |
| `DELETE` | `/api/admin/categories/:id` | Delete a category |

---

### 🛠️ Technicians

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/technicians` | Get all technicians with filters |
| `GET` | `/api/technicians/:id` | Get technician profile by ID |
| `PUT` | `/api/technicians/profile` | Update technician profile |
| `PUT` | `/api/technicians/availability` | Update technician availability slots |
| `GET` | `/api/technicians/bookings` | Get technician's bookings |
| `PATCH` | `/api/technicians/bookings/:id` | Update booking status |
| `GET` | `/api/technicians/stats` | Get technician statistics |

---

### 📅 Bookings

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/bookings` | Create a new booking |
| `GET` | `/api/bookings` | Get current user's bookings |
| `GET` | `/api/bookings/:id` | Get booking details by ID |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel a booking |
| `PATCH` | `/api/bookings/:id/status` | Update booking status (Technician only) |

---

### 💳 Payments

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/payments/create` | Create a payment |
| `GET` | `/api/payments` | Get payment history |
| `GET` | `/api/payments/:id` | Get payment details |
| `PATCH` | `/api/payments/confirm/:id` | Confirm payment |

---

### ⭐ Reviews

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/reviews` | Get all reviews with filters |
| `POST` | `/api/reviews` | Create a review |
| `GET` | `/api/reviews/:id` | Get review details by ID |
| `PATCH` | `/api/reviews/:id` | Update a review |
| `DELETE` | `/api/reviews/:id` | Delete a review |
| `GET` | `/api/reviews/technician/:technicianId` | Get all reviews for a technician |
| `POST` | `/api/reviews/:id/helpful` | Mark a review as helpful |
| `POST` | `/api/reviews/:id/reply` | Reply to a review |

---

## 💡 Challenges & Key Learnings

### 🚀 Technical Challenges & Solutions

1. **Dual Payment Gateway Integration (Stripe & SSLCommerz):**
   - **Challenge:** Integrating both Stripe and SSLCommerz required managing distinct transaction flows, payload structures, and webhook handlers for international and local currency payments seamlessly.
   - **Solution:** Designed a unified payment service module with isolated routing logic and dedicated webhook listeners to process real-time status updates from both gateways securely.

2. **Role-Based Routing & Security (RBAC):**
   - **Challenge:** Restricting route access cleanly across three distinct user roles (`Customer`, `Technician`, and `Admin`) without repetitive permission logic.
   - **Solution:** Implemented a strict, middleware-driven Role-Based Access Control (RBAC) layer (`verifyToken`, `verifyAdmin`, `verifyTechnician`) that validates JWTs and authorizes requests based on user roles before reaching controller logic.

3. **Prisma Client & Vercel Deployment Issues:**
   - **Challenge:** Initially deploying the backend on Vercel caused database connection failures as the Prisma Client wasn't generated during the automated build phase.
   - **Solution:** Resolved the deployment issue by configuring a custom pre-build script (`"vercel-build": "prisma generate && tsc -b"`) in `package.json`, ensuring schema generation occurs prior to TypeScript compilation.

4. **Automating Authentication with Cookie-Parser Migration:**
   - **Challenge:** Replaced tedious manual `Authorization: Bearer <token>` token copy-pasting during Postman testing and frontend integration by migrating to secure **HTTP-Only Cookies**.
   - **Solution:** Integrated `cookie-parser` on the backend so that JWTs are automatically injected and stored in client storage upon login, securing the authentication flow and protecting against XSS attacks.

---

### 📚 Key Learnings

- **Multi-Gateway Architecture:**
  Learned how to architect modular payment handlers that cleanly separate localized payment logic (SSLCommerz) from global standards (Stripe).

- **CI/CD & Deployment Configurations:**
  Gained hands-on experience troubleshooting build-time environment dependencies, database ORM client generation, and cloud deployment pipelines.

- **Modern Web Security Practices:**
  Practical knowledge in hardening authentication with HTTP-Only cookies, CORS policies, and strict role-based authorization layers.

---

## 📚 API Documentation

- **Swagger UI:** [fixitnow-backend-m1ur.onrender.com/api-docs](https://fixitnow-backend-m1ur.onrender.com/api-docs/)
- **Postman Collection:** [FixItNow.postman_collection.json](https://github.com/Sumayea104/fixitnow-backend/blob/main/postman/FixItNow.postman_collection.json)

## 🔑 Admin Credentials

| Credential | Value |
|------------|-------|
| **Email** | `admin@fixitnow.com` |
| **Password** | `admin123` |
> ⚠️ These credentials are for testing and demonstration only.
---

## 🌐 Live API

- **Live URL:** [Render](https://fixitnow-backend-m1ur.onrender.com)
[Vercel](https://fixitnow-backend-m1ur.onrender.com/)

---

## 🧪 Testing

### Test API with cURL

```bash
# Health Check
curl https://fixitnow-backend-m1ur.onrender.com/health

# Register User
curl -X POST https://fixitnow-backend-m1ur.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","role":"CUSTOMER"}'

# Login
curl -X POST https://fixitnow-backend-m1ur.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

```

### Test with Postman

Import the Postman collection from `postman/FixItNow.postman_collection.json`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👨‍💻 Developer

- **Sumayea Rahman**
- **GitHub:** [Sumayea104](https://github.com/Sumayea104)
- **Email:** <sumayearahman7@gmail.com>

---

## 📞 Support

For any questions or issues, please [open an issue](https://github.com/Sumayea104/fixitnow-backend/issues) or contact the developer.

---

## ⭐ Show Your Support

If you found this project helpful, please give it a ⭐ on GitHub!

---
