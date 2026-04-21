import { callOpenRouter, requestTimeoutSeconds } from './_openrouter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const origin = req.headers.origin || req.headers.referer;
    const result = await callOpenRouter(req.body || {}, origin);
    res.status(200).json({ ok: true, prompt_id: req.body?.prompt_id || null, ...result });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    res.status(400).json({
      ok: false,
      error: isTimeout
        ? `OpenRouter request timed out after ${requestTimeoutSeconds()}s. Try a faster model or reduce max output tokens.`
        : error instanceof Error ? error.message : 'Unknown prompt lab error',
    });
  }
}
