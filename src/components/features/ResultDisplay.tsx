import React from 'react';
import { LegalResponse } from '@/types/legal-response';
import { Card, CardContent, CardHeader, CardTitle, Badge, Alert, AlertTitle, AlertDescription } from '@/components/ui/simple-ui';
import { Info, AlertTriangle, Calendar, CheckCircle } from 'lucide-react';

interface ResultDisplayProps {
    result: LegalResponse;
}

export function ResultDisplay({ result }: ResultDisplayProps) {
    const isHighSeverity = result.severity.level === 'High';
    const isMediumSeverity = result.severity.level === 'Medium';
    const severityColor = isHighSeverity ? 'destructive' : isMediumSeverity ? 'secondary' : 'success';

    // Classification Info
    const classification = result.classification_info;
    const confidence = classification?.confidence || 0;

    let confidenceColor = 'text-red-600';
    let confidenceLabel = 'Low';
    if (confidence >= 80) {
        confidenceColor = 'text-green-600';
        confidenceLabel = 'High';
    } else if (confidence >= 60) {
        confidenceColor = 'text-yellow-600';
        confidenceLabel = 'Moderate';
    }

    const [feedbackGiven, setFeedbackGiven] = React.useState(false);

    const handleFeedback = (isCorrect: boolean) => {
        console.log(`[FEEDBACK] Classification: ${classification?.detailed_type}, Correct: ${isCorrect}, Confidence: ${confidence}`);
        setFeedbackGiven(true);
        // Ideally send to an API endpoint here
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Mixed Document Warning */}
            {classification?.is_mixed && (
                <Alert className="bg-orange-50 border-orange-200 text-orange-900">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertTitle>Mixed Document Detected</AlertTitle>
                    <AlertDescription>
                        This document appears to contain elements of multiple document types. We have analyzed the primary content.
                    </AlertDescription>
                </Alert>
            )}

            {/* Summary Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex flex-col">
                        <CardTitle className="text-xl font-bold">Document Summary</CardTitle>
                        <span className="text-xs text-slate-500 font-medium mt-1">
                            Detected: {classification?.detailed_type.replace(/_/g, ' ').toUpperCase()}
                            <span className={`ml-2 ${confidenceColor}`}>({confidence}% Confidence - {confidenceLabel})</span>
                        </span>
                    </div>
                    <Badge variant={severityColor} className="text-sm px-3 py-1">
                        Severity: {result.severity.level}
                    </Badge>
                </CardHeader>
                <CardContent>
                    <p className="text-lg text-slate-900 dark:text-slate-100 mt-2 font-medium">{result.summary}</p>
                    <div className="mt-4 p-4 bg-slate-900 text-white rounded-lg">
                        <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                            <Info className="h-4 w-4" /> Why you received this
                        </h4>
                        <p className="text-slate-200">{result.why_received}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Risks / Severity Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            {result.hidden_risks.length > 0 ? 'Potential Risks' : 'Severity Analysis'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Always show severity reason */}
                        <div className="border-l-4 border-slate-300 pl-4 py-1">
                            <p className="text-sm font-medium text-slate-500">Severity Logic</p>
                            <p className="text-slate-700">{result.severity.reason}</p>
                        </div>

                        {/* Show Risks if any */}
                        {result.hidden_risks.length > 0 && (
                            <div className="space-y-3 mt-4">
                                {result.hidden_risks.map((risk, idx) => (
                                    <div key={idx} className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 text-sm">
                                        <p className="font-bold text-red-900 dark:text-red-100">{risk.risk}</p>
                                        <p className="text-red-800 dark:text-red-200 mt-1">{risk.explanation}</p>
                                        <p className="text-xs text-red-700 font-semibold mt-2">Impact: {risk.impact}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {result.hidden_risks.length === 0 && (
                            <p className="text-slate-600 font-medium italic">No hidden risks detected based on standard rules.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Action Plan */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            What To Do Next
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {result.what_to_do_next.map((step, idx) => (
                                <li key={idx} className="flex gap-3 items-start">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold shrink-0 text-slate-800">
                                        {idx + 1}
                                    </span>
                                    <span className="text-slate-900 dark:text-slate-100 text-base leading-6 font-medium">{step}</span>
                                </li>
                            ))}
                        </ul>

                        {result.important_dates.length > 0 && (
                            <div className="mt-6 pt-6 border-t font-medium">
                                <h4 className="flex items-center gap-2 mb-2 text-slate-900 font-bold">
                                    <Calendar className="h-4 w-4" /> Important Dates
                                </h4>
                                <ul className="list-disc list-inside text-sm text-slate-800 font-medium">
                                    {result.important_dates.map((d, i) => (
                                        <li key={i}>{d}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Feedback Section */}
            {!feedbackGiven && (
                <div className="flex justify-end gap-2 text-sm text-slate-500">
                    <span>Was this document type correct?</span>
                    <button onClick={() => handleFeedback(true)} className="text-green-600 font-bold hover:underline">Yes</button>
                    <span>/</span>
                    <button onClick={() => handleFeedback(false)} className="text-red-600 font-bold hover:underline">No</button>
                    <span>(Check console for log)</span>
                </div>
            )}
            {feedbackGiven && (
                <div className="flex justify-end text-sm text-slate-500 italic">
                    Thanks for your feedback!
                </div>
            )}

            {/* Disclaimer */}
            <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-xs">
                    {result.disclaimer}
                </AlertDescription>
            </Alert>

        </div>
    );
}
