'use server';

import { DocumentType, LegalResponse, Metadata, Severity, HiddenRisk } from '@/types/legal-response';
import { MOCK_FIXTURES } from '../mock-data/fixtures';
import { selectExplanationTemplate } from './explanation-templates';
import OpenAI from 'openai';

// Lazy init to prevent crashes in tests/builds without API key
const getOpenAIClient = () => new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateExplanation(
    text: string,
    metadata: Metadata,
    docType: DocumentType,
    severity?: Severity,
    risks?: HiddenRisk[],
    classificationInfo?: { detailed_type: string; confidence: number; is_mixed: boolean; },
    targetLanguage: string = 'English'
): Promise<LegalResponse> {
    const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_LLM !== 'false';

    if (USE_MOCK) {
        return getMockResponse(docType, severity, risks, text, metadata, classificationInfo);
    }

    try {
        console.log(`Generating explanation using Real AI in ${targetLanguage}...`);
        const templateInstruction = selectExplanationTemplate(docType);

        const prompt = `
        ${templateInstruction}

        IMPORTANT: Provide the response in ${targetLanguage}.
        Translate all summary, reasons, risk explanations, and advice into ${targetLanguage}.
        Keep the keys in JSON (like "summary", "why_received") in English, but the values should be in ${targetLanguage}.

        Analyze the following text and provide a JSON response matching this schema:
        {
          "summary": "string",
          "why_received": "string",
          "severity": { "level": "Low" | "Medium" | "High", "reason": "string" },
          "hidden_risks": [ { "risk": "string", "explanation": "string", "impact": "string" } ],
          "what_to_do_next": ["string", "string"],
          "disclaimer": "Standard legal disclaimer"
        }

        Document Type: ${docType}
        Classification Confidence: ${classificationInfo?.confidence}%
        Extracted Metadata amounts: ${metadata.amounts.join(', ')}
        Extracted Metadata sections: ${metadata.sections.join(', ')}

        TEXT:
        ${text.substring(0, 3000)}
        `;

        const completion = await getOpenAIClient().chat.completions.create({
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

        // Attach classification info
        aiResponse.classification_info = classificationInfo;

        return aiResponse;

    } catch (error) {
        console.error("AI Generation Error:", error);
        console.warn("Falling back to Mock.");
        return getMockResponse(docType, severity, risks, text, metadata, classificationInfo);
    }
}

function getMockResponse(
    docType: DocumentType,
    severity?: Severity,
    risks?: HiddenRisk[],
    text?: string,
    metadata?: Metadata,
    classificationInfo?: { detailed_type: string; confidence: number; is_mixed: boolean; }
): LegalResponse {
    const upperText = text?.toUpperCase() || '';

    // Special safety test trigger - KEPT FOR SAFETY TESTING
    if (upperText.includes('ILLEGAL FINE')) {
        return MOCK_FIXTURES.UNSAFE_TEST;
    }

    // STRICT Deterministic Mock Selection
    let response: LegalResponse;

    // Direct mapping from docType to fixture base
    switch (docType) {
        case 'employment_offer':
            // ALWAYS return Safe Contract for Offers, but enrich with specific metadata if needed
            response = { ...MOCK_FIXTURES.CONTRACT_SAFE };
            response.summary = "This is a standard Employment Offer."; // Override summary to be specific
            break;

        case 'nda':
            // ALWAYS return Risky Contract for NDAs as they are restrictive by nature
            response = { ...MOCK_FIXTURES.CONTRACT_RISKY };
            response.summary = "This is a Non-Disclosure Agreement (NDA).";
            break;

        case 'tax_notice':
        case 'government_notice': // Fallback for legacy
            if (upperText.includes('156') || upperText.includes('DEMAND') || upperText.includes('OUTSTANDING')) {
                response = { ...MOCK_FIXTURES.NOTICE_HIGH_SEVERITY };
            } else {
                response = { ...MOCK_FIXTURES.NOTICE_LOW_SEVERITY };
            }
            break;

        case 'legal_payment_notice':
            response = { ...MOCK_FIXTURES.LEGAL_PAYMENT_NOTICE_FIXTURE };
            break;

        case 'rent_agreement':
            response = { ...MOCK_FIXTURES.CONTRACT_SAFE };
            response.summary = "This is a Rent Agreement.";
            break;

        case 'termination_notice':
            response = { ...MOCK_FIXTURES.NOTICE_HIGH_SEVERITY };
            response.summary = "This is a Termination Notice.";
            break;

        case 'general_contract':
        case 'contract':
            response = { ...MOCK_FIXTURES.CONTRACT_SAFE };
            break;

        default:
            response = { ...MOCK_FIXTURES.GENERIC_UNKNOWN };
            break;
    }

    // FIX 4: Date Extraction Safety
    if (metadata?.dates) {
        response.important_dates = metadata.dates;
    } else {
        response.important_dates = [];
    }

    // Inject risks if provided (from rule engine), without changing base type logic
    if (risks && risks.length > 0) {
        // Create a new array to avoid mutating the fixture
        response.hidden_risks = [...response.hidden_risks];
        risks.forEach(r => {
            if (!response.hidden_risks.some(mr => mr.risk === r.risk)) {
                response.hidden_risks.push(r);
            }
        });
    }

    // Attach classification info
    response.classification_info = classificationInfo;

    return response;
}

