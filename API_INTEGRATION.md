# FixitNow - API Integration Documentation

## API Base URL : <https://fixitnow-backend-m1ur.onrender.com/api>

## Authentication

All protected endpoints require a JWT token in the Authorization header:

Authorization: Bearer <token>

## Endpoints Mapping

### Authentication
| Frontend Route | Backend Endpoint | Method | Description |
|----------------|------------------|--------|-------------|
| `/auth/register` | `/api/auth/register` | POST | Register new user |
| `/auth/login` | `/api/auth/login` | POST | Login user |
| `/dashboard/*` | `/api/auth/me` | GET | Get current user |

### Services & Technicians (Public)
| Frontend Route | Backend Endpoint | Method | Description |
|----------------|------------------|--------|-------------|
| `/services` | `/api/services` | GET | List services |
| `/technicians` | `/api/technicians` | GET | List technicians |
| `/technicians/[id]` | `/api/technicians/:id` | GET | Technician profile |
| `/` (home) | `/api/categories` | GET | Service categories |

### Bookings
| Frontend Route | Backend Endpoint | Method | Description |
|----------------|------------------|--------|-------------|
| `/bookings/new` | `/api/bookings` | POST | Create booking |
| `/dashboard/customer` | `/api/bookings` | GET | User bookings |
| `/bookings/[id]` | `/api/bookings/:id` | GET | Booking details |
| `/bookings/[id]/cancel` | `/api/bookings/:id/cancel` | PATCH | Cancel booking |

### Payment
| Frontend Route | Backend Endpoint | Method | Description |
|----------------|------------------|--------|-------------|
| `/payments/create` | `/api/payments/create` | POST | Create payment |
| `/payments/success` | `/api/payments/confirm` | POST | Confirm payment |
| `/dashboard/customer` | `/api/payments` | GET | Payment history |

### Technician
| Frontend Route | Backend Endpoint | Method | Description |
|----------------|------------------|--------|-------------|
| `/technician/profile` | `/api/technicians/profile` | PUT | Update profile |
| `/technician/availability` | `/api/technicians/availability` | PUT | Set availability |
| `/technician/bookings` | `/api/technicians/bookings` | GET | Technician bookings |
| `/technician/bookings/[id]` | `/api/technicians/bookings/:id` | PATCH | Update status |

### Admin
| Frontend Route | Backend Endpoint | Method | Description |
|----------------|------------------|--------|-------------|
| `/admin/dashboard` | `/api/admin/dashboard/stats` | GET | Dashboard stats |
| `/admin/users` | `/api/admin/users` | GET | All users |
| `/admin/users/[id]` | `/api/admin/users/:id/status` | PATCH | Ban/Unban |
| `/admin/categories` | `/api/admin/categories` | GET/POST | Manage categories |

## Environment Variables
```env
NEXT_PUBLIC_API_URL=https://fixitnow-backend-m1ur.onrender.com/api

```
### Error Handling

All API responses follow this format:

```{
  "success": false,
  "message": "Error message",
  "errors": []
}
```
### Response Format

Success response:

```

{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}```


### Testing

Use the Postman collection: /postman/FixItNow.postman_collection.json


---

## 🚀 **Step 4: Push Changes**

```bash
git add .
git commit -m "docs: update Postman collection and add API integration documentation"
git push```


