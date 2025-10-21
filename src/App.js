import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider, useToast } from './components/Toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import LoadingSpinner from './components/LoadingSpinner';
import ScrollToTop from './components/ScrollToTop';
import { App as CapacitorApp } from '@capacitor/app';
import './App.css';

// Lazy load all page components for better performance
const Home = lazy(() => import('./pages/Home'));
const Details = lazy(() => import('./pages/Details'));
const Search = lazy(() => import('./pages/Search'));
const Actor = lazy(() => import('./pages/Actor'));
const Genre = lazy(() => import('./pages/Genre'));
const WatchLater = lazy(() => import('./pages/WatchLater'));
const Watched = lazy(() => import('./pages/Watched'));
const Upcoming = lazy(() => import('./pages/Upcoming'));
const Settings = lazy(() => import('./pages/Settings'));
const AppSettings = lazy(() => import('./pages/AppSettings'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const ViewAll = lazy(() => import('./pages/ViewAll'));

// Component to handle back button
function BackButtonHandler() {
  const location = useLocation();
  const { showToast } = useToast();
  const [lastBackPress, setLastBackPress] = useState(0);

  useEffect(() => {
    let listener;
    
    const setupListener = async () => {
      listener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        const currentPath = location.pathname;
        
        // If we're on the home page
        if (currentPath === '/') {
          const now = Date.now();
          const timeSinceLastPress = now - lastBackPress;
          
          // If pressed twice within 2 seconds, exit the app
          if (timeSinceLastPress < 2000) {
            CapacitorApp.exitApp();
          } else {
            // First press, show toast
            setLastBackPress(now);
            showToast('Press back again to exit', 'info');
          }
        } else if (canGoBack) {
          // On other pages, use browser's back navigation
          window.history.back();
        }
      });
    };

    setupListener();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [location, lastBackPress, showToast]);

  return null;
}

function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Force dark mode always
    document.documentElement.classList.add('dark');

    // Simulate app initialization (you can add actual init logic here)
    const initializeApp = async () => {
      // Add any initialization logic here (e.g., check auth, load settings)
      await new Promise(resolve => setTimeout(resolve, 1000)); // Minimum 1 second loading
      setAppReady(true);
    };

    initializeApp();
  }, []);

  // Show loading screen while app initializes
  if (!appReady) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <LoadingSpinner fullScreen={true} message="Loading Watchly..." />
      </div>
    );
  }

  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <BackButtonHandler />
          <div className="App min-h-screen bg-black transition-colors duration-200 pb-16 md:pb-0">
            <Navbar />
            <BottomNav />
            <Suspense fallback={<LoadingSpinner fullScreen={true} message="Loading..." />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/details/:mediaType/:id" element={<Details />} />
                <Route path="/search" element={<Search />} />
                <Route path="/actor/:id" element={<Actor />} />
                <Route path="/genre/:id/:name" element={<Genre />} />
                <Route path="/view-all/:type" element={<ViewAll />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/watch-later"
                  element={
                    <ProtectedRoute>
                      <WatchLater />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/watched"
                  element={
                    <ProtectedRoute>
                      <Watched />
                    </ProtectedRoute>
                  }
                />
                <Route path="/upcoming" element={<Upcoming />} />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app-settings"
                  element={
                    <ProtectedRoute>
                      <AppSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
