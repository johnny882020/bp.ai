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

  const login = (email, pwd) =>
    auth.loginViaEmailPassword(email, pwd).then(res => {
      setUser(res.user);
      return res.user;
    });

  const register = (email, pwd) =>
    auth.register({ email, password: pwd }).then(() =>
      auth.loginViaEmailPassword(email, pwd).then(res => {
        setUser(res.user);
        return res.user;
      })
    );

  const logout = () => auth.logout().then(() => setUser(null));

  return { user, loading, login, logout, register };
}
