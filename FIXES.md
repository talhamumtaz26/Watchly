# Watchly Fix Log

This file records the changes made during the application review and repair.

## Step 1 - Use the real authenticated user value

**Status:** Implemented

### Problem

`AuthContext` exposes the authenticated Firebase user as `currentUser`, but the
Details, Watch Later, and Watched pages attempted to read `user`. That value was
undefined, so signed-in users were treated as guests by those screens.

### Changes

- Updated `Details.jsx` to use `currentUser` for cloud status checks and
  Watch Later/Watched operations.
- Updated `WatchLater.jsx` to load and modify the signed-in user's Firestore
  collection using `currentUser`.
- Updated `Watched.jsx` to load and modify the signed-in user's Firestore
  collection using `currentUser`.
- Updated the affected effect dependencies to track `currentUser`.

### Expected behavior

After authentication, Details, Watch Later, and Watched should use Firestore.
When no user is authenticated, they should continue using local storage.

### Validation

- Production build: passed with existing ESLint warnings; no compile errors
- Diff whitespace check: passed
- Manual authenticated cloud-flow test: pending

## Step 2 - Use cloud data in the authenticated Dashboard

**Status:** Implemented

### Problem

The Dashboard always read local storage, even when a user was signed in. This
could show empty or outdated counts for a user whose library was stored in
Firestore.

### Changes

- Updated `Dashboard.jsx` to read watched items, Watch Later items, and watch
  time from Firestore when `currentUser` exists.
- Preserved local-storage statistics for signed-out users.
- Reloaded Dashboard statistics when the authenticated user changes.
- Kept the existing statistics and visual layout unchanged.

### Expected behavior

Signed-in users should see their cloud-backed collection and watch-time
statistics. Signed-out users should continue seeing local-storage statistics.

### Validation

- Production build: passed with existing ESLint warnings; no compile errors
- Diff whitespace check: passed
- Manual authenticated dashboard test: pending

## Step 3 - Prevent duplicate cloud watch-time additions

**Status:** Implemented

### Problem

Every call to `addToWatchedCloud` added the item's runtime to the user's total
watch time, even when the watched document already existed. Repeated login
synchronization or manual synchronization could therefore inflate totals.

### Changes

- Check whether the watched document already exists before writing it.
- Continue updating the watched document so metadata can remain current.
- Add runtime to total watch time only when creating a new watched document.

### Expected behavior

Adding a new watched item increases total watch time once. Repeating the same
operation or running synchronization again does not increase the total a second
time.

### Validation

- Production build: passed with existing ESLint warnings; no compile errors
- Diff whitespace check: passed
- Repeated-sync behavior with Firebase: pending

## Step 4 - Show API failure feedback

**Status:** Implemented

### Problem

Search failures cleared the results and looked like a normal “no results”
state. Upcoming-release failures were only written to the console, so users
received no explanation when TMDb was unavailable.

### Changes

- Added a visible toast when Search cannot load results.
- Added a visible toast when Upcoming Releases cannot load content.
- Preserved the existing empty/fallback rendering and loading behavior.

### Expected behavior

Users should receive a clear temporary-unavailability message instead of
mistaking an API failure for an empty result set.

### Validation

- Production build: passed with ESLint warnings; no compile errors
- Diff whitespace check: passed with a Git line-ending notice for `Search.jsx`
- Manual offline/API-failure test: pending

## Step 5 - Clean ESLint warnings

**Status:** Implemented

### Problem

The production build completed but reported unused imports, unused dead
helpers, missing hook dependencies, and UTF-8 BOM warnings across the app.

### Changes

- Removed unused imports and dead helpers from shared components and pages.
- Removed unused Firestore imports.
- Removed unused Home pagination/filter handlers that were not connected to the
  rendered UI.
- Removed an unused Details reviews result assignment while retaining the
  existing detail loading flow.
- Added focused hook-dependency annotations for effects intentionally tied to
  route, authentication, query, or scroll-restoration changes.
- Removed UTF-8 BOM markers from Watch Later and Watched pages.

### Validation

- Production build: passed with `Compiled successfully`; no ESLint warnings
- Diff check: passed; Git reported only a normal LF-to-CRLF conversion notice
  for `Search.jsx`

## Manual validation log

### Startup

**Result:** Passed

The development app opened at `http://localhost:3000` and the Home page
loaded content successfully.

### Authentication

**Result:** Passed

A test account signed in successfully, the account email appeared in Settings,
and protected pages were accessible.

### Watch Later / Watched actions

**Result:** Failed

While signed in, clicking both Watch Later and Watched on a Details page
produced no visible result. Investigation required before continuing the manual
test sequence.

### Action feedback fix

**Status:** Implemented

The Details page now shows success or failure toasts for adding, removing, and
marking items as Watched. Cloud operations that return `false` no longer look
like inactive buttons.

- Production build after fix: passed with `Compiled successfully`
- Retest after fix: pending

### Firebase root-cause findings

The browser console identified two concrete failures:

- Watch Later writes contained undefined optional fields, which Firestore
  rejects.
- Watched writes were denied because the repository had no Firestore rules
  configuration.

### Applied fix

- Details now omits optional fields when their values are undefined.
- Added `firestore.rules` with owner-only access for each user's nested data.
- Registered the rules file in `firebase.json`.

The Firestore rules must be deployed with the Firebase CLI before the Watched
cloud flow can succeed in the deployed Firebase project:

```bash
firebase deploy --only firestore:rules
```

### Validation

- Production build: passed with `Compiled successfully`
- Diff check: passed with a normal Git line-ending notice for `Search.jsx`
- Rules deployment: pending

### Rules deployment diagnosis

The app project ID and intended deployment project both match
`watchly-1a156`. Firebase Console showed the expired default rules instead of
the new owner-only rules, confirming that the repository rules have not been
published to the active Firestore database yet.

The authenticated UID was present, so the failure is not caused by a missing
login. Deployment remains the required environment step.

### Deployment attempt

The deployment command reached project `watchly-1a156` but Firebase returned
HTTP 401 because the local Firebase CLI credentials are invalid or expired.
The rules are therefore not published yet.

The forced CLI reauthentication and subsequent rules deployment were later
reported as successful. Firebase Console should now show the owner-only rules.

### Authenticated cloud flow

**Result:** Passed

After rules deployment, Watch Later, Watched, and Dashboard all worked after
refreshing the app. The only console message reported was an informational
React Router v7 future-flag warning.

### Android bundle refresh

The production web bundle was rebuilt and `npx cap sync android` completed
successfully. Android now contains the realtime listener implementation.

## Step 8 - Extend realtime sync to Details and Dashboard

**Status:** Implemented

### Changes

- Added Firestore document listeners for Watch Later and Watched status on
  Details pages.
- Added Firestore listeners for Dashboard Watched, Watch Later, and watch-time
  statistics.
- Added cleanup for all new listeners on route changes, logout, and unmount.
- Kept visible error feedback when a realtime listener cannot be created.

### Validation

- Production build before final warning cleanup: passed with one existing
  Details hook warning
- Final production build: pending
- Cross-client test for Details/Dashboard: pending

The final production build passed with `Compiled successfully`, and
`npx cap sync android` completed successfully for the Details/Dashboard
listener update.

The final cross-client realtime test remains pending because the latest
Android build was not installed and tested.

## Step 9 - Rebuild manual sync as a safe merge

**Status:** Implemented

### Changes

- Local-only Watch Later and Watched items are uploaded to Firestore.
- Cloud-only items are downloaded to local storage.
- Existing items are skipped instead of duplicated.
- Nothing is automatically deleted from either local storage or Firestore.
- Local Firestore payloads omit undefined fields before writing.
- Local uploads use Firestore batch writes per collection.
- Sync now returns uploaded, skipped, downloaded, and failed counts.
- The Settings page displays a detailed sync summary and the first failure.
- Sync Now can be pressed again after a successful sync; it is disabled only
  while an operation is actively running.

### Validation

- Production build: passed with `Compiled successfully`
- Diff check: passed with the existing Git line-ending notice for `Search.jsx`
- Manual sync with local/cloud test data: pending

### Debug APK build

The Android Gradle build could not start because no Java runtime was available
in the environment: `JAVA_HOME` is unset and `java` is not on PATH. The APK
must be built from a machine with Java/Android Studio configured.

### Guest list access decision

Signed-out users are redirected to Login when opening Watch Later or Watched.
This is intentional and remains unchanged by decision: personal list pages
stay login-only. Details may still write local data while signed out, but the
protected list pages do not display it until the user signs in.

### Updated guest action behavior

The desired behavior is now explicit: signed-out users cannot add or remove
Watch Later/Watched items from Details. Those actions show a login prompt and
leave storage unchanged. Details also does not show stale local list status
while signed out.

### Validation

- Production build after login-gating change: pending
- Signed-out action test: pending

## Step 6 - Improve guest action messaging and stale watched display

**Status:** Implemented

### Changes

- Changed informational login toasts to a black background with red text and a
  red border.
- Prevented signed-out MovieCard, Home, and View All screens from using stale
  local watched data.
- Kept watched-state display available for authenticated users.

### Validation

- Production build: passed with `Compiled successfully`
- Signed-out UI retest: pending

### Toast behavior adjustment

New toast messages now replace the previous toast, preventing rapid clicks from
stacking repeated login prompts.

- Production build after toast adjustment: passed with `Compiled successfully`
- Rapid-message retest: pending

## Step 7 - Add real-time cloud list synchronization

**Status:** Implemented

### Changes

- Added Firestore `onSnapshot` subscriptions for Watch Later and Watched.
- Watch Later and Watched screens now update when another web or Android
  client changes the same user's collection.
- Subscriptions are removed when the screen unmounts or the user changes.
- Added visible error feedback if a real-time subscription fails.
- Retained local-storage loading for signed-out fallback paths.

### Validation

- Production build: passed with `Compiled successfully`
- Cross-device web/Android test: pending

## Step 8 - Normalize watch-time statistics and activity dates

**Status:** Implemented

### Problem

Watched calculated total runtime from the collection while Dashboard trusted a
separate Firestore aggregate. The aggregate had become stale, so both screens
showed different totals for the same items. Dashboard also passed missing or
Firestore Timestamp date values directly to `new Date()`, producing
`Invalid Date`.

### Changes

- Added `src/utils/watchStats.js` as the canonical utility for:
  - Runtime normalization and TV runtime fallbacks.
  - Watch-time totals, days, and `formatWatchTime()`.
  - Firestore Timestamp, ISO string, numeric, and legacy date normalization.
- Updated local storage, cloud storage, Dashboard, and Watched to use the
  shared calculations.
- Dashboard now derives cloud watch-time from the watched collection rather
  than displaying a stale aggregate.
- Cloud stats are rebuilt when cloud stats are read and after bidirectional
  synchronization.
- Recent Activity checks `watchedDate`, `watchedAt`, and `addedDate`, sorts
  safely without mutating the source array, and displays `Earlier` when no
  valid date exists.
- Updated README Firebase configuration, Firestore terminology, sync behavior,
  and watch-time/date behavior.

### Expected behavior

Dashboard and Watched should show identical total time and days for the same
collection. Older records without a valid watched date should show `Earlier`
instead of `Invalid Date`.

### Validation

- Production build: passed with `Compiled successfully`; no changed-code ESLint errors or warnings
- Diff check: passed; Git reported only the existing LF-to-CRLF notice for `Search.jsx`
- Live cloud data verification: pending

## Step 9 - Resolve layout, auth, category, content, and accessibility issues

**Status:** Implemented

### Changes

- Added `scrollbar-gutter: stable` to prevent the logo and navigation from
  shifting when pages gain or lose a scrollbar.
- Login now shows the six-character requirement only during Sign Up.
- Added show/hide password, forgot-password email reset, and inline auth
  error/status messages.
- Renamed the cloud-sync wording from Google Cloud to Cloud Firestore.
- Added an explicit anime marker and separate Dashboard anime count.
- Upcoming content now excludes unsupported foreign-language/non-poster
  entries and avoids duplicate anime/series records.
- Added personal 1-10 ratings for watched items. Dashboard Top Rated and
  Rating Distribution now use `user_rating`, not TMDb `vote_average`, and
  percentages only include rated items.
- Clear All Data now requires typing `CLEAR ALL` before permanent deletion.
- Updated the in-app author name to Talha Mumtaz.
- Increased navigation/search tap targets and added accessible labels/titles
  to icon-only controls and navigation links.
- Improved poster alt-text fallbacks.

### Validation

- Production build: passed with `Compiled successfully`
- Diff check: passed
- Manual auth reset, rating, upcoming-filter, and clear-data tests: pending

## Step 10 - Guard login and standardize desktop navigation/card grids

**Status:** Implemented

### Changes

- Login now reads `currentUser` and auth `loading` from `AuthContext`.
- Login waits for auth initialization and redirects authenticated users away
  from `/login`.
- Removed icons from the desktop Navbar menu; the mobile bottom navigation
  retains its icons.
- Added the shared `media-grid` class with consistent responsive columns and
  spacing.
- Applied the shared grid to Home lists, Watch Later, Watched, View All, and
  Upcoming so poster cards use the same sizing rules.

### Validation

- Production build: pending
- Authenticated `/login` redirect and desktop visual checks: pending
