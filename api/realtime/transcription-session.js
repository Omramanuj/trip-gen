export const config = {
  api: {
    bodyParser: false,
  },
};

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
          silence_duration_ms: Number(process.env.OPENAI_TRANSCRIBE_SILENCE_MS || 150),
        },
      },
    },
  };
}

async function readRequestBody(req) {
  if (typeof req.body === 'string') return req.body;

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).send('Method not allowed');
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(500).send('OPENAI_API_KEY is not set in the deployment environment.');
    return;
  }

  try {
    const sdp = await readRequestBody(req);
    if (!sdp.trim()) {
      res.status(400).send('Expected SDP offer in request body.');
      return;
    }

    const formData = new FormData();
    formData.set('sdp', sdp);
    formData.set('session', JSON.stringify(transcriptionSessionConfig()));

    const response = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    const answer = await response.text();
    if (!response.ok) {
      res.status(response.status).send(answer || response.statusText);
      return;
    }

    res.setHeader('Content-Type', 'application/sdp');
    res.status(200).send(answer);
  } catch (error) {
    res.status(500).send(error instanceof Error ? error.message : 'Unknown realtime transcription error');
  }
}
