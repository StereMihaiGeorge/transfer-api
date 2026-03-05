# Wedding Planner SaaS API

## Project Overview
A production-style SaaS REST API for wedding planning, built with TypeScript and Express.
Couples can create wedding events, manage guests, arrange seating tables, collect RSVPs and music requests.

## Tech Stack
- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **Database**: PostgreSQL (running on Docker)
- **Auth**: JWT (access tokens 15min + refresh tokens 7days stored in DB)
- **Validation**: Zod schemas per route
- **Password hashing**: bcrypt (10 salt rounds)

## Project Structure
- `src/config/`      - DB connection pool, env variables, mailer setup
- `src/routes/`      - Route definitions
- `src/controllers/` - Request/response handling (thin layer)
- `src/services/`    - Business logic (all DB queries live here)
- `src/models/`      - TypeScript interfaces
- `src/middleware/`  - authenticate, authorize, validate, logger, errorHandler
- `src/schemas/`     - Zod validation schemas
- `src/db/`          - Migration scripts

## Database Tables
- `users`         - Couples who own wedding events (plan: free/basic/premium)
- `events`        - Wedding events (bride, groom, date, venue, slug)
- `tables`        - Seating tables per event (name, capacity)
- `guests`        - Guests per event (status: pending/confirmed/declined, unique RSVP token)
- `song_requests` - Music requests from guests for DJ
- `email_logs`    - Track sent invitation/reminder emails
- `refresh_tokens` - Stored refresh tokens for auth revocation

## Auth Flow
- POST /api/auth/register → create account, returns user
- POST /api/auth/login    → returns accessToken (15min) + refreshToken (7days)
- POST /api/auth/refresh  → swap refreshToken for new accessToken
- POST /api/auth/logout   → revoke refreshToken from DB

## Middleware Chain
Protected routes: authenticate → authorizeEvent → validate → controller
Public routes:   validate → controller

## Key Interfaces
- AuthRequest extends Request with:
  - req.user  → { id, username, email }
  - req.event → { id, user_id }

## Environment Variables
- JWT_SECRET           - Access token secret
- JWT_REFRESH_SECRET   - Refresh token secret
- JWT_ACCESS_EXPIRES   - 15m
- JWT_REFRESH_EXPIRES  - 7d
- DB credentials       - host, port, user, password, database

## API Endpoints (planned)
### Auth (✅ done)
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

### Events (🔄 next)
- POST   /api/events
- GET    /api/events/:id
- PUT    /api/events/:id
- DELETE /api/events/:id
- GET    /api/events/:id/dashboard

### Tables
- POST   /api/events/:id/tables
- GET    /api/events/:id/tables
- PUT    /api/events/:id/tables/:tid
- DELETE /api/events/:id/tables/:tid

### Guests
- POST   /api/events/:id/guests
- GET    /api/events/:id/guests
- PUT    /api/events/:id/guests/:gid
- DELETE /api/events/:id/guests/:gid
- POST   /api/events/:id/guests/:gid/invite

### RSVP (public, no auth)
- GET  /api/rsvp/:token
- POST /api/rsvp/:token

### Songs
- GET /api/events/:id/songs

## Coding Patterns
- Service throws errors, controller catches and sends HTTP response
- authorizeEvent middleware attaches req.event (no double DB calls)
- Never expose password field in responses
- All env variables validated on startup via getEnvVar()
- Use Zod schemas in src/schemas/ for all request validation
- Raw pg pool queries, no ORM