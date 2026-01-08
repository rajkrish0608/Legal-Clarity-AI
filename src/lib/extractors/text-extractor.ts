import { extractPdfText } from './pdf-extractor'; // Server Action
import { performOCR } from './ocr-extractor';

export async function extractText(file: File): Promise<string> {
    // If it's a PDF, try server-side extraction first
    if (file.type === 'application/pdf') {
        const formData = new FormData();
        formData.append('file', file);

        // Call Server Action
        let text = await extractPdfText(formData);

        // Fallback to OCR if text is garbage or empty (< 50 chars as per rule)
        if (!text || text.trim().length < 20) {
            console.log('PDF text is insufficient, falling back to OCR...');
            text = await performOCR(file);
        }
        return text || '';
    }

    // If it's an image, straight to OCR
    if (file.type.startsWith('image/')) {
        return await performOCR(file);
    }

    throw new Error('Unsupported file type');
}
