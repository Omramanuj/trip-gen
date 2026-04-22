function transcriptionSessionConfig() {
  return {
    type: 'transcription',
    audio: {
      input: {
        transcription: {
          model: process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-mini-transcribe',
          language: process.env.OPENAI_TRANSCRIBE_LANGUAGE || 'en',
          prompt: process.env.OPENAI_TRANSCRIBE_PROMPT || 'Recruitment role brief with job title, experience, location, work mode, salary, skills, constraints, and search strategy.',
        },
        turn_detection: {
          type: 'server_vad',
          threshold: Number(process.env.OPENAI_TRANSCRIBE_VAD_THRESHOLD || 0.5),
          prefix_padding_ms: 300,
          silence_duration_ms: Number(process.env.OPENAI_TRANSCRIBE_SILENCE_MS || 250),
        },
      },
    },
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({ ok: false, error: 'OPENAI_API_KEY is not set in the deployment environment.' });
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: transcriptionSessionConfig(),
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const error = payload?.error?.message || payload?.message || response.statusText;
      res.status(response.status).json({ ok: false, error });
      return;
    }

    const token = payload?.value || payload?.client_secret?.value;
    if (!token) {
      res.status(502).json({ ok: false, error: 'OpenAI did not return a realtime client secret.' });
      return;
    }

    res.status(200).json({
      ok: true,
      value: token,
      expires_at: payload?.expires_at || payload?.client_secret?.expires_at || null,
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error instanceof Error ? error.message : 'Unknown realtime token error' });
  }
}
