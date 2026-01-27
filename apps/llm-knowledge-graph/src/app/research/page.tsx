import  fs from 'fs/promises';
import  path from 'path';
import KnowledgeGraphVisualizer from '../../components/core/KnowledgeGraphVisualizer/KnowledgeGraph';
import MindGraphSidebarContent from '../../components/core/AppSidebar/MindGraphSidebarContent';

export default async function Index() {
  const pdfPath = path.join(process.cwd(), 'specs/dummy.pdf');
  const pdfBuffer = await fs.readFile(pdfPath);


  return (
    <MindGraphSidebarContent>
        <KnowledgeGraphVisualizer  />
    </MindGraphSidebarContent>
  );
}
