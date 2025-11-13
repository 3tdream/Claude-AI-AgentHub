"use client";

import { useState } from "react";
import { FileJson, Download, Upload, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface JsonEditorProps {
  data: any;
  onSave: (data: any) => void;
  title?: string;
  description?: string;
}

export function JsonEditor({ data, onSave, title = "JSON Editor", description = "Edit the JSON data below" }: JsonEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOpen = () => {
    setJsonText(JSON.stringify(data, null, 2));
    setError(null);
    setIsOpen(true);
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      onSave(parsed);
      setError(null);
      setSuccessMessage("JSON data saved successfully");
      setTimeout(() => {
        setIsOpen(false);
        setSuccessMessage(null);
      }, 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const handleExport = () => {
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "slides-data.json";
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMessage("JSON file downloaded successfully");
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setJsonText(text);
          try {
            JSON.parse(text);
            setError(null);
            setSuccessMessage("JSON file loaded successfully");
            setTimeout(() => setSuccessMessage(null), 2000);
          } catch (err) {
            setError("Invalid JSON file");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setError(null);
      setSuccessMessage("JSON formatted successfully");
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={handleOpen}
          variant="outline"
          size="icon"
          className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md"
          title="Edit JSON"
        >
          <FileJson className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Button onClick={handleImport} variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={formatJson} variant="outline" size="sm">
              Format JSON
            </Button>
          </div>

          <div className="space-y-2">
            <Label>JSON Data</Label>
            <Textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="font-mono text-sm h-[400px]"
              placeholder="Enter JSON data..."
            />
            {error && (
              <div className="text-sm text-red-500 flex items-center gap-2">
                <X className="w-4 h-4" />
                {error}
              </div>
            )}
            {successMessage && (
              <div className="text-sm text-green-500 flex items-center gap-2">
                <Check className="w-4 h-4" />
                {successMessage}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Check className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
