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
  getSimilarMovies,
  getSimilarTVShows,
  getTVSeasonDetails,
} from '../utils/api';
import {
  markEpisodeWatched,
  unmarkEpisodeWatched,
  getSeasonProgress,
  getTVShowProgress,
} from '../utils/storage';
import {
  addToWatchLaterCloud,
  addToWatchedCloud,
  removeFromWatchLaterCloud,
  removeFromWatchedCloud,
  updateWatchedRatingCloud,
  subscribeToWatchLaterStatusCloud,
  subscribeToWatchedStatusCloud,
  getTVShowProgressCloud,
  markEpisodeWatchedCloud,
  unmarkEpisodeWatchedCloud,
} from '../utils/cloudStorage';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getMediaType, isAnimeItem } from '../utils/media';

const Details = () => {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser } = useAuth();
  const resolvedMediaType = getMediaType({ media_type: mediaType }, mediaType);
  const [details, setDetails] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [episodeProgress, setEpisodeProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchLater, setInWatchLater] = useState(false);
  const [watched, setWatched] = useState(false);
  const episodesRef = React.useRef(null);

  useEffect(() => {
    loadDetails();
    // Reload details when the media route changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mediaType]);

  useEffect(() => {
    if (!currentUser) {
      setInWatchLater(false);
      setWatched(false);
      return undefined;
    }

    const handleSubscriptionError = () => {
      toast.error('Unable to sync this item in real time');
    };
    const unsubscribeWatchLater = subscribeToWatchLaterStatusCloud(
      currentUser.uid,
      parseInt(id),
      mediaType,
      setInWatchLater,
      handleSubscriptionError
    );
    const unsubscribeWatched = subscribeToWatchedStatusCloud(
      currentUser.uid,
      parseInt(id),
      mediaType,
      setWatched,
      handleSubscriptionError
    );

    return () => {
      unsubscribeWatchLater();
      unsubscribeWatched();
    };
  }, [currentUser, id, mediaType, toast]);

  useEffect(() => {
    let active = true;
    if (mediaType !== 'tv') {
      setEpisodeProgress(null);
      return undefined;
    }
    const loadProgress = async () => {
      const progress = currentUser
        ? await getTVShowProgressCloud(currentUser.uid, parseInt(id))
        : getTVShowProgress(parseInt(id));
      if (active) setEpisodeProgress(progress);
    };
    loadProgress().catch(() => {
      if (active) toast.error('Unable to load episode progress');
    });
    return () => { active = false; };
  }, [currentUser, id, mediaType, toast]);

  const isEpisodeProgressWatched = (seasonNumber, episodeNumber) => {
    const progress = episodeProgress || { episodes: {} };
    return Boolean(progress.episodes?.[`S${seasonNumber}E${episodeNumber}`]?.watched);
  };

  const getDisplayedSeasonProgress = (seasonNumber, totalEpisodes) => {
    if (!episodeProgress) return getSeasonProgress(parseInt(id), seasonNumber, totalEpisodes);
    const watched = Array.from({ length: totalEpisodes }, (_, index) =>
      isEpisodeProgressWatched(seasonNumber, index + 1)
    ).filter(Boolean).length;
    return {
      watched,
      total: totalEpisodes,
      percentage: totalEpisodes > 0 ? Math.round((watched / totalEpisodes) * 100) : 0,
    };
  };

  const loadDetails = async () => {
    setLoading(true);
    try {
      const detailsPromise =
        mediaType === 'movie' ? getMovieDetails(id) : getTVDetails(id);
      const creditsPromise =
        mediaType === 'movie' ? getMovieCredits(id) : getTVCredits(id);
      const videosPromise =
        mediaType === 'movie' ? getMovieVideos(id) : getTVVideos(id);
      const similarPromise =
        mediaType === 'movie' ? getSimilarMovies(id) : getSimilarTVShows(id);

      const [detailsData, creditsData, videosData, similarData] =
        await Promise.all([
          detailsPromise,
          creditsPromise,
          videosPromise,
          similarPromise,
        ]);

      setDetails(detailsData);
      setCredits(creditsData);
      setVideos(videosData.results?.filter((v) => v.site === 'YouTube') || []);
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

  const handleAddToWatchLater = async () => {
    if (!currentUser) {
      toast.info('Please log in to use Watch Later');
      return;
    }

    if (!details) return;

    // Calculate total runtime for TV shows
    let totalRuntime = details.runtime || 0;
    if (mediaType === 'tv' && !totalRuntime) {
      const episodeRuntime = details.episode_run_time?.[0] || 45;
      const numberOfEpisodes = details.number_of_episodes || (details.number_of_seasons * 10) || 10;
      totalRuntime = episodeRuntime * numberOfEpisodes;
    }

    const item = {
      id: details.id,
      title: details.title || details.name,
      media_type: resolvedMediaType,
      ...(isAnimeItem(details, resolvedMediaType)
        ? { isAnime: true }
        : {}),
      runtime: totalRuntime,
      ...(details.poster_path ? { poster_path: details.poster_path } : {}),
      ...((details.release_date || details.first_air_date)
        ? { release_date: details.release_date || details.first_air_date }
        : {}),
      ...(details.vote_average !== undefined ? { vote_average: details.vote_average } : {}),
      ...(details.episode_run_time ? { episode_run_time: details.episode_run_time } : {}),
      ...(details.number_of_episodes !== undefined ? { number_of_episodes: details.number_of_episodes } : {}),
      ...(details.number_of_seasons !== undefined ? { number_of_seasons: details.number_of_seasons } : {}),
    };

    if (currentUser) {
      const success = await addToWatchLaterCloud(currentUser.uid, item);
      if (success) {
        setInWatchLater(true);
        toast.success('Added to Watch Later');
      } else {
        toast.error('Could not add this item to Watch Later');
      }
    }
  };

  const handleRemoveFromWatchLater = async () => {
    if (!currentUser) {
      toast.info('Please log in to manage Watch Later');
      return;
    }

    const success = await removeFromWatchLaterCloud(currentUser.uid, parseInt(id), mediaType);
    if (!success) {
      toast.error('Could not remove this item from Watch Later');
      return;
    }
    setInWatchLater(false);
    toast.success('Removed from Watch Later');
  };

  const handleMarkAsWatched = async () => {
    if (!currentUser) {
      toast.info('Please log in to mark items as Watched');
      return;
    }

    if (!details) return;

    // If already watched, remove from watched
    if (watched) {
      const success = await removeFromWatchedCloud(currentUser.uid, parseInt(id), mediaType);
      if (!success) {
        toast.error('Could not remove this item from Watched');
        return;
      }
      setWatched(false);
      toast.success('Removed from Watched');
      return;
    }

    // Calculate total runtime for TV shows
    let totalRuntime = 0;
    if (mediaType === 'tv') {
      const episodeRuntime = details.episode_run_time?.[0] || 45; // Default to 45 mins if not available
      const numberOfEpisodes = details.number_of_episodes || 0;
      
      totalRuntime = episodeRuntime * numberOfEpisodes;
    } else {
      totalRuntime = details.runtime || 0;
    }

    const item = {
      id: details.id,
      title: details.title || details.name,
      media_type: resolvedMediaType,
      ...(isAnimeItem(details, resolvedMediaType)
        ? { isAnime: true }
        : {}),
      runtime: totalRuntime,
      ...(details.poster_path ? { poster_path: details.poster_path } : {}),
      ...((details.release_date || details.first_air_date)
        ? { release_date: details.release_date || details.first_air_date }
        : {}),
      ...(details.vote_average !== undefined ? { vote_average: details.vote_average } : {}),
    };

    const success = await addToWatchedCloud(currentUser.uid, item);
    if (success) {
      setWatched(true);
      setInWatchLater(false);
      toast.success('Marked as Watched');
    } else {
      toast.error('Could not mark this item as Watched');
    }
  };

  const handleRateWatched = async () => {
    if (!currentUser || !watched) return;
    const rating = window.prompt('Rate this item from 1 to 10:');
    if (rating === null) return;
    const success = await updateWatchedRatingCloud(currentUser.uid, parseInt(id), mediaType, rating);
    if (success) {
      toast.success('Your rating was saved');
    } else {
      toast.error('Enter a rating between 1 and 10');
    }
  };

  const handleEpisodeToggle = async (seasonNumber, episodeNumber, runtime) => {
    const watchedNow = isEpisodeProgressWatched(seasonNumber, episodeNumber);
    if (currentUser) {
      if (watchedNow) {
        await unmarkEpisodeWatchedCloud(currentUser.uid, parseInt(id), seasonNumber, episodeNumber);
      } else {
        await markEpisodeWatchedCloud(currentUser.uid, parseInt(id), seasonNumber, episodeNumber, runtime);
      }
      setEpisodeProgress(await getTVShowProgressCloud(currentUser.uid, parseInt(id)));
    } else if (watchedNow) {
      unmarkEpisodeWatched(parseInt(id), seasonNumber, episodeNumber);
      setEpisodeProgress(getTVShowProgress(parseInt(id)));
    } else {
      markEpisodeWatched(parseInt(id), seasonNumber, episodeNumber, runtime);
      setEpisodeProgress(getTVShowProgress(parseInt(id)));
    }
    loadSeasonDetails(seasonNumber);
  };

  const handleMarkSeasonWatched = async (seasonNumber, episodeCount) => {
    const episodeRuntime = details.episode_run_time?.[0] || 45;
    for (let ep = 1; ep <= episodeCount; ep++) {
      if (!isEpisodeProgressWatched(seasonNumber, ep)) {
        if (currentUser) {
          await markEpisodeWatchedCloud(currentUser.uid, parseInt(id), seasonNumber, ep, episodeRuntime);
        } else {
          markEpisodeWatched(parseInt(id), seasonNumber, ep, episodeRuntime);
        }
      }
    }
    setEpisodeProgress(currentUser
      ? await getTVShowProgressCloud(currentUser.uid, parseInt(id))
      : getTVShowProgress(parseInt(id)));
    // Reload the season details to reflect changes
    loadSeasonDetails(seasonNumber);
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} message="Loading details..." />;
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-sans font-bold text-fg mb-4">
            Details not found
          </h2>
          <button
            onClick={() => navigate('/')}
            className="bg-brand text-on-brand px-8 py-3 rounded-md font-bold  transition-all transform hover:scale-105"
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
    <div className="min-h-screen bg-bg animate-fade-in">
      {/* Backdrop Header with Gradient Overlay */}
      <div className="relative h-[50vh] md:h-[50vh] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-top transform scale-105"
          style={{
            backgroundImage: `url(${getImageUrl(details.backdrop_path, 'original')})`,
          }}
        />
        
        <div className="absolute inset-0 bg-bg/70"></div>
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 md:top-6 md:left-6 bg-bg/60 backdrop-blur-custom text-fg px-4 py-2 md:px-6 md:py-3 rounded-md md:rounded-md hover:bg-bg/80 transition-all font-semibold flex items-center gap-2 z-10 border border-line/20 text-sm md:text-base"
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
                  className="w-24 md:w-56 rounded-md md:rounded-md  border-2 md:border-4 border-line/20"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/placeholder-image.svg';
                  }}
                />
              </div>

              {/* Title and Meta */}
              <div className="flex-1 pb-1 md:pb-4">
                <h1 className="text-lg md:text-5xl font-sans font-bold text-fg mb-1 md:mb-3 text- animate-slide-up leading-tight">
                  {title}
                </h1>
                <div className="flex flex-wrap items-center gap-1.5 md:gap-4 mb-2 md:mb-4 text-fg-muted text-xs md:text-base animate-slide-up">
                  {releaseDate && (
                    <span className="text-fg font-semibold">
                      {new Date(releaseDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  )}
                  {displayRuntime > 0 && (
                    <>
                      <span>•</span>
                      <span className="font-bold">
                        {mediaType === 'tv' 
                          ? `${Math.floor(displayRuntime / 60)}h` 
                          : `${displayRuntime}m`}
                      </span>
                    </>
                  )}
                  {details.vote_average > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 md:gap-1 text-rating font-bold">
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
                      className="bg-fg/10 backdrop-blur-custom text-fg px-2 py-0.5 md:px-4 md:py-2 rounded md:rounded-md text-xs md:text-sm font-semibold border border-line/20 hover:bg-brand hover:border-brand hover:text-on-brand transition-all cursor-pointer"
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
              className="flex-1 md:flex-none bg-fg hover:bg-fg-secondary text-on-brand px-6 py-3 md:px-8 md:py-4 rounded-md md:rounded-md text-sm md:text-base font-bold transition-all  flex items-center justify-center gap-2"
            >
              <span>Watch Later</span>
            </button>
          )}
          {inWatchLater && !watched && (
            <button
              onClick={handleRemoveFromWatchLater}
              className="flex-1 md:flex-none bg-transparent hover:bg-danger/10 text-danger-text border border-danger px-6 py-3 md:px-8 md:py-4 rounded-md text-sm md:text-base font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span>Remove</span>
            </button>
          )}
          {!watched && (
            <button
              onClick={handleMarkAsWatched}
              className="flex-1 md:flex-none bg-brand hover:bg-brand-hover text-on-brand px-6 py-3 md:px-8 md:py-4 rounded-md md:rounded-md text-sm md:text-base font-bold transition-all  flex items-center justify-center gap-2"
            >
              <span>Watched</span>
            </button>
          )}
          {watched && (
            <button
              onClick={handleMarkAsWatched}
              className="flex-1 md:flex-none bg-brand hover:bg-brand-hover text-on-brand px-6 py-3 md:px-8 md:py-4 rounded-md md:rounded-md text-sm md:text-base font-bold transition-all duration-300  hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>✓ Watched</span>
            </button>
          )}
          {watched && (
            <button
              onClick={handleRateWatched}
              className="flex-1 md:flex-none bg-brand hover:bg-rating text-on-brand px-6 py-3 md:px-8 md:py-4 rounded-md md:rounded-md text-sm md:text-base font-bold transition-all"
            >
              Rate
            </button>
          )}
        </div>

        {/* Overview */}
        <div className="bg-surface rounded-md md:rounded-md p-4 md:p-8 mb-6 md:mb-8  border border-line/5 animate-slide-up">
          <h2 className="text-lg md:text-2xl font-sans font-bold text-fg mb-3 md:mb-4">
            Overview
          </h2>
          <p className="text-fg-muted leading-relaxed text-sm md:text-lg">
            {details.overview || 'No overview available.'}
          </p>
        </div>

        {/* Trailer */}
        {trailer && (
          <div className="bg-surface rounded-md md:rounded-md p-4 md:p-8 mb-6 md:mb-8  border border-line/5 animate-slide-up">
            <h2 className="text-lg md:text-2xl font-sans font-bold text-fg mb-4 md:mb-6">
              Trailer
            </h2>
            <div className="aspect-video rounded-md md:rounded-md overflow-hidden ">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-md md:rounded-md"
              ></iframe>
            </div>
          </div>
        )}

        {/* Episode Tracking for TV Shows - Always visible */}
        {mediaType === 'tv' && seasons.length > 0 && (
          <div ref={episodesRef} className="bg-surface rounded-md md:rounded-md p-4 md:p-8 mb-6 md:mb-8  border border-line/5 animate-slide-up">
            <h2 className="text-lg md:text-2xl font-sans font-bold text-fg mb-4 md:mb-6">
              Episode Tracking
            </h2>
            <div className="space-y-4">
              {seasons.map((season) => {
                const progress = getDisplayedSeasonProgress(season.season_number, season.episode_count);
                return (
                  <div key={season.id} className="bg-bg border border-line/10 rounded-md p-4  transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-fg text-sm md:text-base">
                        {season.name}
                      </h3>
                      <span className="text-xs text-fg-muted font-semibold bg-surface px-2 py-1 rounded-full whitespace-nowrap">
                        {progress.watched}/{progress.total} ({progress.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-bg rounded-full h-2 mb-3 overflow-hidden">
                      <div
                        className="bg-brand h-2 rounded-full transition-all duration-500 "
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex gap-2 justify-between items-center">
                      <button
                        onClick={() => loadSeasonDetails(season.season_number)}
                        className="text-brand hover:text-brand font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        View Episodes →
                      </button>
                      <button
                        onClick={() => handleMarkSeasonWatched(season.season_number, season.episode_count)}
                        className="bg-brand/20 hover:bg-brand/30 text-brand px-3 py-1.5 rounded-md text-xs font-bold transition-all border border-brand/30 whitespace-nowrap"
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
              <div className="fixed inset-0 bg-bg/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-surface rounded-md max-w-2xl w-full max-h-[70vh] overflow-y-auto p-6 animate-scale-in  border border-line/10">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-line/10">
                    <h3 className="text-xl font-sans font-bold text-fg">
                      {seasonDetails.name}
                    </h3>
                    <button
                      onClick={() => setSeasonDetails(null)}
                      className="text-fg-muted hover:text-fg text-2xl transition-colors p-1"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-2">
                    {seasonDetails.episodes?.map((episode) => {
                      const episodeWatched = isEpisodeProgressWatched(selectedSeason, episode.episode_number);
                      return (
                        <div
                          key={episode.id}
                          className={`border rounded-md p-3 transition-all ${
                            episodeWatched
                              ? 'border-brand/50 bg-brand/10'
                              : 'border-line/10 hover:border-brand/50 bg-bg'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-fg text-sm mb-1 line-clamp-1">
                                {episode.episode_number}. {episode.name}
                              </h4>
                              <p className="text-xs text-fg-muted line-clamp-1">
                                {episode.overview || 'No description available.'}
                              </p>
                              {episode.runtime && (
                                <p className="text-xs text-fg-muted mt-1">
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
                              className={`flex-shrink-0 px-3 py-2 rounded-md font-bold text-xs transition-all ${
                                episodeWatched
                                  ? 'bg-brand/20 text-brand hover:bg-brand/30 border border-brand/30'
                                  : 'bg-surface text-fg hover:bg-brand hover:text-on-brand'
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
          <div className="bg-surface rounded-md md:rounded-md p-4 md:p-8 mb-6 md:mb-8  border border-line/5 animate-slide-up">
            <h2 className="text-lg md:text-2xl font-sans font-bold text-fg mb-4 md:mb-6">
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
                    className="w-full aspect-square object-cover rounded-md md:rounded-md mb-2 md:mb-3 group-hover:scale-105 transition-transform "
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/placeholder-image.svg';
                    }}
                  />
                  <p className="font-bold text-xs md:text-sm text-fg line-clamp-1 group-hover:text-brand transition-colors">
                    {actor.name}
                  </p>
                  <p className="text-xs md:text-xs text-fg-muted mt-0.5 md:mt-1 line-clamp-1">
                    {actor.character}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Similar Content */}
        {similar.length > 0 && (
          <div className="bg-surface rounded-md md:rounded-md p-4 md:p-8 mb-6 md:mb-8  border border-line/5 animate-slide-up">
            <h2 className="text-lg md:text-2xl font-sans font-bold text-fg mb-4 md:mb-6">
              Similar {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-6">
              {similar.map((item) => (
                <MovieCard key={item.id} item={{ ...item, media_type: getMediaType(item, resolvedMediaType) }} showType={false} />
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
