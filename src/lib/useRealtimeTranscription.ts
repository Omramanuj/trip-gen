import { useCallback, useEffect, useRef, useState } from 'react';

type RealtimeTranscriptionEvent = {
  type: string;
  item_id?: string;
  delta?: string;
  transcript?: string;
  error?: {
    message?: string;
  };
};

type RealtimeTokenResponse = {
  ok?: boolean;
  value?: string;
  error?: string;
};

interface UseRealtimeTranscriptionOptions {
  text: string;
  setText: (text: string) => void;
}

const appendVoiceText = (baseText: string, voiceText: string) => {
  const cleanVoiceText = voiceText.trim();
  if (!cleanVoiceText) return baseText;
  if (!baseText.trim()) return cleanVoiceText;

  const separator = /[\s\n]$/.test(baseText) ? '' : ' ';
  return `${baseText}${separator}${cleanVoiceText}`;
};

export function useRealtimeTranscription({ text, setText }: UseRealtimeTranscriptionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [supportsVoiceInput, setSupportsVoiceInput] = useState(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const baseInputRef = useRef('');
  const activeTranscriptsRef = useRef<Record<string, string>>({});
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  const stopListening = useCallback(() => {
    dataChannelRef.current?.close();
    peerConnectionRef.current?.close();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    dataChannelRef.current = null;
    peerConnectionRef.current = null;
    mediaStreamRef.current = null;
    setIsListening(false);
  }, []);

  useEffect(() => {
    setSupportsVoiceInput(Boolean(navigator.mediaDevices?.getUserMedia && window.RTCPeerConnection));

    return () => {
      stopListening();
    };
  }, [stopListening]);

  const renderRealtimeTranscript = useCallback(() => {
    const active = Object.values(activeTranscriptsRef.current).join(' ');
    setText(appendVoiceText(baseInputRef.current, active));
  }, [setText]);

  const handleRealtimeEvent = useCallback((event: RealtimeTranscriptionEvent) => {
    if (event.type === 'conversation.item.input_audio_transcription.delta') {
      const itemId = event.item_id || 'active';
      activeTranscriptsRef.current[itemId] = `${activeTranscriptsRef.current[itemId] || ''}${event.delta || ''}`;
      renderRealtimeTranscript();
      return;
    }

    if (event.type === 'conversation.item.input_audio_transcription.completed') {
      const itemId = event.item_id || 'active';
      const finalTranscript = event.transcript?.trim() || activeTranscriptsRef.current[itemId]?.trim() || '';
      delete activeTranscriptsRef.current[itemId];
      if (finalTranscript) {
        baseInputRef.current = appendVoiceText(baseInputRef.current, finalTranscript);
      }
      renderRealtimeTranscript();
      return;
    }

    if (event.type === 'error') {
      setVoiceError(event.error?.message || 'Realtime transcription failed.');
    }
  }, [renderRealtimeTranscript]);

  const createRealtimeToken = async () => {
    const response = await fetch('/api/realtime/transcription-token', {
      method: 'POST',
    });
    const payload = await response.json().catch(() => null) as RealtimeTokenResponse | null;

    if (!response.ok || !payload?.value) {
      throw new Error(payload?.error || `Realtime token request failed (${response.status}).`);
    }

    return payload.value;
  };

  const startListening = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
      setVoiceError('Realtime voice input needs browser microphone and WebRTC support.');
      setSupportsVoiceInput(false);
      return;
    }

    setVoiceError('');
    baseInputRef.current = textRef.current;
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

      const ephemeralKey = await createRealtimeToken();
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const sdpResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp',
        },
      });

      const answerSdp = await sdpResponse.text();
      if (!sdpResponse.ok) {
        throw new Error(answerSdp || `Realtime WebRTC connection failed (${sdpResponse.status}).`);
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
  }, [handleRealtimeEvent, stopListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
      return;
    }

    void startListening();
  }, [isListening, startListening, stopListening]);

  const handleTextChange = useCallback((nextText: string) => {
    setText(nextText);
    textRef.current = nextText;
    if (isListening) {
      baseInputRef.current = nextText;
      activeTranscriptsRef.current = {};
    }
  }, [isListening, setText]);

  return {
    isListening,
    supportsVoiceInput,
    voiceError,
    toggleListening,
    handleTextChange,
  };
}
