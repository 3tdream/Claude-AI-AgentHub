"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Conversation } from "@/lib/conversations";

import { Message } from "@/types";

// Message type interfaces
interface BaseMessage extends Message {
  type: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface TranscriptionMessage extends BaseMessage {
  type: "conversation.item.input_audio_transcription";
  transcript?: string;
  text?: string;
}

interface TranscriptionCompletedMessage extends BaseMessage {
  type: "conversation.item.input_audio_transcription.completed";
  transcript: string;
}

interface AudioTranscriptDeltaMessage extends BaseMessage {
  type: "response.audio_transcript.delta";
  delta: string;
}

interface FunctionCallMessage extends BaseMessage {
  type: "response.function_call_arguments.done";
  name: string;
  call_id: string;
  arguments: string;
}

interface ResponseDoneMessage extends BaseMessage {
  type: "response.done";
  response: {
    usage: {
      total_tokens: number;
      input_tokens: number;
      output_tokens: number;
    };
  };
}

interface TextInputMessage extends BaseMessage {
  type: "conversation.item.create";
  item: {
    id: string;
    type: "message" | "function_call_output";
    role?: "user";
    content?: Array<{
      type: "input_text";
      text: string;
    }>;
    timestamp?: string;
    call_id?: string;
    output?: string;
  };
}

type WebRTCMessage = 
  | TranscriptionMessage 
  | TranscriptionCompletedMessage 
  | AudioTranscriptDeltaMessage 
  | FunctionCallMessage
  | ResponseDoneMessage
  | TextInputMessage
  | BaseMessage;

export interface Tool {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}

// Type for tool functions that matches useToolsFunctions
interface BaseToolResult {
  success: boolean;
  message: string;
}

interface TimeToolResult extends BaseToolResult {
  time: string;
  timezone: string;
}

interface ThemeToolResult extends BaseToolResult {
  theme?: string;
}

type ToolResult = TimeToolResult | ThemeToolResult | BaseToolResult;

type NoArgFunction = () => Promise<ToolResult> | ToolResult;
type UrlFunction = (args: { url: string }) => Promise<ToolResult> | ToolResult;
type TextFunction = (args: { text: string }) => Promise<ToolResult> | ToolResult;
type TitleFunction = (args: { title: string }) => Promise<ToolResult> | ToolResult;
type DescriptionFunction = (args: { description: string }) => Promise<ToolResult> | ToolResult;
type BlockFunction = (args: { blockId: string, title?: string, content?: string }) => Promise<ToolResult> | ToolResult;
type QueryFunction = (args: { query: string }) => Promise<ToolResult> | ToolResult;
type SectionIdFunction = (args: { sectionId: string }) => Promise<ToolResult> | ToolResult;

type ToolFunction = NoArgFunction | UrlFunction | TextFunction | TitleFunction | DescriptionFunction | BlockFunction | QueryFunction | SectionIdFunction;

/**
 * The return type for the hook, matching Approach A
 * (RefObject<HTMLDivElement | null> for the audioIndicatorRef).
 */
interface UseWebRTCAudioSessionReturn {
  status: string;
  isSessionActive: boolean;
  audioIndicatorRef: React.RefObject<HTMLDivElement | null>;
  audioStreamRef: React.MutableRefObject<MediaStream | null>;
  dataChannelRef: React.MutableRefObject<RTCDataChannel | null>;
  startSession: () => Promise<void>;
  stopSession: () => void;
  handleStartStopClick: () => Promise<void>;
  registerFunction: (name: string, fn: ToolFunction) => void;
  msgs: WebRTCMessage[];
  currentVolume: number;
  conversation: Conversation[];
}

/**
 * Hook to manage a real-time session with OpenAI's Realtime endpoints.
 */
export default function useWebRTCAudioSession(
  voice: string,
  tools?: Tool[],
  instructions?: string,
  sessionEndpoint: string = "/api/session",
): UseWebRTCAudioSessionReturn {
  // Connection/session states
  const [status, setStatus] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Audio references for local mic
  // Approach A: explicitly typed as HTMLDivElement | null
  const audioIndicatorRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // WebRTC references
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  // Keep track of all raw events/messages
  const [msgs, setMsgs] = useState<WebRTCMessage[]>([]);

  // Main conversation state
  const [conversation, setConversation] = useState<Conversation[]>([]);

  // Track if AI is currently responding
  const isAIRespondingRef = useRef<boolean>(false);

  // For function calls (AI "tools")
  const functionRegistry = useRef<Record<string, ToolFunction>>({});

  // Volume analysis (assistant inbound audio)
  const [currentVolume, setCurrentVolume] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeIntervalRef = useRef<number | null>(null);

  /**
   * We track only the ephemeral user message **ID** here.
   * While user is speaking, we update that conversation item by ID.
   */
  const ephemeralUserMessageIdRef = useRef<string | null>(null);

  /**
   * Register a function (tool) so the AI can call it.
   */
  function registerFunction(name: string, fn: ToolFunction) {
    functionRegistry.current[name] = fn;
  }

  /**
   * Configure the data channel on open, sending a session update to the server.
   */
  function configureDataChannel(dataChannel: RTCDataChannel) {
    // Send session update
    const sessionUpdate = {
      type: "session.update",
      session: {
        modalities: ["text", "audio"],
        voice,
        tools: tools || [],
        input_audio_transcription: {
          model: "whisper-1",
        },
        instructions: instructions,
      },
    };
    dataChannel.send(JSON.stringify(sessionUpdate));

    console.log("Session update sent:", sessionUpdate);
  }

  /**
   * Return an ephemeral user ID, creating a new ephemeral message in conversation if needed.
   */
  function getOrCreateEphemeralUserId(): string {
    let ephemeralId = ephemeralUserMessageIdRef.current;
    if (!ephemeralId) {
      // Use uuidv4 for a robust unique ID
      ephemeralId = uuidv4();
      ephemeralUserMessageIdRef.current = ephemeralId;

      const newMessage: Conversation = {
        id: ephemeralId,
        role: "user",
        text: "",
        timestamp: new Date().toISOString(),
        isFinal: false,
        status: "speaking",
      };

      // Append the ephemeral item to conversation
      setConversation((prev) => [...prev, newMessage]);
    }
    return ephemeralId;
  }

  /**
   * Update the ephemeral user message (by ephemeralUserMessageIdRef) with partial changes.
   */
  function updateEphemeralUserMessage(partial: Partial<Conversation>) {
    const ephemeralId = ephemeralUserMessageIdRef.current;
    if (!ephemeralId) return; // no ephemeral user message to update

    setConversation((prev) =>
      prev.map((msg) => {
        if (msg.id === ephemeralId) {
          return { ...msg, ...partial };
        }
        return msg;
      }),
    );
  }

  /**
   * Clear ephemeral user message ID so the next user speech starts fresh.
   */
  function clearEphemeralUserMessage() {
    ephemeralUserMessageIdRef.current = null;
  }

  /**
   * Validate incoming message
   */
  function isValidMessage(msg: WebRTCMessage): boolean {
    if (!msg || !msg.type) return false;
    
    // For text messages, ensure content exists
    if (msg.type === "conversation.item.create") {
      const textMsg = msg as TextInputMessage;
      return !!(textMsg.item?.content?.[0]?.text);
    }
    
    // For transcriptions, ensure transcript or text exists
    if (msg.type === "conversation.item.input_audio_transcription") {
      const transcriptMsg = msg as TranscriptionMessage;
      return !!(transcriptMsg.transcript || transcriptMsg.text);
    }
    
    return true;
  }

  /**
   * Stop current AI response if any
   */
  function stopAIResponse() {
    if (isAIRespondingRef.current) {
      // Mark the last assistant message as final if it exists
      setConversation((prev) => {
        if (prev.length === 0) return prev;
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.role === 'assistant' && !lastMsg.isFinal) {
          const updated = [...prev];
          updated[updated.length - 1] = { ...lastMsg, isFinal: true };
          return updated;
        }
        return prev;
      });
      isAIRespondingRef.current = false;
    }
  }

  /**
   * Main data channel message handler: interprets events from the server.
   */
  async function handleDataChannelMessage(event: MessageEvent) {
    try {
      // Log raw data for debugging
      if (typeof event.data !== 'string') {
        console.warn("Non-string data received:", event.data);
        return;
      }

      const msg = JSON.parse(event.data) as WebRTCMessage;

      // Log all incoming messages for debugging
      console.log('[DataChannel] Received:', msg.type, msg);

      // Validate message
      if (!isValidMessage(msg)) {
        console.warn("Invalid message received:", msg);
        return;
      }

      switch (msg.type) {
        /**
         * User speech started
         */
        case "input_audio_buffer.speech_started": {
          stopAIResponse(); // Stop AI response when user starts speaking
          getOrCreateEphemeralUserId();
          updateEphemeralUserMessage({ status: "speaking" });
          break;
        }

        /**
         * User speech stopped
         */
        case "input_audio_buffer.speech_stopped": {
          // optional: you could set "stopped" or just keep "speaking"
          updateEphemeralUserMessage({ status: "speaking" });
          break;
        }

        /**
         * Audio buffer committed => "Processing speech..."
         */
        case "input_audio_buffer.committed": {
          updateEphemeralUserMessage({
            text: "Processing speech...",
            status: "processing",
          });
          break;
        }

        /**
         * Partial user transcription
         */
        case "conversation.item.input_audio_transcription": {
          const transcriptionMsg = msg as TranscriptionMessage;
          const partialText =
            transcriptionMsg.transcript ?? transcriptionMsg.text ?? "User is speaking...";
          updateEphemeralUserMessage({
            text: partialText,
            status: "speaking",
            isFinal: false,
          });
          break;
        }

        /**
         * Final user transcription
         */
        case "conversation.item.input_audio_transcription.completed": {
          // console.log("Final user transcription:", msg.transcript);
          updateEphemeralUserMessage({
            text: (msg as TranscriptionCompletedMessage).transcript || "",
            isFinal: true,
            status: "final",
          });
          clearEphemeralUserMessage();
          break;
        }

        /**
         * Streaming AI transcripts (assistant partial)
         */
        case "response.audio_transcript.delta": {
          isAIRespondingRef.current = true;
          const newMessage: Conversation = {
            id: uuidv4(), // generate a fresh ID for each assistant partial
            role: "assistant",
            text: (msg as AudioTranscriptDeltaMessage).delta,
            timestamp: new Date().toISOString(),
            isFinal: false,
          };

          setConversation((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.role === "assistant" && !lastMsg.isFinal) {
              // Append to existing assistant partial
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...lastMsg,
                text: lastMsg.text + (msg as AudioTranscriptDeltaMessage).delta,
              };
              return updated;
            } else {
              // Start a new assistant partial
              return [...prev, newMessage];
            }
          });
          break;
        }

        /**
         * Mark the last assistant message as final
         */
        case "response.audio_transcript.done": {
          isAIRespondingRef.current = false;
          setConversation((prev) => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            updated[updated.length - 1].isFinal = true;
            return updated;
          });
          break;
        }

        /**
         * AI calls a function (tool)
         */
        /**
         * Handle text input message
         */
        case "conversation.item.create": {
          const textMsg = msg as TextInputMessage;
          const content = textMsg.item?.content?.[0];
          
          if (textMsg.item?.type === 'message' && 
              textMsg.item.role === 'user' && 
              content?.type === 'input_text' &&
              content.text) {
            // Create ephemeral message first
            const ephemeralId = uuidv4();
            ephemeralUserMessageIdRef.current = ephemeralId;
            
            const ephemeralMessage: Conversation = {
              id: ephemeralId,
              role: 'user',
              text: '',
              timestamp: new Date().toISOString(),
              isFinal: false,
              status: 'speaking'
            };
            
            // Add ephemeral message to show loading state
            setConversation(prev => [...prev, ephemeralMessage]);
            
            // After a short delay, update with the actual text
            setTimeout(() => {
              const finalMessage: Conversation = {
                id: textMsg.item.id,
                role: 'user',
                text: content.text,
                timestamp: textMsg.item.timestamp || new Date().toISOString(),
                isFinal: true,
                status: 'final'
              };
              
              setConversation(prev => {
                // Replace ephemeral message with final message
                const withoutEphemeral = prev.filter(msg => msg.id !== ephemeralId);
                return [...withoutEphemeral, finalMessage];
              });
              
              ephemeralUserMessageIdRef.current = null;
            }, 500); // Show loading state for 500ms
          }
          break;
        }

        case "response.function_call_arguments.done": {
          const functionMsg = msg as FunctionCallMessage;
          const fn = functionRegistry.current[functionMsg.name];
          if (fn) {
            const args = JSON.parse(functionMsg.arguments);
            const result = await fn(args);

            // Respond with function output
            const response = {
              type: "conversation.item.create",
              item: {
                type: "function_call_output",
                call_id: functionMsg.call_id,
                output: JSON.stringify(result),
              },
            };
            dataChannelRef.current?.send(JSON.stringify(response));

            const responseCreate = {
              type: "response.create",
            };
            dataChannelRef.current?.send(JSON.stringify(responseCreate));
          }
          break;
        }

        default: {
          // console.warn("Unhandled message type:", msg.type);
          break;
        }
      }

      // Always log the raw message with required Message properties
      const messageWithBase: WebRTCMessage = {
        ...msg,
        role: msg.type.startsWith('response') ? 'assistant' : 'user',
        content: msg.type === 'response.audio_transcript.delta' 
          ? (msg as AudioTranscriptDeltaMessage).delta
          : msg.type === 'conversation.item.input_audio_transcription'
          ? (msg as TranscriptionMessage).transcript || (msg as TranscriptionMessage).text || ''
          : msg.type === 'conversation.item.input_audio_transcription.completed'
          ? (msg as TranscriptionCompletedMessage).transcript
          : '',
      };
      setMsgs((prevMsgs) => [...prevMsgs, messageWithBase]);
      return msg;
    } catch (error) {
      console.error("Error handling data channel message:", error);
      if (error instanceof SyntaxError && event?.data) {
        console.error("Problematic data:", event.data.substring(0, 200));
      }
    }
  }

  /**
   * Fetch ephemeral token from your Next.js endpoint
   */
  async function getEphemeralToken() {
    try {
      const response = await fetch(sessionEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to get ephemeral token: ${response.status}`);
      }
      const data = await response.json();
      return data.client_secret.value;
    } catch (err) {
      console.error("getEphemeralToken error:", err);
      throw err;
    }
  }

  /**
   * Sets up a local audio visualization for mic input (toggle wave CSS).
   */
  function setupAudioVisualization(stream: MediaStream) {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    source.connect(analyzer);

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateIndicator = () => {
      if (!audioContext) return;
      analyzer.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;

      // Toggle an "active" class if volume is above a threshold
      if (audioIndicatorRef.current) {
        audioIndicatorRef.current.classList.toggle("active", average > 30);
      }
      requestAnimationFrame(updateIndicator);
    };
    updateIndicator();

    audioContextRef.current = audioContext;
  }

  /**
   * Calculate RMS volume from inbound assistant audio
   */
  function getVolume(): number {
    if (!analyserRef.current) return 0;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const float = (dataArray[i] - 128) / 128;
      sum += float * float;
    }
    return Math.sqrt(sum / dataArray.length);
  }

  /**
   * Start a new session:
   */
  async function startSession() {
    try {
      setStatus("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setupAudioVisualization(stream);

      setStatus("Fetching ephemeral token...");
      const ephemeralToken = await getEphemeralToken();

      setStatus("Establishing connection...");
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Create and attach audio element to DOM for inbound assistant TTS
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      document.body.appendChild(audioEl);

      // Inbound track => assistant's TTS
      pc.ontrack = (event) => {
        audioEl.srcObject = event.streams[0];

        // Optional: measure inbound volume
        const audioCtx = new AudioContext();
        const src = audioCtx.createMediaStreamSource(event.streams[0]);
        const inboundAnalyzer = audioCtx.createAnalyser();
        inboundAnalyzer.fftSize = 256;
        src.connect(inboundAnalyzer);
        analyserRef.current = inboundAnalyzer;

        // Start volume monitoring
        volumeIntervalRef.current = window.setInterval(() => {
          setCurrentVolume(getVolume());
        }, 100);
      };

      // Data channel for transcripts
      const dataChannel = pc.createDataChannel("response");
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        // console.log("Data channel open");
        configureDataChannel(dataChannel);
      };
      dataChannel.onmessage = handleDataChannelMessage;

      // Add local (mic) track
      pc.addTrack(stream.getTracks()[0]);

      // Create offer & set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send SDP offer to OpenAI Realtime
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const response = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralToken}`,
          "Content-Type": "application/sdp",
        },
      });

      // Set remote description
      const answerSdp = await response.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      setIsSessionActive(true);
      setStatus("Session established successfully!");
    } catch (err) {
      console.error("startSession error:", err);
      setStatus(`Error: ${err}`);
      stopSession();
    }
  }

  /**
   * Stop the session & cleanup
   */
  function stopSession() {
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (audioIndicatorRef.current) {
      audioIndicatorRef.current.classList.remove("active");
    }
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    analyserRef.current = null;

    ephemeralUserMessageIdRef.current = null;

    setCurrentVolume(0);
    setIsSessionActive(false);
    setStatus("Session stopped");
    setMsgs([]);
    setConversation([]);
  }

  /**
   * Toggle start/stop from a single button
   */
  async function handleStartStopClick() {
    if (isSessionActive) {
      stopSession();
    } else {
      await startSession();
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => stopSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    isSessionActive,
    audioIndicatorRef,
    audioStreamRef,
    dataChannelRef,
    startSession,
    stopSession,
    handleStartStopClick,
    registerFunction,
    msgs,
    currentVolume,
    conversation,
    setConversation,
  };
}
