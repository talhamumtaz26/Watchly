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
export const getPopularMovies = async (page = 1) => {
  try {
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
export const getPopularTVShows = async (page = 1) => {
  try {
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
 */
export const getTVShowsByGenre = async (genreId, page = 1) => {
  try {
    const response = await api.get('/discover/tv', {
      params: { with_genres: genreId, page },
    });
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
