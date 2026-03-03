import { useState, useEffect } from 'react';
import { auth } from '@/api/base44Client';

export function useAuth() {
  const [user,    setUser]    = useState(undefined); // undefined = still loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth.me()
      .then(u  => { setUser(u);    setLoading(false); })
      .catch(() => { setUser(null); setLoading(false); });
  }, []);

  // login: returns User on success, throws on failure
  const login = (email, pwd) =>
    auth.loginViaEmailPassword(email, pwd).then(res => { setUser(res.user); return res.user; });

  // register: creates account and triggers verification email; caller handles OTP step
  const register = (email, pwd) => auth.register({ email, password: pwd });

  // verifyOtp: submits the 6-digit code sent to the user's email
  const verifyOtp = (email, code) => auth.verifyOtp({ email, otpCode: code });

  // resendOtp: sends a new verification code to the email address
  const resendOtp = (email) => auth.resendOtp(email);

  const logout = () => auth.logout().then(() => setUser(null));

  return { user, loading, login, logout, register, verifyOtp, resendOtp };
}
