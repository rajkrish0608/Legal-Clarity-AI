export type SeverityLevel = 'Low' | 'Medium' | 'High';

export interface Severity {
    level: SeverityLevel;
    reason: string;
}

export interface HiddenRisk {
    risk: string;
    explanation: string;
    impact: string;
}

export interface LegalResponse {
    summary: string;
    why_received: string;
    severity: Severity;
    hidden_risks: HiddenRisk[];
    what_to_do_next: string[];
    important_dates: string[];
    disclaimer: string;
}

export type DocumentType = 'government_notice' | 'legal_payment_notice' | 'contract' | 'unknown';

export interface Metadata {
    dates: string[];
    amounts: string[];
    sections: string[];
    keywords: string[];
    hasDemand: boolean;
}
