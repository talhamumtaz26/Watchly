# 🚀 Watchly - Quick Feature Reference

## New Features Quick Access Guide

### 🏠 Home Page

- **Genre Filter**: Chips at top (all 19 genres)
- **Load More**: Buttons at bottom of Movies/TV sections
- **Search**: Top bar with live results
- **Trending**: Only visible when no genre filter active

### 📄 Details Page

- **Trailers**: Embedded YouTube player
- **Track Episodes**: TV shows only, button below actions
- **Similar Content**: Scrollable section at bottom
- **Reviews**: Top 3 user reviews displayed
- **Cast**: Visual grid with photos

### 📺 Episode Tracking (TV Shows)

1. Click "📺 Track Episodes" on details page
2. View all seasons with progress bars
3. Click "View Episodes" on any season
4. Mark individual episodes as watched
5. Progress auto-updates

### 📊 Dashboard

- **Location**: Navbar → Dashboard
- **Features**:
  - Overview stats (4 cards)
  - Content type distribution
  - Rating distribution
  - Recent activity (last 5)
  - Top rated (top 5)
  - Quick action buttons

### 📚 Watch Later

- Mark items as watched directly
- Remove items with confirmation
- View stats (total, movies, TV, time)
- Toast notifications for actions

### ✅ Watched

- Filter: All / Movies / TV Shows
- Sort: Date / Rating / Title
- View detailed watch stats
- Remove items with confirmation
- Toast notifications

### 📅 Upcoming

- Countdown timers to release
- Add to Watch Later
- Released/Unreleased badges
- Toast notifications

### ⚙️ Settings

- Export data (JSON backup)
- Import data (restore from backup)
- Clear all data (with double confirmation)
- Theme toggle (also in navbar)
- Toast notifications for all actions

## Keyboard Shortcuts

- **Esc**: Close modals/popups
- **Search**: Focus search bar (when on home page)

## Toast Notifications

All browser alerts replaced with elegant toasts:

- **Green**: Success messages
- **Red**: Error messages
- **Yellow**: Warning messages
- **Blue**: Info messages

Auto-dismiss after 3 seconds, or click X to close.

## Tips & Tricks

1. **Genre + Load More**: Combine genre filter with load more for deep browsing
2. **Episode Tracking**: Mark episodes as you watch to track progress
3. **Dashboard**: Check regularly to see your viewing patterns
4. **Export Data**: Back up your data before clearing browser storage
5. **Similar Content**: Discover new content from details pages
6. **Trailers**: Watch trailers before adding to Watch Later

## Mobile-Specific Features

- **Genre Filter**: Dropdown instead of chips
- **Responsive Cards**: Optimized grid layouts
- **Touch-Friendly**: All buttons sized for touch
- **Scrollable Sections**: Horizontal scrolling where needed

## Performance Tips

1. **Load More**: Use instead of loading everything at once
2. **Genre Filter**: Narrow down content before browsing
3. **Clear Cache**: If app feels slow, clear browser cache
4. **Export Data**: Regular backups prevent data loss

## Troubleshooting

**Toast notifications not appearing?**

- Check that ToastProvider is wrapping app (it is!)

**Genre filter not working?**

- Clear any existing filters first
- Refresh the page if needed

**Episode tracking not saving?**

- Check localStorage is enabled
- Not in private/incognito mode

**Load more not appearing?**

- You've reached the end of available content
- Try a different genre filter

**Videos not loading?**

- Check internet connection
- Some content may not have trailers
- Try refreshing the page

## API Rate Limits

TMDb API has rate limits:

- 40 requests per 10 seconds
- If you see errors, wait a few seconds

## Data Storage

All data stored in browser localStorage:

- Watch Later list
- Watched list
- Episode tracking
- Total watch time
- Theme preference

**Storage Size**: No practical limit for typical usage

## Browser Compatibility

Tested and working on:

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ⚠️ IE11 (limited support)

---

**Need Help?** Check the main README.md or NEW_FEATURES.md for detailed documentation.
