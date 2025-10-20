# 🔥 Firebase Authentication & Cloud Storage Setup Guide

## Overview

Your Watchly app now has Firebase authentication and cloud-based data storage! This means:

- ✅ Users can sign up/login with email or Google
- ✅ Data is saved to the cloud (Firestore)
- ✅ Data syncs across devices
- ✅ Protected routes require authentication
- ✅ Beautiful login/signup pages

## 📋 Step-by-Step Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name (e.g., "Watchly")
4. Enable Google Analytics (optional)
5. Click **"Create project"**

### 2. Enable Authentication

1. In Firebase Console, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Click on **"Sign-in method"** tab
4. Enable **"Email/Password"**:
   - Click on "Email/Password"
   - Toggle **"Enable"**
   - Click **"Save"**
5. Enable **"Google"**:
   - Click on "Google"
   - Toggle **"Enable"**
   - Enter project support email
   - Click **"Save"**

### 3. Create Firestore Database

1. In Firebase Console, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose a location (closest to your users)
5. Click **"Enable"**

### 4. Get Firebase Configuration

1. In Firebase Console, click the ⚙️ (Settings) icon
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (</>) to add a web app
5. Enter app nickname (e.g., "Watchly Web")
6. Check **"Also set up Firebase Hosting"** (optional)
7. Click **"Register app"**
8. Copy the `firebaseConfig` object values

### 5. Configure Environment Variables

1. Create a `.env` file in your project root:

   ```bash
   copy .env.example .env
   ```

2. Open `.env` and fill in your Firebase config values:

   ```env
   REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
   REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

   REACT_APP_TMDB_API_KEY=your-tmdb-api-key
   ```

3. **Important**: Add `.env` to your `.gitignore` to keep credentials secure!

### 6. Restart the Development Server

```bash
npm start
```

## 🎯 How It Works

### Authentication Flow

1. **Sign Up**:

   - User goes to `/login`
   - Clicks "Sign Up" tab
   - Enters email and password (min 6 characters)
   - Account is created in Firebase Auth
   - User is redirected to home page

2. **Login**:

   - User goes to `/login`
   - Enters credentials
   - Firebase authenticates
   - User is redirected to home page

3. **Google Sign-In**:

   - User clicks "Continue with Google"
   - Google popup appears
   - User selects account
   - Instantly logged in

4. **Logout**:
   - User clicks profile icon in navbar
   - Clicks "Logout"
   - Logged out and redirected to login

### Protected Routes

These pages require authentication:

- `/watch-later` - Watch Later list
- `/watched` - Watched collection
- `/dashboard` - Watch statistics
- `/settings` - App settings

If user is not logged in, they're redirected to `/login`.

### Cloud Data Storage

All user data is stored in Firestore under this structure:

```
users/
  {userId}/
    watchLater/
      {mediaType}_{mediaId}
    watched/
      {mediaType}_{mediaId}
    stats/
      watchTime
    tvProgress/
      {tvShowId}
```

### Data Sync Features

- ✅ **Automatic sync**: Data saves to cloud when added/removed
- ✅ **Real-time**: Changes reflect immediately
- ✅ **Cross-device**: Access your data from any device
- ✅ **Secure**: Data is private to each user

## 🔐 Security Rules (Production)

Before deploying to production, update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🎨 UI Features

### Login Page

- Beautiful gradient background
- Tabbed interface (Login/Sign Up)
- Email & password authentication
- Google sign-in button
- Guest access link
- Form validation
- Loading states
- Error handling

### Navbar

- Shows user email when logged in
- Profile dropdown menu
- Logout button
- Login button when not authenticated

## 📱 Guest vs Authenticated

### Guest Users (Not Logged In)

- ✅ Browse movies/TV shows
- ✅ View details
- ❌ Cannot add to Watch Later
- ❌ Cannot mark as Watched
- ❌ No access to Dashboard/Settings

### Authenticated Users

- ✅ All guest features
- ✅ Add to Watch Later
- ✅ Mark as Watched
- ✅ Track episodes
- ✅ View statistics
- ✅ Data syncs across devices

## 🐛 Troubleshooting

### Firebase not initialized

- Make sure `.env` file exists
- Check that all `REACT_APP_FIREBASE_*` variables are set
- Restart development server after creating `.env`

### Authentication errors

- Check Firebase Console > Authentication is enabled
- Verify Email/Password and Google are enabled
- Check project credentials match `.env` file

### Firestore errors

- Ensure Firestore Database is created
- Check security rules allow test mode
- Verify project ID matches

### "Invalid credential" error

- Check email/password are correct
- Ensure password is at least 6 characters
- Try resetting password

## 🚀 Next Steps

1. **Set up Firebase** (follow steps above)
2. **Test authentication** (sign up, login, logout)
3. **Add content** to Watch Later and Watched
4. **Check Firestore Console** to see your data
5. **Test on another device** to verify sync
6. **Update security rules** before production

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Quickstart](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Auth Guide](https://firebase.google.com/docs/auth/web/start)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

## 💡 Tips

- Use **test mode** during development
- Keep `.env` file secure (never commit to git)
- Test authentication flow thoroughly
- Monitor Firebase usage in console
- Set up billing alerts to avoid surprises

---

**Your Watchly app is now powered by Firebase! 🎉**

Need help? Check the Firebase Console for logs and errors.
