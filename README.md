# Suguna Multispeciality — Phase 3 + Phase 4

This package keeps the existing Phase 2 visual direction and extends it with production-style backend workflows, real supplied assets, secure admin management, validation, and operational tooling.

## Included

### Public website
- Existing premium Suguna Multispeciality layout retained
- Real supplied Suguna logo
- Real supplied doctor photos for Dr. G. Rajasekar and Dr. G. Kayathri
- Real supplied hospital/facility imagery
- Real hospital address and 24×7 phone number
- Departments and diagnostic services from the supplied hospital material
- 24×7 emergency call and WhatsApp actions
- Appointment request workflow
- Patient review submission + moderation workflow
- Contact/enquiry workflow
- Responsive navigation and mobile layout
- SEO metadata and accessible labels

### Phase 3 — backend + data workflows
- MongoDB/Mongoose data layer
- Appointment CRUD workflow + status management
- Review moderation workflow
- Contact enquiry storage + status management
- Public department/diagnostic/facility APIs
- Dashboard statistics API
- Secure admin login with JWT

### Phase 4 — production hardening + admin portal
- `/admin` admin portal
- Admin authentication via private `ADMIN_KEY`
- Appointment inbox and status controls
- Review approval/unpublish controls
- Enquiry inbox and status controls
- Helmet security headers
- CORS configuration
- API rate limiting for public endpoints
- Input length/phone/rating validation
- Server-side error handling
- Session storage for admin token

## MongoDB setup

The `.env.example` already uses the requested MongoDB username:

`gouthamdpi51_db_user`

The password is intentionally left as a placeholder. Add your own password and Atlas cluster host in `backend/.env`.

Example:

`MONGODB_URI=mongodb+srv://gouthamdpi51_db_user:<YOUR_PASSWORD>@<YOUR_CLUSTER_HOST>/suguna_multispeciality?retryWrites=true&w=majority`

Do not commit your real `.env` file or share the password publicly.

Your current Atlas IP access can remain restricted to your existing IP (`157.51.80.186/32`). No `0.0.0.0/0` rule is required for this development setup.

## Run

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

On macOS/Linux, use `cp .env.example .env` instead of `copy`.

Fill in `MONGODB_URI`, `JWT_SECRET`, and `ADMIN_KEY` before starting the backend.

### 2. Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Optional `frontend/.env`:

`VITE_API_URL=http://localhost:5000/api`

### 3. Open

- Website: `http://localhost:5173`
- Admin: `http://localhost:5173/admin`
- API health: `http://localhost:5000/api/health`

## Admin login

Use the value you set in `backend/.env` as `ADMIN_KEY`.

No admin password is hard-coded into the source.

## Supplied image mapping

- `logo.jpg` — Suguna Multispeciality logo
- `doctor-rajasekar.jpg` — supplied Dr. G. Rajasekar photo
- `doctor-kayathri.jpg` — supplied Dr. G. Kayathri photo
- `hospital-hero.jpg` — supplied/cropped hospital exterior
- `hospital-about.jpg` — supplied/cropped hospital exterior
- `hospital-gallery-1.jpg` — supplied/cropped hospital exterior
- `hospital-gallery-2.jpg` — supplied hospital/service reference image

## Important production note

Before public deployment, use a strong random `JWT_SECRET`, a strong private `ADMIN_KEY`, restrict MongoDB network access to the production server IP, and configure the real production frontend URL in `CLIENT_URL`.
