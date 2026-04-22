import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Check, Loader2, Zap } from 'lucide-react';
import { MOCK_INPUT } from '../mockData';
import { CoverageFieldId, fastExtractBriefCoverage } from '../lib/fastBriefCoverage';

interface ExpressionCaptureProps {
  inputText: string;
  setInputText: (text: string) => void;
  onCrystallize: () => void;
}

const VACANCY_TAGS = [
  { id: 'confidential', label: 'Confidential' },
  { id: 'no_cap', label: 'No upper salary cap' },
  { id: 'new_pos', label: 'New position' },
  { id: 'replace', label: 'Replacement hiring' },
  { id: 'first_principle', label: '1st principle thinker' },
  { id: 'ai_power', label: 'AI tool power user' },
  { id: 'any_exp', label: 'Any experience works' },
];

const NUDGES = [
  { id: 'designation', label: 'Designation', mandatory: true },
  { id: 'experience_years', label: 'Experience (in yrs)', mandatory: true },
  { id: 'location', label: 'Location', mandatory: true },
  { id: 'wfh_mode', label: 'WFO/WFH', mandatory: true },
  { id: 'salary_range', label: 'Salary', mandatory: true },
  { id: 'industry_type', label: 'Industry type', mandatory: false },
  { id: 'company_type', label: 'Company type', mandatory: false },
  { id: 'experience_type', label: 'Experience type', mandatory: false },
  { id: 'must_haves', label: 'Must haves', mandatory: false },
  { id: 'disqualifiers', label: 'Disqualifier', mandatory: false },
  { id: 'red_flags', label: 'Red flags', mandatory: false },
  { id: 'search_strategy', label: 'Thoughts on search strategy', mandatory: false }
] satisfies { id: CoverageFieldId; label: string; mandatory: boolean }[];

type RealtimeTranscriptionEvent = {
  type: string;
  item_id?: string;
  delta?: string;
  transcript?: string;
  error?: {
    message?: string;
  };
};

const appendVoiceText = (baseText: string, voiceText: string) => {
  const cleanVoiceText = voiceText.trim();
  if (!cleanVoiceText) return baseText;
  if (!baseText.trim()) return cleanVoiceText;

  const separator = /[\s\n]$/.test(baseText) ? '' : ' ';
  return `${baseText}${separator}${cleanVoiceText}`;
};

export function ExpressionCapture({ inputText, setInputText, onCrystallize }: ExpressionCaptureProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [supportsVoiceInput, setSupportsVoiceInput] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const baseInputRef = useRef('');
  const completedTranscriptsRef = useRef<string[]>([]);
  const activeTranscriptsRef = useRef<Record<string, string>>({});
  const coverage = useMemo(() => fastExtractBriefCoverage(inputText), [inputText]);

  useEffect(() => {
    setSupportsVoiceInput(Boolean(navigator.mediaDevices?.getUserMedia && window.RTCPeerConnection));

    return () => {
      dataChannelRef.current?.close();
      peerConnectionRef.current?.close();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const toggleTag = (id: string) => {
    const next = new Set(selectedTags);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTags(next);
  };

  const handleMockFill = () => {
    setInputText(MOCK_INPUT);
  };

  const renderRealtimeTranscript = () => {
    const completed = completedTranscriptsRef.current.join(' ');
    const active = Object.values(activeTranscriptsRef.current).join(' ');
    const liveTranscript = appendVoiceText(completed, active);
    setInputText(appendVoiceText(baseInputRef.current, liveTranscript));
  };

  const stopListening = () => {
    dataChannelRef.current?.close();
    peerConnectionRef.current?.close();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    dataChannelRef.current = null;
    peerConnectionRef.current = null;
    mediaStreamRef.current = null;
    setIsListening(false);
  };

  const handleRealtimeEvent = (event: RealtimeTranscriptionEvent) => {
    if (event.type === 'conversation.item.input_audio_transcription.delta') {
      const itemId = event.item_id || 'active';
      activeTranscriptsRef.current[itemId] = `${activeTranscriptsRef.current[itemId] || ''}${event.delta || ''}`;
      renderRealtimeTranscript();
      return;
    }

    if (event.type === 'conversation.item.input_audio_transcription.completed') {
      const itemId = event.item_id || 'active';
      delete activeTranscriptsRef.current[itemId];
      if (event.transcript?.trim()) {
        completedTranscriptsRef.current = [...completedTranscriptsRef.current, event.transcript.trim()];
      }
      renderRealtimeTranscript();
      return;
    }

    if (event.type === 'error') {
      setVoiceError(event.error?.message || 'Realtime transcription failed.');
    }
  };

  const startListening = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
      setVoiceError('Realtime voice input needs browser microphone and WebRTC support.');
      setSupportsVoiceInput(false);
      return;
    }

    setVoiceError('');
    baseInputRef.current = inputText;
    completedTranscriptsRef.current = [];
    activeTranscriptsRef.current = {};
    setIsListening(true);

    try {
      const peerConnection = new RTCPeerConnection();
      const dataChannel = peerConnection.createDataChannel('oai-events');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaStream.getAudioTracks().forEach((track) => {
        peerConnection.addTrack(track, mediaStream);
      });

      dataChannel.addEventListener('open', () => {
        setVoiceError('');
      });

      dataChannel.addEventListener('message', (message) => {
        try {
          handleRealtimeEvent(JSON.parse(message.data) as RealtimeTranscriptionEvent);
        } catch {
          // Ignore non-JSON control messages.
        }
      });

      peerConnection.addEventListener('connectionstatechange', () => {
        if (['failed', 'disconnected', 'closed'].includes(peerConnection.connectionState)) {
          if (peerConnectionRef.current === peerConnection) {
            setIsListening(false);
          }
        }
      });

      peerConnectionRef.current = peerConnection;
      dataChannelRef.current = dataChannel;
      mediaStreamRef.current = mediaStream;

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const sdpResponse = await fetch('/api/realtime/transcription-session', {
        method: 'POST',
        body: offer.sdp,
        headers: {
          'Content-Type': 'application/sdp',
        },
      });

      const answerSdp = await sdpResponse.text();
      if (!sdpResponse.ok) {
        throw new Error(answerSdp || 'Realtime transcription session failed.');
      }

      await peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });
    } catch (error) {
      stopListening();
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setVoiceError('Microphone access was blocked. Allow microphone permission and try again.');
        return;
      }
      setVoiceError(error instanceof Error ? error.message : 'Realtime voice input could not start.');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      return;
    }

    startListening();
  };

  useEffect(() => {
    if (inputText.trim().length < 12) {
      setIsRefining(false);
      return;
    }

    setIsRefining(true);
    const timeout = window.setTimeout(() => setIsRefining(false), 450);
    return () => window.clearTimeout(timeout);
  }, [inputText]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto flex gap-12"
    >
      <div className="flex-1 flex flex-col gap-6">
        <div>
          <h1 className="font-serif text-3xl text-ink tracking-tight mb-2">
            Describe the role
          </h1>
          <p className="text-ink-muted text-sm pr-12">
            Speak as if you were briefing a trusted recruiter. A preferred audio note will touch upon all the necessary tags below.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
             <button 
                onClick={toggleListening}
                disabled={!supportsVoiceInput}
                title={supportsVoiceInput ? 'Toggle OpenAI Realtime voice input' : 'Realtime voice input is not supported in this browser'}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isListening 
                    ? 'bg-signal-weak/10 text-signal-weak animate-pulse' 
                    : supportsVoiceInput
                      ? 'bg-surface-card border border-ink/10 text-ink/60 hover:text-ink hover:border-ink/30'
                      : 'bg-surface-card border border-ink/10 text-ink-faint cursor-not-allowed'
                }`}
              >
                {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>
              <div className="flex flex-col">
                 <span className="font-medium text-sm text-ink">
                   {isListening ? 'Listening live...' : supportsVoiceInput ? 'Tap to speak' : 'Voice unavailable'}
                 </span>
                 <span className="text-xs text-ink-muted">
                   {isListening ? 'Streaming to OpenAI Realtime.' : 'Uses WebRTC transcription.'}
                 </span>
              </div>
          </div>

          <div className="relative w-full">
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (isListening) {
                  baseInputRef.current = e.target.value;
                  completedTranscriptsRef.current = [];
                  activeTranscriptsRef.current = {};
                }
              }}
              placeholder="Type or paste what's on your mind"
              className={`w-full min-h-[160px] bg-white border border-ink/10 p-6 font-serif text-base leading-relaxed text-black caret-black resize-y outline-none focus:border-ink/30 transition-colors placeholder:text-ink-faint ${isListening && inputText.length === 0 ? 'italic' : ''}`}
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <button 
                onClick={handleMockFill}
                className="text-xs font-mono text-ink-faint hover:text-ink transition-colors"
              >
                [Mock Input]
              </button>
            </div>
          </div>
          {voiceError && (
            <div className="rounded-sm border border-signal-warning/30 bg-signal-warning/10 px-3 py-2 text-xs text-signal-warning">
              {voiceError}
            </div>
          )}
        </div>

        <div className="mt-2">
           <div className="mb-3 flex items-center justify-between gap-3">
             <h4 className="text-[10px] font-mono uppercase tracking-widest text-ink-muted">Coverage Checklist</h4>
             <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-ink-muted">
               <Zap className="h-3.5 w-3.5 text-signal-verified" />
               <span>{coverage.elapsedMs.toFixed(1)}ms local</span>
               {isRefining && (
                 <>
                   <span className="text-ink-faint">·</span>
                   <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-muted" />
                   <span>refining</span>
                 </>
               )}
             </div>
           </div>
           <div className="flex flex-wrap gap-2">
              {NUDGES.map(nudge => {
                const isCovered = coverage.coveredFields.has(nudge.id);
                return (
                  <div
                    key={nudge.id}
                    className={`px-2.5 py-1 text-xs font-mono rounded-sm flex items-center gap-1.5 transition-all duration-300 ${
                      isCovered 
                        ? 'bg-ink text-base' 
                        : !isCovered && inputText.length > 0
                          ? 'bg-signal-warning/20 text-signal-warning border border-signal-warning/30'
                          : nudge.mandatory ? 'bg-transparent border border-ink/30 text-ink' : 'bg-transparent border border-ink/10 text-ink/50'
                    }`}
                  >
                    {isCovered && <Check className="w-3 h-3" />}
                    {nudge.label} {nudge.mandatory && !isCovered && <span className="text-[10px]">*</span>}
                  </div>
                )
              })}
           </div>
           {inputText.length > 0 && (
             <div className="mt-4 grid gap-3 rounded-md border border-ink/10 bg-surface-card p-4 md:grid-cols-[1fr_1fr]">
               <div>
                 <div className="text-[10px] font-mono uppercase tracking-widest text-ink-muted">Detected Signals</div>
                 <div className="mt-2 flex flex-col gap-1.5">
                   {coverage.hits.length ? coverage.hits.slice(0, 6).map((hit) => (
                     <div key={`${hit.field}-${hit.value}`} className="flex items-center justify-between gap-3 text-xs">
                       <span className="text-ink">{hit.label}</span>
                       <span className="truncate text-ink-muted">{hit.value}</span>
                     </div>
                   )) : (
                     <div className="text-xs text-ink-muted">Keep typing; local parser is watching for role, location, salary, work mode, and constraints.</div>
                   )}
                 </div>
               </div>
               <div>
                 <div className="text-[10px] font-mono uppercase tracking-widest text-ink-muted">Mandatory Gaps</div>
                 <div className="mt-2 flex flex-wrap gap-1.5">
                   {coverage.missingMandatory.length ? coverage.missingMandatory.map((field) => {
                     const nudge = NUDGES.find((item) => item.id === field);
                     return (
                       <span key={field} className="rounded-sm border border-ink/10 px-2 py-1 text-xs text-ink-muted">
                         {nudge?.label || field}
                       </span>
                     );
                   }) : (
                     <span className="rounded-sm bg-signal-verified/10 px-2 py-1 text-xs text-signal-verified">Mandatory tags covered</span>
                   )}
                 </div>
               </div>
             </div>
           )}
        </div>

        <AnimatePresence>
          {inputText.length > 5 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end mt-4"
            >
              <button
                onClick={onCrystallize}
                className="px-6 py-2.5 bg-ink text-base font-sans text-sm font-medium hover:bg-ink/90 transition-colors shadow-sm"
              >
                Fine Tune
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-[280px] shrink-0 pt-16">
        <h4 className="text-[10px] font-mono uppercase tracking-widest text-ink-muted mb-4 border-b border-ink/10 pb-2">Context Tags</h4>
        <div className="flex flex-col gap-2">
          {VACANCY_TAGS.map(tag => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-2 text-xs text-left font-mono transition-colors border rounded-sm ${
                selectedTags.has(tag.id)
                  ? 'bg-ink/5 text-ink border-ink/30 font-medium'
                  : 'bg-transparent text-ink/60 border-ink/10 hover:border-ink/20 hover:text-ink'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
