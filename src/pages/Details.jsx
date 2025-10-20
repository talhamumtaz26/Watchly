import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMovieDetails,
  getTVDetails,
  getMovieCredits,
  getTVCredits,
  getImageUrl,
  getMovieVideos,
  getTVVideos,
  getMovieReviews,
  getTVReviews,
  getSimilarMovies,
  getSimilarTVShows,
  getTVSeasonDetails,
} from '../utils/api';
import {
  addToWatchLater,
  addToWatched,
  removeFromWatchLater,
  removeFromWatched,
  isInWatchLater,
  isWatched,
  getTVShowProgress,
  markEpisodeWatched,
  unmarkEpisodeWatched,
  isEpisodeWatched,
  getSeasonProgress,
} from '../utils/storage';
import { useToast } from '../components/Toast';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Details = () => {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [details, setDetails] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchLater, setInWatchLater] = useState(false);
  const [watched, setWatched] = useState(false);
  const episodesRef = React.useRef(null);

  useEffect(() => {
    loadDetails();
    checkStatus();
  }, [id, mediaType]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const detailsPromise =
        mediaType === 'movie' ? getMovieDetails(id) : getTVDetails(id);
      const creditsPromise =
        mediaType === 'movie' ? getMovieCredits(id) : getTVCredits(id);
      const videosPromise =
        mediaType === 'movie' ? getMovieVideos(id) : getTVVideos(id);
      const reviewsPromise =
        mediaType === 'movie' ? getMovieReviews(id) : getTVReviews(id);
      const similarPromise =
        mediaType === 'movie' ? getSimilarMovies(id) : getSimilarTVShows(id);

      const [detailsData, creditsData, videosData, reviewsData, similarData] =
        await Promise.all([
          detailsPromise,
          creditsPromise,
          videosPromise,
          reviewsPromise,
          similarPromise,
        ]);

      setDetails(detailsData);
      setCredits(creditsData);
      setVideos(videosData.results?.filter((v) => v.site === 'YouTube') || []);
      setReviews(reviewsData.results || []);
      setSimilar(similarData.results?.slice(0, 6) || []);

      if (mediaType === 'tv' && detailsData.seasons) {
        setSeasons(detailsData.seasons);
      }
    } catch (error) {
      console.error('Error loading details:', error);
      toast.error('Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const loadSeasonDetails = async (seasonNumber) => {
    try {
      const data = await getTVSeasonDetails(id, seasonNumber);
      setSeasonDetails(data);
      setSelectedSeason(seasonNumber);
    } catch (error) {
      console.error('Error loading season details:', error);
    }
  };

  const checkStatus = () => {
    setInWatchLater(isInWatchLater(parseInt(id), mediaType));
    setWatched(isWatched(parseInt(id), mediaType));
  };

  const handleAddToWatchLater = () => {
    if (!details) return;

    const item = {
      id: details.id,
      title: details.title || details.name,
      poster_path: details.poster_path,
      release_date: details.release_date || details.first_air_date,
      vote_average: details.vote_average,
      media_type: mediaType,
      runtime: details.runtime || details.episode_run_time?.[0] || 0,
    };

    if (addToWatchLater(item)) {
      setInWatchLater(true);
      // Removed toast notification
    } else {
      // Already in list - no notification
    }
  };

  const handleRemoveFromWatchLater = () => {
    removeFromWatchLater(parseInt(id), mediaType);
    setInWatchLater(false);
    // Removed toast notification
  };

  const handleMarkAsWatched = () => {
    if (!details) return;

    // If already watched, remove from watched
    if (watched) {
      removeFromWatched(parseInt(id), mediaType);
      setWatched(false);
      return;
    }

    // Calculate total runtime for TV shows
    let totalRuntime = 0;
    if (mediaType === 'tv') {
      const episodeRuntime = details.episode_run_time?.[0] || 45; // Default to 45 mins if not available
      const numberOfSeasons = details.number_of_seasons || 0;
      const numberOfEpisodes = details.number_of_episodes || 0;
      
      totalRuntime = episodeRuntime * numberOfEpisodes;
      console.log('TV Show Runtime Calculation:', {
        episodeRuntime,
        numberOfEpisodes,
        totalRuntime,
        hours: Math.floor(totalRuntime / 60),
        minutes: totalRuntime % 60
      });
    } else {
      totalRuntime = details.runtime || 0;
      console.log('Movie Runtime:', totalRuntime);
    }

    const item = {
      id: details.id,
      title: details.title || details.name,
      poster_path: details.poster_path,
      release_date: details.release_date || details.first_air_date,
      vote_average: details.vote_average,
      media_type: mediaType,
      runtime: totalRuntime,
    };

    console.log('Marking as watched:', item);

    if (addToWatched(item)) {
      setWatched(true);
      setInWatchLater(false);
      // Removed toast notification
      
      // For TV shows, mark all episodes as watched
      if (mediaType === 'tv' && details.seasons) {
        details.seasons.forEach(season => {
          if (season.season_number > 0) { // Skip specials (season 0)
            for (let ep = 1; ep <= season.episode_count; ep++) {
              markEpisodeWatched(
                parseInt(id),
                season.season_number,
                ep,
                details.episode_run_time?.[0] || 45
              );
            }
          }
        });
      }
    } else {
      // Already watched - no notification
    }
  };

  const handleEpisodeToggle = (seasonNumber, episodeNumber, runtime) => {
    const isWatched = isEpisodeWatched(parseInt(id), seasonNumber, episodeNumber);
    
    if (isWatched) {
      unmarkEpisodeWatched(parseInt(id), seasonNumber, episodeNumber);
    } else {
      markEpisodeWatched(parseInt(id), seasonNumber, episodeNumber, runtime);
    }
    
    // Reload the season details to reflect changes
    loadSeasonDetails(seasonNumber);
  };

  const handleMarkSeasonWatched = (seasonNumber, episodeCount) => {
    const episodeRuntime = details.episode_run_time?.[0] || 45;
    for (let ep = 1; ep <= episodeCount; ep++) {
      markEpisodeWatched(parseInt(id), seasonNumber, ep, episodeRuntime);
    }
    // Reload the season details to reflect changes
    loadSeasonDetails(seasonNumber);
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} message="Loading details..." />;
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Details not found
          </h2>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-purple text-white px-8 py-3 rounded-xl font-bold hover:shadow-purple transition-all transform hover:scale-105"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const title = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;
  const runtime = details.runtime || details.episode_run_time?.[0] || 0;
  
  // Calculate total runtime for TV shows
  const displayRuntime = mediaType === 'tv' && details.number_of_episodes
    ? (details.episode_run_time?.[0] || 45) * details.number_of_episodes
    : runtime;
    
  const cast = credits?.cast?.slice(0, 10) || [];
  const trailer = videos.find((v) => v.type === 'Trailer') || videos[0];

  return (
    <div className="min-h-screen bg-background-darker animate-fade-in">
      {/* Backdrop Header with Gradient Overlay */}
      <div className="relative h-[50vh] md:h-[50vh] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-top transform scale-105"
          style={{
            backgroundImage: `url(${getImageUrl(details.backdrop_path, 'original')})`,
          }}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-darker via-background-darker/70 to-background-darker/20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background-darker/80 via-transparent to-background-darker"></div>
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 md:top-6 md:left-6 bg-black/60 backdrop-blur-custom text-white px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl hover:bg-black/80 transition-all font-semibold flex items-center gap-2 z-10 border border-white/20 text-sm md:text-base"
        >
          ← Back
        </button>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 pb-3 md:pb-6 px-4 md:px-6">
          <div className="container mx-auto">
            <div className="flex flex-row gap-3 md:gap-6 items-end">
              {/* Poster */}
              <div className="flex-shrink-0 animate-scale-in">
                <img
                  src={getImageUrl(details.poster_path, 'w500')}
                  alt={title}
                  className="w-24 md:w-56 rounded-lg md:rounded-2xl shadow-2xl border-2 md:border-4 border-white/20"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/500x750/1E293B/94A3B8?text=No+Image';
                  }}
                />
              </div>

              {/* Title and Meta */}
              <div className="flex-1 pb-1 md:pb-4">
                <h1 className="text-lg md:text-5xl font-display font-bold text-white mb-1 md:mb-3 text-shadow-lg animate-slide-up leading-tight">
                  {title}
                </h1>
                <div className="flex flex-wrap items-center gap-1.5 md:gap-4 mb-2 md:mb-4 text-text-muted text-[11px] md:text-base animate-slide-up">
                  <span className="text-white font-semibold">
                    {releaseDate 
                      ? new Date(releaseDate).getFullYear()
                      : 'N/A'}
                  </span>
                  {displayRuntime > 0 && (
                    <>
                      <span>•</span>
                      <span>
                        {mediaType === 'tv' 
                          ? `${Math.floor(displayRuntime / 60)}h` 
                          : `${displayRuntime}m`}
                      </span>
                    </>
                  )}
                  {details.vote_average > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 md:gap-1 text-accent-yellow font-bold">
                        <span>⭐</span>
                        <span>{details.vote_average.toFixed(1)}</span>
                      </span>
                    </>
                  )}
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-1 md:gap-2 animate-slide-up">
                  {details.genres?.slice(0, 3).map((genre) => (
                    <a
                      key={genre.id}
                      href={`/genre/${genre.id}/${encodeURIComponent(genre.name)}`}
                      className="bg-white/10 backdrop-blur-custom text-white px-2 py-0.5 md:px-4 md:py-2 rounded md:rounded-xl text-[9px] md:text-sm font-semibold border border-white/20 hover:bg-red-600 hover:border-red-600 transition-all cursor-pointer"
                    >
                      {genre.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8 animate-slide-up">
          {!watched && !inWatchLater && (
            <button
              onClick={handleAddToWatchLater}
              className="flex-1 md:flex-none bg-white hover:bg-gray-200 text-black px-6 py-3 md:px-8 md:py-4 rounded-lg md:rounded-xl text-sm md:text-base font-bold transition-all shadow-card hover:shadow-card-hover flex items-center justify-center gap-2"
            >
              <span>Watch Later</span>
            </button>
          )}
          {inWatchLater && !watched && (
            <button
              onClick={handleRemoveFromWatchLater}
              className="flex-1 md:flex-none bg-black hover:bg-gray-900 text-white border-2 border-white px-6 py-3 md:px-8 md:py-4 rounded-lg md:rounded-xl text-sm md:text-base font-bold transition-all duration-300 shadow-card hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Remove</span>
            </button>
          )}
          {!watched && (
            <button
              onClick={handleMarkAsWatched}
              className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg md:rounded-xl text-sm md:text-base font-bold transition-all shadow-card flex items-center justify-center gap-2"
            >
              <span>Watched</span>
            </button>
          )}
          {watched && (
            <button
              onClick={handleMarkAsWatched}
              className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg md:rounded-xl text-sm md:text-base font-bold transition-all duration-300 shadow-green hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>✓ Watched</span>
            </button>
          )}
        </div>

        {/* Overview */}
        <div className="bg-card-darker rounded-xl md:rounded-2xl p-4 md:p-8 mb-6 md:mb-8 shadow-card border border-white/5 animate-slide-up">
          <h2 className="text-lg md:text-2xl font-display font-bold text-white mb-3 md:mb-4">
            Overview
          </h2>
          <p className="text-text-muted leading-relaxed text-sm md:text-lg">
            {details.overview || 'No overview available.'}
          </p>
        </div>

        {/* Trailer */}
        {trailer && (
          <div className="bg-card-darker rounded-xl md:rounded-2xl p-4 md:p-8 mb-6 md:mb-8 shadow-card border border-white/5 animate-slide-up">
            <h2 className="text-lg md:text-2xl font-display font-bold text-white mb-4 md:mb-6">
              Trailer
            </h2>
            <div className="aspect-video rounded-lg md:rounded-xl overflow-hidden shadow-card-hover">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg md:rounded-xl"
              ></iframe>
            </div>
          </div>
        )}

        {/* Episode Tracking for TV Shows - Always visible */}
        {mediaType === 'tv' && seasons.length > 0 && (
          <div ref={episodesRef} className="bg-card-darker rounded-xl md:rounded-2xl p-4 md:p-8 mb-6 md:mb-8 shadow-card border border-white/5 animate-slide-up">
            <h2 className="text-lg md:text-2xl font-display font-bold text-white mb-4 md:mb-6">
              Episode Tracking
            </h2>
            <div className="space-y-4">
              {seasons.map((season) => {
                const progress = getSeasonProgress(parseInt(id), season.season_number, season.episode_count);
                return (
                  <div key={season.id} className="bg-background-darker border border-white/10 rounded-xl p-4 hover:shadow-card-hover transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white text-sm md:text-base">
                        {season.name}
                      </h3>
                      <span className="text-xs text-text-muted font-semibold bg-card-dark px-2 py-1 rounded-full whitespace-nowrap">
                        {progress.watched}/{progress.total} ({progress.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-background-darker rounded-full h-2 mb-3 overflow-hidden">
                      <div
                        className="bg-gradient-purple h-2 rounded-full transition-all duration-500 shadow-purple"
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex gap-2 justify-between items-center">
                      <button
                        onClick={() => loadSeasonDetails(season.season_number)}
                        className="text-accent-purple hover:text-accent-blue font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        View Episodes →
                      </button>
                      <button
                        onClick={() => handleMarkSeasonWatched(season.season_number, season.episode_count)}
                        className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-green-500/30 whitespace-nowrap"
                      >
                        ✓ Mark Watched
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Episode List Modal */}
            {/* Episode List Modal */}
            {seasonDetails && (
              <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-card-darker rounded-xl max-w-2xl w-full max-h-[70vh] overflow-y-auto p-6 animate-scale-in shadow-card-hover border border-white/10">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                    <h3 className="text-xl font-display font-bold text-white">
                      {seasonDetails.name}
                    </h3>
                    <button
                      onClick={() => setSeasonDetails(null)}
                      className="text-text-muted hover:text-white text-2xl transition-colors p-1"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-2">
                    {seasonDetails.episodes?.map((episode) => {
                      const episodeWatched = isEpisodeWatched(parseInt(id), selectedSeason, episode.episode_number);
                      return (
                        <div
                          key={episode.id}
                          className={`border rounded-lg p-3 transition-all ${
                            episodeWatched
                              ? 'border-green-500/50 bg-green-600/10'
                              : 'border-white/10 hover:border-accent-purple/50 bg-background-darker'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-white text-sm mb-1 line-clamp-1">
                                {episode.episode_number}. {episode.name}
                              </h4>
                              <p className="text-xs text-text-muted line-clamp-1">
                                {episode.overview || 'No description available.'}
                              </p>
                              {episode.runtime && (
                                <p className="text-xs text-text-muted mt-1">
                                  ⏱ {episode.runtime} min
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                handleEpisodeToggle(
                                  selectedSeason,
                                  episode.episode_number,
                                  episode.runtime || 0
                                )
                              }
                              className={`flex-shrink-0 px-3 py-2 rounded-lg font-bold text-xs transition-all ${
                                episodeWatched
                                  ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30'
                                  : 'bg-card-dark text-white hover:bg-accent-purple'
                              }`}
                            >
                              {episodeWatched ? '✓' : 'Mark'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <div className="bg-card-darker rounded-xl md:rounded-2xl p-4 md:p-8 mb-6 md:mb-8 shadow-card border border-white/5 animate-slide-up">
            <h2 className="text-lg md:text-2xl font-display font-bold text-white mb-4 md:mb-6">
              Cast
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-6">
              {cast.map((actor) => (
                <a
                  key={actor.id}
                  href={`/actor/${actor.id}`}
                  className="text-center group cursor-pointer"
                >
                  <img
                    src={getImageUrl(actor.profile_path, 'w185')}
                    alt={actor.name}
                    className="w-full aspect-square object-cover rounded-lg md:rounded-2xl mb-2 md:mb-3 group-hover:scale-105 transition-transform shadow-card"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/185x278/1E293B/94A3B8?text=No+Image';
                    }}
                  />
                  <p className="font-bold text-xs md:text-sm text-white line-clamp-1 group-hover:text-red-600 transition-colors">
                    {actor.name}
                  </p>
                  <p className="text-[10px] md:text-xs text-text-muted mt-0.5 md:mt-1 line-clamp-1">
                    {actor.character}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Similar Content */}
        {similar.length > 0 && (
          <div className="bg-card-darker rounded-xl md:rounded-2xl p-4 md:p-8 mb-6 md:mb-8 shadow-card border border-white/5 animate-slide-up">
            <h2 className="text-lg md:text-2xl font-display font-bold text-white mb-4 md:mb-6">
              Similar {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-6">
              {similar.map((item) => (
                <MovieCard key={item.id} item={{ ...item, media_type: mediaType }} showType={false} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section Removed */}
      </div>
    </div>
  );
};

export default Details;
