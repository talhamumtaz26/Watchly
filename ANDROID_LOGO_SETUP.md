# Watchly Android Logo & Splash Screen Setup

## ✅ Configuration Complete!

I've configured your Android app to use custom branding with black background and your Watchly logo.

## 📋 What You Need to Do Now:

### 1. Prepare Your Logo Images

You need to create different sizes of your logo for the splash screen and app icon:

#### **For Splash Screen:**

- Create a **PNG image with transparent background**
- Recommended size: **768x768 pixels** (will be centered on black background)
- Save it as: `splash_logo.png`

#### **For App Icon (Launcher):**

You'll need multiple sizes for different screen densities:

- **512x512 px** (xxxhdpi) - Main icon
- **384x384 px** (xxhdpi)
- **256x256 px** (xhdpi)
- **192x192 px** (hdpi)
- **128x128 px** (mdpi)

---

### 2. Place the Images in These Folders:

#### **Splash Screen Logo:**

Copy your `splash_logo.png` to:

```
d:\Talha\Watchly\android\app\src\main\res\drawable\splash_logo.png
```

#### **App Icons (Launcher Icons):**

Copy the different sizes to these folders:

```
d:\Talha\Watchly\android\app\src\main\res\mipmap-mdpi\ic_launcher.png (128x128)
d:\Talha\Watchly\android\app\src\main\res\mipmap-hdpi\ic_launcher.png (192x192)
d:\Talha\Watchly\android\app\src\main\res\mipmap-xhdpi\ic_launcher.png (256x256)
d:\Talha\Watchly\android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png (384x384)
d:\Talha\Watchly\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png (512x512)
```

Also for round icons:

```
d:\Talha\Watchly\android\app\src\main\res\mipmap-mdpi\ic_launcher_round.png
d:\Talha\Watchly\android\app\src\main\res\mipmap-hdpi\ic_launcher_round.png
d:\Talha\Watchly\android\app\src\main\res\mipmap-xhdpi\ic_launcher_round.png
d:\Talha\Watchly\android\app\src\main\res\mipmap-xxhdpi\ic_launcher_round.png
d:\Talha\Watchly\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_round.png
```

---

### 3. Easy Way: Use Online Icon Generator

**Option A - Use Android Asset Studio:**

1. Go to: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
2. Upload your Watchly logo
3. Choose "Image" source type
4. Set padding to 0% for full bleed icon
5. Set background color to #000000 (black)
6. Download the ZIP file
7. Extract and copy all folders to: `d:\Talha\Watchly\android\app\src\main\res\`

**Option B - Use Capacitor Assets Generator (Recommended):**

```bash
# Install the package
npm install -g @capacitor/assets

# Place your logo as icon.png (1024x1024) in assets folder
# Then run:
npx @capacitor/assets generate --android
```

---

### 4. Rebuild the Android App

After placing all images, run these commands:

```bash
# Sync the changes to Android
npx cap sync android

# Build the app
cd android
./gradlew assembleDebug
```

---

## 🎨 What I've Already Configured:

✅ **Splash Screen:**

- Black background (#000000)
- Centered logo display
- 2-second duration
- Smooth fade out (300ms)
- Fullscreen immersive mode
- No white screen flash

✅ **Theme Colors:**

- Primary: Red (#DC2626)
- Primary Dark: Black (#000000)
- Accent: Red (#DC2626)

✅ **Removed:**

- Default Android loading screen
- White screen between splash and app
- Action bar from app

✅ **Files Modified/Created:**

- `capacitor.config.ts` - Splash screen configuration
- `android/app/src/main/res/values/colors.xml` - App colors
- `android/app/src/main/res/values/styles.xml` - Custom theme
- `android/app/src/main/res/drawable/splash.xml` - Splash layout
- `android/app/src/main/java/com/watchly/app/MainActivity.java` - Remove white flash

---

## 🚀 Quick Steps Summary:

1. **Prepare your logo** (768x768 PNG with transparent background)
2. **Use Android Asset Studio** to generate all icon sizes
3. **Copy splash_logo.png** to `drawable` folder
4. **Copy all mipmap folders** from generated assets to your `res` folder
5. **Run:** `npx cap sync android`
6. **Test the app!**

---

## 📱 Testing:

After setup, when you launch the app you'll see:

1. ✅ Your Watchly logo on black background (splash screen)
2. ✅ Smooth 300ms fade transition
3. ✅ No white screen!
4. ✅ Direct load into your app

---

## Need Help?

If you encounter any issues:

- Make sure all image files are PNG format
- Check that filenames match exactly (case-sensitive)
- Verify images are in correct folders
- Run `npx cap sync android` after adding images
- Clean and rebuild: `cd android && ./gradlew clean && ./gradlew assembleDebug`
