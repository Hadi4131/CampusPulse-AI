import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const SetUsername = () => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim()) return;

        setLoading(true);
        try {
            await updateProfile(user, {
                displayName: username
            });
            // Force reload to update context or just navigate
            // Ideally AuthContext listens to changes, but sometimes reload is safer for displayName
            window.location.href = '/';
        } catch (error) {
            console.error("Error setting username:", error);
            alert("Failed to set username: " + error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
            <div className="w-full max-w-md p-8 rounded-xl bg-card border border-border shadow-xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent rounded-t-xl"></div>
                <h2 className="text-2xl font-serif font-bold mb-4 text-primary text-center">One Last Step!</h2>
                <p className="text-muted-foreground text-center mb-6">
                    Please choose a public <strong>Username</strong>. This will be shown on the dashboard instead of your email.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground ml-1">Username</label>
                        <input
                            type="text"
                            placeholder="e.g. CampusHero"
                            className="w-full p-3 rounded-lg bg-secondary/30 border border-input text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-3 rounded-lg font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Set Username'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetUsername;
