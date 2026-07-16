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
| **Demo Video** | *(আপনার ভিডিও লিংক দিন)* |

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

### Base URL: [FixitNow-Backend](https://fixitnow-backend-m1ur.onrender.com)

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/me` | Get current user profile | ✅ |

### Admin (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| PATCH | `/api/admin/users/:id/status` | Update user status (ban/unban) |
| GET | `/api/admin/bookings` | Get all bookings |
| GET | `/api/admin/dashboard/stats` | Get dashboard statistics |
| POST | `/api/admin/categories` | Create a new category |
| GET | `/api/admin/categories` | Get all categories |
| PATCH | `/api/admin/categories/:id` | Update a category |
| DELETE | `/api/admin/categories/:id` | Delete a category |
| PATCH | `/api/admin/technicians/:id/verify` | Verify a technician |

### Technician (Technician Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/technicians/profile` | Update technician profile |
| PUT | `/api/technicians/availability` | Update availability slots |
| GET | `/api/technicians/bookings` | Get technician's bookings |
| PATCH | `/api/technicians/bookings/:id/status` | Update booking status (accept/decline/complete) |
| GET | `/api/technicians/stats` | Get technician statistics |

### Customer

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create a new booking |
| GET | `/api/bookings` | Get user's bookings |
| GET | `/api/bookings/:id` | Get booking details |
| PATCH | `/api/bookings/:id/cancel` | Cancel a booking |

### Payment

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create` | Create a payment intent/session |
| GET | `/api/payments` | Get user's payment history |
| GET | `/api/payments/:id` | Get payment details |

### Reviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Create a review after job completion |

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Get all services with filters |
| GET | `/api/technicians` | Get all technicians with filters |
| GET | `/api/technicians/:id` | Get technician profile with reviews |
| GET | `/api/categories` | Get all service categories |

### Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API root information |
| GET | `/health` | Health check |
| GET | `/api-docs` | Swagger UI documentation |
| GET | `/api-docs.json` | Swagger JSON specification |

---

## 📚 API Documentation

- **Swagger UI:** [https://fixitnow-backend-m1ur.onrender.com/api-docs](https://fixitnow-backend-m1ur.onrender.com/api-docs)
- **Postman Collection:** [FixItNow.postman_collection.json](https://github.com/Sumayea104/fixitnow-backend/blob/main/postman/FixItNow.postman_collection.json)

## 🔑 Admin Credentials

| Credential | Value |
|------------|-------|
| **Email** | `admin@fixitnow.com` |
| **Password** | `admin123` |

---

## 🌐 Live API

- **Live URL:** [https://fixitnow-backend-m1ur.onrender.com](https://fixitnow-backend-m1ur.onrender.com)

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
