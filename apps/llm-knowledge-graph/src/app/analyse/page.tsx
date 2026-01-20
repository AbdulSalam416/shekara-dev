import { MindGraphSidebar } from '../../components/core/AppSidebar';
import { parsePdf } from '../../services/pdfParser';
import * as fs from 'fs/promises';
import * as path from 'path';

export default async function Index() {
  const pdfPath = path.join(process.cwd(), 'specs/dummy.pdf');
  const pdfBuffer = await fs.readFile(pdfPath);
  const parsedData = await parsePdf(pdfBuffer);
  console.log("Parsed data",parsedData);

  return (
    <div>
      <MindGraphSidebar />
    </div>
  );
}
