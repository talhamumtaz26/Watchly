import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import LoadingSpinner from './components/LoadingSpinner';
import ScrollToTop from './components/ScrollToTop';
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

function App() {
  useEffect(() => {
    // Force dark mode always
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
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
