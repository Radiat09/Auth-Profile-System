**Secure Auth & User Profile API**

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white) ![version](https://img.shields.io/badge/version-1.0.0-blue.svg)

A compact, production-oriented TypeScript backend that provides secure authentication (email/password + OTP via email/SMS), JWT-based protection, and user profile management with image upload support.

**Why this project is useful**

- **Multi-channel auth:** Email/password plus OTP flows for phone or email verification and login.
- **Security-first:** Password hashing with `bcrypt`, JWT tokens, and input validation middleware.
- **Profile features:** Protected routes for profile CRUD and profile-picture upload (local `uploads/` by default; Cloudinary optional).
- **Minimal, extendable architecture:** Clear separation of controllers, routes, middleware, and utils.

**What's included**

- Authentication controllers and routes (`src/controllers`, `src/routes/auth.routes.ts`).
- Profile management and upload handlers (`src/controllers/profile.controller.ts`, `src/routes/profile.routes.ts`).
- Utilities for email, OTP, hashing and middleware for validation and auth protection.

**Prerequisites**

- Node.js 18+ (or an active LTS release)
- MongoDB (local or hosted) and a connection URI

**Quick start — developer flow**

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
# If a .env.example exists
cp .env.example .env || echo "Create a .env with required vars"
```

3. Fill in required environment variables in `.env` (examples):

```
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/your_db_name

# Security
JWT_SECRET=your_super_secret_key

# Optional (SMS/Email/Cloudinary)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
CLOUDINARY_API_KEY=...
```

4. Run in development (auto-reloads):

```bash
npm run dev
```

5. Build & run for production:

```bash
npm run build
npm start
```

**API: Quick reference**

Base URL: `/` (server) — API prefix: `/api/v1`

- Authentication routes mounted at: `POST /api/v1/auth/*` (see `src/routes/auth.routes.ts`)
- Profile routes mounted at: `POST/GET/PUT /api/v1/profile/*` (protected by JWT, see `src/routes/profile.routes.ts`)

Core endpoints (examples):

- `POST /api/v1/auth/register/email` — Register with `{ email, password, name }`
- `POST /api/v1/auth/verify/email` — Verify email OTP `{ email, otp }`
- `POST /api/v1/auth/register/phone` — Register with phone `{ phone, name }`
- `POST /api/v1/auth/verify/phone` — Verify phone OTP `{ phone, otp }`
- `POST /api/v1/auth/login/email` — Login with `{ email, password }` (returns JWT)
- `POST /api/v1/auth/login/phone` — Send login OTP to phone `{ phone }`
- `POST /api/v1/auth/login/verify` — Verify login OTP `{ phone, otp }`

Profile endpoints (protected — include `Authorization: Bearer <token>`):

- `GET /api/v1/profile/` — Get current user profile
- `PUT /api/v1/profile/` — Update profile fields
- `POST /api/v1/profile/upload-picture` — Upload profile picture (multipart form, field `profilePicture`)
- `DELETE /api/v1/profile/picture` — Delete profile picture

Example: register user (email)

```bash
curl -X POST http://localhost:3000/api/v1/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"S3cureP@ss","name":"Alice"}'
```

Example: upload profile picture (with JWT)

```bash
curl -X POST http://localhost:3000/api/v1/profile/upload-picture \
  -H "Authorization: Bearer $TOKEN" \
  -F "profilePicture=@./avatar.jpg"
```

**Configuration & customization**

- Default file storage: local `uploads/` folder (served at `/uploads`). To use Cloudinary, wire up the Cloudinary client in the upload utility.
- SMS is implemented via Twilio helpers; configure `TWILIO_*` env vars to enable.
- Email (OTP templates) uses Nodemailer — configure SMTP credentials in env.

**Project structure (important files)**

- `src/app.ts` — Express app and route mounting
- `src/server.ts` — Entrypoint, DB connection and graceful shutdown
- `src/routes/` — Route definitions (`auth.routes.ts`, `profile.routes.ts`)
- `src/controllers/` — Request handlers and business logic
- `src/middlewares/` — Auth, validation, upload middleware
- `src/models/` — Mongoose models (e.g., `user.model.ts`)
- `uploads/` — Default directory for profile-picture storage

**Support & documentation**

- For usage questions or issues, open an issue in this repository.
- For major feature requests or RFCs, create an issue labeled `enhancement`.
- See `CONTRIBUTING.md` for contribution guidelines and `LICENSE` for licensing details.

**Maintainers & Contributing**

- Maintained by the project contributors. See `CONTRIBUTING.md` for how to contribute.
- Short contribution flow: fork → feature branch → PR with tests and description.

**Security**

- Do not commit secrets. Use environment variables and secret managers.
- Rotate `JWT_SECRET` and SMTP/Twilio credentials if leaked.

**Acknowledgements**

- Built with Express, TypeScript and MongoDB.

---

NOTE: Could not get TWILIO number as it is a paid service and unable to find phone otp sender free service.
