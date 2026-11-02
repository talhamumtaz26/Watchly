# Watchly audit — 2 November 2026

## Scope and result

Reviewed the current working tree, frontend module graph (36 JS/JSX modules,
32 reachable from the entry point), authentication, local/cloud data flow,
Firebase proxy/rules, Android configuration, build setup, tracked-file inventory,
and current npm advisories for both lockfiles. Existing uncommitted work was
preserved. No application files were changed or deleted during this audit.

This is a source/dependency review with isolated reproductions, not a penetration
test or certification. Live Firebase rules, deployed function configuration,
account settings, old key revocation, Git history, and physical-device behavior
were not verified. The previous successful build does not establish security.

**Do not publish the current AAB until the native dependency vulnerability and
account-isolation issue below are addressed.**

## Security priorities

### 1. Critical advisory: installed Capacitor Android 7.4.3

`package-lock.json` resolves `@capacitor/android` and `@capacitor/core` to 7.4.3.
The upstream advisory GHSA-rvm3-566m-v7fv affects Android 7.x below 7.6.9.
It describes remote content executing at the application's origin through the
internal HTTP proxy path, with access to local storage and registered native
capabilities. Exploitation requires a victim to activate a crafted link in the
WebView; an end-to-end exploit against Watchly was not attempted. Disabling
CapacitorHttp alone is not the upstream fix.

Upgrade compatible Capacitor packages to a patched release, sync, rebuild, and
redistribute. The AAB produced before this audit still contains 7.4.3.

Source: https://github.com/ionic-team/capacitor/security/advisories/GHSA-rvm3-566m-v7fv

### 2. High: libraries are not isolated between accounts

`src/utils/storage.js:4` uses global `watchly_watch_later` and `watchly_watched`
keys. `src/contexts/AuthContext.jsx:45` signs out without separating/clearing
personal local data. Its login sync (`:69`) and manual sync read those shared
lists and upload them under the currently signed-in UID.

Reproduction: a synthetic local item belonging to account A was passed through
the real `syncLocalToCloud` function with mocked Firestore and account B's UID.
The resulting write targeted B. No real accounts or cloud records were changed.

Use UID-scoped local stores, reset in-memory user data on account changes, cancel
stale account operations, and define a deliberate migration path for legacy
unowned data. Do not automatically assign an old shared library to the next user.
Owner-only Firestore rules do not prevent this client-side mixing.

### 3. High before public deployment: proxy has no abuse controls

`functions/index.js:6` and `functions/proxy.js:7` allow supported GET requests
without authentication, App Check verification, or per-client rate limits.
CORS and `maxInstances: 3` do not stop scripts from consuming the public endpoint
and its TMDb quota/billable runtime. The proxy added in the previous pass protects
the key from the APK, but does not solve abuse protection. Its default direct
function URL also bypasses the configured Hosting rewrite; cache headers alone
do not establish a shared server cache.

Keep public browsing if desired, but add verified App Check, appropriate quotas/
rate limits, and monitoring. App Check requires client setup as well as server
verification; do not blindly enforce it before clients can send valid tokens.
Source: https://firebase.google.com/docs/app-check/custom-resource-backend

### 4. Medium: complete Firebase user object is logged

`src/contexts/AuthContext.jsx:99` logs `result.user`. This can expose account
metadata and token-bearing SDK state in console/debug captures. Remove the full
object log. Other debug logs in Details and ViewAll also print UID/library data
or produce substantial noise; retain only useful, redacted diagnostics.

### 5. Dependency advisories need triage

Root lockfile: **80 findings — 6 critical, 41 high, 15 moderate, 18 low**.
Functions lockfile: **8 moderate, no high/critical findings**. These counts overlap
through dependencies and are not 88 independently exploitable app vulnerabilities.

| Dependency | Installed | Relevance |
| --- | --- | --- |
| @capacitor/android | 7.4.3 | Shipped native runtime; critical advisory above |
| axios | 1.12.2 | Used in browser/WebView; high advisories, many concerning Node adapters or requiring prior prototype pollution |
| react-router-dom | 6.30.1 | Active frontend dependency; high advisory chain, affected feature reachability needs checking |
| protobufjs | 7.5.4 | Firestore Node/gRPC dependency chain; npm presence alone does not prove browser-bundle exposure |
| tar | 6.2.1 | Capacitor CLI/build dependency |
| shell-quote | 1.8.3 | React development/build tooling |
| proxy-addr | 2.0.7 | webpack-dev-server/Express tooling |
| websocket-driver | 0.7.4 | Development server and Firebase Realtime Database dependency; app uses Firestore, not Realtime Database |

Raw evidence: `dependency-audit.json` and `functions-dependency-audit.json`.
Do not use `npm audit fix --force` blindly: npm suggests `react-scripts@0.0.0`
for parts of this tree, which is not a usable upgrade strategy. Patch compatible
runtime dependencies first, then address the old CRA build chain separately.

## Confirmed correctness and data-management problems

1. **Deleted items can return.** `cloudStorage.js:479` uploads local-only items,
   while cloud deletion does not consistently remove the local cached copy.
   Reproduced with a deleted cloud fixture and the real upload function: it
   recreated the item. Define authoritative storage or deletion tombstones.
2. **Malformed imports break library access.** `storage.js:344` accepts arbitrary
   JSON shapes; importing `{ "watched": {} }` makes `isWatched()` throw
   `watched.some is not a function`. AppSettings reads the entire file without
   a size limit. Validate schema, count/size, item types and ranges before any
   write; report errors to the user. This is a local integrity/availability bug,
   not evidence of remote code execution.
3. **Clear/export are incomplete.** `clearAllData()` leaves episode tracking and
   settings; `exportData()` omits episode tracking even though import supports
   it. Both were reproduced in isolated storage. Cloud items also survive a
   local clear and can return. Clarify local versus cloud deletion in the UI.
4. **Episode progress does not use cloud helpers.** Details calls local episode
   functions even for signed-in users. The cloud episode helpers exist but are
   not connected to that UI, and bidirectional sync covers only the two lists.
   Keep the episode feature, but finish its persistence before claiming full sync.
5. **Android back toast calls a missing function.** `App.js:34,55` destructures
   `showToast`, but `Toast.jsx:52` provides `addToast`, `info`, etc., not
   `showToast`. The first home-screen back press therefore calls undefined.
6. **Cloud failures can look successful.** Cloud getters convert errors to empty
   lists and mutations often return false. WatchLater ignores mutation results
   and can remove a source entry after a failed destination write. Also,
   `syncCloudToLocal()` returns `{ success:false, error }` on exceptions, while
   `syncBidirectional()` only combines `.failures`, potentially reporting success.
   Propagate explicit failures and make moves atomic where possible.
7. **Login-sync ordering is fragile.** `AuthContext.jsx:132` only starts sync when
   `redirectChecked` is false. If the redirect check resolves before an email
   sign-in event, that sign-in does not trigger the intended sync. Redirect login
   also navigates immediately after starting an unawaited sync.
8. **Home fetches twice on mount.** Both effects in Home call `loadData()`;
   each load issues five requests. The genre/category state is permanently null
   because no setters are retained, so those filter branches are dead code.
9. **Actor search opens the wrong route.** Multi-search includes `person`, but
   Search sends every result to `/details/{media_type}/{id}` rather than using
   `/actor/{id}` for a person. It also uses poster_path rather than profile_path.
10. **Search accessibility/race gaps.** Result cards are clickable divs without
    keyboard semantics; the search field has no explicit accessible label.
    In-flight requests are not canceled or ordered, so old responses can replace
    a newer query. Several View All arrow links lack accessible names outside
    their loading state.
11. **Offline PWA claim is incomplete.** Registration code is reachable on web,
    but there is no service-worker implementation/output in this checkout/build.
    Keep it only if implementing a real offline strategy; otherwise remove the
    dead registration and correct README claims. Native offline notice exists.
12. **Missing fallback poster.** `getImageUrl()` returns `/placeholder-image.png`,
    which does not exist. Error handlers switch to a third-party placeholder URL
    without preventing repeated error handling. Use a bundled fallback asset.

## Files safe to remove from active source

The following six files have no role in the current reachable frontend graph:

| File | Reason |
| --- | --- |
| src/components/Navbar.jsx.backup | Backup copy, not imported |
| src/pages/AppSettings.jsx.backup | Backup copy, not imported |
| src/pages/Watched_temp.jsx | Unreachable old page |
| src/components/GenreFilter.jsx | Unreachable component |
| src/components/SearchBar.jsx | Unreachable component; active Search page is separate |
| src/components/ThemeToggle.jsx | Unreachable; App currently forces dark mode |

Together they are 55,787 bytes. Removing them improves clarity, not meaningful
APK size, since they are not imported. Git history can retain old implementations.
If reintroducing a feature, recover the relevant code deliberately.

Also remove from version control/ignore generated `.firebase/hosting.YnVpbGQ.cache`
and personal Android Studio AI migration/state files such as
`android/.idea/copilot.data.migration.*.xml`, `studiobot.xml`, and
`deploymentTargetSelector.xml`. Do not blanket-delete shared IDE configuration
without checking whether the team relies on it.

Replace or remove the scaffold tests:
- `ExampleUnitTest.java` only checks `2 + 2`.
- `ExampleInstrumentedTest.java` expects `com.getcapacitor.app`, but this app is
  `com.watchly.app`, so it is stale and will fail when run.

`assets/` is currently empty. It is removable if no external workflow needs it.

## Rebuildable local folders, not source waste

| Folder | Measured size | Recommendation |
| --- | ---: | --- |
| node_modules/ | 1,233.6 MB | Keep for development; npm ci recreates it; not shipped whole |
| android/app/build/ | 80.3 MB | Rebuildable; preserve any release artifact you need before cleaning |
| android/.gradle/ | 4.8 MB | Rebuildable cache; removing slows the next build |
| build/ | 1.1 MB | Generated web release; needed for current hosting/native sync |

No cleanup deletion was performed.

## Important files and features to keep

- All reachable routed pages, shared MovieCard/MovieList, navigation, authentication,
  toast, loading and offline-notice components.
- `watchStats.js` and `media.js`: shared behavior, not duplicate junk.
- Local storage and cloud storage modules: both currently used; consolidate their
  ownership/sync rules rather than deleting either module.
- `functions/`, its lockfile and proxy tests; `scripts/build.cjs`; `firestore.rules`;
  Firebase/Capacitor configs; `RELEASE.md`; both package lockfiles and `.env.example`.
- `.firebaserc`: Firebase project mapping, not a private credential.
- `.env`: private local configuration, excluded from Git; retain needed Firebase
  settings. Remove obsolete TMDb client variables after rotation/migration.
- Android manifests, Gradle scripts/wrapper, MainActivity, icon resources and
  density variants. Do not mistake generated-looking native resources for junk.
- `@capacitor/status-bar`: registered natively despite no frontend JS import.
  `@capacitor/android`, CLI and CSS/PostCSS tooling also cannot be judged unused
  purely by looking for React imports. CLI could move to devDependencies.
- Auth, Firestore, discovery, watch lists, episode tracking, statistics and backup
  are core product features. Theme switching is currently unused. Actor pages,
  trailers and upcoming releases are active optional features, not dead code.

## Positive controls and limitations

Checked-in Firestore rules restrict users to their own subtree and deny unmatched
paths. Verify deployment separately; add data validation and emulator tests.
The proxy uses a fixed upstream host, endpoint/query allowlists, a timeout and
sanitized error responses. No dangerous HTML injection/eval calls were found in
the searched app code. No old TMDb key or selected private-key/service-account/
GitHub-token/AWS-key patterns were found in current tracked files; this limited
scan does not cover all secret types or Git history.

The previous build verification established no source maps/old TMDb key in the
new AAB and a non-debuggable release manifest. It remains unsigned, uses the
affected Capacitor runtime, and requires proxy deployment and key rotation.

## Recommended order

1. Patch Capacitor and triage the other runtime dependency advisories.
2. Fix account isolation and deletion/sync semantics with regression tests.
3. Add proxy abuse protection and verify deployed Firestore rules/key rotation.
4. Fix import/export/clear, missing back toast API and cloud failure propagation.
5. Remove the six unused files and generated/personal tracked metadata.
6. Fix search, duplicate fetches, missing fallback, offline documentation and stale tests.
7. Rebuild, sign, and verify on a real Android device before distribution.
