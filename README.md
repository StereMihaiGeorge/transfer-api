# Nunta Perfecta API 💒

> Production-grade SaaS REST API for wedding planning built with TypeScript and Express

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)

---

## 📖 Overview

**Nunta Perfecta** is a multi-tenant SaaS REST API that helps couples plan their perfect wedding. Couples can register, create their wedding event, manage guests, organize seating arrangements, collect RSVPs, handle music requests, and track planning tasks — all through a clean, well-documented API.

### ✨ Key Features

- 🏢 **Multi-tenant SaaS architecture** — complete data isolation per couple
- 🔐 **JWT authentication** with refresh tokens and revocation
- 👥 **Guest management** with RSVP system via unique tokens
- 📧 **Email invitations** via Nodemailer (Ethereal for dev, SMTP for prod)
- 🪑 **Table seating management** with capacity tracking
- ✅ **Wedding todo checklist** with categories and status
- 🎵 **DJ playlist export** (CSV) with special moments
- 📚 **Interactive API docs** via Swagger UI

---

## 🛠️ Tech Stack

| Category   | Technology                              |
|------------|-----------------------------------------|
| Runtime    | Node.js + TypeScript                    |
| Framework  | Express.js                              |
| Database   | PostgreSQL                              |
| Auth       | JWT + bcrypt                            |
| Validation | Zod                                     |
| Email      | Nodemailer + Ethereal (dev) / SMTP (prod)|
| Docs       | Swagger UI                              |

---

## 📁 Project Structure

```
src/
├── config/        # DB connection pool, env validation, mailer, swagger
├── controllers/   # Request/response handling (thin layer)
├── db/            # Migration scripts
├── emails/        # Email service + HTML templates
├── middleware/    # authenticate, authorize, validate, logger, errorHandler
├── models/        # TypeScript interfaces
├── routes/        # Route definitions
├── schemas/       # Zod validation schemas
└── services/      # Business logic (all DB queries live here)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (or Docker)
- Git

### Installation

```bash
# Clone the repo
git clone https://github.com/StereMihaiGeorge/transfer-api.git
cd transfer-api

# Install dependencies
npm install

# Copy env file
cp .env.example .env
# Edit .env with your values

# Run migrations
npm run migrate

# Start development server
npm run dev
```

### Docker (PostgreSQL only)

```bash
docker run --name nunta-perfecta-db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=my-pass \
  -e POSTGRES_DB=app_test \
  -p 5432:5432 \
  -d postgres
```

---

## ⚙️ Environment Variables

| Variable             | Description                    | Example                    |
|----------------------|--------------------------------|----------------------------|
| `DB_HOST`            | Database host                  | `localhost`                |
| `DB_PORT`            | Database port                  | `5432`                     |
| `DB_USER`            | Database user                  | `admin`                    |
| `DB_PASSWORD`        | Database password              | `secret`                   |
| `DB_NAME`            | Database name                  | `app_test`                 |
| `JWT_SECRET`         | Access token secret            | `random-string`            |
| `JWT_REFRESH_SECRET` | Refresh token secret           | `random-string`            |
| `JWT_ACCESS_EXPIRES` | Access token expiry            | `15m`                      |
| `JWT_REFRESH_EXPIRES`| Refresh token expiry           | `7d`                       |
| `FRONTEND_URL`       | Frontend URL for CORS          | `http://localhost:5173`    |
| `SMTP_HOST`          | SMTP host                      | `smtp.ethereal.email`      |
| `SMTP_PORT`          | SMTP port                      | `587`                      |
| `SMTP_USER`          | SMTP user                      | `user@ethereal.email`      |
| `SMTP_PASS`          | SMTP password                  | `secret`                   |
| `SMTP_FROM`          | From email address             | `noreply@nuntaperfecta.ro` |

---

## 📚 API Documentation

Interactive Swagger UI is available at: **http://localhost:3000/api/docs**

### Endpoint Groups

| Group    | Base URL                       | Auth Required |
|----------|--------------------------------|---------------|
| Auth     | `/api/v1/auth`                 | No            |
| Events   | `/api/v1/events`               | Yes           |
| Guests   | `/api/v1/events/:id/guests`    | Yes           |
| Tables   | `/api/v1/events/:id/tables`    | Yes           |
| Todos    | `/api/v1/events/:id/todos`     | Yes           |
| Songs    | `/api/v1/events/:id/songs`     | Yes           |
| RSVP     | `/api/v1/rsvp`                 | No (public)   |

---

## 🔑 Key Features Explained

### Multi-tenancy

Each couple registers an account and creates their own wedding event. All resources (guests, tables, todos, songs) are scoped to that event. The `authorizeEvent` middleware validates ownership on every request, ensuring complete data isolation between tenants.

### Authentication Flow

```
POST /api/v1/auth/register  →  Create account
POST /api/v1/auth/login     →  Returns accessToken (15min) + refreshToken (7days)
POST /api/v1/auth/refresh   →  Swap refreshToken for new accessToken
POST /api/v1/auth/logout    →  Revoke refreshToken from DB
```

- **Access token**: short-lived (15min), used for all API calls
- **Refresh token**: long-lived (7 days), hashed and stored in the database
- **Logout**: immediately revokes the refresh token — no waiting for expiry

### RSVP System

Each guest receives a unique, unguessable token upon creation. A public RSVP link (`/api/v1/rsvp/:token`) allows guests to respond without any login. The flow is two-step: confirm attendance → submit meal/music preferences.

### Email Service

| Email Type       | Trigger                                  |
|------------------|------------------------------------------|
| Invitation       | Couple sends invite to guest             |
| Confirmation     | Guest confirms RSVP                      |
| Notification     | Couple notified when guest responds      |
| Preferences      | Sent to confirmed guests for details     |
| Reminder         | Sent to pending guests before deadline   |

---

## 🗄️ Database Schema

| Table           | Key Fields                                                   |
|-----------------|--------------------------------------------------------------|
| `users`         | id, username, email, password, plan                          |
| `events`        | id, user_id, bride_name, groom_name, date, venue, slug       |
| `guests`        | id, event_id, name, email, token, status, member_count       |
| `tables`        | id, event_id, name, capacity                                 |
| `todos`         | id, event_id, title, category, status                        |
| `song_requests` | id, event_id, guest_id, song_title, genre                    |
| `event_songs`   | id, event_id, moment, song_title, artist                     |
| `refresh_tokens`| id, user_id, token, expires_at                               |
| `email_logs`    | id, event_id, guest_id, type, status                         |

---

## 📜 Scripts

| Command           | Description                  |
|-------------------|------------------------------|
| `npm run dev`     | Start development server     |
| `npm run build`   | Compile TypeScript           |
| `npm run start`   | Start production server      |
| `npm run migrate` | Run database migrations      |

---

## 🗺️ Roadmap

- [ ] Frontend (Next.js or Alpine.js)
- [ ] Railway deployment
- [ ] Resend email integration
- [ ] Stripe payment integration
- [ ] Drag & drop seating chart
- [ ] SMS reminders
- [ ] Multi-language support (RO/EN)
- [ ] Vendor management
- [ ] Budget tracker
- [ ] Mobile app

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
