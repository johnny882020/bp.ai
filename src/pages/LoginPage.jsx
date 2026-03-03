import React, { useState } from 'react';
import HeartLogo from '@/components/HeartLogo';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [pwd,   setPwd]   = useState('');
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onLogin(email, pwd);
    } catch (err) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setBusy(false);
    }
  };

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

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
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
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white h-11 text-sm font-semibold"
            disabled={busy}
          >
            {busy ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-8">
          Your health data is private and encrypted.
        </p>
      </div>
    </div>
  );
}
