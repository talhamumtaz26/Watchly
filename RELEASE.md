# Android release and service setup

## Required before using this version

Discovery now calls a Cloudflare Worker. There is no client-key fallback.
Create a replacement TMDb key in the TMDb account, then:

1. Create a Worker in the Cloudflare dashboard and paste in
   [`cloudflare-worker/worker.js`](cloudflare-worker/worker.js).
2. Add a Worker secret named `TMDB_KEY`, enter the replacement key, and deploy.
3. Copy the `workers.dev` URL into `REACT_APP_TMDB_PROXY_URL` before building.

Never put the key in a `REACT_APP` variable. The Worker reads it from its secret
environment and the frontend only receives TMDb data.
After verifying the deployed proxy and distributing the new app, revoke the old
key. Revoking it will stop discovery in older APKs. No key has been rotated or
service deployed by these source changes.

The public endpoint uses fixed upstream path/query allowlists, timeouts and
caching. CORS is not authentication or a rate limit: add service-level abuse
controls before broad public distribution. It intentionally preserves browsing
without login.

## Build and signing

```sh
npm run build
npx cap sync android
npx cap open android
```

In Android Studio choose Generate Signed Bundle / APK, select Android App Bundle,
and use your private upload keystore. Never commit keys or passwords.
`npm run android:release` builds the release bundle with Gradle, but signing still
requires your release signing configuration. The release variant explicitly
disables debugging. Debug APKs remain available for development.

The build wrapper disables source maps and removes legacy REACT_APP_TMDB_KEY and
REACT_APP_TMDB_BASE_URL values after loading environment files. Rebuild and sync
before inspecting artifacts: source changes cannot sanitize a previously shared
APK. Verify the final signed artifact, certificate and manifest before upload.

## App Links

App Links cannot be completed with a guessed fingerprint. Obtain the SHA-256
fingerprint of the Play **app signing certificate** from Play Console. Publish
`public/.well-known/assetlinks.json` with package `com.watchly.app`, relation
`delegate_permission/common.handle_all_urls`, and that fingerprint in
`sha256_cert_fingerprints`. Allow this file through Hosting's hidden-file ignore
rule, deploy Hosting, and check that both declared hosts return JSON (not the
SPA). Include other certificate fingerprints only for builds you intend to trust.
No placeholder association file is deployed.

## Device verification

- Android 15: status bar, cutouts and gesture/three-button navigation insets;
  black system-bar backgrounds and light icons.
- Search: keyboard opens/resizes without obscuring the input or results.
- Accessibility: pinch zoom, text scaling, visible focus and library actions.
- Airplane mode: offline notice; after reconnect, Reload restores discovery.
- Cold start: splash yields to the rendered app shell without an artificial delay.
- New install and upgrade: login, library sync, and no source maps or old TMDb key
  in the packaged assets.

Android backup is now disabled to avoid OS backup of local library/cache data;
Firebase sync and explicit export/import remain available. Device manufacturers
can have differing device-transfer behavior; this flag is not a secure-storage
mechanism. Existing fonts are bundled locally. Maskable icons are not declared
until purpose-designed artwork is available.
