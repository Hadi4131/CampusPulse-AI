import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    PopoverForm,
    PopoverFormButton,
    PopoverFormSeparator,
    PopoverFormCutOutLeftIcon,
    PopoverFormCutOutRightIcon,
    PopoverFormSuccess
} from '../components/ui/PopoverForm';

const ComplaintForm = () => {
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [open, setOpen] = useState(false);

    // Auth context
    const { user } = useAuth();

    // Reset when closed
    useEffect(() => {
        if (!open) {
            setDescription('');
            setResult(null);
            setLoading(false);
        }
    }, [open]);

    const submit = async () => {
        if (!description) return;
        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/complaints`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description,
                    user_id: user?.uid || 'anonymous',
                    user_email: user?.email || 'anonymous',
                    user_name: user?.displayName || 'Anonymous Student'
                }),
            });

            if (!response.ok) throw new Error("Failed to submit");

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error(error);
            alert("Error submitting complaint: " + error.message);
            setLoading(false);
        }
    }

    // Success component with analysis
    const AnalysisSuccess = () => (
        <div className="p-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3 className="text-lg font-bold text-primary mb-1">Received</h3>
            <p className="text-xs text-muted-foreground mb-4">Ticket #{result?.id.slice(0, 8)}...</p>

            <div className="bg-muted/50 p-3 rounded-lg text-left text-sm space-y-2 mb-4 border border-border">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs font-medium uppercase">Priority</span>
                    <span className={`px-2 py-0.5 rounded textxs font-bold ${result?.analysis?.urgency === 'High' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                        {result?.analysis?.urgency}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs font-medium uppercase">Category</span>
                    <span className="text-foreground font-medium">{result?.analysis?.category}</span>
                </div>
                <div className="pt-2 border-t border-border mt-2">
                    <span className="text-muted-foreground text-xs font-medium uppercase block mb-1">Action</span>
                    <p className="text-foreground text-xs leading-relaxed">{result?.analysis?.suggested_action}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground font-sans p-4 transition-colors duration-300">

            <div className="text-center mb-16 space-y-4">
                <div className="inline-block p-1 rounded-2xl bg-gradient-to-tr from-primary to-accent mb-2">
                    <div className="bg-background rounded-xl px-4 py-1">
                        <span className="text-xs font-bold tracking-widest uppercase text-primary">Beta v1.0</span>
                    </div>
                </div>
                <h1 className="text-5xl md:text-7xl font-serif font-extrabold tracking-tight text-primary">
                    CampusPulse
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                    Brewing better campus experiences, one feedback at a time.
                </p>
            </div>

            <div className="w-full flex items-center justify-center relative z-10">
                <PopoverForm
                    title="Share Your Thoughts"
                    open={open}
                    setOpen={setOpen}
                    width="400px"
                    height="320px"
                    showCloseButton={result === null}
                    showSuccess={result !== null}
                    openChild={
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                submit();
                            }}
                            className="flex flex-col h-full bg-card"
                        >
                            <div className="relative flex-1">
                                <textarea
                                    autoFocus
                                    placeholder="What's bothering you today? (e.g. 'The library is too noisy')"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="h-full w-full resize-none rounded-t-lg p-5 text-base outline-none bg-transparent placeholder:text-muted-foreground/60 text-foreground"
                                    required
                                />
                            </div>
                            <div className="relative flex h-14 items-center px-[10px] bg-muted/30 border-t border-border">
                                <PopoverFormSeparator width="100%" />
                                <div className="absolute left-0 top-0 -translate-x-[1.5px] -translate-y-1/2">
                                    <PopoverFormCutOutLeftIcon />
                                </div>
                                <div className="absolute right-0 top-0 translate-x-[1.5px] -translate-y-1/2 rotate-180">
                                    <PopoverFormCutOutRightIcon />
                                </div>
                                <PopoverFormButton
                                    loading={loading && !result}
                                    text="Submit Feedback"
                                />
                            </div>
                        </form>
                    }
                    successChild={<AnalysisSuccess />}
                />
            </div>

            <footer className="absolute bottom-6 text-xs text-muted-foreground flex gap-4">
                <span>&copy; 2025 CampusPulse</span>
                <span>•</span>
                <span>Powered by Gemini</span>
            </footer>
        </div>
    );
};

export default ComplaintForm;
