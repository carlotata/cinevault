# 🎬 CineVault — Movie Discovery, Watchlist & Tracking Web App

[![Vue.js 3](https://img.shields.io/badge/Vue.js-3.5.40-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1.5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TMDB API](https://img.shields.io/badge/TMDB_API-v3-01B4E4?style=flat-square&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/documentation/api)
[![Responsive](https://img.shields.io/badge/Responsive-Mobile%20%7C%20Tablet%20%7C%20Desktop-f59e0b?style=flat-square)](style.css)

**CineVault** is a modern, high-performance, single-page movie discovery and personal tracking web application built with **Vue 3** and powered by **The Movie Database (TMDB) API**. Designed with a cinematic aesthetic, it offers real-time movie exploration, trailer playback, interactive filtering, watchlist queue management, favorites curation, and seamless Dark/Light theming.

---

## 👥 Project Developers & Authors

This project was developed as a collaborative group submission by:

- **Aviso, John Carl**
- **Baydal, Lourden**
- **Patigas, John Paul**

---

## 🚀 Key Features Walkthrough

### 1. 🌟 Live TMDB Movie Discovery
- **Live TMDB REST API Integration**: Dynamically loads real-time catalog data from TMDB endpoints (`/trending`, `/movie/popular`, `/movie/top_rated`, `/movie/now_playing`, `/movie/upcoming`).
- **Rotating Hero Carousel**:
  - Auto-playing cinematic slideshow of top trending movies.
  - Interactive controls: Pause/resume autoplay on hover, manual Next/Previous navigation arrows, and pagination indicator dots.
  - Quick action buttons to launch trailer playback or inspect full movie metadata.

### 2. 🎛️ Advanced Filtering, Sorting & Search
- **Dynamic Category Tabs**: 1-click switching between *Popular*, *Trending*, *Top Rated*, *Now Playing*, and *Upcoming*.
- **Multi-Genre Filter**: Filter catalog by 19 TMDB genres (Action, Sci-Fi, Drama, Animation, Thriller, Comedy, Horror, etc.).
- **Rating Threshold Selector**: Filter movies by minimum rating scores (All, ★ 5+, ★ 6+, ★ 7+, ★ 8+).
- **Multi-Criteria Sorting**: Sort results by *Most Popular*, *Top Rated*, *Title (A–Z)*, or *Release Date (Newest)*.
- **Custom Accessible Dropdowns**: Interactive pill dropdowns with chevron animation, outside-click auto-dismiss, and mobile-safe viewport positioning.
- **Global Search Overlay Modal**:
  - Centered popup search interface with backdrop blur and instant auto-focus.
  - Recent search query history chips with 1-click search execution and individual/batch removal.

### 3. 📑 Comprehensive Movie Details & Trailer Modal
- **Dynamic YouTube Trailer Player**: Automatically queries TMDB video endpoints to embed official trailers and teasers with responsive 16:9 aspect ratio.
- **Full Movie Metadata**: Displays release date, runtime (formatted in hours & minutes), budget, revenue, production status, tagline, synopsis, and genres.
- **Top Billed Cast Section**: Horizontal cast scroll with profile photos and character names.
- **Dynamic Watch Status Segmented Controller**:
  - Allows assigning and updating movies across 3 distinct queue states:
    - ⏳ **Plan to Watch**
    - 🎬 **Watching**
    - ✅ **Completed**
  - Features an active status badge and responsive segmented button controls.

### 4. 📌 Watchlist & Favorites Management
- **Personal Watchlist Queue**: Save movies into your personal queue with live counter badges.
- **Sub-Filter Categories**: Filter personal watchlist by *All*, *Plan to Watch*, *Watching*, or *Completed*.
- **Favorites Collection**: Instant 1-click bookmarking for all-time favorite films.
- **Account-Based Persistence**: Sign in to sync your watchlist, watch statuses, favorites, recent searches, and theme setting with the Express + PostgreSQL backend, so they follow you across devices.

### 5. ☀️ Dark / Light Theming System
- **CSS Custom Property Tokens**: Fully cohesive design system supporting both **Cinematic Dark** and **Clean Light** modes.
- **Optimized Light Mode**: Carefully tuned contrast, localized scrim gradients, and high-visibility hero banner imagery.
- **Smooth 1-Tap Toggle**: Theme switch button with 180° animated icon rotation.

### 6. 📱 Mobile-First Responsive Design
- **Header Burger Menu & Drawer**: Full-screen slide-in mobile navigation drawer with backdrop blur and automatic auto-closing on link or brand interaction.
- **Mobile Movie Grid**: Fluid 2-column grid layout on mobile screens (`repeat(2, minmax(0, 1fr))`).
- **Responsive 2×2 Watchlist Category Pills**: Evenly distributed 50% width category pills on mobile devices.
- **Bottom-Sheet Modal**: On mobile devices ($\le 768\text{px}$), the details modal transitions into an ergonomic bottom sheet.

### 7. 🔔 Minimalist Toast Notifications
- Compact, unobtrusive feedback toast in the bottom-right corner for all queue and favorite actions.
- State-specific icons and colors (Emerald for added, Red for removed, Amber for status updates).

---

## 🛠️ Technology Stack & Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **Vue.js 3** (Options API) | Reactive data binding, computed properties, conditional rendering, list rendering, event handling |
| **Build Tool** | **Vite 8** | Ultra-fast local development server, hot module replacement (HMR), optimized production bundling |
| **Styling & Design** | **Modern CSS3** | Custom CSS variables, Glassmorphism, CSS Grid, Flexbox, Keyframe animations, Media queries |
| **Data Source** | **TMDB API (v3)** | Real-time movie catalog, search index, credits, trailer videos, and backdrop imagery |
| **Typography & Icons** | **Google Fonts (Inter)** & **FontAwesome 6** | Clean sans-serif typography and vector iconography |
| **Backend API** | **Express 5 + PostgreSQL + JWT** | Layered (routes, controllers, services, repositories) REST API with token auth, per-user watchlist/favorites/search history/settings, and a TMDB proxy that keeps the API key server-side |
| **Migrations** | **node-pg-migrate** | Plain SQL migration files in `backend/migrations` |

---

## 📁 Project Directory Structure

```text
cinevault/
├── frontend/           # Vue 3 + Vite frontend
│   ├── index.html      # Semantic HTML5 template, Vue root mounting point, SVG/FA icons, modals
│   ├── app.js          # Vue 3 application logic, state, methods, computed properties, TMDB API services
│   ├── style.css       # Complete design system, theme variables, glassmorphism, responsive breakpoints
│   ├── package.json    # Project metadata, scripts, dependencies (Vue 3, Vite)
│   └── vite.config.js  # Vite build and plugin configurations
├── backend/            # Express + PostgreSQL API
│   ├── migrations/     # SQL migrations (node-pg-migrate)
│   ├── src/
│   │   ├── routes/         # URL -> controller wiring
│   │   ├── controllers/    # HTTP in/out
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # SQL queries
│   │   ├── middlewares/    # Auth, validation, rate limits, error handling
│   │   ├── validators/     # zod input schemas
│   │   └── clients/        # TMDB client
│   └── test/           # API tests (node:test)
├── .gitignore          # Version control ignore definitions
└── README.md           # Project documentation and assignment walkthrough
```

---

## ⚙️ Installation & Local Setup

### Prerequisites
- **Node.js** (version `>=22`) and **npm**
- **PostgreSQL** (12 or newer)
- A free **TMDB API key** (https://www.themoviedb.org/settings/api)

The frontend never talks to TMDB directly. It calls the Express API (`/api/...`), which proxies TMDB so the key stays on the server. Watchlist, favorites, recent searches and the theme preference are saved per user account in PostgreSQL.

### 1. Database

Create a PostgreSQL role and an empty database:

```bash
sudo -u postgres psql -c "CREATE USER den WITH PASSWORD 'secret';" -c "CREATE DATABASE cinevault OWNER den;"
```

### 2. Backend (Express API) — `cinevault/backend`

```bash
cd cinevault/backend
npm install
cp .env.example .env
```

Fill in `backend/.env`:

```env
PORT=8000
DATABASE_URL=postgres://den:secret@127.0.0.1:5432/cinevault
JWT_SECRET=a_long_random_string   # e.g. openssl rand -hex 32
TMDB_API_KEY=your_tmdb_api_key
```

Create the tables and start the API on `http://127.0.0.1:8000`:

```bash
npm run migrate
npm run dev      # or: npm start
```

| Command | What it does |
| :--- | :--- |
| `npm run migrate` | Applies all pending SQL migrations |
| `npm run migrate:down` | Undoes the latest migration |
| `npm run migrate:create -- add-something` | Creates a new SQL migration file in `migrations/` |
| `npm test` | Runs the API tests (they create and delete their own throwaway users) |

### 3. Frontend (Vue 3 + Vite) — `cinevault/frontend`

Open a second terminal:

```bash
cd cinevault/frontend
npm install
npm run dev
```

*The app launches at `http://localhost:5173/`. Vite proxies every `/api` request to the Express server on port 8000, so start the backend first.*

Other scripts: `npm run build` (production build) and `npm run preview` (preview the build).

### 4. Using the app
- Browsing, searching and trailers work without an account.
- Click **Sign in** to create an account. Adding to the Watchlist or Favorites asks you to sign in first.

### API overview (`/api`)

| Area | Endpoints |
| :--- | :--- |
| Auth | `POST /register`, `POST /login`, `POST /logout`, `GET /user` |
| Movies (TMDB proxy) | `GET /movies/category/{popular\|trending\|top_rated\|now_playing\|upcoming}`, `GET /movies/search?query=`, `GET /movies/{id}`, `GET /genres` |
| Watchlist | `GET`, `POST /watchlist`, `PATCH /watchlist/{id}` (status), `DELETE /watchlist/{id}`, `DELETE /watchlist/completed` |
| Favorites | `GET`, `POST /favorites`, `DELETE /favorites/{id}` |
| Recent searches | `GET`, `POST /recent-searches`, `DELETE /recent-searches/{id}`, `DELETE /recent-searches` |
| Settings | `GET`, `PUT /settings` (`dark_mode`) |
| Health | `GET /hello` |

Everything except register, login, `hello` and the movie routes requires an `Authorization: Bearer <token>` header.

---

## 📋 Assignment Requirements Compliance Checklist

| Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **Single Page Application (SPA)** | Built as a unified Vue 3 SPA with dynamic tab routing (`discover`, `watchlist`, `favorites`) without page reloads. | ✅ Fulfilled |
| **Live API Integration** | Connected to TMDB REST API v3 for fetching live movie catalogs, search queries, credits, and YouTube trailers. | ✅ Fulfilled |
| **Search & Filtering** | Real-time search, 19 genre filters, rating threshold filtering, and multi-criteria sorting. | ✅ Fulfilled |
| **Watchlist / Queue Management** | Add/remove movies, assign statuses (*Plan to Watch*, *Watching*, *Completed*), and sub-filter the queue. | ✅ Fulfilled |
| **Favorites System** | 1-click favorite bookmarking with real-time reactive badge counters. | ✅ Fulfilled |
| **Modal & Media Playback** | Interactive details modal with responsive embedded YouTube trailer and cast credits. | ✅ Fulfilled |
| **Data Persistence** | Watchlist, favorites, search history and theme are stored per user through the Express API in PostgreSQL and restored on reload. | ✅ Fulfilled |
| **Dark & Light Themes** | Complete CSS token-based theming with smooth toggle transition and persistent state. | ✅ Fulfilled |
| **Responsive Design** | Full responsiveness verified on mobile ($\le 480\text{px}$, $\le 640\text{px}$, $\le 768\text{px}$), tablets, and desktop displays. | ✅ Fulfilled |
| **Clean UI / UX** | Glassmorphism styling, compact toast notifications, and zero layout overflow. | ✅ Fulfilled |
| **Group Authors Credited** | Authors explicitly credited in the footer and README documentation. | ✅ Fulfilled |

---

## 📄 License & Attribution

- **Developed by**: Aviso, John Carl · Baydal, Lourden · Patigas, John Paul
- **Attribution**: This product uses the TMDB API but is not endorsed or certified by TMDB.
- **Academic Use**: Developed for academic project evaluation.
