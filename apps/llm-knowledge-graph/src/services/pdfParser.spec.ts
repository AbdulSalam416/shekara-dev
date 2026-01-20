import * as fs from 'fs';
import * as path from 'path';
import { parsePdf } from './pdfParser';

describe('pdfParser', () => {
  it('should parse a PDF file and extract its text content', async () => {
    const pdfPath = path.resolve(__dirname, '../../specs/dummy.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    const text = await parsePdf(pdfBuffer);
    expect(text.trim()).toBe('Dummy PDF file');
  });
});
