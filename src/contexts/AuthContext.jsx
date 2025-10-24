import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { syncLocalToCloud } from '../utils/cloudStorage';
import { getWatchLater, getWatched } from '../utils/storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Sign up with email and password
  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Login with email and password
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Logout
  const logout = () => {
    return signOut(auth);
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Always use redirect for Capacitor apps (better mobile support)
    const isCapacitor = window.Capacitor !== undefined;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isCapacitor || isMobile) {
      setAuthLoading(true);
      return signInWithRedirect(auth, provider);
    } else {
      return signInWithPopup(auth, provider);
    }
  };

  // Sync local data to cloud when user logs in
  const syncDataOnLogin = async (user) => {
    if (user) {
      try {
        // Get local data
        const localWatchLater = getWatchLater();
        const localWatched = getWatched();
        
        // Only sync if there's local data
        if (localWatchLater.length > 0 || localWatched.length > 0) {
          console.log('Syncing local data to cloud...');
          await syncLocalToCloud(user.uid, {
            watchLater: localWatchLater,
            watched: localWatched,
          });
          console.log('Sync completed successfully');
        }
      } catch (error) {
        console.error('Error syncing data on login:', error);
      }
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    let redirectChecked = false;
    
    // Check for redirect result on component mount
    getRedirectResult(auth)
      .then((result) => {
        redirectChecked = true;
        setAuthLoading(false);
        
        if (result && result.user) {
          // User signed in successfully after redirect
          console.log('Google sign-in successful:', result.user);
          setCurrentUser(result.user);
          // Sync local data to cloud
          syncDataOnLogin(result.user);
          // Redirect to home page
          window.location.href = '/';
        }
      })
      .catch((error) => {
        redirectChecked = true;
        setAuthLoading(false);
        console.error('Error with redirect result:', error);
        
        // Handle specific errors
        if (error.code === 'auth/unauthorized-domain') {
          console.error('Unauthorized domain. Check Firebase Console authorized domains.');
        } else if (error.code === 'auth/popup-blocked') {
          console.error('Popup was blocked.');
        } else if (error.code !== 'auth/cancelled-popup-request') {
          console.error('Authentication error:', error.message);
        }
      })
      .finally(() => {
        if (!redirectChecked) {
          setAuthLoading(false);
        }
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      setCurrentUser(user);
      
      // Sync data when user state changes (login)
      if (user && !redirectChecked) {
        syncDataOnLogin(user);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    signInWithGoogle,
    loading,
    authLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
