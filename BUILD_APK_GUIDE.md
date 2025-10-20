# 📱 Watchly - Build APK Guide

## ✅ Build Completed Successfully!

Your app has been built and synced to Android. Follow the steps below to create the APK.

---

## 🎯 Quick Summary

**Status:**

- ✅ React app built successfully
- ✅ Synced to Android platform
- ✅ Capacitor plugins updated
- ✅ Ready to build APK

**Next Steps:**

1. Open Android Studio
2. Build the APK
3. Install on device

---

## 📋 Detailed Instructions

### Method 1: Using Android Studio (Recommended) 🎨

#### Step 1: Open Project in Android Studio

```bash
npx cap open android
```

This will launch Android Studio with your Watchly project.

#### Step 2: Build APK in Android Studio

1. **Wait for Gradle Sync** to complete (bottom right corner)
2. Go to: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for the build to complete (usually 2-5 minutes)
4. Click on **locate** in the notification that appears
5. Your APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Step 3: Install APK

**Option A - Via USB:**

- Connect your Android phone
- Enable USB debugging
- Run: `adb install android/app/build/outputs/apk/debug/app-debug.apk`

**Option B - Direct Transfer:**

- Copy the APK to your phone
- Open it and install (you may need to allow "Install from Unknown Sources")

---

### Method 2: Using Command Line (Advanced) 💻

#### Prerequisites

Make sure you have:

- Android SDK installed
- ANDROID_HOME environment variable set
- Gradle installed

#### Build Commands

**Debug APK (Quick):**

```bash
cd android
./gradlew assembleDebug
```

**Release APK (Optimized):**

```bash
cd android
./gradlew assembleRelease
```

**Output Location:**

- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

---

## 🔄 Future Updates Workflow

When you make changes to your app, follow this workflow:

### 1. Make Code Changes

Edit your React components, pages, etc.

### 2. Build React App

```bash
npm run build
```

### 3. Sync to Android

```bash
npx cap sync android
```

### 4. Build APK

```bash
# Open Android Studio
npx cap open android

# OR use command line
cd android
./gradlew assembleDebug
```

---

## 🚀 Quick Commands Reference

### One-Line Build & Sync

```bash
npm run build && npx cap sync android
```

### Open in Android Studio

```bash
npx cap open android
```

### Build Debug APK (Command Line)

```bash
cd android && ./gradlew assembleDebug && cd ..
```

### Find APK Location

```bash
explorer.exe android\app\build\outputs\apk\debug
```

---

## 📱 App Configuration

**App Details:**

- **App ID:** com.watchly.app
- **App Name:** Watchly
- **Platform:** Android
- **Build Tool:** Capacitor + Gradle

**Splash Screen:**

- Background: Black (#000000)
- Duration: 2 seconds
- Color: Red (#DC2626)

---

## ⚙️ Build Settings

### Debug Build (Current)

- **Optimized:** No
- **Size:** Larger (~20-40 MB)
- **Speed:** Faster to build
- **Use Case:** Testing and development

### Release Build (For Play Store)

- **Optimized:** Yes
- **Size:** Smaller (~10-20 MB)
- **Speed:** Slower to build
- **Requires:** Code signing with keystore
- **Use Case:** Production deployment

---

## 🔐 Code Signing (For Release)

To create a signed release APK for Play Store:

### 1. Generate Keystore

```bash
keytool -genkey -v -keystore watchly-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias watchly
```

### 2. Update build.gradle

Add to `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('../../watchly-release-key.jks')
            storePassword 'YOUR_PASSWORD'
            keyAlias 'watchly'
            keyPassword 'YOUR_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
        }
    }
}
```

### 3. Build Signed Release

```bash
cd android
./gradlew assembleRelease
```

---

## 🐛 Troubleshooting

### Issue: Gradle Sync Failed

**Solution:**

```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

### Issue: APK Not Found

**Solution:**
Build may have failed. Check Android Studio's "Build" output panel for errors.

### Issue: App Crashes on Launch

**Solution:**

1. Check logs: `adb logcat | grep Watchly`
2. Ensure Firebase config is correct
3. Check API keys in `.env` file

### Issue: White Screen on Android

**Solution:**
Clear Capacitor cache and rebuild:

```bash
npx cap sync android --force
```

---

## 📊 Build Optimization Tips

### Reduce APK Size

1. Enable ProGuard in release builds
2. Use WebP images instead of PNG
3. Remove unused dependencies
4. Enable resource shrinking

### Improve Performance

1. Enable R8 code shrinker
2. Use app bundles (.aab) instead of APKs
3. Optimize images before building
4. Lazy load components (already implemented ✅)

---

## 🎉 Current Build Status

```
✅ React App Built Successfully
✅ Capacitor Synced to Android
✅ Plugins Configured:
   - @capacitor/splash-screen@7.0.3
✅ Ready to Build APK
```

**Build Time:** ~2-5 minutes (first build may take longer)
**APK Size:** ~20-40 MB (debug), ~10-20 MB (release)

---

## 📞 Next Steps

1. **Immediate:**

   - Run `npx cap open android` to open Android Studio
   - Build APK using Android Studio
   - Test on your Android device

2. **Before Play Store Deployment:**

   - Generate signed release APK
   - Test on multiple devices
   - Create Play Store listing
   - Add screenshots and description
   - Set up app versioning

3. **Ongoing:**
   - Use `npm run build && npx cap sync android` after code changes
   - Test thoroughly before each release
   - Monitor crash reports and user feedback

---

## 🔗 Useful Links

- **Capacitor Docs:** https://capacitorjs.com/docs
- **Android Build Guide:** https://capacitorjs.com/docs/android
- **Play Store Publishing:** https://play.google.com/console

---

**Your Watchly app is ready to be built into an APK! 🚀**

_Last synced: Just now_
_Build method: Capacitor 7.4.3_
