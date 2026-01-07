import { processDocument, ProcessInput } from '@/lib/pipeline/orchestrator';
import { describe, it, expect, vi } from 'vitest';
import * as ocrExtractor from '@/lib/extractors/ocr-extractor';
import * as textExtractor from '@/lib/extractors/text-extractor';

// Mock dependencies
vi.mock('@/lib/extractors/ocr-extractor', () => ({
    performOCR: vi.fn(),
}));

vi.mock('@/lib/extractors/text-extractor', () => ({
    extractText: vi.fn(),
}));

describe('Pipeline Orchestrator Inputs', () => {

    it('should process TEXT input directly', async () => {
        const input: ProcessInput = {
            inputType: 'text',
            rawText: "This is a Notice of Demand under Section 156 for Rs. 50,000."
        };

        const result = await processDocument(input);

        expect(result.success).toBe(true);
        expect(result.data?.severity.level).toBe('High'); // 156 -> High
    });

    it('should fail if TEXT input is too short', async () => {
        const input: ProcessInput = {
            inputType: 'text',
            rawText: "Too short"
        };
        const result = await processDocument(input);
        expect(result.success).toBe(false);
        expect(result.error).toContain('too short');
    });

    it('should use OCR for IMAGE input', async () => {
        // Must be > 50 chars to pass extraction stage
        vi.spyOn(ocrExtractor, 'performOCR').mockResolvedValue("This is a generic section 143(1) intimation from the Income Tax Dept, confirming return processing.");

        const file = new File(["dummy"], "test.png", { type: "image/png" });
        const input: ProcessInput = {
            inputType: 'image',
            file: file
        };

        const result = await processDocument(input);

        expect(ocrExtractor.performOCR).toHaveBeenCalledWith(file);
        expect(result.success).toBe(true);
        expect(result.data?.severity.level).toBe('Low');
    });

    it('should use Smart Extractor for PDF input', async () => {
        // Must be > 50 chars
        vi.spyOn(textExtractor, 'extractText').mockResolvedValue("Employment Agreement with lock-in period of 2 years. This text is long enough to pass validation.");

        const file = new File(["dummy"], "test.pdf", { type: "application/pdf" });
        const input: ProcessInput = {
            inputType: 'pdf',
            file: file
        };

        const result = await processDocument(input);

        expect(textExtractor.extractText).toHaveBeenCalledWith(file);
        expect(result.success).toBe(true);
        // "contract" vs "Contract" check
        expect(result.data?.summary.toLowerCase()).toContain('contract');
    });
});
