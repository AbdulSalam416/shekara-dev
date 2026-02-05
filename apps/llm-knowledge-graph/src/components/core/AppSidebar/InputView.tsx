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
  TooltipTrigger
} from "@shekara-dev/ui"
import { parsePdf } from '../../../services/pdfParser';
import {
  Upload,
  Play,
  Settings2,
  X,
  FileText,
  Loader2,
  Paperclip,
  AlertCircle,
  Zap
} from "lucide-react"

interface FileWithBuffer {
  file: File;
  buffer: ArrayBuffer;
  id: string;
}

interface InputViewProps {
  maxUploads?: number;
  onGenerateAction: (papers) => Promise<void>;
  isGeneratingResponses: boolean;
}

export default function InputView({ maxUploads = 5, onGenerateAction , isGeneratingResponses}: InputViewProps) {
  const [inputText, setInputText] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<FileWithBuffer[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const remainingSlots = maxUploads - uploadedFiles.length
    if (remainingSlots <= 0) {
      alert(`Maximum of ${maxUploads} files allowed.`)
      return
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots)
    setIsUploading(true)

    try {
      const newFiles: FileWithBuffer[] = await Promise.all(
        filesToProcess.map(async (file) => {
          const buffer = await file.arrayBuffer()
          return {
            file,
            buffer,
            id: Math.random().toString(36).substring(7)
          }
        })
      )
      setUploadedFiles(prev => [...prev, ...newFiles])
    } catch (error) {
      console.error("Error reading files:", error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }
  const handleGenerate = async () => {
    if (uploadedFiles.length > 0) {
      const papers = await Promise.all(
        uploadedFiles.map(async (fileObj, index) => {
          if (fileObj.file.type === 'application/pdf') {
            try {
              const buffer = Buffer.from(fileObj.buffer);
              const data = await parsePdf(buffer);
              console.log(data)
              return {
                text: data.text,
                id: `${fileObj.file.name ?? 'paper'}${index+1}`
              };
            } catch (error) {
              console.error(`Error parsing ${fileObj.file.name}:`, error);
              return {
                text: `Error parsing ${fileObj.file.name}`,
                id: `paper${index + 1}`
              };
            }
          } else {
            // For non-PDF files, assume it's a text-like file and decode
            const text = new TextDecoder().decode(fileObj.buffer);
            return {
              text,
              id: `paper${index + 1}`
            };
          }
        })
      );

      const output = { papers };
   await onGenerateAction(papers)
      console.log("--- Parsed Papers Output ---");
      console.log(JSON.stringify(output, null, 2));
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Research Intelligence Input
          </label>
          <Badge variant="outline" className="text-[9px] font-medium px-1.5 py-0">
            {uploadedFiles.length} / {maxUploads} Files
          </Badge>
        </div>

        <div className="relative group border border-muted rounded-xl bg-muted/30 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-200">
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 border-b border-muted/50">
              {uploadedFiles.map((fileObj) => (
                <div
                  key={fileObj.id}
                  className="flex items-center gap-2 bg-white border border-muted px-2 py-1 rounded-md shadow-sm animate-in zoom-in-95 duration-200"
                >
                  <FileText className="h-3 w-3 text-primary" />
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
          )}

          <Textarea
            placeholder="Describe your research goal or paste text to analyze..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[160px] w-full resize-none bg-transparent border-none focus-visible:ring-0 p-4 text-sm leading-relaxed"
          />

          <div className="flex items-center justify-between p-2 bg-muted/20 rounded-b-xl border-t border-muted/30">
            <div className="flex items-center gap-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className="hidden"
                accept=".pdf,.txt,.doc,.docx"
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
                    <p className="text-[10px]">Attach research papers (Max {maxUploads})</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isUploading || (!inputText.trim() && uploadedFiles.length === 0) || isGeneratingResponses}
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
            Using <span className="font-bold text-slate-700">GPT-4o</span> optimized for semantic relationship extraction and research gap identification.
          </p>
        </div>
      </div>
    </div>
  )
}
