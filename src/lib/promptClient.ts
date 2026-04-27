export type PromptStatus = "success" | "schema_fail" | "error";

export type RunResult<T = unknown> = {
  run_id: string;
  status: PromptStatus;
  output: T | null;
  output_text: string;
  model: string;
  latency_ms: number;
  input_tokens: number;
  output_tokens: number;
  error: string | null;
  rendered_messages?: Array<{ role: string; content: string }>;
};

export type ChainStep = {
  step_id: string;
  status: PromptStatus;
  output: unknown;
  run_id: string;
};

export type ChainRunResult = {
  chain_run_id: string;
  steps: ChainStep[];
  aborted: { step_id: string; error: string } | null;
};

function readEnv(): { url: string; anonKey: string } {
  const url = import.meta.env.VITE_PROMPT_SERVICE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_PROMPT_SERVICE_ANON_KEY as
    | string
    | undefined;
  if (!url || !anonKey) {
    throw new Error(
      "Prompt service env vars missing. Set VITE_PROMPT_SERVICE_URL and VITE_PROMPT_SERVICE_ANON_KEY in .env",
    );
  }
  return { url: url.replace(/\/$/, ""), anonKey };
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const { url, anonKey } = readEnv();
  const response = await fetch(`${url}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Prompt service ${path} returned ${response.status}: ${text.slice(0, 400)}`,
    );
  }
  return (await response.json()) as T;
}

export class PromptRunError extends Error {
  run_id: string;
  status: PromptStatus;
  template_key: string;
  constructor(args: {
    template_key: string;
    run_id: string;
    status: PromptStatus;
    error: string | null;
  }) {
    super(
      `Prompt "${args.template_key}" failed (status=${args.status}, run_id=${args.run_id}): ${args.error ?? "no error message"}`,
    );
    this.name = "PromptRunError";
    this.run_id = args.run_id;
    this.status = args.status;
    this.template_key = args.template_key;
  }
}

export async function runPrompt<T = unknown>(args: {
  template_key: string;
  inputs: Record<string, unknown>;
  version_id?: string;
  model?: string;
  params?: Record<string, unknown>;
}): Promise<RunResult<T>> {
  const result = await postJson<RunResult<T>>("/functions/v1/prompt-run", args);
  // Surface every model call so we can see what ran with which model.
  console.info(
    `[prompt] ${args.template_key} status=${result.status} model=${result.model} run_id=${result.run_id} latency_ms=${result.latency_ms}`,
  );
  if (result.status !== "success") {
    console.error(
      `[prompt] ${args.template_key} failed`,
      { run_id: result.run_id, status: result.status, error: result.error, output_text: result.output_text },
    );
    throw new PromptRunError({
      template_key: args.template_key,
      run_id: result.run_id,
      status: result.status,
      error: result.error,
    });
  }
  return result;
}

export async function runChain(args: {
  chain_key: string;
  inputs: Record<string, unknown>;
  pins?: Record<string, unknown>;
}): Promise<ChainRunResult> {
  const result = await postJson<ChainRunResult>(
    "/functions/v1/prompt-chain-run",
    args,
  );
  console.info(
    `[prompt:chain] ${args.chain_key} chain_run_id=${result.chain_run_id} steps=${result.steps.length}${result.aborted ? ` aborted_at=${result.aborted.step_id}` : ""}`,
  );
  for (const step of result.steps) {
    console.info(
      `[prompt:chain] -> ${step.step_id} status=${step.status} run_id=${step.run_id}`,
    );
  }
  if (result.aborted) {
    throw new PromptRunError({
      template_key: `${args.chain_key}:${result.aborted.step_id}`,
      run_id: result.aborted.step_id,
      status: "error",
      error: result.aborted.error,
    });
  }
  return result;
}
