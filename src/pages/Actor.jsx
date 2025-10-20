import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadActorData();
  }, [id]);

  const loadActorData = async () => {
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
  };

  const handleItemClick = (item, mediaType) => {
    navigate(`/details/${mediaType}/${item.id}`);
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} message="Loading actor details..." />;
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Actor not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
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
    <div className="min-h-screen bg-black">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <FiArrowLeft className="text-xl" />
          <span>Back</span>
        </button>
      </div>

      {/* Actor Header */}
      <div className="container mx-auto px-4 pb-8">
        <div className="bg-card-dark rounded-xl p-6 md:p-8 shadow-lg border border-gray-800">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <img
                src={getImageUrl(person.profile_path, 'w500')}
                alt={person.name}
                className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-xl shadow-lg mx-auto"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x500/1F2937/9CA3AF?text=No+Image';
                }}
              />
            </div>

            {/* Actor Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {person.name}
              </h1>

              {/* Details */}
              <div className="space-y-3 mb-6">
                {person.birthday && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <FiCalendar className="text-red-600" />
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
                  <div className="flex items-center gap-2 text-gray-400">
                    <FiMapPin className="text-red-600" />
                    <span>{person.place_of_birth}</span>
                  </div>
                )}

                {person.known_for_department && (
                  <div className="text-gray-400">
                    <span className="text-white font-semibold">Known For:</span> {person.known_for_department}
                  </div>
                )}
              </div>

              {/* Biography */}
              {person.biography && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-3">Biography</h2>
                  <p className="text-gray-400 leading-relaxed line-clamp-6">
                    {person.biography}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Movies */}
      {movieCredits.length > 0 && (
        <div className="container mx-auto px-4 pb-8">
          <div className="bg-card-dark rounded-xl p-6 md:p-8 shadow-lg border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-6">
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
                      className="w-full rounded-lg shadow-lg group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/500x750/1F2937/9CA3AF?text=No+Image';
                      }}
                    />
                    {movie.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-black/95 text-yellow-500 px-2 py-1 rounded-lg text-xs font-bold">
                        ⭐ {movie.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-white text-sm font-semibold mt-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {movie.title}
                  </h3>
                  {movie.character && (
                    <p className="text-gray-400 text-xs mt-1 line-clamp-1">
                      as {movie.character}
                    </p>
                  )}
                  {movie.release_date && (
                    <p className="text-gray-500 text-xs mt-1">
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
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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
          <div className="bg-card-dark rounded-xl p-6 md:p-8 shadow-lg border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-6">
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
                      className="w-full rounded-lg shadow-lg group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/500x750/1F2937/9CA3AF?text=No+Image';
                      }}
                    />
                    {show.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-black/95 text-yellow-500 px-2 py-1 rounded-lg text-xs font-bold">
                        ⭐ {show.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-white text-sm font-semibold mt-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {show.name}
                  </h3>
                  {show.character && (
                    <p className="text-gray-400 text-xs mt-1 line-clamp-1">
                      as {show.character}
                    </p>
                  )}
                  {show.first_air_date && (
                    <p className="text-gray-500 text-xs mt-1">
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
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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
