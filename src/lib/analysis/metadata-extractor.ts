import { Metadata } from '@/types/legal-response';

export function extractMetadata(text: string): Metadata {
    const dateRegex = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b|\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{2,4})\b/gi;
    const amountRegex = /(?:Rs\.?|INR|₹)\s*[\d,]+(?:\.\d{2})?|\b[\d,]+\s*(?:lakhs?|crores?|cr|L)\b/gi;
    const sectionRegex = /Section\s+(\d+(?:\([A-Z0-9]+\))?)/gi;
    const demandRegex = /demand|outstanding|payable/i;

    const dates = (text.match(dateRegex) || []).map(s => s.trim());
    const amounts = (text.match(amountRegex) || []).map(s => s.trim());
    const sections = Array.from(text.matchAll(sectionRegex)).map(m => m[1]);
    const hasDemand = demandRegex.test(text);

    // Extract other potentially useful keywords
    const keywordRegex = /\b(Intimation|Employment|Appointment|NDA|Confidentiality|Lease)\b/gi;
    const keywords = (text.match(keywordRegex) || []).map(s => s.trim());

    return {
        dates: Array.from(new Set(dates)), // Unique dates
        amounts: Array.from(new Set(amounts)),
        sections: Array.from(new Set(sections)),
        keywords: Array.from(new Set(keywords)),
        hasDemand
    };
}
