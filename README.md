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
- **Persistent LocalStorage**: All watchlist entries, watch statuses, favorites, recent search terms, and theme settings are automatically synchronized and persisted in `localStorage`.

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
| **Persistence** | **Browser LocalStorage** | Client-side persistent storage for watchlist, favorites, search history, and theme mode |

---

## 📁 Project Directory Structure

```text
cinevault/
├── index.html          # Semantic HTML5 template, Vue root mounting point, SVG/FA icons, modals
├── app.js              # Vue 3 application logic, state, methods, computed properties, TMDB API services
├── style.css           # Complete design system, theme variables, glassmorphism, responsive breakpoints
├── package.json        # Project metadata, scripts, dependencies (Vue 3, Vite)
├── vite.config.js      # Vite build and plugin configurations
├── .gitignore          # Version control ignore definitions
└── README.md           # Project documentation and assignment walkthrough
```

---

## ⚙️ Installation & Local Setup

### Prerequisites
- **Node.js** (version `^22.18.0` or `>=24.12.0` recommended)
- **npm** package manager

### Step-by-Step Setup

1. **Clone or Navigate to the Project Directory**:
   ```bash
   cd cinevault
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   *The application will launch locally at `http://localhost:5173/` (or the port specified in terminal).*

4. **Build for Production**:
   ```bash
   npm run build
   ```

5. **Preview Production Build**:
   ```bash
   npm run preview
   ```

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
| **Data Persistence** | Seamless client-side state caching using `localStorage` across page reloads. | ✅ Fulfilled |
| **Dark & Light Themes** | Complete CSS token-based theming with smooth toggle transition and persistent state. | ✅ Fulfilled |
| **Responsive Design** | Full responsiveness verified on mobile ($\le 480\text{px}$, $\le 640\text{px}$, $\le 768\text{px}$), tablets, and desktop displays. | ✅ Fulfilled |
| **Clean UI / UX** | Glassmorphism styling, compact toast notifications, and zero layout overflow. | ✅ Fulfilled |
| **Group Authors Credited** | Authors explicitly credited in the footer and README documentation. | ✅ Fulfilled |

---

## 📄 License & Attribution

- **Developed by**: Aviso, John Carl · Baydal, Lourden · Patigas, John Paul
- **Attribution**: This product uses the TMDB API but is not endorsed or certified by TMDB.
- **Academic Use**: Developed for academic project evaluation.
