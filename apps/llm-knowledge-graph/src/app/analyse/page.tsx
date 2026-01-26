import { MindGraphSidebar } from '../../components/core/AppSidebar';
import  fs from 'fs/promises';
import  path from 'path';
import KnowledgeGraphVisualizer from '../../components/core/KnowledgeGraphVisualizer/KnowledgeGraph';

export default async function Index() {
  const pdfPath = path.join(process.cwd(), 'specs/dummy.pdf');
  const pdfBuffer = await fs.readFile(pdfPath);


  return (
    <div className="flex h-screen max-w-screen">
      <MindGraphSidebar />
      <main className="flex-1">
        <KnowledgeGraphVisualizer  />
      </main>

    </div>
  );
}
