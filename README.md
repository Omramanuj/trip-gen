<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/929d61fb-f8fc-49ba-afdb-8d3dff44e492

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Recruitment OS Prompt Lab

The Prompt Lab runs real Recruitment OS prompts through a design-local OpenRouter API.

Create `design/recruitment-os/.env`:

```bash
OPENROUTER_API_KEY="your_openrouter_key"
OPENROUTER_FAST_MODEL="openai/gpt-4o-mini"
OPENROUTER_STRATEGY_MODEL="openai/gpt-4o"
OPENROUTER_TRIP_MODEL="openai/gpt-4o"
OPENROUTER_TIMEOUT_MS="90000"
```

Start the combined frontend + API server:

```bash
npm run dev:prompt-lab
```

Open:

```text
http://localhost:3000/
```

Go to **Prompt Lab**, pick a prompt case, edit the JSON input, and click **Run LLM**. The frontend sends the actual rendered system/user messages to `/api/prompt-lab/run`; the API calls OpenRouter server-side so the key is not exposed in the browser.

## Prompt Evals

This package uses Promptfoo for Codex prompt evaluation.

Prerequisites:

- Node.js `20.20.0+` or `22.22.0+`
- Codex CLI installed and authenticated, or `OPENAI_API_KEY` exported

Run the Codex app-server eval:

```bash
npm run eval:codex
```

Open the Promptfoo results UI:

```bash
npm run eval:codex:view
```

The default config lives at `evals/codex-app-server/promptfooconfig.yaml`. It runs Codex in read-only mode with approvals disabled, so it is safe for prompt and repository-review evals.
