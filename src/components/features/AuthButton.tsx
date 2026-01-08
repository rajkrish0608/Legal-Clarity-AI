'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/simple-ui';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { History, LogOut, Loader2 } from 'lucide-react';

export function AuthButton() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const [showInput, setShowInput] = useState(false);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async () => {
        if (!email) return;
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/analyze`,
            },
        });
        if (error) {
            setMessage(error.message);
        } else {
            setMessage('Check your email for the login link!');
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setShowInput(false);
    };

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <Link href="/history">
                    <Button variant="outline" className="flex items-center gap-2 border-slate-200">
                        <History className="h-4 w-4" /> History
                    </Button>
                </Link>
                <div className="text-sm text-slate-600 hidden sm:block">
                    {user.email}
                </div>
                <Button onClick={handleLogout} variant="ghost" size="sm" className="text-slate-500 hover:text-red-600">
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    if (!showInput) {
        return (
            <Button onClick={() => setShowInput(true)} variant="outline" className="shadow-sm border-slate-200">
                Sign In
            </Button>
        );
    }

    return (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {!message ? (
                <>
                    <input
                        type="email"
                        placeholder="Enter email..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 w-48 shadow-sm"
                        autoFocus
                    />
                    <Button onClick={handleLogin} disabled={loading || !email} className="bg-slate-900 text-white hover:bg-slate-800">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Link'}
                    </Button>
                    <button onClick={() => setShowInput(false)} className="text-xs text-slate-400 hover:text-slate-600 px-1">Cancel</button>
                </>
            ) : (
                <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-md border border-green-100">
                    <span className="text-sm text-green-700 font-medium">{message}</span>
                    <button onClick={() => { setMessage(''); setShowInput(false); }} className="text-xs text-green-600 hover:underline">Close</button>
                </div>
            )}
        </div>
    );
}
