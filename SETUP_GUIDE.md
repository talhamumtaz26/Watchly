# 🚀 Watchly - Complete Setup Guide

## Quick Start

Follow these steps to get Watchly up and running:

### Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages:

- react & react-dom
- react-router-dom (for routing)
- axios (for API calls)
- tailwindcss (for styling)
- And other development dependencies

### Step 2: Get Your TMDb API Key

1. Go to [The Movie Database (TMDb)](https://www.themoviedb.org/)
2. Sign up for a free account (if you don't have one)
3. Go to Settings → API → Request an API Key
4. Fill out the form and get your API key

### Step 3: Configure API Key

1. Open the `.env` file in the project root directory
2. Replace `your_api_key_here` with your actual TMDb API key:

```env
REACT_APP_TMDB_KEY=your_actual_api_key_here
REACT_APP_TMDB_BASE_URL=https://api.themoviedb.org/3
REACT_APP_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

⚠️ **Important**: Never commit your `.env` file with the real API key to version control!

### Step 4: Start the App

Run the development server:

```bash
npm start
```

The app will open at `http://localhost:3000`

## Features Overview

### 🏠 Home Page

- Browse trending, popular movies, and TV shows
- Search functionality with live results
- Clean grid layout with poster images

### 🔍 Details Page

- View comprehensive information about any movie/TV show
- See cast, ratings, genres, and overview
- Add to Watch Later or mark as Watched
- Navigate back to previous page

### 📚 Watch Later

- Save movies and TV shows you plan to watch
- View stats (total items, movies, TV shows, estimated time)
- Mark items as watched directly from the list
- Remove items from the list

### ✅ Watched

- Track all completed content
- Filter by type (All, Movies, TV Shows)
- Sort by date, rating, or title
- View detailed watch statistics
- Remove items if needed

### 📅 Upcoming

- Browse upcoming movie releases
- See countdown to release dates
- Add upcoming movies to Watch Later
- View release dates and overview

### ⚙️ Settings

- Toggle between dark and light themes
- Export your data as a JSON backup
- Import data from a backup file
- Clear all data (with confirmation)
- View app information and features

## Troubleshooting

### Problem: API not working

**Solution**: Make sure you've added your TMDb API key in the `.env` file and restarted the server.

### Problem: Styles not loading

**Solution**: Ensure Tailwind CSS is properly configured and PostCSS is installed.

### Problem: Images not loading

**Solution**: Check your internet connection and verify the TMDb API is accessible.

### Problem: Data not persisting

**Solution**: Make sure localStorage is enabled in your browser and you're not in private/incognito mode.

## Browser Compatibility

Watchly works best on modern browsers:

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Tips for Best Experience

1. **Add your TMDb API key first** - The app won't work without it
2. **Use dark mode** - It's enabled by default and easier on the eyes
3. **Export your data regularly** - Keep backups of your watch lists
4. **Browse upcoming releases** - Stay updated with new content
5. **Track your watch time** - See how much content you've consumed

## Next Steps

After setup:

1. Browse the home page to see trending content
2. Search for your favorite movies or shows
3. Add items to your Watch Later list
4. Mark items as watched to track your progress
5. Explore settings to customize your experience

## Need Help?

- Check the main README.md for more details
- Review the code comments for implementation details
- Open an issue on GitHub if you find bugs

---

Happy Watching! 🍿
