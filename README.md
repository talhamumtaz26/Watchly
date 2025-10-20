# Watchly 🎬

A modern movie and TV tracking app built with React and the TMDb API.

## Features

✨ **Discover** trending movies and TV shows  
🔍 **Search** for any movie or series  
📄 **View Details** with cast, ratings, and more  
📚 **Watch Later** - Save content to watch  
✅ **Watched** - Track completed content  
⏱️ **Watch Time** - See total hours watched  
📅 **Upcoming** - Browse upcoming releases  
🌓 **Dark/Light Mode** - Theme support  
💾 **Data Export/Import** - Backup your lists

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- TMDb API Key (free)

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd Watchly
```

2. Install dependencies:

```bash
npm install
```

3. Get your TMDb API Key:

   - Go to [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
   - Sign up for a free account
   - Request an API key

4. Configure environment variables:

   - Open the `.env` file in the project root
   - Replace `your_api_key_here` with your actual TMDb API key:

   ```
   REACT_APP_TMDB_KEY=your_actual_api_key_here
   REACT_APP_TMDB_BASE_URL=https://api.themoviedb.org/3
   REACT_APP_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
   ```

5. Start the development server:

```bash
npm start
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Frontend**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Data Storage**: localStorage
- **API**: The Movie Database (TMDb)

## Project Structure

```
Watchly/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── MovieCard.jsx
│   │   ├── MovieList.jsx
│   │   ├── SearchBar.jsx
│   │   └── ThemeToggle.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Details.jsx
│   │   ├── WatchLater.jsx
│   │   ├── Watched.jsx
│   │   ├── Upcoming.jsx
│   │   └── Settings.jsx
│   ├── utils/
│   │   ├── api.js
│   │   └── storage.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── .env
├── .gitignore
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm build`

Builds the app for production to the `build` folder

### `npm test`

Launches the test runner

## Usage

### Adding to Watch Later

1. Browse or search for a movie/TV show
2. Click on the item to view details
3. Click "Add to Watch Later" button

### Marking as Watched

1. Go to Watch Later list
2. Click "✓ Watched" on any item
3. The item moves to Watched and adds to your total watch time

### Managing Lists

- **Watch Later**: View and manage items you plan to watch
- **Watched**: View completed items with filtering and sorting options
- **Settings**: Export/import data, clear all data, change theme

## Data Storage

All data is stored locally in your browser using localStorage:

- Watch Later list
- Watched list
- Total watch time
- Theme preference

You can export your data as a JSON file and import it later.

## Future Enhancements

- 🔐 User authentication with Firebase
- ☁️ Cloud sync across devices
- 🤖 AI-based recommendations
- 👥 Social features (share lists, follow friends)
- 🔔 Release notifications
- 📊 Advanced analytics dashboard
- 📱 Mobile responsive improvements

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Data provided by [The Movie Database (TMDb)](https://www.themoviedb.org/)
- This product uses the TMDb API but is not endorsed or certified by TMDb

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Made with ❤️ by Watchly Team
