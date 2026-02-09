'use client';

import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Button,
} from '@shekara-dev/ui';
import { useGraphStore } from '../../store/graphStore';
import { Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generateGraphScreenshot: () => Promise<string | null>;
  graphImage: string | null;
}

export function ExportDialog({ open, onOpenChange, generateGraphScreenshot, graphImage }: ExportDialogProps) {
  const { currentGraph, currentCentralityAnalysis } = useGraphStore();
  const exportContentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = React.useState(false);

  const handleDownloadPdf = async () => {
    setLoading(true);
    if (!exportContentRef.current) {
      setLoading(false);
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    let yOffset = 10; // Initial y-offset for content

    // Add textual content
    const textInput = exportContentRef.current;
    let textCanvas;
    try {
      textCanvas = await html2canvas(textInput, {
        scale: 2,
        useCORS: true,
        logging: true,
        allowTaint: true,
      });
    } catch (error) {
      console.error("Error generating text canvas with html2canvas:", error);
      setLoading(false);
      return;
    }
    let textImgData: string;
    try {
      textImgData = textCanvas.toDataURL('image/png');
    } catch (error) {
      console.error("Error converting text canvas to data URL:", error);
      setLoading(false);
      return;
    }
    
    if (!textImgData || textImgData === 'data:,') { // Check if data URL is empty or invalid
      console.error("html2canvas failed to generate valid text image data.");
      setLoading(false);
      return; // Exit if text image data is invalid
    }

    const textImgHeight = (textCanvas.height * pdfWidth) / textCanvas.width;

    pdf.addImage(textImgData, 'PNG', 0, yOffset, pdfWidth, textImgHeight);
    yOffset += textImgHeight + 10; // Add height of text image + padding

    // Add graph image if available
    let currentGraphImage = graphImage;
    if (!currentGraphImage) {
      currentGraphImage = await generateGraphScreenshot();
    }

    if (currentGraphImage) {
      if (!currentGraphImage || currentGraphImage === 'data:,') { // Check if data URL is empty or invalid
        console.warn("Graph image data is invalid or empty, skipping addition to PDF.");
      } else {
        // Check if the graph image will fit on the current page
        if (yOffset + 100 > pdfHeight) { // Rough estimate for graph height
          pdf.addPage();
          yOffset = 10;
        }
        pdf.text("Knowledge Graph Visualization", 10, yOffset);
        yOffset += 5; // Padding for title
        pdf.addImage(currentGraphImage, 'PNG', 10, yOffset, pdfWidth - 20, (pdfWidth - 20) * (9 / 16)); // Aspect ratio 16:9
        yOffset += (pdfWidth - 20) * (9 / 16) + 10; // Update y-offset
      }
    }

    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    pdf.save(`MindGraph_Analysis_${timestamp}.pdf`);
    setLoading(false);
    onOpenChange(false); // Close dialog after download
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Export Analysis as PDF</DialogTitle>
          <DialogDescription>
            Preview of the current graph and analysis. Click download to save as PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-0">
          <div
            ref={exportContentRef}
            className="bg-background p-6 rounded-lg shadow-lg"
            // Temporarily hide this div and rely on screenshot for text capture
            style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}
          >
            <h1 className="text-2xl font-bold mb-4 text-foreground">MindGraph AI Analysis Report</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Generated on: {format(new Date(), 'PPP p')}
            </p>

            {currentGraph && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3 text-foreground">Graph Overview</h2>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">Total Nodes:</span> {currentGraph.nodes.length}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Total Edges:</span> {currentGraph.relationships.length}
                  </div>
                  {currentGraph.metadata?.num_papers && (
                    <div>
                      <span className="font-medium text-foreground">Papers Analyzed:</span> {currentGraph.metadata.num_papers}
                    </div>
                  )}
                  {currentGraph.metadata?.description && (
                    <div className="col-span-2">
                      <span className="font-medium text-foreground">Description:</span> {currentGraph.metadata.description}
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentCentralityAnalysis && (
              <div>
                <h2 className="text-xl font-semibold mb-3 text-foreground">Key Influencer Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Most Influential */}
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-foreground">Most Influential Nodes</h3>
                    <ul className="space-y-1">
                      {currentCentralityAnalysis.mostInfluential.map((node, index) => (
                        <li key={node.nodeId} className="text-sm text-muted-foreground">
                          {index + 1}. <span className="font-medium text-foreground">{node.label}</span> (Type: {node.type}, Score: {(node.pageRank * 100).toFixed(0)}%)
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Most Central */}
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-foreground">Most Connected Nodes</h3>
                    <ul className="space-y-1">
                      {currentCentralityAnalysis.mostCentral.map((node, index) => (
                        <li key={node.nodeId} className="text-sm text-muted-foreground">
                          {index + 1}. <span className="font-medium text-foreground">{node.label}</span> (Type: {node.type}, Score: {(node.degreeCentrality * 100).toFixed(0)}%)
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Most Frequent */}
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-foreground">Most Frequent Concepts</h3>
                    <ul className="space-y-1">
                      {currentCentralityAnalysis.mostFrequent.map((node, index) => (
                        <li key={node.nodeId} className="text-sm text-muted-foreground">
                          {index + 1}. <span className="font-medium text-foreground">{node.label}</span> (Type: {node.type}, Count: {node.frequency})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* General Stats */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-2 text-foreground">Graph Statistics</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground">Average Degree:</span> {currentCentralityAnalysis.stats.avgDegree}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Max Degree:</span> {currentCentralityAnalysis.stats.maxDegree}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Graph Density:</span> {(currentCentralityAnalysis.stats.densityRatio * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!currentGraph && !currentCentralityAnalysis && (
              <p className="text-center text-muted-foreground">No graph data or analysis available to export.</p>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleDownloadPdf} disabled={loading || (!currentGraph && !currentCentralityAnalysis)}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
