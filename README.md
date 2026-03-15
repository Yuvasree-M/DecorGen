# DecorGen — AI Interior Design Application

Full-stack application: React + Vite frontend, Node.js + Express backend, Firebase Auth + Firestore, Cloudinary, Freepik AI.

---

## ✅ Architecture (Correct Flow)

```
Browser (React)
  └── apiFetch() / apiUpload()
        └── Express Backend
              ├── Firebase Admin SDK → Firestore  (all DB reads/writes)
              └── Freepik API + Cloudinary         (AI generation + image upload)
```

**Frontend NEVER talks to Firestore directly.** All data goes through the Express backend.

---

## 👥 User Roles

| Role    | Access |
|---------|--------|
| USER    | Home page, generate/enhance designs, connect with builders, view own dashboard |
| BUILDER | Builder dashboard — see and reply to client inquiries sent to them |
| ADMIN   | Admin dashboard — manage all users, view all designs, manage all inquiries |

Set roles in Admin Dashboard → Users tab → Change Role dropdown.

---

## 🔗 Routes

| Path                  | Access |
|-----------------------|--------|
| `/`                   | Public landing page |
| `/login`              | Public |
| `/register`           | Public |
| `/dashboard`          | USER only |
| `/admin/dashboard`    | ADMIN only |
| `/builder/dashboard`  | BUILDER only |

---

## 🚀 Setup

### 1. Firebase

1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password + Google
3. Create **Firestore Database** (start in test mode)
4. **Project Settings → Service accounts → Generate new private key**
5. Copy the entire JSON and minify it into one line

### 2. Backend `.env`

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
FREEPIK_API_KEY=your_freepik_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Frontend `.env`

```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false; // All access via backend only
    }
  }
}
```
*(Backend uses Admin SDK which bypasses these rules — this blocks direct browser access)*

### 5. Install & Run

```bash
# Backend
cd backend
npm install
npm run dev        # or: node server.js

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## 📦 Features

- **Hero section** — fullscreen room background, CTA button opens generator modal
- **About section** — app description + image grid
- **How It Works** — 5-step visual guide + before/after carousel with 4 examples
- **FAQ** — accordion-style, same pattern as ecommerce app
- **Contact** — form that saves to Firestore via backend
- **Footer** — 3-column with quick links, social icons

- **GeneratorModal** — Generate + Enhance tabs, 6 styles, custom prompt (only shows when Custom clicked), before/after slider, Download button, Connect with Designer button
- **BuilderModal** — shows builders filtered by chosen style, profiles with specialties, inquiry form → saved via backend API
- **Login/Register** — standalone pages with Google + email/password, role-based redirect after login
- **User Dashboard** — designs grid (from API) + inquiries list (from API)
- **Admin Dashboard** — stats + tabbed tables: Users (with role change), Designs (image grid), Inquiries (with reply/close)
- **Builder Dashboard** — all inquiries assigned to this builder, reply modal, close button, email client link

---

## 📡 API Endpoints

```
POST /api/auth/register          — register new user (after Firebase signup)
GET  /api/auth/me                — get logged-in user profile + role

GET  /api/users                  — [ADMIN] all users
PATCH /api/users/:uid/role       — [ADMIN] change user role
GET  /api/users/profile          — [USER] own profile
PUT  /api/users/profile          — [USER] update phone/address

POST /api/designs/generate       — generate AI design (guest or user)
POST /api/designs/enhance        — enhance image (guest or user)
GET  /api/designs/my             — [USER] own saved designs
GET  /api/designs/all            — [ADMIN] all designs

POST /api/inquiries              — submit inquiry to a builder
GET  /api/inquiries/my           — [USER/BUILDER] own inquiries
GET  /api/inquiries/all          — [ADMIN] all inquiries
PATCH /api/inquiries/:id/status  — [ADMIN/BUILDER] update status + reply

POST /api/contact                — save contact form message
```
