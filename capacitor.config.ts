import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.watchly.app',
  appName: 'Watchly',
  webDir: 'build',
  android: { adjustMarginsForEdgeToEdge: 'auto', backgroundColor: '#1A1917' },
  server: {
    hostname: 'watchly-1a156.web.app',
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: { style: 'DARK', backgroundColor: '#1A1917' },
    SplashScreen: {
      launchAutoHide: false,
      launchFadeOutDuration: 300,
      backgroundColor: "#1A1917",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#F0AE26",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    }
  }
};

export default config;
