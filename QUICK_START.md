# 🚀 Quick Start Guide - Firebase Authentication

## You're almost ready! Just 3 steps to enable authentication:

### Step 1: Create Firebase Project (5 minutes)

1. Go to https://console.firebase.google.com/
2. Click "Add project" or "Create a project"
3. Name it "Watchly" → Next
4. Disable Google Analytics (or enable if you want) → Create project
5. Wait for project to be created

### Step 2: Enable Authentication & Firestore

1. In left sidebar, click **"Authentication"** → Get started
2. Click **"Sign-in method"** tab
3. Enable **"Email/Password"** → Save
4. Enable **"Google"** → Enter your email → Save
5. In left sidebar, click **"Firestore Database"** → Create database
6. Choose **"Start in test mode"** → Next
7. Select location (closest to you) → Enable

### Step 3: Get Your Config & Set Up .env

1. Click ⚙️ (Settings) → Project settings
2. Scroll down to "Your apps"
3. **Choose Web app** (</> icon):
   - Click **Web icon </>**
   - Register app: Name it "Watchly Web" → Register app
   - **Important:** The same Web config works for both web browsers AND Android PWA!
   - **Note:** You do NOT need to add a separate Android app in Firebase
4. Copy the config values (you'll need these):

```javascript
// You'll see something like this:
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "watchly-xxx.firebaseapp.com",
  projectId: "watchly-xxx",
  storageBucket: "watchly-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc...",
};
```

5. Create `.env` file in project root:

```bash
copy .env.example .env
```

6. Open `.env` and fill in your values:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=watchly-xxx.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=watchly-xxx
REACT_APP_FIREBASE_STORAGE_BUCKET=watchly-xxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc...

REACT_APP_TMDB_API_KEY=your-existing-tmdb-key
```

7. Restart your dev server:

```bash
npm start
```

## 🎉 That's it! Test it out:

1. Go to http://localhost:3000/login
2. Try signing up with email/password
3. Or try "Continue with Google"
4. You should be logged in!

## 📱 Bonus: Your App Works on Android Too!

Your app is now a **Progressive Web App (PWA)** that can be installed on Android devices!

### Quick Android Test (Local):

1. Make sure your phone is on the **same Wi-Fi** as your computer
2. Open **Chrome** on your Android phone
3. Visit: `http://192.168.100.45:3000`
4. Tap Chrome menu (⋮) → **"Add to Home screen"** or **"Install app"**
5. The app installs like a native app! 🎉

### Deploy for Real Users:

When ready to deploy for real users, check out `ANDROID_DEPLOYMENT.md` for:

- Firebase Hosting deployment (free, includes HTTPS)
- How users can install your app on Android
- PWA features and customization

**Note:** Firebase Web config works for both web AND Android - no separate Android app needed!

## 📱 What You Can Do Now:

**Logged In:**

- ✅ Add movies to Watch Later
- ✅ Mark movies as Watched
- ✅ Track TV show episodes
- ✅ View your statistics
- ✅ Data syncs to cloud
- ✅ Access from any device **(web OR Android!)**

**Not Logged In (Guest):**

- ✅ Browse movies/TV shows
- ✅ View details
- ❌ Can't save to lists

## 🐛 Troubleshooting:

**"Firebase not initialized"**

- Make sure you created `.env` file
- Check all values are filled in (no spaces, quotes)
- Restart npm server

**"Invalid credential"**

- Password must be 6+ characters
- Check email format is correct

**"Auth domain not authorized"**

- Go to Firebase Console → Authentication → Settings
- Add your domain to authorized domains

## 📚 More Details:

- **Complete Firebase Setup:** `FIREBASE_SETUP.md`
- **Android/PWA Deployment:** `ANDROID_DEPLOYMENT.md` ⭐
- **Full Feature List:** `FIREBASE_INTEGRATION_SUMMARY.md`

---

**Ready to test? Go to: http://localhost:3000/login** 🚀

**Want to deploy on Android? Read: `ANDROID_DEPLOYMENT.md`** 📱
