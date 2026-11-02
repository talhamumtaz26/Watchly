# Watchly TMDb Cloudflare Worker

1. In the Cloudflare dashboard, open **Workers & Pages** and create a Worker.
2. Open **Edit code**, replace the editor contents with [`worker.js`](./worker.js), and save.
3. Open the Worker **Settings**, add a Secret named `TMDB_KEY`, and enter the TMDb API key.
4. Deploy the Worker and copy its `workers.dev` URL.
5. Set `REACT_APP_TMDB_PROXY_URL` to that URL in the frontend build environment. Do not put the TMDb key in any frontend environment variable.

The optional [`wrangler.toml`](./wrangler.toml) can be used for CLI deployments. Add the `TMDB_KEY` secret with `wrangler secret put TMDB_KEY`; do not put the secret value in the TOML file.
