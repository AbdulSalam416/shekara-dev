import { PDFParse, TextResult } from 'pdf-parse';

// Set the workerSrc to point to the CDN version for simplicity first.
PDFParse.setWorker('https://cdn.jsdelivr.net/npm/pdf-parse@latest/dist/pdf-parse/web/pdf.worker.mjs');

/**
 * Parses a PDF file buffer and extracts its text content.
 * @param fileBuffer The PDF file content as a Buffer.
 * @returns A promise that resolves with the extracted text content.
 */
export async function parsePdf(fileBuffer: Buffer): Promise<TextResult> {
  try {
    const uint8ArrayCopy = new Uint8Array(fileBuffer);
    const parser =  new PDFParse(uint8ArrayCopy);
    return  await parser.getText();
  } catch (error) {
    // TODO: Implement more robust error handling.
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file.');
  }
}
