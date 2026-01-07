import { DocumentType, LegalResponse, Metadata, Severity, HiddenRisk } from '@/types/legal-response';
import { MOCK_FIXTURES } from '@/lib/mock-data/fixtures';

export async function generateExplanation(
    text: string,
    metadata: Metadata,
    docType: DocumentType,
    severity?: Severity,
    risks?: HiddenRisk[]
): Promise<LegalResponse> {
    const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_LLM !== 'false'; // Default to true

    if (USE_MOCK) {
        return getMockResponse(docType, severity, risks, text, metadata);
    }

    // TODO: Implement Real LLM Call here
    // For now, fall back to mock
    console.warn('Real LLM not implemented yet, using mock.');
    return getMockResponse(docType, severity, risks, text, metadata);
}

function getMockResponse(
    docType: DocumentType,
    severity?: Severity,
    risks?: HiddenRisk[],
    text?: string,
    metadata?: Metadata
): LegalResponse {
    const upperText = text?.toUpperCase() || '';

    // Special safety test trigger
    if (upperText.includes('ILLEGAL FINE')) {
        return MOCK_FIXTURES.UNSAFE_TEST;
    }

    // Mock Selection Logic
    let response: LegalResponse;

    if (docType === 'government_notice') {
        const isTax = upperText.includes('INCOME TAX') || upperText.includes('143') || upperText.includes('156');
        if (upperText.includes('156') || upperText.includes('DEMAND') || (isTax && upperText.includes('OUTSTANDING'))) {
            response = { ...MOCK_FIXTURES.NOTICE_HIGH_SEVERITY };
        } else if (upperText.includes('143') || upperText.includes('INTIMATION')) {
            response = { ...MOCK_FIXTURES.NOTICE_LOW_SEVERITY };
        } else {
            // Default tax notice if classified as such but undefined subtype
            response = { ...MOCK_FIXTURES.NOTICE_LOW_SEVERITY };
        }
    } else if (docType === 'legal_payment_notice') {
        response = { ...MOCK_FIXTURES.LEGAL_PAYMENT_NOTICE_FIXTURE };
    } else if (docType === 'contract') {
        if (upperText.includes('LOCK-IN') || upperText.includes('LOCK IN') || upperText.includes('BOND')) {
            // Use Risky fixture base
            const baseResponse = MOCK_FIXTURES.CONTRACT_RISKY;
            // Ensure detected risks are included
            const mergedRisks = [...baseResponse.hidden_risks];
            if (risks) {
                risks.forEach(r => {
                    if (!mergedRisks.some(mr => mr.risk === r.risk)) {
                        mergedRisks.push(r);
                    }
                });
            }
            response = {
                ...baseResponse,
                hidden_risks: mergedRisks
            };
        } else {
            // Default safe contract
            response = { ...MOCK_FIXTURES.CONTRACT_SAFE };
        }
    } else {
        // Unknown type default fallback
        if (upperText.includes('143')) response = { ...MOCK_FIXTURES.NOTICE_LOW_SEVERITY };
        else if (upperText.includes('156')) response = { ...MOCK_FIXTURES.NOTICE_HIGH_SEVERITY };
        else if (upperText.includes('LOCK')) response = { ...MOCK_FIXTURES.CONTRACT_RISKY };
        else response = { ...MOCK_FIXTURES.NOTICE_LOW_SEVERITY }; // Ultimate safe fallback
    }

    // FIX 4: Date Extraction Safety
    // Overwrite the mock dates with actual dates found in the document
    // If no dates found, result should be empty.
    if (metadata?.dates) {
        response.important_dates = metadata.dates;
    } else {
        response.important_dates = [];
    }

    return response;
}
