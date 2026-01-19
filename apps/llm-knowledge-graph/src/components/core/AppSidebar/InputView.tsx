"use client"

import * as React from "react"
import { useState } from 'react'

import { Button } from "@shekara-dev/ui"
import {

  Upload,
  Play,
  Settings2
} from "lucide-react"
import { Textarea } from "@shekara-dev/ui"


export default function InputView() {
  const [inputText, setInputText] = useState("")

  const handleGenerate = () => {
    console.log("Generating from:", inputText)
    // Add your generation logic here
  }

  const handleUploadFile = () => {
    console.log("Upload file clicked")
    // Add your file upload logic here
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Knowledge Input
        </label>
        <Textarea
          placeholder="Paste text, technical documentation, or research papers here to extract entities..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="min-h-[200px] resize-none bg-muted/50 border-muted"
        />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleGenerate}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          <Play className="h-4 w-4 mr-2" />
          Generate
        </Button>
        <Button
          onClick={handleUploadFile}
          variant="outline"
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Button>
      </div>

      <div className="flex flex-col gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex items-center gap-2 text-primary">
          <Settings2 className="h-5 w-5" />
          <span className="font-semibold">Extraction Settings</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Using GPT-4o optimized schema for semantic relationship extraction.
          Confidence threshold set to 0.85.
        </p>
      </div>
    </div>
  )
}
