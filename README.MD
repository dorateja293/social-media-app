## SocialStack – Social Media Web Application (MERN)

SocialStack is a full‑stack social media platform built with the MERN stack.  
Users can create posts with images, like and comment on posts, follow other users, and receive notifications for interactions.

---

## 🚀 Core Features

- **Authentication & Security**
  - JWT‑based auth with protected API routes
  - Auth guard on frontend routes (`ProtectedRoute`)

- **Social Feed**
  - Personalized feed showing posts from followed users
  - Instagram / tweet‑style post cards (text + optional image)
  - Like / unlike posts with live like counts
  - Add and delete your own comments

- **User Profiles & Relationships**
  - Public profile page with posts, followers, and following counts
  - Follow / unfollow other users
  - User search with type‑ahead (navbar search box)

- **Notifications**
  - Notifications for likes and comments on your posts
  - Mark single notification as read
  - “Mark all as read” support

- **Media & Storage**
  - Image upload via `multer` + `cloudinary`
  - Post images stored in Cloudinary and served via CDN URL

---

## 🛠️ Tech Stack

- **Frontend**
  - React (Vite)
  - React Router
  - Tailwind CSS + custom utility classes
  - Axios (API client)

- **Backend**
  - Node.js + Express
  - MongoDB + Mongoose
  - JSON Web Tokens (JWT) for auth
  - Multer + Cloudinary for image uploads

- **Dev & Tooling**
  - ESLint
  - Nodemon
  - Postman / REST client for API testing

---

## 📦 Project Structure

```text
.
├── client/                # React frontend (Vite)
│   ├── src/
│   │   ├── api/           # Axios instance
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages (Feed, Login, Register, Profile, Notifications)
│   │   └── utils/         # Frontend helpers
│   └── public/            # Static assets (logo, favicon)
│
├── server/                # Node/Express backend
│   ├── src/
│   │   ├── config/        # DB & Cloudinary configuration
│   │   ├── controllers/   # Route controllers (auth, users, posts, notifications)
│   │   ├── middlewares/   # Auth + upload middleware
│   │   ├── models/        # Mongoose models (User, Post, Notification)
│   │   ├── routes/        # Express routers
│   │   └── utils/         # Utility helpers (e.g. createNotification)
└── README.md
```

---

## ⚙️ Local Development Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "Social media app"
```

### 2. Backend setup (`server`)

```bash
cd server
npm install
```

Create a `.env` file in `server/` with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend:

```bash
npm run dev
```

The API will be available at `http://localhost:5000` (e.g. `http://localhost:5000/api/auth/login`).

### 3. Frontend setup (`client`)

Open a **new terminal**:

```bash
cd client
npm install
npm run dev
```

Vite will start the React app (by default at `http://localhost:5173`).

> Ensure the backend (`http://localhost:5000`) is running, as the frontend Axios client is configured to use that base URL.

---

## 🔐 Authentication Flow (High Level)

1. User registers or logs in via `/api/auth/register` or `/api/auth/login`.
2. Backend returns a signed JWT.
3. Frontend stores the token in `localStorage` and attaches it to all API calls via an Axios interceptor (`Authorization: Bearer <token>`).
4. Protected routes on the backend use `authMiddleware` to verify the token and attach the `req.user` object.
5. Frontend `ProtectedRoute` component checks for the token and redirects unauthenticated users to `/login`.

---

## ✅ Available Scripts

From the **client/** directory:

- `npm run dev` – start Vite dev server
- `npm run build` – build production assets
- `npm run preview` – preview the production build

From the **server/** directory:

- `npm run dev` – start backend with Nodemon
- `npm start` – start backend with Node

---

## 🧪 Basic Manual Test Checklist

- Register a new user and log in.
- Create a post with and without an image.
- Like & unlike a post; verify like count updates.
- Comment on a post; verify you can delete your own comment.
- Follow another user and confirm their posts appear in your feed.
- Trigger likes/comments on your posts and verify notifications:
  - Notifications list loads.
  - You can mark a single notification as read.
  - “Mark all as read” works.

---

## 📌 Notes / Future Improvements

- Add real‑time updates (WebSockets) for likes/comments/notifications.
- Add image cropping/compression on the client before upload.
- Introduce pagination / infinite scrolling in the main feed UI.
- Improve accessibility (ARIA labels, keyboard navigation, color contrast checks).


