import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { currentUser, loading, login, signup, resetPassword } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!loading && currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, loading, navigate]);

  if (loading || currentUser) {
    return (
      <div className="fixed inset-0 bg-background-darker flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (isSignUp && password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);

    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      // Redirect will happen automatically via AuthContext
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Auth error:', error);
      setErrorMessage(error.code === 'auth/user-not-found'
        ? 'No account found with this email.'
        : error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential'
          ? 'Invalid email or password.'
          : isSignUp
            ? 'Failed to create account'
            : 'Failed to login');
      
      // Handle specific error codes
      switch (error.code) {
        case 'auth/email-already-in-use':
          toast.error('Email already in use. Try logging in instead.');
          break;
        case 'auth/weak-password':
          toast.error('Password is too weak. Use at least 6 characters.');
          break;
        case 'auth/invalid-email':
          toast.error('Invalid email address.');
          break;
        case 'auth/user-not-found':
          toast.error('No account found with this email.');
          break;
        case 'auth/wrong-password':
          toast.error('Incorrect password.');
          break;
        case 'auth/invalid-credential':
          toast.error('Invalid email or password.');
          break;
        default:
          toast.error(isSignUp ? 'Failed to create account' : 'Failed to login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMessage('Enter your email address first.');
      return;
    }
    try {
      await resetPassword(email);
      setErrorMessage('Password reset email sent. Check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
      setErrorMessage(error.code === 'auth/user-not-found'
        ? 'No account found with this email.'
        : 'Unable to send a password reset email.');
    }
  };

  return (
    <div className="fixed inset-0 bg-background-darker flex items-center justify-center px-4 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl -ml-48 -mt-48"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-blue/20 rounded-full blur-3xl -mr-48 -mb-48"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-pink/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md">

        {/* Auth Card */}
        <div className="bg-card-darker rounded-2xl shadow-card-hover border border-white/10 p-8 backdrop-blur-custom animate-slide-up">
          {/* Toggle Tabs */}
          <div className="flex gap-2 mb-6 bg-card-dark rounded-xl p-1">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                !isSignUp
                  ? 'bg-gradient-red text-white shadow-red'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                isSignUp
                  ? 'bg-gradient-red text-white shadow-red'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-card-dark border border-white/10 rounded-xl text-white placeholder-text-muted focus:border-accent-purple focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-card-dark border border-white/10 rounded-xl text-white placeholder-text-muted focus:border-accent-purple focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all"
                disabled={submitting}
              />
              <div className="flex items-center justify-between mt-1">
                {isSignUp ? (
                  <p className="text-xs text-text-muted">Minimum 6 characters</p>
                ) : <span />}
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="text-xs text-red-400 hover:text-red-300 min-h-8 px-1"
                >
                  {showPassword ? 'Hide password' : 'Show password'}
                </button>
              </div>
            </div>

            {errorMessage && (
              <p role="alert" className="rounded-lg border border-red-500/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                {errorMessage}
              </p>
            )}

            {!isSignUp && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-red-400 hover:text-red-300 min-h-8"
              >
                Forgot password?
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-red text-white font-bold py-3 rounded-xl hover:shadow-red transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isSignUp ? 'Creating account...' : 'Logging in...'}
                </span>
              ) : (
                <span>{isSignUp ? 'Create Account' : 'Login'}</span>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;
