import  fs from 'fs/promises';
import  path from 'path';
import KnowledgeGraphVisualizer from '../../components/core/KnowledgeGraphVisualizer/KnowledgeGraph';
import GapAnalysis from '../../components/GapAnalysis';
import MindGraphResearchLayout from '../../components/core/MindGraphResearch';

export default async function Index() {
  const pdfPath = path.join(process.cwd(), 'specs/dummy.pdf');
  const pdfBuffer = await fs.readFile(pdfPath);


  return (

    <MindGraphResearchLayout>
      <div className="flex">
        <div className="flex-1 ">
          <KnowledgeGraphVisualizer />
        </div>
        <div className={'flex-1'}><GapAnalysis /></div>
      </div>
    </MindGraphResearchLayout>
  );
}
