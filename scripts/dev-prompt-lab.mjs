import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const port = Number(process.env.PORT || 3000);
const defaultFastModel = process.env.OPENROUTER_FAST_MODEL || 'openai/gpt-4o-mini';
const defaultStrategyModel = process.env.OPENROUTER_STRATEGY_MODEL || process.env.OPENROUTER_INFERENCE_MODEL || 'openai/gpt-4o';
const defaultTripModel = process.env.OPENROUTER_TRIP_MODEL || defaultStrategyModel;
const requestTimeoutMs = Number(process.env.OPENROUTER_TIMEOUT_MS || 90000);

function modelForPrompt(promptId, explicitModel) {
  if (explicitModel) return explicitModel;
  if (promptId === 'inference_cards') return defaultStrategyModel;
  if (promptId === 'journey_planner') return defaultTripModel;
  if (typeof promptId === 'string' && promptId.startsWith('lever_content_')) return defaultTripModel;
  return defaultFastModel;
}

function extractJson(text) {
  const trimmed = text.trim();
  const withoutOuterFence = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const withoutAnyFenceMarkers = withoutOuterFence.replace(/```(?:json)?/gi, '').trim();

  for (const candidate of [trimmed, withoutOuterFence, withoutAnyFenceMarkers]) {
    if (!candidate) continue;
    try {
      return JSON.parse(candidate);
    } catch {
      // Try progressively more tolerant parsing below.
    }
  }

  try {
    return JSON.parse(trimmed);
  } catch (directError) {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      try {
        return JSON.parse(fenced[1].trim());
      } catch {
        const preview = fenced[1].slice(0, 240).replace(/\s+/g, ' ');
        throw new Error(`Model returned malformed fenced JSON. Preview: ${preview}`);
      }
    }

    const firstBrace = withoutAnyFenceMarkers.indexOf('{');
    const lastBrace = withoutAnyFenceMarkers.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const candidate = withoutAnyFenceMarkers.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        const preview = candidate.slice(0, 240).replace(/\s+/g, ' ');
        const reason = directError instanceof Error ? directError.message : 'Invalid JSON';
        throw new Error(`Model returned malformed JSON: ${reason}. Preview: ${preview}`);
      }
    }

    const preview = trimmed.slice(0, 240).replace(/\s+/g, ' ');
    throw new Error(`Model response did not contain parseable JSON. Preview: ${preview}`);
  }
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

async function callOpenRouter(body) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set. Add it to design/recruitment-os/.env.');
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
        'HTTP-Referer': process.env.APP_URL || `http://localhost:${port}`,
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
          'HTTP-Referer': process.env.APP_URL || `http://localhost:${port}`,
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

async function main() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/prompt-lab/health', (_req, res) => {
    res.json({
      ok: true,
      provider: 'openrouter',
      model: defaultStrategyModel,
      fast_model: defaultFastModel,
      strategy_model: defaultStrategyModel,
      trip_model: defaultTripModel,
      configured: Boolean(process.env.OPENROUTER_API_KEY),
    });
  });

  app.post('/api/prompt-lab/run', async (req, res) => {
    try {
      assertRunPromptRequest(req.body);
      const result = await callOpenRouter(req.body);
      res.json({ ok: true, prompt_id: req.body.prompt_id || null, ...result });
    } catch (error) {
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      res.status(400).json({
        ok: false,
        error: isTimeout
          ? `OpenRouter request timed out after ${requestTimeoutMs / 1000}s. Try a faster model or reduce max output tokens.`
          : error instanceof Error ? error.message : 'Unknown prompt lab error',
      });
    }
  });

  const vite = await createViteServer({
    configFile: false,
    root: process.cwd(),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(port, '0.0.0.0', () => {
    console.log(`Recruitment OS Prompt Lab running at http://localhost:${port}`);
    console.log(`OpenRouter fast model: ${defaultFastModel}`);
    console.log(`OpenRouter strategy model: ${defaultStrategyModel}`);
    console.log(`OpenRouter trip model: ${defaultTripModel}`);
    console.log(`OpenRouter timeout: ${requestTimeoutMs}ms`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
