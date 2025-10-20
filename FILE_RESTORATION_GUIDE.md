# 🔧 File Restoration Guide

## Issue

Three files got corrupted during editing: Search.jsx, WatchLater.jsx, and Watched.jsx

## Solution

Copy and paste the complete file contents below into each respective file.

---

## File 1: src/pages/Search.jsx

**Path:** `d:\Talha\Watchly\src\pages\Search.jsx`

**Instructions:**

1. Delete the existing `src\pages\Search.jsx` file
2. Create a new file `src\pages\Search.jsx`
3. Copy ALL the content below and paste it:

```jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchMedia, getImageUrl } from "../utils/api";
import { FiSearch } from "react-icons/fi";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length > 2) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await searchMedia(query, "multi", 1);
      setResults(data.results.slice(0, 20));
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (item) => {
    const mediaType = item.media_type || (item.title ? "movie" : "tv");
    navigate(`/details/${mediaType}/${item.id}`);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Sticky Search Header */}
      <div className="sticky top-16 z-30 bg-black border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          {/* Search Input */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for movies, TV shows, actors..."
                className="w-full px-5 py-3 pl-12 bg-card-dark text-white rounded-xl border border-gray-800 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all text-base"
                autoFocus
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            </div>
            {loading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Container */}
      <div className="container mx-auto px-4">
        {results.length === 0 && query.trim().length === 0 ? (
          <div
            className="flex items-center justify-center"
            style={{ height: "calc(100vh - 10rem)" }}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Start Searching
              </h2>
              <p className="text-gray-400">
                Type to search for movies, TV shows, and more...
              </p>
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="py-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {results.map((item) => {
                const title = item.title || item.name;
                const mediaType =
                  item.media_type || (item.title ? "movie" : "tv");
                const year =
                  item.release_date?.split("-")[0] ||
                  item.first_air_date?.split("-")[0];

                return (
                  <div
                    key={`${mediaType}-${item.id}`}
                    onClick={() => handleResultClick(item)}
                    className="bg-card-dark rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg"
                  >
                    <div className="relative">
                      <img
                        src={getImageUrl(item.poster_path, "w500")}
                        alt={title}
                        className="w-full h-72 object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/500x750/1F2937/9CA3AF?text=No+Image";
                        }}
                      />
                      {item.vote_average > 0 && (
                        <div className="absolute top-2 right-2 bg-black/95 text-yellow-500 px-2 py-1 rounded-lg text-xs font-bold">
                          ⭐ {item.vote_average.toFixed(1)}
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                        {title}
                      </h3>
                      <p className="text-xs text-gray-400">
                        <span className="text-red-600 capitalize">
                          {mediaType}
                        </span>
                        {year && ` • ${year}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : query.trim().length > 2 && !loading ? (
          <div
            className="flex items-center justify-center"
            style={{ height: "calc(100vh - 10rem)" }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                No results found
              </h2>
              <p className="text-gray-400">
                Try searching with different keywords
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Search;
```

---

## ✅ After Replacing All 3 Files

Run these commands:

```powershell
npm run build
npx cap sync android
npx cap open android
```

Then build the APK in Android Studio!
