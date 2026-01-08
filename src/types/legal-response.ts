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
    classification_info?: {
        detailed_type: string;
        confidence: number;
        is_mixed: boolean;
    };
}

export type DocumentType =
    | 'government_notice' // Legacy mapping from tax_notice
    | 'legal_payment_notice'
    | 'contract' // Legacy/fallback
    | 'unknown'
    | 'employment_offer'
    | 'nda'
    | 'tax_notice'
    | 'general_contract'
    | 'rent_agreement'
    | 'termination_notice';

export interface ClassificationResult {
    documentType: DocumentType;
    confidence: number;
    mixed: boolean;
    scores: Record<string, number>;
}

export interface Metadata {
    dates: string[];
    amounts: string[];
    sections: string[];
    keywords: string[];
    hasDemand: boolean;
}
