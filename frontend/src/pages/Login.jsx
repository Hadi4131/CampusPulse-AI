import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password, username);
            }
            navigate('/');
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground transition-colors duration-300">
            <div className="z-10 w-full max-w-md p-8 rounded-xl bg-card border border-border shadow-xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent rounded-t-xl"></div>
                <h2 className="text-3xl font-serif font-bold mb-2 text-center text-primary">{isLogin ? 'Welcome Back' : 'Join Us'}</h2>
                <p className="text-center text-muted-foreground mb-8 text-sm">Sign in to your account</p>

                {error && <div className="p-3 mb-4 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground ml-1">Username</label>
                            <input
                                type="text"
                                placeholder="CampusHero"
                                className="w-full p-3 rounded-lg bg-secondary/30 border border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground ml-1">Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className="w-full p-3 rounded-lg bg-secondary/30 border border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full p-3 rounded-lg bg-secondary/30 border border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full p-3 rounded-lg font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-md active:scale-95" disabled={loading}>
                        {loading ? 'Brewing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="flex items-center my-6">
                    <div className="flex-1 h-px bg-border"></div>
                    <span className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Or</span>
                    <div className="flex-1 h-px bg-border"></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full p-3 rounded-lg font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all flex items-center justify-center gap-2 border border-border"
                >
                    <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" /><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.715H.957v2.332A8.997 8.997 0 0 0 9 18z" /><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" /><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.159 6.656 3.58 9 3.58z" /></svg>
                    Continue with Google
                </button>

                <p className="mt-6 text-muted-foreground text-center text-sm">
                    {isLogin ? "First time here? " : "Been here before? "}
                    <span
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary cursor-pointer font-bold hover:underline underline-offset-4"
                    >
                        {isLogin ? 'Create Account' : 'Log In'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;
