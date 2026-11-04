import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPersonDetails, getPersonMovieCredits, getPersonTVCredits, getImageUrl } from '../utils/api';
import { FiArrowLeft, FiCalendar, FiMapPin } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

const Actor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [movieCredits, setMovieCredits] = useState([]);
  const [tvCredits, setTVCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllMovies, setShowAllMovies] = useState(false);
  const [showAllTV, setShowAllTV] = useState(false);
  const [showFullBiography, setShowFullBiography] = useState(false);
  const [biographyIsClamped, setBiographyIsClamped] = useState(false);
  const biographyRef = useRef(null);

  const loadActorData = useCallback(async () => {
    setLoading(true);
    try {
      const [personData, moviesData, tvData] = await Promise.all([
        getPersonDetails(id),
        getPersonMovieCredits(id),
        getPersonTVCredits(id),
      ]);

      setPerson(personData);
      
      // Sort by popularity and filter out items without poster
      const sortedMovies = moviesData.cast
        .filter(movie => movie.poster_path)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      const sortedTV = tvData.cast
        .filter(show => show.poster_path)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

      setMovieCredits(sortedMovies);
      setTVCredits(sortedTV);
    } catch (error) {
      console.error('Error loading actor data:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadActorData();
  }, [id, loadActorData]);

  useEffect(() => {
    const biography = biographyRef.current;
    if (!biography || !person?.biography || showFullBiography) return undefined;

    const updateClampState = () => {
      setBiographyIsClamped(biography.scrollHeight > biography.clientHeight);
    };

    updateClampState();
    window.addEventListener('resize', updateClampState);
    return () => window.removeEventListener('resize', updateClampState);
  }, [person?.biography, showFullBiography]);

  const handleItemClick = (item, mediaType) => {
    navigate(`/details/${mediaType}/${item.id}`);
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} message="Loading actor details..." />;
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-fg mb-4">Actor not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-brand hover:bg-brand-hover text-on-brand px-6 py-3 rounded-md transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const displayedMovies = showAllMovies ? movieCredits : movieCredits.slice(0, 12);
  const displayedTV = showAllTV ? tvCredits : tvCredits.slice(0, 12);

  return (
    <div className="min-h-screen bg-bg">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-fg-secondary hover:text-fg transition-colors"
        >
          <FiArrowLeft className="text-xl" />
          <span>Back</span>
        </button>
      </div>

      {/* Actor Header */}
      <div className="container mx-auto px-4 pb-8">
        <div className="bg-surface rounded-md p-6 md:p-8  border border-line">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <img
                src={getImageUrl(person.profile_path, 'w500')}
                alt={person.name}
                className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-md  mx-auto"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder-image.svg';
                }}
              />
            </div>

            {/* Actor Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-fg mb-4">
                {person.name}
              </h1>

              {/* Details */}
              <div className="space-y-3 mb-6">
                {person.birthday && (
                  <div className="flex items-center gap-2 text-fg-secondary">
                    <FiCalendar className="text-brand" />
                    <span>
                      Born: {new Date(person.birthday).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      {person.deathday && ` - Died: ${new Date(person.deathday).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}`}
                    </span>
                  </div>
                )}

                {person.place_of_birth && (
                  <div className="flex items-center gap-2 text-fg-secondary">
                    <FiMapPin className="text-brand" />
                    <span>{person.place_of_birth}</span>
                  </div>
                )}

                {person.known_for_department && (
                  <div className="text-fg-secondary">
                    <span className="text-fg font-semibold">Known For:</span> {person.known_for_department}
                  </div>
                )}
              </div>

              {/* Biography */}
              {person.biography && (
                <div>
                  <h2 className="text-xl font-bold text-fg mb-3">Biography</h2>
                  <p
                    ref={biographyRef}
                    className={`text-fg-secondary leading-relaxed ${showFullBiography ? '' : 'line-clamp-6'}`}
                  >
                    {person.biography}
                  </p>
                  {biographyIsClamped && (
                    <button
                      type="button"
                      aria-expanded={showFullBiography}
                      onClick={() => setShowFullBiography((expanded) => !expanded)}
                      className="min-h-11 mt-2 text-brand hover:text-brand-hover font-semibold transition-colors"
                    >
                      {showFullBiography ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Movies */}
      {movieCredits.length > 0 && (
        <div className="container mx-auto px-4 pb-8">
          <div className="bg-surface rounded-md p-6 md:p-8  border border-line">
            <h2 className="text-2xl font-bold text-fg mb-6">
              Movies ({movieCredits.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {displayedMovies.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => handleItemClick(movie, 'movie')}
                  className="cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={getImageUrl(movie.poster_path, 'w500')}
                      alt={movie.title}
                      className="w-full rounded-md  group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/placeholder-image.svg';
                      }}
                    />
                    {movie.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-bg/95 text-brand px-2 py-1 rounded-md text-xs font-bold">
                        ⭐ {movie.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-fg text-sm font-semibold mt-2 line-clamp-2 group-hover:text-brand transition-colors">
                    {movie.title}
                  </h3>
                  {movie.character && (
                    <p className="text-fg-secondary text-xs mt-1 line-clamp-1">
                      as {movie.character}
                    </p>
                  )}
                  {movie.release_date && (
                    <p className="text-fg-muted text-xs mt-1">
                      {movie.release_date.split('-')[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {movieCredits.length > 12 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllMovies(!showAllMovies)}
                  className="bg-brand hover:bg-brand-hover text-on-brand px-6 py-3 rounded-md font-semibold transition-colors"
                >
                  {showAllMovies ? 'Show Less' : `Show All ${movieCredits.length} Movies`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TV Shows */}
      {tvCredits.length > 0 && (
        <div className="container mx-auto px-4 pb-8">
          <div className="bg-surface rounded-md p-6 md:p-8  border border-line">
            <h2 className="text-2xl font-bold text-fg mb-6">
              TV Shows ({tvCredits.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {displayedTV.map((show) => (
                <div
                  key={show.id}
                  onClick={() => handleItemClick(show, 'tv')}
                  className="cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={getImageUrl(show.poster_path, 'w500')}
                      alt={show.name}
                      className="w-full rounded-md  group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/placeholder-image.svg';
                      }}
                    />
                    {show.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-bg/95 text-brand px-2 py-1 rounded-md text-xs font-bold">
                        ⭐ {show.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-fg text-sm font-semibold mt-2 line-clamp-2 group-hover:text-brand transition-colors">
                    {show.name}
                  </h3>
                  {show.character && (
                    <p className="text-fg-secondary text-xs mt-1 line-clamp-1">
                      as {show.character}
                    </p>
                  )}
                  {show.first_air_date && (
                    <p className="text-fg-muted text-xs mt-1">
                      {show.first_air_date.split('-')[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {tvCredits.length > 12 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllTV(!showAllTV)}
                  className="bg-brand hover:bg-brand-hover text-on-brand px-6 py-3 rounded-md font-semibold transition-colors"
                >
                  {showAllTV ? 'Show Less' : `Show All ${tvCredits.length} TV Shows`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Actor;
