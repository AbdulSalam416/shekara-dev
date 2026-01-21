import { MindGraphSidebar } from '../../components/core/AppSidebar';
import { parsePdf } from '../../services/pdfParser';
import * as fs from 'fs/promises';
import * as path from 'path';
import ResearchGraphExtractor from '../../services/graphExtractionService';

export default async function Index() {
  const pdfPath = path.join(process.cwd(), 'specs/dummy.pdf');
  const pdfBuffer = await fs.readFile(pdfPath);
  const parsedData = await parsePdf(pdfBuffer);

  const graphExtractor = new ResearchGraphExtractor();
  const graphData = await graphExtractor.extractFromPaper(parsedData.pages[0].text);
  console.log('Extracted Graph Data:', JSON.stringify(graphData, null, 2));

  return (
    <div>
      <MindGraphSidebar />
    </div>
  );
}
