const defaultFastModel = process.env.OPENROUTER_FAST_MODEL || 'openai/gpt-4o-mini';
const defaultStrategyModel = process.env.OPENROUTER_STRATEGY_MODEL || process.env.OPENROUTER_INFERENCE_MODEL || 'openai/gpt-4o';
const defaultTripModel = process.env.OPENROUTER_TRIP_MODEL || defaultStrategyModel;
const requestTimeoutMs = Number(process.env.OPENROUTER_TIMEOUT_MS || 90000);

export function healthPayload() {
  return {
    ok: true,
    provider: 'openrouter',
    model: defaultStrategyModel,
    fast_model: defaultFastModel,
    strategy_model: defaultStrategyModel,
    trip_model: defaultTripModel,
    configured: Boolean(process.env.OPENROUTER_API_KEY),
  };
}

function modelForPrompt(promptId, explicitModel) {
  if (explicitModel) return explicitModel;
  if (promptId === 'inference_cards') return defaultStrategyModel;
  if (promptId === 'journey_planner') return defaultTripModel;
  if (typeof promptId === 'string' && promptId.startsWith('lever_content_')) return defaultTripModel;
  return defaultFastModel;
}

function findBalancedJson(text) {
  const firstObject = text.indexOf('{');
  const firstArray = text.indexOf('[');
  const firstIndex = [firstObject, firstArray].filter((index) => index >= 0).sort((a, b) => a - b)[0];
  if (firstIndex === undefined) return null;

  const opener = text[firstIndex];
  const closer = opener === '{' ? '}' : ']';
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = firstIndex; index < text.length; index += 1) {
    const char = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === opener) depth += 1;
    if (char === closer) depth -= 1;

    if (depth === 0) {
      return text.slice(firstIndex, index + 1);
    }
  }

  return null;
}

function extractJson(text) {
  const trimmed = text.trim();
  const withoutOuterFence = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const withoutFenceMarkers = withoutOuterFence.replace(/```(?:json)?/gi, '').trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const balanced = findBalancedJson(withoutFenceMarkers);

  const candidates = [
    trimmed,
    withoutOuterFence,
    withoutFenceMarkers,
    fenced?.[1]?.trim(),
    balanced,
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Keep trying more tolerant candidates.
    }
  }

  const preview = (balanced || withoutFenceMarkers || trimmed).slice(0, 300).replace(/\s+/g, ' ');
  throw new Error(`Model returned text that was not valid JSON. Preview: ${preview}`);
}

function assertRunPromptRequest(body) {
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    throw new Error('messages must be a non-empty array.');
  }

  for (const message of body.messages) {
    if (!['system', 'user', 'assistant'].includes(message.role)) {
      throw new Error(`unsupported message role: ${message.role}`);
    }
    if (typeof message.content !== 'string' || !message.content.trim()) {
      throw new Error('every message must include non-empty content.');
    }
  }
}

export async function callOpenRouter(body, origin) {
  assertRunPromptRequest(body);

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in the deployment environment.');
  }

  const model = modelForPrompt(body.prompt_id, body.model);
  const requestBody = {
    model,
    messages: body.messages,
    temperature: body.temperature ?? 0.2,
    max_tokens: body.max_tokens ?? 2200,
    response_format: { type: 'json_object' },
  };

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || origin || 'https://vercel.app',
        'X-Title': 'Recruitment OS Prompt Lab',
      },
      body: JSON.stringify(requestBody),
    });

    let payload = await response.json().catch(() => null);
    const detail = payload?.error?.message || payload?.message || response.statusText;

    if (!response.ok && /response_format|json_object/i.test(detail || '')) {
      const { response_format: _responseFormat, ...fallbackBody } = requestBody;
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || origin || 'https://vercel.app',
          'X-Title': 'Recruitment OS Prompt Lab',
        },
        body: JSON.stringify(fallbackBody),
      });
      payload = await response.json().catch(() => null);
    }

    if (!response.ok) {
      const errorDetail = payload?.error?.message || payload?.message || response.statusText;
      throw new Error(`OpenRouter ${response.status}: ${errorDetail}`);
    }

    const text = payload?.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text.trim()) {
      throw new Error('OpenRouter response did not include choices[0].message.content.');
    }

    return {
      model: payload?.model || model,
      usage: payload?.usage || null,
      duration_ms: Date.now() - startedAt,
      raw_text: text,
      json: extractJson(text),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function requestTimeoutSeconds() {
  return requestTimeoutMs / 1000;
}
