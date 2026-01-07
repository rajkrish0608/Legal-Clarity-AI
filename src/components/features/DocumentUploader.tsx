'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/simple-ui';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/components/ui/simple-ui';

interface DocumentUploaderProps {
    onUpload: (file: File) => Promise<void>;
    isProcessing: boolean;
    accept?: string;
    helperText?: string;
}

export function DocumentUploader({ onUpload, isProcessing, accept = ".pdf,image/*", helperText = "PDF, JPG, PNG (Max 10MB)" }: DocumentUploaderProps) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    }, []);

    const handleSubmit = async () => {
        if (file) {
            await onUpload(file);
        }
    };

    const clearFile = () => setFile(null);

    // Reset file if accept changes (tab switch)
    React.useEffect(() => {
        setFile(null);
    }, [accept]);

    return (
        <div className="w-full max-w-xl mx-auto">
            {!file ? (
                <div
                    className={cn(
                        "relative border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer hover:bg-slate-50",
                        dragActive ? "border-slate-600 bg-slate-50" : "border-slate-300"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={handleChange}
                    />
                    <div className="flex flex-col items-center gap-3 text-slate-600">
                        <div className="p-4 bg-slate-100 rounded-full">
                            <Upload className="h-6 w-6 text-slate-500" />
                        </div>
                        <p className="font-medium text-lg">Click to upload or drag and drop</p>
                        <p className="text-sm text-slate-400">{helperText}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-medium text-sm text-slate-900 truncate max-w-[200px]">{file.name}</p>
                                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <Button variant="outline" size="icon" onClick={clearFile} disabled={isProcessing} className="hover:bg-red-50 hover:text-red-500 border-none">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <Button
                        className="w-full h-12 text-lg"
                        onClick={handleSubmit}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Document...
                            </>
                        ) : "Analyze Now"}
                    </Button>
                </div>
            )}
        </div>
    );
}
