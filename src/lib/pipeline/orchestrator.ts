import { extractText } from '@/lib/extractors/text-extractor';
import { extractMetadata } from '@/lib/analysis/metadata-extractor';
import { classifyDocument } from '@/lib/analysis/classifiers';
import { determineSeverity, detectContractRisks } from '@/lib/analysis/rule-engine';
import { generateExplanation } from '@/lib/analysis/explanation-generator';
import { performSafetyCheck, ensureDisclaimer } from '@/lib/safety/guardrails';
import { LegalResponse } from '@/types/legal-response';
import { performOCR } from '@/lib/extractors/ocr-extractor';

export interface PipelineResult {
    success: boolean;
    data?: LegalResponse;
    error?: string;
    stage?: string;
}

export type InputType = 'pdf' | 'image' | 'text';

export interface ProcessInput {
    inputType: InputType;
    file?: File;
    rawText?: string;
}

export async function processDocument(input: ProcessInput): Promise<PipelineResult> {
    try {
        // Stage 1: Text Extraction
        console.log('Stage 1: Text Extraction...');
        let text = '';

        if (input.inputType === 'text') {
            if (!input.rawText || input.rawText.trim().length < 10) {
                return { success: false, error: 'Pasted text is too short.', stage: 'extraction' };
            }
            text = input.rawText;
        } else if (input.inputType === 'image') {
            if (!input.file) return { success: false, error: 'No file provided for image analysis.', stage: 'extraction' };
            // Force OCR for image mode
            text = await performOCR(input.file);
        } else if (input.inputType === 'pdf') {
            if (!input.file) return { success: false, error: 'No file provided for PDF analysis.', stage: 'extraction' };
            // Use smart extractor (PDF/OCR hybrid)
            text = await extractText(input.file);
        }

        if (!text || text.length < 20) {
            console.error(`Extraction failed. Text length: ${text?.length || 0}`);
            return { success: false, error: 'Could not extract sufficient text (minimum 20 characters required).', stage: 'extraction' };
        }

        // Stage 2: Metadata Extraction
        console.log('Stage 2: Metadata Extraction...');
        const metadata = extractMetadata(text);

        // Stage 3: Classification
        console.log('Stage 3: Classification...');
        // Stage 3: Classification
        console.log('Stage 3: Classification...');
        const classificationResult = classifyDocument(text, metadata);
        const detailedDocType = classificationResult.documentType;

        // Map to Broad Types for Rule Engine compatibility
        let broadType: 'government_notice' | 'legal_payment_notice' | 'contract' | 'unknown' = 'unknown';

        if (detailedDocType === 'TAX_NOTICE' || detailedDocType === 'government_notice') {
            broadType = 'government_notice';
        } else if (detailedDocType === 'LEGAL_PAYMENT_NOTICE' || detailedDocType === 'legal_payment_notice') {
            broadType = 'legal_payment_notice';
        } else if (['EMPLOYMENT_OFFER', 'NDA', 'GENERAL_CONTRACT', 'RENT_AGREEMENT', 'TERMINATION_NOTICE', 'contract'].includes(detailedDocType)) {
            broadType = 'contract';
        }

        if (broadType === 'unknown') {
            // ideally ask user, defaulted for now
        }

        // Stage 4: Rule Engine Application
        console.log('Stage 4: Rule Engine...');
        let severity;
        let risks;

        if (broadType === 'government_notice') {
            severity = determineSeverity(metadata);
        } else if (broadType === 'legal_payment_notice') {
            // Default Severity for Legal Payment Notice
            severity = {
                level: 'Medium' as const,
                reason: 'A legal notice for outstanding payment requires attention to avoid escalation.'
            };
        } else {
            // Contract or unknown (treat as contract for risk scan)
            risks = detectContractRisks(text);
        }

        // Stage 5: Explain (LLM/Mock)
        console.log('Stage 5: Explanation Generation...');
        let response = await generateExplanation(
            text,
            metadata,
            detailedDocType, // Pass detailed type
            severity,
            risks,
            { // Pass new classification info
                detailed_type: detailedDocType,
                confidence: classificationResult.confidence,
                is_mixed: classificationResult.mixed
            }
        );

        // Override severity/risks with Rules where applicable
        if (broadType === 'government_notice' && severity) {
            response.severity = severity; // Force rule-based severity
        } else if (broadType === 'legal_payment_notice' && severity) {
            response.severity = severity; // Force default severity
        }

        // Stage 6: Safety Check
        console.log('Stage 6: Safety Check...');
        const safetyResult = performSafetyCheck(response);
        if (!safetyResult.valid) {
            console.warn('Safety Check Failed:', safetyResult.errors);

            // Stage 7: Safety Rewrite (Simple Scrubbing/Rejection for now)
            return {
                success: false,
                error: `Safety Validation Failed: ${safetyResult.errors[0]}`,
                stage: 'safety'
            };
        }

        // Stage 8: Final Polish
        response = ensureDisclaimer(response);

        return {
            success: true,
            data: response
        };

    } catch (err: any) {
        console.error('Pipeline Error:', err);
        return {
            success: false,
            error: err.message || 'An unexpected error occurred.',
            stage: 'unknown'
        };
    }
}
