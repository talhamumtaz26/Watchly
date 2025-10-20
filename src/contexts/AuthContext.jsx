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
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    // Use redirect on mobile, popup on desktop
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      return signInWithRedirect(auth, provider);
    } else {
      return signInWithPopup(auth, provider);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    // Check for redirect result on component mount
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User signed in successfully after redirect
          console.log('Google sign-in successful:', result.user);
          setCurrentUser(result.user);
        }
      })
      .catch((error) => {
        console.error('Error with redirect result:', error);
        // Clear any pending auth state
        if (error.code === 'auth/unauthorized-domain') {
          alert('This domain is not authorized for Google Sign-In. Please check Firebase Console.');
        } else if (error.code === 'auth/popup-blocked') {
          alert('Popup was blocked. Please allow popups for this site.');
        } else if (error.code === 'auth/cancelled-popup-request') {
          // User closed the popup, ignore
        } else {
          alert('Authentication error: ' + error.message);
        }
        setLoading(false);
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
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
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
