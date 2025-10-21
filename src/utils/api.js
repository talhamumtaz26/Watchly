import axios from 'axios';

// TMDb API configuration
const API_KEY = process.env.REACT_APP_TMDB_KEY;
const BASE_URL = process.env.REACT_APP_TMDB_BASE_URL;
export const IMAGE_BASE_URL = process.env.REACT_APP_TMDB_IMAGE_BASE_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

// Helper function to get image URL
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return '/placeholder-image.png';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

// API functions

/**
 * Get trending movies/TV shows
 * @param {string} mediaType - 'all', 'movie', or 'tv'
 * @param {string} timeWindow - 'day' or 'week'
 */
export const getTrending = async (mediaType = 'all', timeWindow = 'day') => {
  try {
    const response = await api.get(`/trending/${mediaType}/${timeWindow}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trending:', error);
    throw error;
  }
};

/**
 * Get popular movies
 */
export const getPopularMovies = async (page = 1, sortBy = null, filterYear = null, filterLetter = null) => {
  try {
    // If sortBy is specified, use discover endpoint for sorting
    if (sortBy) {
      const params = { page };
      const today = new Date().toISOString().split('T')[0];
      
      if (sortBy === 'date') {
        params.sort_by = 'release_date.desc';
        params['release_date.lte'] = today; // Only released movies
      } else if (sortBy === 'year') {
        params.sort_by = 'primary_release_date.desc';
        if (filterYear) {
          params.primary_release_year = filterYear;
        }
      } else if (sortBy === 'az') {
        params.sort_by = 'title.asc';
        // TMDB doesn't support letter filtering directly, we'll filter client-side
      } else {
        params.sort_by = 'popularity.desc';
      }
      
      const response = await api.get('/discover/movie', { params });
      
      // Filter by letter client-side if specified
      if (sortBy === 'az' && filterLetter) {
        const filtered = response.data.results.filter(item => 
          (item.title || '').toLowerCase().startsWith(filterLetter.toLowerCase())
        );
        return { ...response.data, results: filtered };
      }
      
      return response.data;
    }
    
    const response = await api.get('/movie/popular', { params: { page } });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

/**
 * Get popular TV shows
 */
export const getPopularTVShows = async (page = 1, sortBy = null, filterYear = null, filterLetter = null) => {
  try {
    // If sortBy is specified, use discover endpoint for sorting
    if (sortBy) {
      const params = { page };
      const today = new Date().toISOString().split('T')[0];
      
      if (sortBy === 'date') {
        params.sort_by = 'first_air_date.desc';
        params['first_air_date.lte'] = today; // Only aired shows
      } else if (sortBy === 'year') {
        params.sort_by = 'first_air_date.desc';
        if (filterYear) {
          params.first_air_date_year = filterYear;
        }
      } else if (sortBy === 'az') {
        params.sort_by = 'name.asc';
      } else {
        params.sort_by = 'popularity.desc';
      }
      
      const response = await api.get('/discover/tv', { params });
      
      // Filter by letter client-side if specified
      if (sortBy === 'az' && filterLetter) {
        const filtered = response.data.results.filter(item => 
          (item.name || '').toLowerCase().startsWith(filterLetter.toLowerCase())
        );
        return { ...response.data, results: filtered };
      }
      
      return response.data;
    }
    
    const response = await api.get('/tv/popular', { params: { page } });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular TV shows:', error);
    throw error;
  }
};

/**
 * Get upcoming movies
 */
export const getUpcomingMovies = async (page = 1) => {
  try {
    const response = await api.get('/movie/upcoming', { params: { page } });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    throw error;
  }
};

/**
 * Get upcoming TV shows (using discover with future air dates)
 */
export const getUpcomingTVShows = async (page = 1) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    const maxDate = sixMonthsLater.toISOString().split('T')[0];

    const response = await api.get('/discover/tv', {
      params: {
        page,
        'first_air_date.gte': today,
        'first_air_date.lte': maxDate,
        sort_by: 'first_air_date.asc'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming TV shows:', error);
    throw error;
  }
};

/**
 * Get upcoming anime (using discover with animation genre and future air dates)
 */
export const getUpcomingAnime = async (page = 1) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    const maxDate = sixMonthsLater.toISOString().split('T')[0];

    const response = await api.get('/discover/tv', {
      params: {
        page,
        with_genres: 16, // Animation genre
        'first_air_date.gte': today,
        'first_air_date.lte': maxDate,
        sort_by: 'first_air_date.asc'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming anime:', error);
    throw error;
  }
};

/**
 * Search for movies or TV shows
 * @param {string} query - Search query
 * @param {string} type - 'movie', 'tv', or 'multi'
 */
export const searchMedia = async (query, type = 'multi', page = 1) => {
  try {
    const response = await api.get(`/search/${type}`, {
      params: { query, page },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching media:', error);
    throw error;
  }
};

/**
 * Get movie details by ID
 * @param {number} movieId - Movie ID
 */
export const getMovieDetails = async (movieId) => {
  try {
    const response = await api.get(`/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

/**
 * Get TV show details by ID
 * @param {number} tvId - TV show ID
 */
export const getTVDetails = async (tvId) => {
  try {
    const response = await api.get(`/tv/${tvId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching TV details:', error);
    throw error;
  }
};

/**
 * Get movie credits (cast and crew)
 * @param {number} movieId - Movie ID
 */
export const getMovieCredits = async (movieId) => {
  try {
    const response = await api.get(`/movie/${movieId}/credits`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie credits:', error);
    throw error;
  }
};

/**
 * Get TV show credits (cast and crew)
 * @param {number} tvId - TV show ID
 */
export const getTVCredits = async (tvId) => {
  try {
    const response = await api.get(`/tv/${tvId}/credits`);
    return response.data;
  } catch (error) {
    console.error('Error fetching TV credits:', error);
    throw error;
  }
};

/**
 * Get similar movies
 * @param {number} movieId - Movie ID
 */
export const getSimilarMovies = async (movieId) => {
  try {
    const response = await api.get(`/movie/${movieId}/similar`);
    return response.data;
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    throw error;
  }
};

/**
 * Get similar TV shows
 * @param {number} tvId - TV show ID
 */
export const getSimilarTVShows = async (tvId) => {
  try {
    const response = await api.get(`/tv/${tvId}/similar`);
    return response.data;
  } catch (error) {
    console.error('Error fetching similar TV shows:', error);
    throw error;
  }
};

/**
 * Get movies by genre
 * @param {number} genreId - Genre ID
 * @param {number} page - Page number
 */
export const getMoviesByGenre = async (genreId, page = 1) => {
  try {
    const response = await api.get('/discover/movie', {
      params: { with_genres: genreId, page },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    throw error;
  }
};

/**
 * Get TV shows by genre
 * @param {number} genreId - Genre ID
 * @param {number} page - Page number
 * @param {string} sortBy - Sort option ('all', 'date', 'year', 'az')
 * @param {string} filterYear - Filter by specific year
 * @param {string} filterLetter - Filter by starting letter
 */
export const getTVShowsByGenre = async (genreId, page = 1, sortBy = null, filterYear = null, filterLetter = null) => {
  try {
    const params = { with_genres: genreId, page };
    const today = new Date().toISOString().split('T')[0];
    
    if (sortBy) {
      if (sortBy === 'date') {
        params.sort_by = 'first_air_date.desc';
        params['first_air_date.lte'] = today; // Only aired shows
      } else if (sortBy === 'year') {
        params.sort_by = 'first_air_date.desc';
        if (filterYear) {
          params.first_air_date_year = filterYear;
        }
      } else if (sortBy === 'az') {
        params.sort_by = 'name.asc';
      } else {
        params.sort_by = 'popularity.desc';
      }
    }
    
    const response = await api.get('/discover/tv', { params });
    
    // Filter by letter client-side if specified
    if (sortBy === 'az' && filterLetter) {
      const filtered = response.data.results.filter(item => 
        (item.name || '').toLowerCase().startsWith(filterLetter.toLowerCase())
      );
      return { ...response.data, results: filtered };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching TV shows by genre:', error);
    throw error;
  }
};

/**
 * Get movie videos (trailers, teasers, etc.)
 * @param {number} movieId - Movie ID
 */
export const getMovieVideos = async (movieId) => {
  try {
    const response = await api.get(`/movie/${movieId}/videos`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie videos:', error);
    throw error;
  }
};

/**
 * Get TV show videos (trailers, teasers, etc.)
 * @param {number} tvId - TV show ID
 */
export const getTVVideos = async (tvId) => {
  try {
    const response = await api.get(`/tv/${tvId}/videos`);
    return response.data;
  } catch (error) {
    console.error('Error fetching TV videos:', error);
    throw error;
  }
};

/**
 * Get movie reviews
 * @param {number} movieId - Movie ID
 */
export const getMovieReviews = async (movieId) => {
  try {
    const response = await api.get(`/movie/${movieId}/reviews`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie reviews:', error);
    throw error;
  }
};

/**
 * Get TV show reviews
 * @param {number} tvId - TV show ID
 */
export const getTVReviews = async (tvId) => {
  try {
    const response = await api.get(`/tv/${tvId}/reviews`);
    return response.data;
  } catch (error) {
    console.error('Error fetching TV reviews:', error);
    throw error;
  }
};

/**
 * Get TV show season details
 * @param {number} tvId - TV show ID
 * @param {number} seasonNumber - Season number
 */
export const getTVSeasonDetails = async (tvId, seasonNumber) => {
  try {
    const response = await api.get(`/tv/${tvId}/season/${seasonNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching TV season details:', error);
    throw error;
  }
};

/**
 * Get movies currently in theatres (now playing)
 * @param {number} page - Page number
 */
export const getNowPlayingMovies = async (page = 1) => {
  try {
    const response = await api.get('/movie/now_playing', { params: { page } });
    return response.data;
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    throw error;
  }
};

/**
 * Get popular content on streaming platforms
 * @param {string} mediaType - 'movie' or 'tv'
 * @param {number} page - Page number
 */
export const getStreamingContent = async (mediaType = 'movie', page = 1) => {
  try {
    // Using discover endpoint to find content available on streaming
    const response = await api.get(`/discover/${mediaType}`, {
      params: {
        page,
        sort_by: 'popularity.desc',
        'with_watch_monetization_types': 'flatrate|free', // Streaming options
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching streaming content:', error);
    throw error;
  }
};

/**
 * Get movies by region and language
 * @param {string} region - Region code (e.g., 'US', 'IN', 'PK')
 * @param {string} language - Language code (e.g., 'en', 'hi', 'ur')
 * @param {number} page - Page number
 */
export const getMoviesByRegion = async (region, language, page = 1) => {
  try {
    const response = await api.get('/discover/movie', {
      params: {
        page,
        region: region || undefined,
        with_original_language: language || undefined,
        sort_by: 'popularity.desc',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movies by region:', error);
    throw error;
  }
};

/**
 * Get actor/person details
 * @param {number} personId - Person ID
 */
export const getPersonDetails = async (personId) => {
  try {
    const response = await api.get(`/person/${personId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching person details:', error);
    throw error;
  }
};

/**
 * Get actor's movie credits
 * @param {number} personId - Person ID
 */
export const getPersonMovieCredits = async (personId) => {
  try {
    const response = await api.get(`/person/${personId}/movie_credits`);
    return response.data;
  } catch (error) {
    console.error('Error fetching person movie credits:', error);
    throw error;
  }
};

/**
 * Get actor's TV credits
 * @param {number} personId - Person ID
 */
export const getPersonTVCredits = async (personId) => {
  try {
    const response = await api.get(`/person/${personId}/tv_credits`);
    return response.data;
  } catch (error) {
    console.error('Error fetching person TV credits:', error);
    throw error;
  }
};

/**
 * Get watch providers (streaming platforms) for a movie
 * @param {number} movieId - Movie ID
 */
export const getMovieWatchProviders = async (movieId) => {
  try {
    const response = await api.get(`/movie/${movieId}/watch/providers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie watch providers:', error);
    throw error;
  }
};

/**
 * Get watch providers (streaming platforms) for a TV show
 * @param {number} tvId - TV show ID
 */
export const getTVWatchProviders = async (tvId) => {
  try {
    const response = await api.get(`/tv/${tvId}/watch/providers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching TV watch providers:', error);
    throw error;
  }
};

export default api;
