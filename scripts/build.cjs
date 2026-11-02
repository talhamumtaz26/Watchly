// CRA exposes every REACT_APP_* value. Strip legacy TMDb credentials even if
// an old .env still exists, and always disable source maps for distributable builds.
process.env.NODE_ENV = 'production';
require('react-scripts/config/env');
delete process.env.REACT_APP_TMDB_KEY;
delete process.env.REACT_APP_TMDB_BASE_URL;
process.env.GENERATE_SOURCEMAP = 'false';
require('react-scripts/scripts/build');
