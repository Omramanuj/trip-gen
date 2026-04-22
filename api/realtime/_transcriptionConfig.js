const DEFAULT_TRANSCRIBE_MODEL = 'gpt-4o-mini-transcribe';
const DEFAULT_TRANSCRIBE_LANGUAGE = 'en';
const DEFAULT_VAD_THRESHOLD = 0.5;
const DEFAULT_SILENCE_DURATION_MS = 150;
const DEFAULT_PREFIX_PADDING_MS = 300;

function readNumberEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

export function realtimeTranscriptionSessionConfig() {
  const transcription = {
    model: process.env.OPENAI_TRANSCRIBE_MODEL || DEFAULT_TRANSCRIBE_MODEL,
    language: process.env.OPENAI_TRANSCRIBE_LANGUAGE || DEFAULT_TRANSCRIBE_LANGUAGE,
  };

  if (process.env.OPENAI_TRANSCRIBE_PROMPT) {
    transcription.prompt = process.env.OPENAI_TRANSCRIBE_PROMPT;
  }

  return {
    type: 'transcription',
    audio: {
      input: {
        transcription,
        turn_detection: {
          type: 'server_vad',
          threshold: readNumberEnv('OPENAI_TRANSCRIBE_VAD_THRESHOLD', DEFAULT_VAD_THRESHOLD),
          prefix_padding_ms: readNumberEnv('OPENAI_TRANSCRIBE_PREFIX_PADDING_MS', DEFAULT_PREFIX_PADDING_MS),
          silence_duration_ms: readNumberEnv('OPENAI_TRANSCRIBE_SILENCE_MS', DEFAULT_SILENCE_DURATION_MS),
        },
      },
    },
  };
}
