'use server';

import { DocumentType, LegalResponse, Metadata, Severity, HiddenRisk } from '@/types/legal-response';
import { MOCK_FIXTURES } from '@/lib/mock-data/fixtures';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateExplanation(
    text: string,
    metadata: Metadata,
    docType: DocumentType,
    severity?: Severity,
    risks?: HiddenRisk[]
): Promise<LegalResponse> {
    const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_LLM !== 'false';

    if (USE_MOCK) {
        return getMockResponse(docType, severity, risks, text, metadata);
    }

    try {
        console.log("Generating explanation using Real AI...");
        const prompt = `
        You are a Legal AI Assistant. Analyze the following document text and provide a JSON response matches this schema:
        {
          "summary": "string",
          "why_received": "string",
          "severity": { "level": "Low" | "Medium" | "High", "reason": "string" },
          "hidden_risks": [ { "risk": "string", "explanation": "string", "impact": "string" } ],
          "what_to_do_next": ["string", "string"],
          "disclaimer": "Standard legal disclaimer"
        }

        Document Type: ${docType}
        Extracted Metadata amounts: ${metadata.amounts.join(', ')}
        Extracted Metadata sections: ${metadata.sections.join(', ')}

        TEXT:
        ${text.substring(0, 3000)}
        `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful legal assistant." }, { role: "user", content: prompt }],
            model: "gpt-4o",
            response_format: { type: "json_object" },
        });

        const rawContent = completion.choices[0].message.content;
        if (!rawContent) throw new Error("No content from OpenAI");

        const aiResponse = JSON.parse(rawContent) as LegalResponse;

        // Safety Overrides
        // 1. Force dates from metadata to avoid hallucination
        aiResponse.important_dates = metadata.dates || [];

        // 2. Ensure disclaimer exists
        if (!aiResponse.disclaimer) {
            aiResponse.disclaimer = "This explanation is for informational purposes only and does not constitute legal advice.";
        }

        return aiResponse;

    } catch (error) {
        console.error("AI Generation Error:", error);
        console.warn("Falling back to Mock.");
        return getMockResponse(docType, severity, risks, text, metadata);
    }
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
        else response = { ...MOCK_FIXTURES.GENERIC_UNKNOWN }; // Ultimate safe fallback
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
