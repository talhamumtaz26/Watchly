# Watchly 

A modern, feature-rich Progressive Web App (PWA) for tracking movies, TV shows, and anime. Built with React and powered by The Movie Database (TMDb) API, Watchly offers a seamless experience across web and mobile platforms.

![React](https://img.shields.io/badge/React-18.x-blue)
![Capacitor](https://img.shields.io/badge/Capacitor-Latest-blue)
![Firebase](https://img.shields.io/badge/Firebase-Enabled-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

### Content Discovery

- **Streaming & Theatre Content** - Discover what's popular on streaming platforms and in theatres
- **Movies, Series & Anime** - Browse 12 items per category with "View All" option for infinite scrolling
- **Genre Exploration** - Filter content by your favorite genres
- **Search Functionality** - Find any movie, TV show, or anime instantly
- **Upcoming Releases** - Browse future releases across all content types (movies, series, anime)

### User Experience

- **Installable Web App** - Install on supported devices
- **Android App Support** - Built with Capacitor for native Android experience
- **Smart Back Navigation** - Double-tap to exit from home, intuitive navigation throughout
- **Scroll Position Memory** - Returns to exact scroll position when navigating back
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Consistent Library Layout** - Shared responsive poster grids across
  discovery and personal-library pages

### Personal Library

- **Watch Later List** - Save content you want to watch
- **Watched Collection** - Track what you've completed with sorting and filtering
- **Total Watch Time** - See your accumulated viewing hours
- **Cloud Sync** - Firebase integration for cross-device synchronization
- **Data Export/Import** - Backup and restore your data anytime

### Authentication

- **Firebase Auth** - Secure user authentication
- **Author** - Talha Mumtaz
- **Protected Routes** - Secure access to personal features
- **User Profiles** - Personalized experience for each user

## Release hardening

See [RELEASE.md](RELEASE.md) for the required TMDb proxy deployment, key rotation,
signed Android App Bundle steps, App Links setup, and device verification.
Discovery requires the deployed proxy; TMDb credentials belong in the Cloudflare Worker
secret, never in the frontend environment.

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **TMDb API Key** (free) - [Get it here](https://www.themoviedb.org/settings/api)
- **Firebase Project** (optional for auth) - [Firebase Console](https://console.firebase.google.com/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/talhamumtaz26/watchly.git
   cd watchly
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up TMDb API Key:**

   - Sign up at [TMDb](https://www.themoviedb.org/)
   - Go to Settings → API
   - Request a free API key

4. **Configure environment variables:**

   Create a `.env` file in the project root:

   ```env
   REACT_APP_TMDB_PROXY_URL=https://watchly-proxy.YOUR-SUBDOMAIN.workers.dev
   REACT_APP_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
   ```

5. **Set up Firebase (optional):**

   Add these Firebase values to the same `.env` file:

   ```env
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

   Watchly uses Firebase Authentication and Firestore. Deploy the repository's
   owner-only rules before using cloud sync:

   ```bash
   firebase deploy --only firestore:rules
   ```

6. **Start the development server:**

   ```bash
   npm start
   ```

7. **Open in browser:**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

**Web Build:**

```bash
npm run build
```

**Android Build:**

```bash
npm run build
npx cap sync android
npx cap open android
```

To build an APK from Android Studio:

1. Install Android Studio with the Android SDK, SDK Platform, and an Android
   SDK Build-Tools version.
2. Install a supported JDK and configure Android Studio to use it under
   **Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle
   JDK**.
3. Run the web build and Capacitor sync:

   ```bash
   npm run build
   npx cap sync android
   npx cap open android
   ```

4. In Android Studio, wait for Gradle sync to finish.
5. For a test APK, select **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
   The debug APK is written under
   `android/app/build/outputs/apk/debug/app-debug.apk`.
6. For a release APK, select **Build → Generate Signed Bundle / APK**, choose
   **APK**, create or select a keystore, and complete the signing wizard.
   Keep the keystore and passwords private and backed up.

The command-line debug build can also be run from the Android directory:

```bash
cd android
gradlew.bat assembleDebug
```

## Tech Stack

### Frontend

- **React 18** - Modern React with hooks and concurrent features
- **React Router v6** - Client-side routing with advanced navigation
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests

### Mobile & PWA

- **Capacitor** - Cross-platform native runtime
- **Web App Manifest** - PWA installation

### Backend & Storage

- **Firebase Authentication** - User management
- **Cloud Firestore** - User libraries, watch-time stats, and realtime sync
- **Session Storage** - State persistence
- **Local Storage** - Offline data caching

### Watch-time and sync behavior

- Dashboard and Watched use the same calculated total from the Watched
  collection and the shared `formatWatchTime()` helper.
- TV items without a runtime use the episode runtime and episode-count
  fallback already used by the Watched collection.
- Firestore watch-time stats are rebuilt from Watched items when cloud stats
  are read and after bidirectional sync, so stale incremental totals do not
  override the collection.
- Manual Sync Now performs a safe merge: local-only records upload,
  cloud-only records download, duplicates are skipped, and no records are
  automatically deleted.
- Recent activity accepts Firestore Timestamp values, ISO strings, numeric
  timestamps, and legacy `watchedAt`/`addedDate` fields. Missing or invalid
  dates display as `Earlier`.

### APIs

- **TMDb API** - Movie, TV, and anime data
- **TMDb Discover** - Advanced filtering and sorting

## Project Structure

```
Watchly/
├── android/                    # Capacitor Android project
├── public/
│   ├── index.html             # HTML entry point
│   └── manifest.json          # PWA manifest
├── src/
│   ├── components/
│   │   ├── BottomNav.jsx      # Mobile bottom navigation
│   │   ├── LoadingSpinner.jsx # Loading states
│   │   ├── MovieCard.jsx      # Content card component
│   │   ├── MovieList.jsx      # Content list with carousel
│   │   ├── Navbar.jsx         # Top navigation bar
│   │   ├── ProtectedRoute.jsx # Auth route protection
│   │   └── Toast.jsx          # Notification system
│   ├── contexts/
│   │   └── AuthContext.jsx    # Authentication context
│   ├── firebase/
│   │   └── config.js          # Firebase configuration
│   ├── pages/
│   │   ├── Home.jsx           # Main landing page
│   │   ├── ViewAll.jsx        # Infinite scroll view
│   │   ├── Details.jsx        # Content detail page
│   │   ├── Search.jsx         # Search results
│   │   ├── Genre.jsx          # Genre-filtered content
│   │   ├── Actor.jsx          # Actor details and filmography
│   │   ├── Upcoming.jsx       # Upcoming releases
│   │   ├── WatchLater.jsx     # Watch later list
│   │   ├── Watched.jsx        # Watched collection
│   │   ├── Settings.jsx       # App settings
│   │   ├── AppSettings.jsx    # Application preferences
│   │   ├── Dashboard.jsx      # User dashboard
│   │   └── Login.jsx          # Authentication page
│   ├── utils/
│   │   ├── api.js             # TMDb API integration
│   │   ├── storage.js         # Local storage utilities
│   │   ├── cloudStorage.js    # Firestore cloud storage and sync
│   │   └── watchStats.js      # Shared watch-time and date normalization
│   ├── App.js                 # Root component with routing
│   ├── App.css               # Global styles
│   ├── index.js              # React entry point
│   └── index.css             # Tailwind imports
├── .env                       # Environment variables
├── capacitor.config.ts        # Capacitor configuration
├── firebase.json              # Firebase settings
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind configuration
└── postcss.config.js          # PostCSS configuration
```
## Deployment

### Web Deployment

Deploy to any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop `build` folder
- **Firebase Hosting**: `firebase deploy`

### Android Deployment

1. Build the web app: `npm run build`
2. Sync with Capacitor: `npx cap sync android`
3. Open in Android Studio: `npx cap open android`
4. Build APK or AAB for Google Play Store

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit your changes:** `git commit -m 'Add amazing feature'`
4. **Push to the branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Test on multiple devices/browsers
- Update documentation as needed
- Keep commits focused and descriptive

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

Found a bug or have a question?

- Open an [issue on GitHub](https://github.com/talhamumtaz26/Watchly/issues)
- Email: [talhamalik2604@gmail.com]

## Show Your Support

Give a ⭐️ if this project helped you!

---

**Made with ❤️ by [Talha Mumtaz](https://github.com/talhamumtaz26)**
