# /\*

# 📱 APP NAME: Watchly

🧭 PURPOSE:
A movie and TV tracking app that lets users:

1. Discover movies, dramas, and series released till date.
2. Get updates about upcoming releases.
3. View detailed information (synopsis, release date, runtime, genres, ratings, cast).
4. Add items to:
   - "Watch Later" list
   - "Watched" list
5. Track total watch time of all completed items.

The app will use the TMDb API for all data (movies, shows, etc.).
It will NOT stream or download media — only display information.

=================================
⚙️ TECH STACK
=================================
Frontend: React (or React Native if mobile)
Backend (optional): Node.js/Express (for secure API calls)
Database: localStorage (initially), can later move to Firebase or MongoDB
API: TMDb (The Movie Database API)

=================================
🧩 CORE FEATURES
=================================

1. 🔍 HOME SCREEN:

   - Display popular, trending, and upcoming movies/series.
   - Include search bar to find any movie or series by name.
   - Show poster, title, release year, and rating for each item.
   - Clicking any item opens a Details Page.

2. 📄 DETAILS PAGE:

   - Show poster, title, release date, genres, overview, cast, and TMDb rating.
   - Include “Add to Watch Later” and “Mark as Watched” buttons.
   - When "Mark as Watched" is clicked:
     - Move it from "Watch Later" → "Watched".
     - Add its runtime to total watched hours counter.

3. 🎬 WATCH LATER SECTION:

   - List all saved movies/series added by user.
   - Allow removing or marking as watched.

4. ✅ WATCHED SECTION:

   - Show all completed items.
   - Display total combined watch time (sum of all runtimes).
   - Allow filtering (by genre, type, date watched, etc.).
   - Allow deleting entries.

5. 📅 UPCOMING RELEASES:

   - Fetch from TMDb “upcoming” endpoint.
   - Show countdown to release dates.

6. ⏱ TOTAL WATCH TIME TRACKER:

   - Display in user profile or dashboard.
   - Example: “You’ve watched 143 hours of content so far.”

7. ⚙️ SETTINGS / PROFILE:
   - Theme toggle (light/dark mode).
   - Optional user login (later with Firebase Auth).
   - Reset all data button.

=================================
🔐 TMDB API INTEGRATION
=================================
Use your TMDb API key safely:

- Store it in a `.env` file as: REACT_APP_TMDB_KEY=your_api_key_here
- For requests, use:
  `https://api.themoviedb.org/3/`
  Example endpoints:
  - `/trending/all/day`
  - `/movie/upcoming`
  - `/search/movie?query=`
  - `/tv/popular`
  - `/movie/{movie_id}` (for details)
  - `/movie/{movie_id}/credits` (for cast)

Use Axios or Fetch for API calls.

=================================
💾 DATA STORAGE
=================================
Phase 1: Use browser localStorage to store:

- Watch Later list
- Watched list
- Total watched time

Phase 2: Add Firebase (optional) for sync across devices.

=================================
🎨 UI DESIGN (clean & minimal)
=================================

- Home → grid of posters with hover effect.
- Details → large poster, clean text, clear buttons.
- Watch Later & Watched → simple list with small thumbnails.
- Use Tailwind CSS for styling.
- Dark mode as default, toggle available in Settings.

=================================
📱 COMPONENT STRUCTURE
=================================
App.js
├── components/
│ ├── Navbar.jsx
│ ├── MovieCard.jsx
│ ├── MovieList.jsx
│ ├── SearchBar.jsx
│ └── ThemeToggle.jsx
├── pages/
│ ├── Home.jsx
│ ├── Details.jsx
│ ├── WatchLater.jsx
│ ├── Watched.jsx
│ ├── Upcoming.jsx
│ └── Settings.jsx
├── utils/
│ ├── api.js (for TMDb calls)
│ └── storage.js (localStorage helper)
├── App.css or Tailwind styles
├── index.js
└── .env

=================================
🧠 FUTURE UPGRADES
=================================

- Firebase authentication & cloud sync.
- AI-based recommendation system (using watched history).
- Social features (friends, share watch lists).
- Notifications for new releases in your favorite genres.
- Analytics dashboard showing stats (hours watched, genres, etc.).
- Responsive design for mobile and desktop.

=================================
💬 INSTRUCTIONS FOR COPILOT
=================================
Generate the full React app for “Watchly” with all pages and features described above.
Use TMDb API integration as outlined.
Implement localStorage handling for lists and total watch time.
Use Tailwind CSS for styling.
Comment code clearly for readability.
Build step by step, starting from the App structure, then pages, then components.
\*/
