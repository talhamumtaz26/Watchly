# Watchly 🎬

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

- **Progressive Web App (PWA)** - Install on any device and use offline
- **Android App Support** - Built with Capacitor for native Android experience
- **Smart Back Navigation** - Double-tap to exit from home, intuitive navigation throughout
- **Scroll Position Memory** - Returns to exact scroll position when navigating back
- **Responsive Design** - Optimized for mobile, tablet, and desktop

### Personal Library

- **Watch Later List** - Save content you want to watch
- **Watched Collection** - Track what you've completed with sorting and filtering
- **Total Watch Time** - See your accumulated viewing hours
- **Cloud Sync** - Firebase integration for cross-device synchronization
- **Data Export/Import** - Backup and restore your data anytime

### Authentication

- **Firebase Auth** - Secure user authentication
- **Protected Routes** - Secure access to personal features
- **User Profiles** - Personalized experience for each user

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
   REACT_APP_TMDB_KEY=your_tmdb_api_key_here
   REACT_APP_TMDB_BASE_URL=https://api.themoviedb.org/3
   REACT_APP_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
   ```

5. **Set up Firebase (optional):**

   Add your Firebase configuration to `src/firebase/config.js`:

   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     storageBucket: "your-storage-bucket",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id",
   };
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

## Tech Stack

### Frontend

- **React 18** - Modern React with hooks and concurrent features
- **React Router v6** - Client-side routing with advanced navigation
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests

### Mobile & PWA

- **Capacitor** - Cross-platform native runtime
- **Service Workers** - Offline support and caching
- **Web App Manifest** - PWA installation

### Backend & Storage

- **Firebase Authentication** - User management
- **Firebase Cloud Storage** - Data synchronization
- **Session Storage** - State persistence
- **Local Storage** - Offline data caching

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
│   │   ├── GenreFilter.jsx    # Genre filtering component
│   │   ├── LoadingSpinner.jsx # Loading states
│   │   ├── MovieCard.jsx      # Content card component
│   │   ├── MovieList.jsx      # Content list with carousel
│   │   ├── Navbar.jsx         # Top navigation bar
│   │   ├── ProtectedRoute.jsx # Auth route protection
│   │   ├── SearchBar.jsx      # Search functionality
│   │   ├── ThemeToggle.jsx    # Dark/light mode toggle
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
│   │   └── cloudStorage.js    # Firebase cloud storage
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

## Usage Guide

### Browsing Content

1. Launch the app to see popular content across categories
2. Tap any content card to view detailed information
3. Use the "View All" arrow to see more items with infinite scroll
4. Swipe between pages using bottom navigation

### Managing Your Library

1. **Add to Watch Later:**

   - Tap any content card
   - Click "Add to Watch Later" button
   - Access from Watch Later page

2. **Mark as Watched:**

   - Open Watch Later list
   - Click "✓ Watched" button
   - Automatically moves to Watched collection
   - Adds to total watch time

3. **Filter & Sort Watched:**
   - Open Watched page
   - Use filter buttons for type (All/Movies/TV)
   - Sort by date added or title

### Searching

1. Tap search icon in navigation
2. Type movie, TV show, or anime name
3. Results appear in real-time
4. Tap any result for details

### Theme & Settings

1. Access Settings for:
   - Export data (JSON file)
   - Import data from backup
   - Clear all data
   - Sign out

## Data & Privacy

### Local Storage

- Watch Later list
- Watched collection
- Total watch time
- Theme preference
- Session states

### Cloud Storage (Firebase)

- Synchronized across devices when logged in
- Secure user authentication
- Optional - app works without login

### Data Export/Import

- Export your data as JSON anytime
- Import to restore or transfer data
- No data lock-in

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
