import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Copy, Loader2, Play, RefreshCw } from 'lucide-react';
import {
  buildApplicationFormPrompt,
  buildBriefExtractionPrompt,
  buildClarifyingQuestionsPrompt,
  buildInferenceCardsPrompt,
  buildJourneyPlannerPrompt,
  buildLeverContentPrompt,
  buildOutreachPrompt,
  type PromptSpec,
} from '../prompts/recruitmentOsPrompts';
import {
  approvedInferenceCards,
  confirmedAssignmentJourney,
  extractedFintechBrief,
  fintechBackendBrief,
} from '../prompts/recruitmentOsFixtures';
import { leverIds } from '../prompts/recruitmentOsSchemas';

type PromptCaseId =
  | 'brief_extraction'
  | 'clarifying_questions'
  | 'inference_cards'
  | 'application_form'
  | 'outreach_draft'
  | 'journey_planner'
  | 'lever_content_assignment'
  | 'lever_content_demo'
  | 'lever_content_quiz'
  | 'lever_content_rapid_fire';

type PromptCase = {
  id: PromptCaseId;
  label: string;
  description: string;
  defaultInput: unknown;
  build: (input: any) => PromptSpec;
  preview: (input: any) => unknown;
};

const cases: PromptCase[] = [
  {
    id: 'brief_extraction',
    label: 'Brief Extraction',
    description: 'First-screen HM signals into mandatory role tags.',
    defaultInput: fintechBackendBrief,
    build: buildBriefExtractionPrompt,
    preview: () => extractedFintechBrief,
  },
  {
    id: 'clarifying_questions',
    label: 'Clarifying Questions',
    description: 'Missing mandatory tags into short HM questions.',
    defaultInput: {
      brief: { ...extractedFintechBrief, red_flags: [], search_strategy: null },
      missingFields: ['red_flags', 'search_strategy'],
    },
    build: buildClarifyingQuestionsPrompt,
    preview: () => ({
      questions: [
        {
          field: 'red_flags',
          question: 'What are absolute red flags that should stop us from moving this candidate forward?',
        },
        {
          field: 'search_strategy',
          question: 'Where should recruiters search first, and which candidate pools should they avoid?',
        },
      ],
    }),
  },
  {
    id: 'inference_cards',
    label: 'Six Inference Cards',
    description: 'Complete brief into HM approval cards.',
    defaultInput: { brief: extractedFintechBrief },
    build: buildInferenceCardsPrompt,
    preview: () => approvedInferenceCards,
  },
  {
    id: 'application_form',
    label: 'Application Form',
    description: 'Journey 1 candidate form with LLM-selected fields.',
    defaultInput: { brief: extractedFintechBrief, inferenceCards: approvedInferenceCards },
    build: buildApplicationFormPrompt,
    preview: () => ({
      journey_number: 1,
      title: 'Application Form & Initial Context',
      description: 'Collect identity, contact, availability, compensation fit, and role-specific proof signals.',
      dropout_risk: 'low',
      estimated_minutes: 6,
      form_sections: [
        {
          section_id: 'identity_contact',
          title: 'Identity & Contact',
          description: 'Basic candidate details required for recruiter follow-up.',
          fields: [
            {
              field_id: 'full_name',
              label: 'Full name',
              field_type: 'short_text',
              required: true,
              placeholder: 'Your full name',
              options: [],
              help_text: null,
              target_signal: 'identity',
              reasoning: 'Recruiters need a reliable candidate identity before reviewing evidence.',
            },
            {
              field_id: 'email',
              label: 'Email address',
              field_type: 'email',
              required: true,
              placeholder: 'name@example.com',
              options: [],
              help_text: null,
              target_signal: 'contactability',
              reasoning: 'Email is required for application confirmation and next-step communication.',
            },
            {
              field_id: 'phone',
              label: 'Phone number',
              field_type: 'phone',
              required: true,
              placeholder: '+91...',
              options: [],
              help_text: null,
              target_signal: 'contactability',
              reasoning: 'Phone is useful for time-sensitive hiring loops and recruiter screening.',
            },
            {
              field_id: 'current_location',
              label: 'Current location',
              field_type: 'location',
              required: true,
              placeholder: 'City, country',
              options: [],
              help_text: 'Mention relocation openness if relevant.',
              target_signal: 'location fit',
              reasoning: 'The role has a Bangalore or relocation constraint, so location is a fit signal.',
            },
          ],
        },
        {
          section_id: 'profile_evidence',
          title: 'Profile & Proof',
          description: 'Artifacts that help validate seniority and relevant ownership.',
          fields: [
            {
              field_id: 'resume_cv',
              label: 'Resume / CV',
              field_type: 'file',
              required: true,
              placeholder: null,
              options: [],
              help_text: 'PDF preferred.',
              target_signal: 'career history',
              reasoning: 'Resume is the baseline artifact for experience, company history, and role scope.',
            },
            {
              field_id: 'linkedin_url',
              label: 'LinkedIn URL',
              field_type: 'url',
              required: true,
              placeholder: 'https://linkedin.com/in/...',
              options: [],
              help_text: null,
              target_signal: 'profile verification',
              reasoning: 'LinkedIn helps verify current role, career path, and recruiter outreach context.',
            },
            {
              field_id: 'github_or_portfolio',
              label: 'GitHub, portfolio, or technical writing',
              field_type: 'url',
              required: false,
              placeholder: 'Optional link',
              options: [],
              help_text: 'Share only if it shows relevant backend or systems work.',
              target_signal: 'proof of practice',
              reasoning: 'Technical artifacts can support backend depth without making the form too heavy.',
            },
          ],
        },
        {
          section_id: 'role_fit',
          title: 'Role Fit',
          description: 'Low-friction questions tied to must-haves and constraints.',
          fields: [
            {
              field_id: 'payment_systems_experience',
              label: 'Have you owned payment systems in production?',
              field_type: 'single_select',
              required: true,
              placeholder: null,
              options: ['Yes, primary owner', 'Yes, contributing engineer', 'Adjacent systems only', 'No'],
              help_text: null,
              target_signal: 'payment infrastructure ownership',
              reasoning: 'Payment systems ownership is a core must-have for this role.',
            },
            {
              field_id: 'notice_period',
              label: 'Notice period',
              field_type: 'notice_period',
              required: true,
              placeholder: 'Example: 30 days',
              options: [],
              help_text: null,
              target_signal: 'availability',
              reasoning: 'The mandate has a tight timeline, so availability affects feasibility.',
            },
            {
              field_id: 'expected_ctc',
              label: 'Expected compensation',
              field_type: 'salary',
              required: false,
              placeholder: 'Expected CTC',
              options: [],
              help_text: 'Optional but helps avoid late-stage mismatch.',
              target_signal: 'compensation fit',
              reasoning: 'Compensation alignment is important because the role has a defined budget range.',
            },
          ],
        },
      ],
      knockout_fields: ['current_location', 'payment_systems_experience', 'notice_period'],
      privacy_note: 'Your information is used only for this hiring process and is reviewed by the hiring team and authorized recruiting partners.',
    }),
  },
  {
    id: 'outreach_draft',
    label: 'Outreach Draft',
    description: 'Approved role signal into channel-specific candidate message.',
    defaultInput: {
      brief: extractedFintechBrief,
      inferenceCards: approvedInferenceCards,
      platform: 'linkedin',
      tone: 'direct',
      sender: 'recruiter',
    },
    build: buildOutreachPrompt,
    preview: () => ({
      platform: 'linkedin',
      tone: 'direct',
      sender: 'recruiter',
      message_text:
        'You look close to the payment-infra profile we are hiring for in Bangalore: backend ownership, scale, and failure recovery. Open to a short application journey? [Application Link]',
      cta_placeholder: '[Application Link]',
    }),
  },
  {
    id: 'journey_planner',
    label: 'Journey Planner',
    description: 'Approved cards into a Band/Rung-aware evaluation triad.',
    defaultInput: { brief: extractedFintechBrief, inferenceCards: approvedInferenceCards },
    build: buildJourneyPlannerPrompt,
    preview: () => ({
      journeys: [
        {
          journey_number: 2,
          title: 'Payment Failure Recovery Work Sample',
          description: 'Checks applied execution in a scoped payment-failure context.',
          lever_id: 'assignment',
          lever_rationale: 'A short work sample validates procedural depth without a heavy take-home.',
          structure_hint: 'Brief, written response, optional artifact proof.',
          target_signals: ['idempotency', 'failure recovery', 'ledger correctness'],
          skill_frame: confirmedAssignmentJourney.skill_frame,
          estimated_minutes: 10,
          dropout_risk: 'medium',
        },
        {
          journey_number: 3,
          title: 'Explain Your Payment Recovery Design',
          description: 'Checks tacit know-how and stakeholder-facing procedural fluency.',
          lever_id: 'demo',
          lever_rationale: 'A demo reveals how the candidate structures real work for others.',
          structure_hint: 'Scenario, walkthrough spine, written walkthrough, optional proof.',
          target_signals: ['procedural fluency', 'trade-off clarity', 'audience adaptation'],
          skill_frame: { ...confirmedAssignmentJourney.skill_frame, target_depth: 'L2-L4' },
          estimated_minutes: 15,
          dropout_risk: 'medium',
        },
        {
          journey_number: 4,
          title: 'Serious or Joking: Payment Infra Claims',
          description: 'Checks fast recognition of serious vs unserious payment-system statements.',
          lever_id: 'rapid_fire',
          lever_rationale: 'Rapid fire reveals instincts and practiced judgment.',
          structure_hint: 'Timed serious/joking statements.',
          target_signals: ['tacit standards', 'risk recognition', 'reflex judgment'],
          skill_frame: { ...confirmedAssignmentJourney.skill_frame, target_depth: 'L2-L4' },
          estimated_minutes: 8,
          dropout_risk: 'low',
        },
      ],
    }),
  },
  ...leverIds.map((lever_id) => ({
    id: `lever_content_${lever_id}` as PromptCaseId,
    label: `Lever Content: ${lever_id}`,
    description: 'Confirmed journey into DB-ready card_template and sub_card_templates.',
    defaultInput: {
      brief: extractedFintechBrief,
      inferenceCards: approvedInferenceCards,
      journey: { ...confirmedAssignmentJourney, lever_id },
      hmConstraint: lever_id === 'assignment' ? confirmedAssignmentJourney.hm_constraint : undefined,
    },
    build: buildLeverContentPrompt,
    preview: () => buildLeverPreview(lever_id),
  })),
];

function buildLeverPreview(leverId: string) {
  const commonCard = {
    lever_id: leverId,
    title: leverId === 'rapid_fire' ? 'Payment Infra Serious or Joking' : 'Payment Failure Recovery',
    instruction: 'Complete this short evidence journey using the scenario provided.',
    time_cap_seconds: leverId === 'demo' ? 900 : leverId === 'rapid_fire' ? 480 : 600,
    required: true,
    is_enabled: true,
    rubric_json: {
      signals: ['idempotency', 'failure recovery', 'judgment quality'],
      scoring: 'Interpret evidence using L1-L4 depth anchors; do not score polish or style.',
    },
  };

  if (leverId === 'rapid_fire') {
    return {
      card_template: commonCard,
      sub_card_templates: [
        {
          sequence_index: 1,
          sub_card_type: 'briefing',
          interaction_type: 'display',
          title: 'Rules',
          body_text: null,
          response_expected: false,
          body_json: { prompt: 'Mark each statement Serious or Joking.', timer_seconds: 10, auto_advance: true },
        },
        {
          sequence_index: 2,
          sub_card_type: 'task',
          interaction_type: 'choice_buttons',
          title: 'Statement 1',
          body_text: null,
          response_expected: true,
          body_json: {
            badge: 'Idempotency',
            prompt: 'Retries can safely create duplicate ledger entries if reconciliation catches them later.',
            options: [
              { id: 'serious', label: 'Serious', value: 'serious' },
              { id: 'joking', label: 'Joking', value: 'joking' },
            ],
            timer_seconds: 10,
            auto_advance: true,
          },
        },
      ],
    };
  }

  if (leverId === 'demo') {
    return {
      card_template: commonCard,
      sub_card_templates: [
        {
          sequence_index: 1,
          sub_card_type: 'briefing',
          interaction_type: 'display',
          title: 'Scenario',
          body_text: null,
          response_expected: false,
          body_json: {
            prompt: 'Demo how you would explain a payment recovery design to a CTO and on-call lead.',
            subtitle: 'Focus on sequence, trade-offs, and failure boundaries.',
            blocks: [
              { label: 'Stack', value: 'API, queue, ledger' },
              { label: 'Scale', value: 'High retry volume' },
              { label: 'Constraint', value: 'No duplicate charges' },
            ],
            non_signals: ['visual polish', 'slide design'],
          },
        },
      ],
    };
  }

  if (leverId === 'quiz') {
    return {
      card_template: commonCard,
      sub_card_templates: [
        {
          sequence_index: 1,
          sub_card_type: 'briefing',
          interaction_type: 'display',
          title: 'Judgment Check',
          body_text: null,
          response_expected: false,
          body_json: { prompt: 'Choose the best response for each payment incident scenario.', rules: ['Single choice'] },
        },
        {
          sequence_index: 2,
          sub_card_type: 'task',
          interaction_type: 'choice_buttons',
          title: 'Retry Storm',
          body_text: null,
          response_expected: true,
          body_json: {
            prompt: 'Gateway timeouts spike during retries. What should you prioritize first?',
            options: [
              { id: 'a', label: 'Pause all retries and inspect idempotency guarantees', value: 'pause_inspect' },
              { id: 'b', label: 'Increase retry count to improve success rate', value: 'increase_retries' },
            ],
            selection_mode: 'single',
            correct_answer: 'a',
            supporting_text: 'Duplicate prevention and ledger correctness come before throughput.',
          },
        },
      ],
    };
  }

  return {
    card_template: commonCard,
    sub_card_templates: [
      {
        sequence_index: 1,
        sub_card_type: 'briefing',
        interaction_type: 'display',
        title: 'Brief',
        body_text: null,
        response_expected: false,
        body_json: {
          prompt: 'A payment retry flow is causing inconsistent ledger states after gateway timeouts.',
          subtitle: 'Write a scoped recovery plan.',
          blocks: [
            { label: 'Audience', value: 'CTO and on-call lead' },
            { label: 'Format', value: 'Short plan' },
            { label: 'Duration', value: '10 minutes' },
          ],
          highlight: 'Prioritize correctness before throughput.',
        },
      },
      {
        sequence_index: 2,
        sub_card_type: 'task',
        interaction_type: 'long_text',
        title: 'Response',
        body_text: null,
        response_expected: true,
        body_json: {
          prompt: 'Explain your recovery plan, key assumptions, and first safeguards.',
          placeholder: 'Start with the failure mode...',
          sections: ['Failure mode', 'Safeguards', 'Trade-offs'],
          max_words: 500,
          done_looks_like: 'Clear assumptions, idempotency boundary, ledger recovery path.',
        },
      },
    ],
  };
}

function pretty(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function renderPrompt(spec: PromptSpec) {
  return spec.messages
    .map((message) => `## ${message.role.toUpperCase()}\n\n${message.content}`)
    .join('\n\n---\n\n');
}

export function PromptLab() {
  const [selectedId, setSelectedId] = useState<PromptCaseId>('journey_planner');
  const [model, setModel] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [llmOutput, setLlmOutput] = useState<string>('');
  const [llmRawOutput, setLlmRawOutput] = useState<string>('');
  const selectedCase = cases.find((item) => item.id === selectedId) || cases[0];
  const [inputTextByCase, setInputTextByCase] = useState<Record<string, string>>(() =>
    Object.fromEntries(cases.map((item) => [item.id, pretty(item.defaultInput)])),
  );
  const inputText = inputTextByCase[selectedCase.id] || pretty(selectedCase.defaultInput);

  const parsedInput = useMemo(() => {
    try {
      return { ok: true as const, value: JSON.parse(inputText) };
    } catch (error) {
      return { ok: false as const, error: error instanceof Error ? error.message : 'Invalid JSON' };
    }
  }, [inputText]);

  const promptSpec = parsedInput.ok ? selectedCase.build(parsedInput.value) : null;
  const promptText = promptSpec ? renderPrompt(promptSpec) : '';
  const previewOutput = parsedInput.ok ? selectedCase.preview(parsedInput.value) : null;

  const updateInput = (value: string) => {
    setInputTextByCase((current) => ({ ...current, [selectedCase.id]: value }));
  };

  const resetInput = () => updateInput(pretty(selectedCase.defaultInput));

  const runPrompt = async () => {
    if (!promptSpec) return;

    setIsRunning(true);
    setRunError(null);
    setLlmOutput('');
    setLlmRawOutput('');

    try {
      const response = await fetch('/api/prompt-lab/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_id: promptSpec.id,
          model: model.trim() || undefined,
          temperature: promptSpec.temperature,
          max_tokens: promptSpec.maxOutputTokens,
          messages: promptSpec.messages,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || `Prompt run failed with ${response.status}`);
      }

      setLlmOutput(pretty(payload.json));
      setLlmRawOutput(payload.raw_text || '');
    } catch (error) {
      setRunError(error instanceof Error ? error.message : 'Unknown prompt run error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section className="w-full space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink">Prompt Lab</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
            Render Recruitment OS prompts and run them against OpenRouter from the design-local dev server.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-ink/10 bg-surface-card px-3 py-2 text-xs font-mono text-signal-verified">
          <CheckCircle2 size={16} />
          Design local
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {cases.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
              selectedCase.id === item.id
                ? 'border-ink bg-ink text-base'
                : 'border-ink/10 bg-surface-card text-ink-muted hover:border-ink/30 hover:text-ink'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-md border border-ink/10 bg-surface-card">
          <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-ink">{selectedCase.label}</div>
              <div className="text-xs text-ink-muted">{selectedCase.description}</div>
            </div>
            <button
              onClick={resetInput}
              className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-3 py-1.5 text-xs text-ink-muted hover:text-ink"
            >
              <RefreshCw size={14} />
              Reset
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(event) => updateInput(event.target.value)}
            spellCheck={false}
            className="min-h-[560px] w-full resize-y bg-white p-4 font-mono text-xs leading-5 text-black caret-black outline-none placeholder:text-ink-faint"
          />
          {!parsedInput.ok && (
            <div className="border-t border-signal-weak/20 bg-signal-weak/5 px-4 py-3 text-xs text-signal-weak">
              {parsedInput.error}
            </div>
          )}
        </div>

        <div className="grid gap-4">
          <div className="rounded-md border border-ink/10 bg-surface-card">
            <div className="flex flex-col gap-3 border-b border-ink/10 px-4 py-3 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0 flex-1">
                <label className="text-xs font-mono uppercase tracking-widest text-ink-muted">Model override</label>
                <input
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  className="mt-1 w-full rounded-md border border-ink/10 bg-white px-3 py-2 font-mono text-xs text-black caret-black outline-none placeholder:text-ink-faint focus:border-ink/40"
                  placeholder="Blank uses fast route"
                />
              </div>
              <button
                onClick={runPrompt}
                disabled={!promptSpec || isRunning}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-ink px-4 text-xs font-medium text-base transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRunning ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
                Run LLM
              </button>
            </div>
            {runError && (
              <div className="flex items-start gap-2 border-b border-signal-weak/20 bg-signal-weak/5 px-4 py-3 text-xs leading-5 text-signal-weak">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{runError}</span>
              </div>
            )}
            <div className="px-4 py-3 text-xs leading-5 text-ink-muted">
              This sends the selected prompt&apos;s real system/user messages to the design-local API route, which calls OpenRouter with your server-side API key.
            </div>
          </div>
          <OutputPanel title="Rendered Prompt" value={promptText} />
          <OutputPanel title="Real LLM JSON Output" value={llmOutput} />
          <OutputPanel title="Raw LLM Text" value={llmRawOutput} />
          <OutputPanel title="Fallback Preview JSON" value={previewOutput ? pretty(previewOutput) : ''} />
        </div>
      </div>
    </section>
  );
}

function OutputPanel({ title, value }: { title: string; value: string }) {
  const copy = () => {
    void navigator.clipboard?.writeText(value);
  };

  return (
    <div className="rounded-md border border-ink/10 bg-surface-card">
      <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
          <Play size={15} />
          {title}
        </div>
        <button
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-3 py-1.5 text-xs text-ink-muted hover:text-ink"
        >
          <Copy size={14} />
          Copy
        </button>
      </div>
      <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-5 text-ink">
        {value}
      </pre>
    </div>
  );
}
