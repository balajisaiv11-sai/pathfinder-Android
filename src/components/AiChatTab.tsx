import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Brain,
  Zap,
  MessageSquare,
  PlusCircle,
  Copy,
  Check,
  Volume2,
  Trash2,
  AlertCircle,
  Lightbulb,
  Mic,
  MicOff,
  Loader2,
  Square,
  X,
} from 'lucide-react';
import { AI_PERSONAS, SUGGESTED_CHAT_PROMPTS } from '../data/mockData';
import { StudentProfile } from '../utils/matching';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  thinkingEnabled?: boolean;
}

interface AiChatTabProps {
  profile: StudentProfile;
  onAddPlanItem: (title: string, note?: string) => void;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const AiChatTab: React.FC<AiChatTabProps> = ({
  profile,
  onAddPlanItem,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        text: `Hello! I am your **Pathfinder AI Counselor** for Class 10 & 12 pathways. 
Whether you're deciding between Science, Commerce, Arts, Polytechnic Diplomas, or ITI trades, I'm here to listen without judgment.

💡 *Pro-tip:* Turn on **🧠 High Thinking Mode** when you need in-depth comparisons, entrance exam strategies, or multi-step career blueprints!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.8-flash',
        thinkingEnabled: false,
      },
    ];
  });

  const [input, setInput] = useState('');
  const [selectedPersonaId, setSelectedPersonaId] = useState('general');
  const [engineMode, setEngineMode] = useState<'general' | 'fast' | 'complex'>('general');
  const [thinkingMode, setThinkingMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedToPlanId, setSavedToPlanId] = useState<string | null>(null);

  // Audio transcription states (gemini-3.5-transcribe)
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcribeNotice, setTranscribeNotice] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activePersona =
    AI_PERSONAS.find((p) => p.id === selectedPersonaId) || AI_PERSONAS[0];

  // Clean up audio streams on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startVoiceRecording = async () => {
    setErrorMsg(null);
    setTranscribeNotice(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Microphone access is not supported by your browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Select supported mime type
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      const mediaRecorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) {
          setIsRecording(false);
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: selectedMime || 'audio/webm',
        });

        // Convert blob to base64
        setIsTranscribing(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            if (!base64String) {
              throw new Error('Failed to process recorded audio');
            }

            const res = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioData: base64String,
                mimeType: audioBlob.type || 'audio/webm',
              }),
            });

            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.details || err.error || 'Failed to transcribe');
            }

            const data = await res.json();
            const transcriptText = (data.transcript || '').trim();

            if (transcriptText) {
              setInput((prev) => (prev ? prev + ' ' + transcriptText : transcriptText));
              setTranscribeNotice(`Transcribed via ${data.model || 'gemini-3.5-transcribe'}`);
              setTimeout(() => setTranscribeNotice(null), 3000);
            } else {
              setTranscribeNotice('No speech detected. Try speaking closer to the microphone.');
              setTimeout(() => setTranscribeNotice(null), 3500);
            }
          };
        } catch (transcribeErr: any) {
          console.error('Transcription error:', transcribeErr);
          setErrorMsg(transcribeErr?.message || 'Could not transcribe audio. Please try again.');
        } finally {
          setIsTranscribing(false);
          setIsRecording(false);
        }
      };

      mediaRecorder.start(250); // collect in 250ms chunks
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setErrorMsg(
        err?.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access in your browser.'
          : 'Could not access microphone: ' + (err?.message || 'Unknown error')
      );
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  const cancelVoiceRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    audioChunksRef.current = [];
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle incoming initial prompt from other tabs
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      setInput(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt, onClearInitialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || loading) return;

    setErrorMsg(null);
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      // Build history for multi-turn server request
      const serverMessages = newHistory
        .filter((m) => m.id !== 'msg-welcome')
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      // Determine model parameters per instructions
      const useThinking = thinkingMode || engineMode === 'complex';
      const effectiveModelType = useThinking ? 'complex' : engineMode;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: serverMessages,
          systemInstruction: activePersona.systemInstruction,
          modelType: effectiveModelType,
          thinkingMode: useThinking,
          userContext: {
            stage: profile.stage,
            subjects: profile.subjects,
            interests: profile.interests,
            strengths: profile.strengths,
            prefs: profile.prefs,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Server request failed');
      }

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: 'msg-' + Date.now() + '-ai',
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || (useThinking ? 'gemini-4-argon' : 'gemini-3.8-flash'),
        thinkingEnabled: data.thinkingEnabled ?? useThinking,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMsg(
        err?.message ||
          'Could not reach AI counselor. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    // Clean markdown before speaking
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveToPlan = (msgId: string, text: string) => {
    // Extract first meaningful sentence or title
    const firstLine = text.split('\n').filter((l) => l.trim().length > 0)[0] || 'AI Recommendation';
    const cleanTitle = firstLine.replace(/^[#*\-•\s]+/, '').slice(0, 80);
    onAddPlanItem(cleanTitle, text.slice(0, 400));
    setSavedToPlanId(msgId);
    setTimeout(() => setSavedToPlanId(null), 2500);
  };

  return (
    <div className="flex flex-col h-full bg-[#14231d] text-stone-100 overflow-hidden">
      {/* Top Android Material 3 App Header */}
      <div className="p-3 bg-[#192c24] border-b border-emerald-900/40 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-stone-950 font-bold shadow-md">
              <Sparkles className="w-4 h-4 text-stone-900" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Gemini AI Counselor
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Multi-Turn
                </span>
              </h2>
              <p className="text-[11px] text-emerald-300/80 leading-tight">
                {activePersona.name} · {profile.stage ? (profile.stage === 'c10' ? 'Class 10' : 'Class 12') : 'General'}
              </p>
            </div>
          </div>

          {/* Clear conversation button */}
          <button
            onClick={() => {
              if (window.confirm('Clear conversation history?')) {
                setMessages([
                  {
                    id: 'msg-welcome',
                    role: 'model',
                    text: 'Conversation reset. What would you like to explore next?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    modelUsed: 'gemini-3.8-flash',
                  },
                ]);
              }
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-emerald-950/50 transition-colors"
            title="Clear Chat"
            aria-label="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Roles selection chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[11px] text-stone-400 font-medium shrink-0">Role:</span>
          {AI_PERSONAS.map((p) => {
            const isSelected = selectedPersonaId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPersonaId(p.id)}
                className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-semibold border-emerald-400 shadow-sm'
                    : 'bg-emerald-950/40 text-stone-300 border-emerald-900/50 hover:bg-emerald-900/40'
                }`}
              >
                {p.name.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Engine & High Thinking Switcher Bar */}
        <div className="mt-2 pt-2 border-t border-emerald-900/40 flex flex-wrap items-center justify-between gap-2">
          {/* Engine Modes */}
          <div className="flex items-center gap-1 bg-stone-900/60 p-0.5 rounded-lg border border-emerald-950/60 text-[11px]">
            <button
              onClick={() => {
                setEngineMode('fast');
                setThinkingMode(false);
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
                engineMode === 'fast' && !thinkingMode
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Fast Lite Engine (gemini-3.1-flash-lite)"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Fast</span>
            </button>

            <button
              onClick={() => {
                setEngineMode('general');
                setThinkingMode(false);
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
                engineMode === 'general' && !thinkingMode
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="General Counselor (gemini-3.8-flash)"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>General</span>
            </button>

            <button
              onClick={() => {
                setEngineMode('complex');
                setThinkingMode(true);
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
                thinkingMode || engineMode === 'complex'
                  ? 'bg-purple-500/30 text-purple-200 font-semibold border border-purple-400/50 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Deep Thinking with gemini-4-argon"
            >
              <Brain className="w-3 h-3 text-purple-300 animate-pulse" />
              <span>Deep Think</span>
            </button>
          </div>

          {/* Thinking Mode Toggle Badge */}
          <button
            onClick={() => setThinkingMode(!thinkingMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
              thinkingMode
                ? 'bg-gradient-to-r from-purple-900/70 to-indigo-900/70 text-purple-200 border-purple-500/60 shadow-md ring-1 ring-purple-500/30'
                : 'bg-stone-900/50 text-stone-400 border-stone-700/50 hover:border-emerald-700/60'
            }`}
            aria-pressed={thinkingMode}
          >
            <Brain className={`w-3.5 h-3.5 ${thinkingMode ? 'text-purple-300' : 'text-stone-400'}`} />
            <span>High Thinking: {thinkingMode ? 'ON (gemini-4-argon)' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in-50 duration-200`}
            >
              {/* Message Header */}
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-stone-400">
                {isUser ? (
                  <>
                    <span>You</span>
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-emerald-300">Pathfinder AI</span>
                    {msg.thinkingEnabled && (
                      <span className="inline-flex items-center gap-0.5 px-1 rounded bg-purple-950/80 text-purple-300 border border-purple-600/40 text-[9px]">
                        <Brain className="w-2.5 h-2.5" /> High Thinking
                      </span>
                    )}
                    {msg.modelUsed && (
                      <span className="font-mono text-[9px] text-stone-400">
                        ({msg.modelUsed})
                      </span>
                    )}
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                  </>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-emerald-700 text-white rounded-tr-none'
                    : 'bg-[#1e342b] text-stone-100 rounded-tl-none border border-emerald-900/50'
                }`}
              >
                {/* Formatted body */}
                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {msg.text.split('\n\n').map((paragraph, idx) => {
                    // Check for bullet lists
                    if (paragraph.includes('\n- ') || paragraph.startsWith('- ')) {
                      const items = paragraph.split('\n').filter((l) => l.trim().length > 0);
                      return (
                        <ul key={idx} className="list-disc list-inside space-y-1 my-1 text-stone-200">
                          {items.map((it, i) => (
                            <li key={i} className="leading-snug">
                              {it.replace(/^[-•*]\s*/, '')}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={idx}>{paragraph}</p>;
                  })}
                </div>

                {/* AI Message Action Bar */}
                {!isUser && msg.id !== 'msg-welcome' && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-900/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-300/80">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-emerald-200 flex items-center gap-1 transition-colors"
                        title="Copy advice"
                        aria-label="Copy advice"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSpeak(msg.text)}
                        className="hover:text-emerald-200 flex items-center gap-1 transition-colors"
                        title="Read aloud"
                        aria-label="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    </div>

                    {/* Add to personal checklist action */}
                    <button
                      onClick={() => handleSaveToPlan(msg.id, msg.text)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all border ${
                        savedToPlanId === msg.id
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border-emerald-700/40'
                      }`}
                    >
                      {savedToPlanId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-amber-400" />
                          <span>Added to My Plan</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3 h-3 text-emerald-400" />
                          <span>Save to Plan</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading state indicator */}
        {loading && (
          <div className="flex flex-col items-start animate-in fade-in-50">
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-stone-400">
              <span className="font-semibold text-emerald-300">Pathfinder AI</span>
              {thinkingMode && (
                <span className="inline-flex items-center gap-0.5 px-1 rounded bg-purple-950/80 text-purple-300 border border-purple-600/40 text-[9px] animate-pulse">
                  <Brain className="w-2.5 h-2.5" /> Reasoning deeply...
                </span>
              )}
            </div>
            <div className="bg-[#1e342b] border border-emerald-900/50 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2.5 text-stone-300 text-xs shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>
                {thinkingMode
                  ? 'Analyzing career streams, entrance exams & contingencies with High Thinking...'
                  : 'Preparing tailored advice for you...'}
              </span>
            </div>
          </div>
        )}

        {/* Error notice */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <div className="flex-1">
              <span>{errorMsg}</span>
              <button
                onClick={() => handleSendMessage()}
                className="ml-2 underline text-rose-300 font-semibold"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts (horizontal scroll) */}
      <div className="px-3 pt-1 pb-1.5 bg-[#172b22] border-t border-emerald-950/60 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        {SUGGESTED_CHAT_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-200 border border-emerald-800/40 transition-colors disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Transcribe Notice Toast */}
      {transcribeNotice && (
        <div className="px-4 py-1.5 bg-emerald-950/90 border-t border-emerald-700/50 text-[11px] text-emerald-300 flex items-center justify-between shrink-0 animate-in fade-in">
          <span className="flex items-center gap-1.5 font-medium">
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            {transcribeNotice}
          </span>
          <button
            onClick={() => setTranscribeNotice(null)}
            className="text-stone-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Android Input Area */}
      <div className="p-2.5 bg-[#192c24] border-t border-emerald-900/40 shrink-0">
        {isRecording ? (
          /* Active Recording State */
          <div className="flex items-center justify-between gap-3 bg-[#12201a] border border-rose-900/60 rounded-2xl px-4 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-semibold text-rose-300">Listening...</span>
              <span className="font-mono text-stone-300 text-[11px]">
                {Math.floor(recordingSeconds / 60)}:
                {(recordingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelVoiceRecording}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                title="Cancel"
                aria-label="Cancel recording"
              >
                <X className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={stopVoiceRecording}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md tap-bounce"
              >
                <Square className="w-3 h-3 fill-white" />
                <span>Transcribe</span>
              </button>
            </div>
          </div>
        ) : isTranscribing ? (
          /* Transcribing with gemini-3.5-transcribe */
          <div className="flex items-center justify-center gap-2 bg-[#12201a] border border-emerald-800/60 rounded-2xl px-4 py-2.5 text-xs text-emerald-300">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Transcribing audio with gemini-3.5-transcribe...</span>
          </div>
        ) : (
          /* Standard Input Form with Mic Button */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Microphone Button for Audio Input */}
            <button
              type="button"
              onClick={startVoiceRecording}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-[#12201a] hover:bg-emerald-950/70 text-emerald-300 hover:text-emerald-200 border border-emerald-900/60 transition-all flex items-center justify-center tap-bounce"
              title="Voice Input (Transcribe with gemini-3.5-transcribe)"
              aria-label="Start voice input"
            >
              <Mic className="w-4 h-4 text-emerald-400" />
            </button>

            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  thinkingMode
                    ? 'Ask complex question for High Thinking (gemini-4-argon)...'
                    : 'Ask about subjects, exams, diplomas, careers...'
                }
                disabled={loading}
                className="w-full bg-[#12201a] border border-emerald-900/60 focus:border-emerald-500 rounded-2xl px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-400 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`p-2.5 rounded-2xl flex items-center justify-center transition-all ${
                input.trim() && !loading
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-md active:scale-95'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
