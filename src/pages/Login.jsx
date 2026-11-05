import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';

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
      <div className="fixed inset-0 bg-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-hover" />
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
    <div className="fixed inset-0 bg-bg flex items-center justify-center px-4 overflow-hidden">
      <div className="relative z-10 w-full max-w-md">

        {/* Auth Card */}
        <div className="bg-surface rounded-md  border border-line/10 p-8 animate-slide-up">
          {/* Toggle Tabs */}
          <div className="flex gap-2 mb-6 bg-surface rounded-md p-1">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 rounded-md font-bold transition-all ${
                !isSignUp
                  ? 'bg-brand text-on-brand'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 rounded-md font-bold transition-all ${
                isSignUp
                  ? 'bg-brand text-on-brand'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-fg mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-surface border border-line/10 rounded-md text-fg placeholder-fg-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-fg mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-14 bg-surface border border-line/10 rounded-md text-fg placeholder-fg-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-fg-secondary hover:text-brand"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                </button>
              </div>
              <div className="flex items-center justify-end mt-1">
                {isSignUp ? (
                  <p className="text-xs text-fg-muted">Minimum 6 characters</p>
                ) : null}
              </div>
            </div>

            {errorMessage && (
              <p role="alert" className="rounded-md border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger-text">
                {errorMessage}
              </p>
            )}

            {!isSignUp && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="flex min-h-11 w-full items-center justify-end text-sm text-brand hover:text-brand-hover"
              >
                Forgot password?
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand text-on-brand font-bold py-3 rounded-md hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
