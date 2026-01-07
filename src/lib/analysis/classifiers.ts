import { DocumentType, Metadata } from '@/types/legal-response';

export function classifyDocument(text: string, metadata: Metadata): DocumentType {
    const upperText = text.toUpperCase();

    // 1. Tax Indicators (STRICT - "NOTICE" alone is not enough)
    const taxIndicators = [
        'INCOME TAX',
        'SECTION 143',
        'SECTION 156',
        'SECTION 148',
        'NOTICE OF DEMAND',
        'INTIMATION U/S',
        'CENTRAL BOARD OF DIRECT TAXES',
        'ITBA'
    ];

    if (taxIndicators.some(ind => upperText.includes(ind))) {
        return 'government_notice';
    }

    // 2. Legal Payment Indicators
    const paymentIndicators = [
        'LEGAL NOTICE',
        'OUTSTANDING PAYMENT',
        'DUES',
        'SERVICES RENDERED',
        'FINAL NOTICE',
        'DEMAND NOTICE', // Ambiguous, but if not tax, likely general legal
        'RECOVERY OF DUES'
    ];

    if (paymentIndicators.some(ind => upperText.includes(ind))) {
        return 'legal_payment_notice';
    }

    // 3. Contract Indicators
    const contractIndicators = [
        'EMPLOYMENT AGREEMENT',
        'APPOINTMENT LETTER',
        'NON-DISCLOSURE AGREEMENT',
        'CONFIDENTIALITY AGREEMENT',
        'LEASE AGREEMENT',
        'MUTUAL AGREEMENT',
        'THIS AGREEMENT',
        'BY AND BETWEEN',
        'OFFER LETTER'
    ];

    if (contractIndicators.some(ind => upperText.includes(ind))) {
        return 'contract';
    }

    // 4. Fallback based on metadata keywords if text scan fails
    if (metadata.sections.some(s => s.includes('143') || s.includes('156') || s.includes('148'))) {
        return 'government_notice';
    }

    return 'unknown';
}
