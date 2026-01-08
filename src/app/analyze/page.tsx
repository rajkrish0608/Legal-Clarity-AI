'use client';

import React, { useState } from 'react';
import { DocumentUploader } from '@/components/features/DocumentUploader';
import { ResultDisplay } from '@/components/features/ResultDisplay';
import { processDocument } from '@/lib/pipeline/orchestrator';
import { Alert, AlertTitle, AlertDescription, Button, Card, CardContent } from '@/components/ui/simple-ui';
import { ShieldCheck, FileText, Image as ImageIcon, Type, Loader2 } from 'lucide-react';
import { LegalResponse } from '@/types/legal-response';
import { cn } from '@/components/ui/simple-ui';
import { supabase } from '@/lib/supabase/client';
import { AuthButton } from '@/components/features/AuthButton';

type InputMethod = 'pdf' | 'image' | 'text';

export default function AnalyzePage() {
    const [result, setResult] = useState<LegalResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [inputMethod, setInputMethod] = useState<InputMethod>('pdf');
    const [textInput, setTextInput] = useState('');

    const handleAnalysis = async (input: { file?: File, text?: string }) => {
        setProcessing(true);
        setError(null);
        setResult(null);

        try {
            const res = await processDocument({
                inputType: inputMethod,
                file: input.file,
                rawText: input.text
            });

            if (res.success && res.data) {
                setResult(res.data);

                // Save to History (if logged in)
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from('analyses').insert({
                        user_id: user.id,
                        document_type: res.data.severity ? 'government_notice' : 'contract', // Simplified type inference or use logic
                        summary: res.data.summary,
                        full_response: res.data
                    });
                }
            } else {
                setError(res.error || "Analysis failed. Please try again.");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setProcessing(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        await handleAnalysis({ file });
    };

    const handleTextSubmit = async () => {
        if (!textInput.trim()) return;
        await handleAnalysis({ text: textInput });
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Top Navigation */}
                <div className="flex justify-end w-full mb-4">
                    <AuthButton />
                </div>

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 bg-slate-900 rounded-full mb-4">
                        <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Legal Clarity Analysis</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Upload your government notice or contract for a safe, simple explanation.
                    </p>
                </div>

                {/* Main Content Area */}
                {!result && (
                    <div className="space-y-6">
                        {/* Input Method Selector */}
                        <div className="flex justify-center">
                            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                                <button
                                    onClick={() => setInputMethod('pdf')}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                        inputMethod === 'pdf' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    <FileText className="h-4 w-4" /> PDF
                                </button>
                                <button
                                    onClick={() => setInputMethod('image')}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                        inputMethod === 'image' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    <ImageIcon className="h-4 w-4" /> Image
                                </button>
                                <button
                                    onClick={() => setInputMethod('text')}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                        inputMethod === 'text' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    <Type className="h-4 w-4" /> Paste Text
                                </button>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            {inputMethod === 'pdf' && (
                                <DocumentUploader
                                    onUpload={handleFileUpload}
                                    isProcessing={processing}
                                    accept=".pdf"
                                    helperText="Upload PDF Document (Max 10MB)"
                                />
                            )}

                            {inputMethod === 'image' && (
                                <DocumentUploader
                                    onUpload={handleFileUpload}
                                    isProcessing={processing}
                                    accept="image/*"
                                    helperText="Upload Scanned Image (JPG, PNG)"
                                />
                            )}

                            {inputMethod === 'text' && (
                                <div className="space-y-4 max-w-xl mx-auto">
                                    <div className="space-y-2">
                                        <label htmlFor="text-input" className="text-sm font-medium text-slate-700">
                                            Paste your document text below
                                        </label>
                                        <textarea
                                            id="text-input"
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                            placeholder="Copy and paste the content of your notice or contract here..."
                                            className="w-full h-64 p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none text-slate-900 placeholder:text-slate-400"
                                            disabled={processing}
                                        />
                                    </div>
                                    <Button
                                        className="w-full h-12 text-lg"
                                        onClick={handleTextSubmit}
                                        disabled={processing || !textInput.trim()}
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Text...
                                            </>
                                        ) : "Analyze Text"}
                                    </Button>
                                </div>
                            )}

                            {error && (
                                <Alert variant="destructive" className="mt-6">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>
                )}

                {/* Result Section */}
                {result && (
                    <div className="space-y-6">
                        <button
                            onClick={() => setResult(null)}
                            className="text-sm text-slate-500 hover:text-slate-900 underline"
                        >
                            ← Analyze another document
                        </button>
                        <ResultDisplay result={result} />
                    </div>
                )}

            </div>
        </div>
    );
}
