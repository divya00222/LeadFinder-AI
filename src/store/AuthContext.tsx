import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ShieldCheck, Mail, Lock, User, LogIn, ArrowRight } from 'lucide-react';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: any }>;
  signUp: (email: string, pass: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!supabase) {
      // Fallback demo user if Supabase not configured
      const savedUser = localStorage.getItem('crm_demo_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (em: string, pass: string) => {
    if (!supabase) {
      // Demo mode authentication
      const demoUser = { id: 'demo-user-1', email: em };
      localStorage.setItem('crm_demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      return { error: null };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: em, password: pass });
    if (!error && data.user) {
      setUser(data.user);
    }
    return { error };
  };

  const signUp = async (em: string, pass: string) => {
    if (!supabase) {
      const demoUser = { id: 'demo-user-1', email: em };
      localStorage.setItem('crm_demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      return { error: null };
    }
    const { data, error } = await supabase.auth.signUp({ email: em, password: pass });
    if (!error && data.user) {
      setUser(data.user);
    }
    return { error };
  };

  const signOut = async () => {
    if (!supabase) {
      localStorage.removeItem('crm_demo_user');
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  };

  const resetPassword = async (em: string) => {
    if (!supabase) {
      return { error: null };
    }
    return await supabase.auth.resetPasswordForEmail(em);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setErrorMsg(error.message);
      } else if (authMode === 'register') {
        const { error } = await signUp(email, password);
        if (error) setErrorMsg(error.message);
        else setSuccessMsg('Registration successful! You are now logged in.');
      } else if (authMode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) setErrorMsg(error.message);
        else setSuccessMsg('Password reset instructions sent to your email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
      {!loading && !user ? (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950"></div>
          
          <Card className="w-full max-w-md bg-slate-900/90 border-slate-800 backdrop-blur-xl shadow-2xl relative z-10 text-white p-2">
            <CardHeader className="space-y-2 text-center pb-6 border-b border-slate-800">
              <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl mx-auto flex items-center justify-center text-indigo-400 mb-2 shadow-inner">
                <ShieldCheck size={26} />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-white">
                {authMode === 'login' ? 'Sign in to B2B Lead CRM' : authMode === 'register' ? 'Create Supabase Workspace' : 'Reset Password'}
              </CardTitle>
              <p className="text-xs text-slate-400">
                {authMode === 'login' ? 'Enter your credentials to access your secure CRM workspace' : authMode === 'register' ? 'Set up your secure RLS-backed Supabase account' : 'Enter your email to receive a recovery link'}
              </p>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs rounded-lg">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs rounded-lg">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-500" size={16} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>

                {authMode !== 'forgot' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300">Password</label>
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setAuthMode('forgot')}
                          className="text-[11px] text-indigo-400 hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-slate-500" size={16} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30"
                >
                  {isSubmitting ? 'Processing...' : authMode === 'login' ? 'Sign In' : authMode === 'register' ? 'Create Account' : 'Send Reset Link'}
                  <ArrowRight size={16} />
                </Button>
              </form>

              <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
                {authMode === 'login' ? (
                  <p>
                    Don't have a workspace?{' '}
                    <button onClick={() => setAuthMode('register')} className="text-indigo-400 font-semibold hover:underline">
                      Register now
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button onClick={() => setAuthMode('login')} className="text-indigo-400 font-semibold hover:underline">
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
