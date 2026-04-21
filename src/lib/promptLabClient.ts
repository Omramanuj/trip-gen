export async function readPromptLabResponse(response: Response) {
  const text = await response.text();
  let payload: unknown = null;

  if (text.trim()) {
    try {
      payload = JSON.parse(text);
    } catch {
      const preview = text.slice(0, 160).replace(/\s+/g, ' ');
      throw new Error(
        `Prompt API returned non-JSON (${response.status}). This usually means the deployed /api/prompt-lab/run route is missing or failed before returning JSON. Preview: ${preview}`,
      );
    }
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error(`Prompt API returned an empty response (${response.status}).`);
  }

  return payload as {
    ok?: boolean;
    error?: string;
    json?: unknown;
    raw_text?: string;
    [key: string]: unknown;
  };
}
