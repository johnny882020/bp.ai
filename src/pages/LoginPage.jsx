import React, { useState } from 'react';
import HeartLogo from '@/components/HeartLogo';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';

/**
 * Three-mode auth page:
 *   'login'    — email + password (Sign In)
 *   'register' — email + password (Create Account)
 *   'verify'   — 6-digit OTP code (Verify Email)
 */
export default function LoginPage({ onLogin, onRegister, onVerifyOtp, onResendOtp }) {
  const [mode,    setMode]    = useState('login');
  const [email,   setEmail]   = useState('');
  const [pwd,     setPwd]     = useState('');
  const [otp,     setOtp]     = useState('');
  const [error,   setError]   = useState('');
  const [info,    setInfo]    = useState('');
  const [busy,    setBusy]    = useState(false);

  // ── Login / Register submit ────────────────────────────────────────────────
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setInfo('');
    try {
      if (mode === 'login') {
        await onLogin(email, pwd);
        // success → App.jsx will unmount LoginPage
      } else {
        await onRegister(email, pwd);
        // registration succeeded — Base44 sends OTP email
        setMode('verify');
        setOtp('');
        setInfo('Account created! Check your email for the verification code.');
      }
    } catch (err) {
      const msg = err?.message ?? '';
      // If server tells us to verify first, go straight to OTP screen
      if (msg.toLowerCase().includes('verif')) {
        setMode('verify');
        setOtp('');
        setInfo('Check your email for the verification code.');
      } else {
        setError(msg || (mode === 'login'
          ? 'Login failed. Please check your credentials.'
          : 'Registration failed. Try a different email.'));
      }
    } finally {
      setBusy(false);
    }
  };

  // ── OTP submit ─────────────────────────────────────────────────────────────
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.trim().length < 6) { setError('Please enter the 6-digit code.'); return; }
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await onVerifyOtp(email, otp.trim());
      // Verified — now log in
      await onLogin(email, pwd);
    } catch (err) {
      setError(err?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setBusy(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await onResendOtp(email);
      setInfo('A new code has been sent to your email.');
    } catch (err) {
      setError(err?.message || 'Could not resend code. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="p-4 bg-black rounded-3xl shadow-xl shadow-black/20 mb-5">
            <HeartLogo className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">BP.ai</h1>
          <p className="text-sm text-gray-500 mt-1">Blood Pressure Monitor</p>
        </div>

        {/* ── OTP Verification mode ── */}
        {mode === 'verify' ? (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Check your email</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter the 6-digit code sent to<br />
                <span className="font-medium text-gray-700">{email}</span>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Verification Code</label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                autoComplete="one-time-code"
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>

            {info  && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">{info}</p>}
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white h-11 text-sm font-semibold"
              disabled={busy || otp.length < 6}
            >
              {busy ? 'Verifying…' : 'Verify Email'}
            </Button>

            <div className="flex items-center justify-between text-sm text-gray-500 pt-1">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setInfo(''); }}
                className="hover:text-gray-800 hover:underline"
              >
                ← Back to Sign In
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={busy}
                className="text-gray-900 font-semibold hover:underline disabled:opacity-50"
              >
                Resend code
              </button>
            </div>
          </form>

        ) : (
          /* ── Login / Register mode ── */
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {info  && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">{info}</p>}
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white h-11 text-sm font-semibold"
              disabled={busy}
            >
              {busy
                ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </Button>

            {/* Mode toggle */}
            <p className="text-sm text-center text-gray-500 pt-1">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); setInfo(''); }}
                className="text-gray-900 font-semibold hover:underline"
              >
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </form>
        )}

        <p className="text-xs text-gray-400 text-center mt-8">
          Your health data is private and encrypted.
        </p>
      </div>
    </div>
  );
}
