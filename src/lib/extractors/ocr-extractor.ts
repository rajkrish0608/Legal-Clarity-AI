import { createWorker } from 'tesseract.js';

export async function performOCR(file: File): Promise<string> {
    try {
        const worker = await createWorker('eng');
        const ret = await worker.recognize(file);
        await worker.terminate();
        return ret.data.text;
    } catch (error) {
        console.error('OCR Error:', error);
        return '';
    }
}
