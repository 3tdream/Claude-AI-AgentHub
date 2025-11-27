"use client"

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, CheckCircle2, AlertCircle, Volume2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface VoiceInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function VoiceInputDialog({ open, onOpenChange, onSuccess }: VoiceInputDialogProps) {
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    actions?: any[];
  } | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setListening(true);
          setRecording(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => prev + (prev ? ' ' : '') + transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setListening(false);
          setRecording(false);

          if (event.error === 'not-allowed') {
            setResult({
              success: false,
              message: 'Microphone access denied. Please allow microphone permissions.',
            });
          }
        };

        recognition.onend = () => {
          setListening(false);
          setRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setResult({
        success: false,
        message: 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.',
      });
      return;
    }

    if (recording) {
      recognitionRef.current.stop();
    } else {
      setResult(null);
      recognitionRef.current.start();
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setProcessing(true);
    setResult(null);

    try {
      // Process voice command through NLP API
      const voiceResponse = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });

      const voiceData = await voiceResponse.json();

      if (!voiceData.success || !voiceData.actions || voiceData.actions.length === 0) {
        setResult({
          success: false,
          message: 'Could not understand the command. Please try again.',
        });
        return;
      }

      // Execute each action
      const results = [];
      for (const action of voiceData.actions) {
        const actionResponse = await fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });

        const actionData = await actionResponse.json();
        results.push(actionData);
      }

      // Check if all actions succeeded
      const allSuccess = results.every(r => r.success);

      setResult({
        success: allSuccess,
        message: allSuccess
          ? `Successfully processed ${results.length} action(s)`
          : 'Some actions failed to execute',
        actions: results,
      });

      if (allSuccess) {
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Voice command error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process command',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (recognitionRef.current && recording) {
      recognitionRef.current.stop();
    }
    setInput('');
    setResult(null);
    setProcessing(false);
    setRecording(false);
    setListening(false);
    onOpenChange(false);
  };

  const exampleCommands = [
    'Add 5 hours for Acme Corp today at $100 per hour',
    'Show me all entries from this week',
    'Generate a summary report for January',
    'List unpaid work sessions',
    'Update the rate for Client X to $150',
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-indigo-600" />
            Voice Command
          </DialogTitle>
          <DialogDescription>
            Enter a natural language command to manage your work sessions. Try commands like "Add 5 hours for Client X today" or "Show me all unpaid entries".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Microphone Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={toggleRecording}
              disabled={processing}
              className={`relative p-6 rounded-full transition-all ${
                recording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
            >
              {recording ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
              {listening && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {recording ? (
                <span className="text-red-600 flex items-center justify-center gap-2">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  Listening... Speak now
                </span>
              ) : (
                'Click the microphone to start voice input'
              )}
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or type manually</span>
            </div>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Type your command here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[120px] text-base"
              disabled={processing || recording}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <p className="text-xs text-gray-500">
              Press Ctrl+Enter to submit
            </p>
          </div>

          {result && (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    result.success ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  {result.message}
                </p>
                {result.actions && result.actions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {result.actions.map((action, i) => (
                      <p key={i} className="text-xs text-gray-600">
                        {action.message || action.preview}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Example commands:</p>
            <div className="space-y-1">
              {exampleCommands.map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => setInput(cmd)}
                  disabled={processing}
                  className="block w-full text-left text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  • {cmd}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={processing || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Execute Command
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
