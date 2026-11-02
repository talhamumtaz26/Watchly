import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.watchly.app',
  appName: 'Watchly',
  webDir: 'build',
  android: { adjustMarginsForEdgeToEdge: 'force', backgroundColor: '#000000' },
  server: {
    hostname: 'watchly-1a156.web.app',
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: { style: 'DARK', backgroundColor: '#000000' },
    SplashScreen: {
      launchAutoHide: false,
      launchFadeOutDuration: 300,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#DC2626",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    }
  }
};

export default config;
