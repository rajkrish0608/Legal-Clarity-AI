'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { LegalResponse } from '@/types/legal-response';
import { ResultDisplay } from '@/components/features/ResultDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/simple-ui';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AnalysisRecord {
    id: string;
    created_at: string;
    document_type: string;
    summary: string;
    full_response: LegalResponse; // Stored as JSONB
}

export default function HistoryPage() {
    const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchHistory = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/');
                return;
            }

            const { data, error } = await supabase
                .from('analyses')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setAnalyses(data);
            }
            setLoading(false);
        };

        fetchHistory();
    }, [router]);

    if (loading) {
        return <div className="p-8 text-center">Loading history...</div>;
    }

    if (selectedAnalysis) {
        return (
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <button
                        onClick={() => setSelectedAnalysis(null)}
                        className="text-sm text-slate-500 hover:text-slate-900 underline"
                    >
                        ← Back to History
                    </button>
                    <ResultDisplay result={selectedAnalysis.full_response} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-slate-900">Your Analysis History</h1>
                    <Link href="/analyze" className="text-blue-600 hover:underline">
                        + New Analysis
                    </Link>
                </div>

                <div className="grid gap-4">
                    {analyses.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            No analyses saved yet.
                        </div>
                    ) : (
                        analyses.map((item) => (
                            <Card
                                key={item.id}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => setSelectedAnalysis(item)}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg font-medium capitalize text-slate-800">
                                            {item.document_type.replace('_', ' ')}
                                        </CardTitle>
                                        <span className="text-xs text-slate-400">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-600 line-clamp-2">
                                        {item.summary}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
