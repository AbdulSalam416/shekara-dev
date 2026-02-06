"use client"

import * as React from "react"
import { useState, useRef } from 'react'
import {
  Button,
  Textarea,
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@shekara-dev/ui"
import { parsePdf } from '../../../services/pdfParser';
import {
  Play,
  Settings2,
  X,
  FileText,
  Loader2,
  Paperclip,
  Zap,
  AlertCircle,
  Upload
} from "lucide-react"
import { CONSTANTS } from '../../../lib/contants';

interface FileWithBuffer {
  file: File;
  buffer: ArrayBuffer;
  id: string;
  error?: string;
}

interface InputViewProps {
  maxUploads?: number;
  onGenerateAction: (papers: Array<{ text: string; id: string; error?: string }>) => Promise<void>;
  isGeneratingResponses: boolean;
}

const activeLLMModel = process.env.NEXT_PUBLIC_LLM_MODEL ?? 'gemini-flash-latest'
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function InputView({
                                    maxUploads = 5,
                                    onGenerateAction,
                                    isGeneratingResponses
                                  }: InputViewProps) {
  const [inputMode, setInputMode] = useState<'files' | 'text'>('files')
  const [inputText, setInputText] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<FileWithBuffer[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const estimateProcessingTime = (fileCount: number) => {
    const secondsPerFile = 15;
    const totalSeconds = fileCount * secondsPerFile;

    if (totalSeconds < 60) return `~${totalSeconds}s`;
    return `~${Math.ceil(totalSeconds / 60)}m`;
  };

  const loadSampleData = () => {
    setInputText(CONSTANTS.samplePrompt);
  };

  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} exceeds 10MB limit`);
        return;
      }

      // Check file type
      const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      const isTXT = file.type === 'text/plain' || file.name.endsWith('.txt');

      if (!isPDF && !isTXT) {
        errors.push(`${file.name} must be PDF or TXT`);
        return;
      }

      valid.push(file);
    });

    return { valid, errors };
  };

  const processFiles = async (files: File[]) => {
    const newFiles: FileWithBuffer[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = Math.random().toString(36).substring(7);

      try {
        // Show progress
        setUploadProgress(prev => ({ ...prev, [id]: 50 }));

        const buffer = await file.arrayBuffer();

        newFiles.push({ file, buffer, id });

        // Complete
        setUploadProgress(prev => ({ ...prev, [id]: 100 }));
      } catch (error) {
        console.error(`Error reading ${file.name}:`, error);
        newFiles.push({
          file,
          buffer: new ArrayBuffer(0),
          id,
          error: `Failed to read ${file.name}`
        });
      }
    }

    // Clear progress after delay
    setTimeout(() => setUploadProgress({}), 1000);

    return newFiles;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setError(null);

    const remainingSlots = maxUploads - uploadedFiles.length;
    if (remainingSlots <= 0) {
      setError(`Maximum of ${maxUploads} files allowed.`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    // Validate files
    const { valid, errors } = validateFiles(filesToProcess);

    if (errors.length > 0) {
      setError(errors.join('\n'));
      if (valid.length === 0) return;
    }

    setIsUploading(true);

    try {
      const newFiles = await processFiles(valid);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      console.error("Error processing files:", error);
      setError("Failed to process some files. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    const remainingSlots = maxUploads - uploadedFiles.length;

    if (remainingSlots <= 0) {
      setError(`Maximum of ${maxUploads} files allowed.`);
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    const { valid, errors } = validateFiles(filesToProcess);

    if (errors.length > 0) {
      setError(errors.join('\n'));
      if (valid.length === 0) return;
    }

    setIsUploading(true);

    try {
      const newFiles = await processFiles(valid);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      console.error("Error processing files:", error);
      setError("Failed to process some files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleGenerate = async () => {
    setError(null);
    const papers: Array<{ text: string; id: string; error?: string }> = [];

    try {
      // Process uploaded files
      if (uploadedFiles.length > 0) {
        const filePapers = await Promise.all(
          uploadedFiles.map(async (fileObj, index) => {
            if (fileObj.error) {
              return {
                text: '',
                id: fileObj.file.name,
                error: fileObj.error
              };
            }

            if (fileObj.file.type === 'application/pdf' || fileObj.file.name.endsWith('.pdf')) {
              try {
                const buffer = Buffer.from(fileObj.buffer);
                const data = await parsePdf(buffer);

                return {
                  text: data.text,
                  id: fileObj.file.name.replace('.pdf', '')
                };
              } catch (error) {
                console.error(`Error parsing ${fileObj.file.name}:`, error);
                return {
                  text: '',
                  id: fileObj.file.name,
                  error: `Failed to parse ${fileObj.file.name}. File may be corrupted or password-protected.`
                };
              }
            } else {
              // For text files
              const text = new TextDecoder().decode(fileObj.buffer);
              return {
                text,
                id: fileObj.file.name.replace('.txt', '')
              };
            }
          })
        );

        papers.push(...filePapers);
      }

      // Process text input
      if (inputText.trim()) {
        papers.push({
          text: inputText.trim(),
          id: 'pasted_text'
        });
      }

      // Check for errors
      const papersWithErrors = papers.filter(p => p.error);
      if (papersWithErrors.length > 0) {
        setError(`Some files couldn't be processed:\n${papersWithErrors.map(p => p.error).join('\n')}`);
      }

      // Only send papers without errors
      const validPapers = papers.filter(p => !p.error);

      if (validPapers.length === 0) {
        setError("No valid papers to analyze. Please check your files or input.");
        return;
      }

      // Call action with all papers
      await onGenerateAction(validPapers);

      // Success - clear inputs and buffers
      setInputText('');
      setUploadedFiles([]);
      setError(null);

    } catch (error) {
      console.error('Generation failed:', error);
      setError("Analysis failed. Please try again or contact support if the issue persists.");
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    setError(null);
  };

  const canGenerate = !isUploading &&
    !isGeneratingResponses &&
    (uploadedFiles.length > 0 || inputText.trim().length > 0);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[11px] text-destructive font-medium whitespace-pre-line">
              {error}
            </p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-destructive hover:text-destructive/80"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Research Intelligence Input
          </label>
          {inputMode === 'files' && (
            <Badge variant="outline" className="text-[9px] font-medium px-1.5 py-0">
              {uploadedFiles.length} / {maxUploads} Files
            </Badge>
          )}
        </div>

        {/* Input Mode Tabs */}
        <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'files' | 'text')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="files" className="text-[11px]">
              <Upload className="h-3 w-3 mr-1.5" />
              Upload PDFs
            </TabsTrigger>
            <TabsTrigger value="text" className="text-[11px]">
              <FileText className="h-3 w-3 mr-1.5" />
              Paste Text
            </TabsTrigger>
          </TabsList>

          {/* File Upload Mode */}
          <TabsContent value="files" className="mt-0">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted'
              } rounded-xl bg-muted/30 transition-all duration-200`}
            >
              {/* Drag Overlay */}
              {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-xl z-10 border-2 border-primary border-dashed">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-semibold text-primary">Drop PDFs here</p>
                  </div>
                </div>
              )}

              {/* Uploaded Files Display */}
              {uploadedFiles.length > 0 ? (
                <div className="p-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((fileObj) => (
                      <div
                        key={fileObj.id}
                        className={`flex items-center gap-2 px-2 py-1 rounded-md shadow-sm animate-in zoom-in-95 duration-200 ${
                          fileObj.error
                            ? 'bg-destructive/10 border border-destructive/30'
                            : 'bg-white border border-muted'
                        }`}
                      >
                        <FileText className={`h-3 w-3 ${fileObj.error ? 'text-destructive' : 'text-primary'}`} />
                        <span className="text-[11px] font-medium truncate max-w-[120px]">
                          {fileObj.file.name}
                        </span>
                        <button
                          onClick={() => removeFile(fileObj.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Upload Progress */}
                  {Object.keys(uploadProgress).length > 0 && (
                    <div className="space-y-1">
                      {Object.entries(uploadProgress).map(([id, progress]) => (
                        <div key={id} className="w-full h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Empty State
                <div className="p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Drop PDFs here or click to browse
                  </p>
                  <p className="text-[11px] text-muted-foreground/70">
                    Maximum {maxUploads} files, up to 10MB each
                  </p>
                </div>
              )}

              {/* Upload Controls */}
              <div className="flex items-center justify-between p-2 bg-muted/20 rounded-b-xl border-t border-muted/30">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                    accept=".pdf"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-white hover:shadow-sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading || uploadedFiles.length >= maxUploads}
                        >
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-[10px]">Attach PDFs (Max {maxUploads})</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {uploadedFiles.length > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      Est. {estimateProcessingTime(uploadedFiles.length)}
                    </span>
                  )}
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="h-8 px-4 bg-primary hover:bg-primary/90 text-xs font-bold rounded-full shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  {isGeneratingResponses ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                  ) : (
                    <Play className="h-3.5 w-3.5 mr-2 fill-current" />
                  )}
                  Generate Graph
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Text Input Mode */}
          <TabsContent value="text" className="mt-0">
            <div className="relative border border-muted rounded-xl bg-muted/30 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-200">
              <Textarea
                placeholder="Paste research abstract, paper text, or describe your research goal..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full resize-none bg-transparent border-none focus-visible:ring-0 p-4 text-sm leading-relaxed min-h-[200px]"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between p-2 bg-muted/20 rounded-b-xl border-t border-muted/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadSampleData}
                  className="text-[10px] h-7 text-center"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Load Sample
                </Button>

                <div className="flex items-center gap-2">
                  {inputText.trim() && (
                    <span className="text-[10px] text-muted-foreground">
                      {inputText.trim().split(/\s+/).length} words
                    </span>
                  )}

                  <Button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="h-8 px-4 bg-primary hover:bg-primary/90 text-xs font-bold rounded-full shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    {isGeneratingResponses ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                    ) : (
                      <Play className="h-3.5 w-3.5 mr-2 fill-current" />
                    )}
                    Generate Graph
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Settings Info */}
      <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
        <div className="flex items-center gap-2 text-slate-600">
          <Settings2 className="h-4 w-4" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Extraction Engine</span>
        </div>
        <div className="flex items-start gap-2">
          <div className="mt-0.5 p-1 rounded-md bg-primary/10">
            <Zap className="h-3 w-3 text-primary" />
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Using <span className="font-bold text-slate-700">{activeLLMModel}</span> optimized for semantic relationship extraction.
          </p>
        </div>
      </div>
    </div>
  )
}
