'use server';

export async function extractPdfText(formData: FormData): Promise<string> {
    try {
        // @ts-ignore
        const pdf = require('pdf-parse'); // Move inside to prevent build-time/init-time errors

        const file = formData.get('file') as File;
        if (!file) throw new Error('No file provided');

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const data = await pdf(buffer);
        return data.text;
    } catch (error) {
        console.error('PDF Extraction Error:', error);
        return '';
    }
}
