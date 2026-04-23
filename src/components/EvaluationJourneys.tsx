import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { JourneyPlanItemData, LeverContentData, RoleSystemStore, TripProposalData } from '../types';
import { AlertCircle, Check, ChevronDown, ChevronRight, Edit2, Loader2, RefreshCw, Route, Sparkles, Trash2, X } from 'lucide-react';
import {
  buildJourneyPlannerPrompt,
  buildLeverContentPrompt,
  type PromptSpec,
} from '../prompts/recruitmentOsPrompts';
import { approvedInferenceCards, extractedFintechBrief } from '../prompts/recruitmentOsFixtures';
import { readPromptLabResponse } from '../lib/promptLabClient';

interface EvaluationJourneysProps {
  trips: TripProposalData[];
  setTrips: React.Dispatch<React.SetStateAction<TripProposalData[]>>;
  roleSystemStore: RoleSystemStore;
  onNext: () => void;
}

type GenerationStatus = 'queued' | 'generating' | 'complete' | 'failed';

type JourneyPlanGenerationCard = {
  id: 'journey_plan';
      title: string;
      subtitle: string;
      status: GenerationStatus;
      durationLabel: string;
      output?: { journeys: JourneyPlanItemData[] };
      error?: string;
};

type LeverGenerationCard = {
  id: `lever_${number}_${string}`;
      title: string;
      subtitle: string;
      status: GenerationStatus;
      durationLabel: string;
      journey: JourneyPlanItemData;
      output?: LeverContentData;
      error?: string;
};

type GeneratedCard = JourneyPlanGenerationCard | LeverGenerationCard;

type EditableSubCardDraft = {
  title: string;
  body: Record<string, unknown>;
};

type ContentDepth = 'light' | 'standard' | 'deep';

type JourneyPreference = {
  included: boolean;
  lever_id: JourneyPlanItemData['lever_id'];
  content_depth: ContentDepth;
  question_count?: number;
  hm_constraint: string;
};

const CONTENT_DEPTH_OPTIONS: { value: ContentDepth; label: string; description: string }[] = [
  { value: 'light', label: 'Light', description: 'Shorter card, fewer questions, lowest friction.' },
  { value: 'standard', label: 'Standard', description: 'Balanced content for a 30 minute trip.' },
  { value: 'deep', label: 'Deep', description: 'More questions and richer evidence guidance.' },
];

async function runPrompt(spec: PromptSpec) {
  const response = await fetch('/api/prompt-lab/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt_id: spec.id,
      temperature: spec.temperature,
      max_tokens: spec.maxOutputTokens,
      messages: spec.messages,
    }),
  });

  const payload = await readPromptLabResponse(response);

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || `Prompt run failed with ${response.status}`);
  }

  return payload.json;
}

function riskLabel(risk: string) {
  return risk.slice(0, 1).toUpperCase() + risk.slice(1);
}

function getContentDepthInstruction(depth: ContentDepth) {
  if (depth === 'light') {
    return 'CONTENT DEPTH: Generate a light version. Use the minimum useful number of sub-cards/questions, keep prompts concise, and reduce candidate time-on-task where the schema allows it.';
  }

  if (depth === 'deep') {
    return 'CONTENT DEPTH: Generate a deep version. Use the upper end of allowed question/sub-card counts, include richer evidence guidance, and preserve the 30-minute trip budget.';
  }

  return 'CONTENT DEPTH: Generate a standard version. Balance signal quality with candidate friction and stay close to the default lever rules.';
}

function supportsExactQuestionCount(leverId: JourneyPlanItemData['lever_id']) {
  return leverId === 'quiz' || leverId === 'rapid_fire';
}

function getDefaultQuestionCount(leverId: JourneyPlanItemData['lever_id'], depth: ContentDepth) {
  if (leverId === 'rapid_fire') {
    if (depth === 'light') return 6;
    if (depth === 'deep') return 12;
    return 8;
  }

  if (leverId === 'quiz') {
    if (depth === 'light') return 3;
    if (depth === 'deep') return 6;
    return 4;
  }

  return undefined;
}

function getQuestionCountBounds(leverId: JourneyPlanItemData['lever_id']) {
  if (leverId === 'rapid_fire') return { min: 4, max: 12 };
  if (leverId === 'quiz') return { min: 2, max: 6 };
  return { min: 1, max: 10 };
}

function clampQuestionCount(leverId: JourneyPlanItemData['lever_id'], count: number) {
  const { min, max } = getQuestionCountBounds(leverId);
  return Math.min(max, Math.max(min, count));
}

function getQuestionCountInstruction(leverId: JourneyPlanItemData['lever_id'], count?: number) {
  if (!supportsExactQuestionCount(leverId) || !count) return '';
  const unit = leverId === 'rapid_fire' ? 'rapid-fire statements' : 'quiz questions';
  return `EXACT CONTENT COUNT: Generate exactly ${count} ${unit}. Do not generate fewer or more task/question sub-cards. Briefing/display sub-cards do not count toward this number.`;
}

export function EvaluationJourneys({ trips, setTrips, roleSystemStore, onNext }: EvaluationJourneysProps) {
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([
    {
      id: 'journey_plan',
      title: 'Evaluation Journey Plan',
      subtitle: 'A triad of role-specific evaluation levers with Band/Rung skill frames.',
      status: 'queued',
      durationLabel: 'Planner',
    },
  ]);
  const [activeMessage, setActiveMessage] = useState('Preparing generation queue');
  const [hasStarted, setHasStarted] = useState(false);
  const [preferences, setPreferences] = useState<Record<number, JourneyPreference>>({});
  const [collapsedCardIds, setCollapsedCardIds] = useState<Set<string>>(new Set());
  const [isGeneratingLevers, setIsGeneratingLevers] = useState(false);
  const [editingSubCardKey, setEditingSubCardKey] = useState<string | null>(null);
  const [editingSubCardDraft, setEditingSubCardDraft] = useState<EditableSubCardDraft>({ title: '', body: {} });

  const updateCard = useCallback((id: string, patch: Partial<GeneratedCard>) => {
    setGeneratedCards((current) =>
      current.map((card) => (card.id === id ? ({ ...card, ...patch } as GeneratedCard) : card)),
    );
  }, []);

  const appendCards = useCallback((cards: GeneratedCard[]) => {
    setGeneratedCards((current) => {
      const existing = new Set(current.map((card) => card.id));
      return [...current, ...cards.filter((card) => !existing.has(card.id))];
    });
  }, []);

  const runJourneyPlanning = useCallback(async () => {
    setHasStarted(true);
    setActiveMessage('Planning evaluation journeys');
    updateCard('journey_plan', { status: 'generating', error: undefined });
    setGeneratedCards((current) => current.filter((card) => card.id === 'journey_plan'));
    setPreferences({});

    try {
      const journeyPlan = await runPrompt(
        buildJourneyPlannerPrompt({
          brief: roleSystemStore.approvedBrief || extractedFintechBrief,
          inferenceCards: roleSystemStore.approvedInferenceCards || approvedInferenceCards,
        }),
      ) as { journeys: JourneyPlanItemData[] };

      updateCard('journey_plan', {
        status: 'complete',
        output: journeyPlan,
        durationLabel: `${journeyPlan.journeys.length} journeys`,
      });
      setPreferences(
        Object.fromEntries(
          journeyPlan.journeys.map((journey) => [
            journey.journey_number,
            {
              included: true,
              lever_id: journey.lever_id,
              content_depth: 'standard',
              question_count: getDefaultQuestionCount(journey.lever_id, 'standard'),
              hm_constraint: '',
            } satisfies JourneyPreference,
          ]),
        ),
      );
      setActiveMessage('Review lever choices before generation');
    } catch (error) {
      setActiveMessage('Generation paused');
      setGeneratedCards((current) => {
        const active = current.find((card) => card.status === 'generating');
        if (!active) return current;
        return current.map((card) =>
          card.id === active.id
            ? {
                ...card,
                status: 'failed',
                error: error instanceof Error ? error.message : 'Generation failed',
              } as GeneratedCard
            : card,
        );
      });
    }
  }, [roleSystemStore.approvedBrief, roleSystemStore.approvedInferenceCards, updateCard]);

  const runLeverGeneration = useCallback(async () => {
    const planCard = generatedCards.find((card): card is JourneyPlanGenerationCard => card.id === 'journey_plan');
    const journeys = planCard?.output?.journeys || [];
    const selectedJourneys = journeys
      .map((journey) => {
        const preference = preferences[journey.journey_number];
        if (!preference?.included) return null;
        return {
          ...journey,
          lever_id: preference.lever_id,
        };
      })
      .filter((journey): journey is JourneyPlanItemData => Boolean(journey));

    if (!selectedJourneys.length) {
      setActiveMessage('Select at least one lever before generating content');
      return;
    }

    setIsGeneratingLevers(true);
    setEditingSubCardKey(null);

    const leverCards: GeneratedCard[] = selectedJourneys.map((journey) => ({
      id: `lever_${journey.journey_number}_${journey.lever_id}`,
      title: journey.title,
      subtitle: journey.lever_rationale,
      status: 'queued',
      durationLabel: `${journey.estimated_minutes} min`,
      journey,
    }));

    setGeneratedCards((current) => current.filter((card) => card.id === 'journey_plan'));
    setCollapsedCardIds(new Set(leverCards.map((card) => card.id)));
    appendCards(leverCards);

    try {
      for (const card of leverCards) {
        setActiveMessage(`Generating ${card.title}`);
        updateCard(card.id, { status: 'generating', error: undefined });
        if (!('journey' in card)) continue;
        const preference = preferences[card.journey.journey_number];
        const depthInstruction = getContentDepthInstruction(preference?.content_depth || 'standard');
        const countInstruction = getQuestionCountInstruction(
          card.journey.lever_id,
          preference?.question_count,
        );
        const hmConstraint = [depthInstruction, countInstruction, preference?.hm_constraint?.trim()].filter(Boolean).join('\n');
        const output = await runPrompt(
          buildLeverContentPrompt({
            brief: roleSystemStore.approvedBrief || extractedFintechBrief,
            inferenceCards: roleSystemStore.approvedInferenceCards || approvedInferenceCards,
            journey: card.journey,
            hmConstraint,
          }),
        ) as LeverContentData;
        updateCard(card.id, { status: 'complete', output });
      }

      setActiveMessage('Generation complete');
    } catch (error) {
      setActiveMessage('Generation paused');
      setGeneratedCards((current) => {
        const active = current.find((card) => card.status === 'generating');
        if (!active) return current;
        return current.map((card) =>
          card.id === active.id
            ? {
                ...card,
                status: 'failed',
                error: error instanceof Error ? error.message : 'Generation failed',
              } as GeneratedCard
            : card,
        );
      });
    } finally {
      setIsGeneratingLevers(false);
    }
  }, [appendCards, generatedCards, preferences, roleSystemStore.approvedBrief, roleSystemStore.approvedInferenceCards, updateCard]);

  useEffect(() => {
    if (hasStarted) return;
    void runJourneyPlanning();
  }, [hasStarted, runJourneyPlanning]);

  const completeCount = useMemo(
    () => generatedCards.filter((card) => card.status === 'complete').length,
    [generatedCards],
  );

  const generatedLeverCards = useMemo(
    () => generatedCards.filter((card): card is LeverGenerationCard => 'journey' in card),
    [generatedCards],
  );

  const canPreview = generatedLeverCards.length > 0 && generatedLeverCards.every((card) => card.status === 'complete');

  const handleAction = (id: string, action: 'included' | 'removed') => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status: action } : t));
  };

  const updatePreference = (journeyNumber: number, patch: Partial<JourneyPreference>) => {
    setPreferences((current) => ({
      ...current,
      [journeyNumber]: {
        included: true,
        lever_id: 'assignment',
        content_depth: 'standard',
        question_count: getDefaultQuestionCount('assignment', 'standard'),
        hm_constraint: '',
        ...current[journeyNumber],
        ...patch,
      },
    }));
  };

  const toggleCollapsed = (cardId: string) => {
    setCollapsedCardIds((current) => {
      const next = new Set(current);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const removeSubCard = (cardId: string, sequenceIndex: number) => {
    setGeneratedCards((current) =>
      current.map((card) => {
        if (card.id !== cardId || !('journey' in card) || !card.output) return card;
        return {
          ...card,
          output: {
            ...card.output,
            sub_card_templates: card.output.sub_card_templates.filter((subCard) => subCard.sequence_index !== sequenceIndex),
          },
        };
      }),
    );
  };

  const beginEditSubCard = (cardId: string, subCard: LeverContentData['sub_card_templates'][number]) => {
    setEditingSubCardKey(`${cardId}:${subCard.sequence_index}`);
    setEditingSubCardDraft({
      title: subCard.title,
      body: subCard.body_json,
    });
  };

  const saveSubCardEdit = (cardId: string, sequenceIndex: number) => {
    setGeneratedCards((current) =>
      current.map((card) => {
        if (card.id !== cardId || !('journey' in card) || !card.output) return card;
        return {
          ...card,
          output: {
            ...card.output,
            sub_card_templates: card.output.sub_card_templates.map((subCard) =>
              subCard.sequence_index === sequenceIndex
                ? { ...subCard, title: editingSubCardDraft.title, body_json: editingSubCardDraft.body }
                : subCard,
            ),
          },
        };
      }),
    );
    setEditingSubCardKey(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-ink">Trip Generation</h2>
          <p className="text-ink-muted mt-2 max-w-2xl">
            Building each journey card in sequence. The active loader moves forward as soon as a card is ready.
          </p>
        </div>
        <div className="rounded-md border border-ink/10 bg-surface-card px-4 py-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">Agent status</div>
          <div className="mt-1 flex items-center gap-2 text-sm text-ink">
            {completeCount === generatedCards.length ? <Check className="h-4 w-4 text-signal-verified" /> : <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />}
            {activeMessage}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {generatedCards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className={`rounded-md border p-6 transition-all ${
              card.status === 'complete'
                ? 'border-signal-verified/20 bg-[#f4fbf6]'
                : card.status === 'generating'
                  ? 'border-ink/30 bg-surface-card shadow-sm'
                  : card.status === 'failed'
                    ? 'border-signal-weak/30 bg-surface-card'
                    : 'border-ink/10 bg-surface-card opacity-70'
            }`}
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={`mt-1 flex h-9 w-9 items-center justify-center rounded-md border ${
                  card.status === 'complete'
                    ? 'border-signal-verified/20 bg-signal-verified/10 text-signal-verified'
                    : card.status === 'generating'
                      ? 'border-ink/20 bg-base text-ink'
                      : card.status === 'failed'
                        ? 'border-signal-weak/30 text-signal-weak'
                        : 'border-ink/10 text-ink-muted'
                }`}>
                  {card.status === 'complete' && <Check className="h-5 w-5" />}
                  {card.status === 'generating' && <Loader2 className="h-5 w-5 animate-spin" />}
                  {card.status === 'failed' && <X className="h-5 w-5" />}
                  {card.status === 'queued' && (card.id === 'journey_plan' ? <Route className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />)}
                </div>
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                    {card.id === 'journey_plan' ? 'Planner' : 'Lever content'}
                  </div>
                  <div className="mt-1 font-sans text-lg font-medium text-ink">{card.title}</div>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">{card.subtitle}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">Status</div>
                <div className={`mt-1 font-mono text-xs ${
                  card.status === 'complete' ? 'text-signal-verified' : card.status === 'failed' ? 'text-signal-weak' : 'text-ink-muted'
                }`}>
                  {card.status}
                </div>
                <div className="mt-2 rounded-sm bg-ink/5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted">{card.durationLabel}</div>
              </div>
            </div>

            {card.status === 'generating' && (
              <div className="mt-6 rounded-md border border-ink/10 bg-base p-4">
                <div className="flex items-center gap-2 text-sm text-ink">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Agent is generating this card. The next card will begin after this output is rendered.
                </div>
              </div>
            )}

            {card.status === 'failed' && (
              <div className="mt-6 rounded-md border border-signal-weak/20 bg-signal-weak/5 p-4">
                <div className="flex items-start gap-2 text-sm text-signal-weak">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{card.error}</span>
                </div>
                <button
                  onClick={() => void runJourneyPlanning()}
                  className="mt-3 inline-flex items-center gap-2 rounded-md border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink hover:text-base"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Restart generation
                </button>
              </div>
            )}

            {card.status === 'complete' && (
              <GeneratedCardOutput
                card={card}
                editingSubCardKey={editingSubCardKey}
                editingSubCardDraft={editingSubCardDraft}
                setEditingSubCardDraft={setEditingSubCardDraft}
                beginEditSubCard={beginEditSubCard}
                saveSubCardEdit={saveSubCardEdit}
                removeSubCard={removeSubCard}
                preferences={preferences}
                updatePreference={updatePreference}
                runLeverGeneration={runLeverGeneration}
                isGeneratingLevers={isGeneratingLevers}
                isCollapsed={collapsedCardIds.has(card.id)}
                toggleCollapsed={() => toggleCollapsed(card.id)}
              />
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end mt-8">
        <button 
          onClick={onNext}
          disabled={!canPreview}
          className="px-6 py-2.5 bg-ink text-base font-sans text-sm font-medium hover:bg-ink/90 transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          Preview & Approve Role
        </button>
      </div>
    </div>
  );
}

function GeneratedCardOutput({
  card,
  editingSubCardKey,
  editingSubCardDraft,
  setEditingSubCardDraft,
  beginEditSubCard,
  saveSubCardEdit,
  removeSubCard,
  preferences,
  updatePreference,
  runLeverGeneration,
  isGeneratingLevers,
  isCollapsed,
  toggleCollapsed,
}: {
  card: GeneratedCard;
  editingSubCardKey: string | null;
  editingSubCardDraft: EditableSubCardDraft;
  setEditingSubCardDraft: React.Dispatch<React.SetStateAction<EditableSubCardDraft>>;
  beginEditSubCard: (cardId: string, subCard: LeverContentData['sub_card_templates'][number]) => void;
  saveSubCardEdit: (cardId: string, sequenceIndex: number) => void;
  removeSubCard: (cardId: string, sequenceIndex: number) => void;
  preferences: Record<number, JourneyPreference>;
  updatePreference: (journeyNumber: number, patch: Partial<JourneyPreference>) => void;
  runLeverGeneration: () => Promise<void>;
  isGeneratingLevers: boolean;
  isCollapsed: boolean;
  toggleCollapsed: () => void;
}) {
  if (card.id === 'journey_plan') {
    const output = card.output;
    if (!output) return null;
    const selectedCount = output.journeys.filter((journey) => preferences[journey.journey_number]?.included).length;
    return (
      <div className="mt-6 border-t border-ink/10 pt-5">
        <div className="mb-4 flex flex-col gap-3 rounded-md border border-ink/10 bg-base p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-medium text-ink">Choose levers and content depth</div>
            <p className="mt-1 text-xs leading-5 text-ink-muted">
              Include only the journeys you want to generate. Content depth is passed into the prompt before each lever is written.
            </p>
          </div>
          <button
            onClick={() => void runLeverGeneration()}
            disabled={isGeneratingLevers || selectedCount === 0}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-xs font-medium text-base hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isGeneratingLevers ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Generate {selectedCount} selected
          </button>
        </div>

        <div className="grid gap-3">
          {output.journeys.map((journey) => {
            const preference = preferences[journey.journey_number];
            const selectedLever = preference?.lever_id || journey.lever_id;
            const selectedDepth = preference?.content_depth || 'standard';
            const defaultCount = getDefaultQuestionCount(selectedLever, selectedDepth);
            const questionCount = preference?.question_count || defaultCount;
            const bounds = getQuestionCountBounds(selectedLever);

            return (
            <div key={journey.journey_number} className="rounded-md border border-ink/10 bg-surface-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <button
                    type="button"
                    onClick={() => updatePreference(journey.journey_number, { included: !preferences[journey.journey_number]?.included })}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      preferences[journey.journey_number]?.included
                        ? 'border-signal-verified/30 bg-signal-verified/10 text-signal-verified'
                        : 'border-ink/20 bg-base text-transparent'
                    }`}
                    aria-label={preferences[journey.journey_number]?.included ? 'Exclude lever' : 'Include lever'}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <div>
                  <div className="font-medium text-ink">{journey.title}</div>
                  <p className="mt-1 text-xs leading-5 text-ink-muted">{journey.description}</p>
                  </div>
                </div>
                <span className="rounded-sm bg-ink/5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                  {journey.lever_id}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {journey.target_signals.map((signal) => (
                  <span key={signal} className="rounded-sm border border-ink/10 px-2 py-1 text-[11px] text-ink-muted">
                    {signal}
                  </span>
                ))}
                <span className="rounded-sm border border-ink/10 px-2 py-1 text-[11px] text-ink-muted">
                  Band {journey.skill_frame.band} / Rung {journey.skill_frame.rung}
                </span>
                <span className="rounded-sm border border-ink/10 px-2 py-1 text-[11px] text-ink-muted">
                  {riskLabel(journey.dropout_risk)} risk
                </span>
              </div>
              <div className="mt-4 grid gap-3 border-t border-ink/10 pt-4 md:grid-cols-[150px_160px_132px_1fr]">
                <FieldShell label="Lever">
                  <select
                    value={selectedLever}
                    onChange={(event) => {
                      const leverId = event.target.value as JourneyPlanItemData['lever_id'];
                      updatePreference(journey.journey_number, {
                        lever_id: leverId,
                        question_count: getDefaultQuestionCount(leverId, selectedDepth),
                      });
                    }}
                    className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-black outline-none focus:border-ink/40"
                  >
                    <option value="quiz">Quiz</option>
                    <option value="rapid_fire">Rapid fire</option>
                    <option value="assignment">Assignment</option>
                    <option value="demo">Demo</option>
                  </select>
                </FieldShell>
                <FieldShell label="Content amount">
                  <select
                    value={selectedDepth}
                    onChange={(event) => {
                      const contentDepth = event.target.value as ContentDepth;
                      updatePreference(journey.journey_number, {
                        content_depth: contentDepth,
                        question_count: getDefaultQuestionCount(selectedLever, contentDepth),
                      });
                    }}
                    className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-black outline-none focus:border-ink/40"
                  >
                    {CONTENT_DEPTH_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <span className="text-[11px] leading-4 text-ink-muted">
                    {CONTENT_DEPTH_OPTIONS.find((option) => option.value === (preferences[journey.journey_number]?.content_depth || 'standard'))?.description}
                  </span>
                </FieldShell>
                {supportsExactQuestionCount(selectedLever) ? (
                  <FieldShell label={selectedLever === 'rapid_fire' ? 'Statements' : 'Questions'}>
                    <div className="flex h-10 items-center rounded-md border border-ink/10 bg-white text-black">
                      <button
                        type="button"
                        onClick={() => updatePreference(journey.journey_number, {
                          question_count: clampQuestionCount(selectedLever, (questionCount || bounds.min) - 1),
                        })}
                        className="h-full w-9 border-r border-ink/10 text-ink-muted hover:text-ink"
                        aria-label="Decrease count"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={bounds.min}
                        max={bounds.max}
                        value={questionCount || bounds.min}
                        onChange={(event) => updatePreference(journey.journey_number, {
                          question_count: clampQuestionCount(selectedLever, Number(event.target.value)),
                        })}
                        className="h-full min-w-0 flex-1 bg-transparent text-center text-sm text-black outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => updatePreference(journey.journey_number, {
                          question_count: clampQuestionCount(selectedLever, (questionCount || bounds.min) + 1),
                        })}
                        className="h-full w-9 border-l border-ink/10 text-ink-muted hover:text-ink"
                        aria-label="Increase count"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[11px] leading-4 text-ink-muted">
                      Exact count, {bounds.min}-{bounds.max}
                    </span>
                  </FieldShell>
                ) : (
                  <div className="hidden md:block" />
                )}
                <FieldShell label="Constraint">
                  <input
                    value={preferences[journey.journey_number]?.hm_constraint || ''}
                    onChange={(event) => updatePreference(journey.journey_number, { hm_constraint: event.target.value })}
                    maxLength={500}
                    placeholder="Example: keep under 8 minutes, no file upload, focus on idempotency"
                    className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-black outline-none focus:border-ink/40"
                  />
                </FieldShell>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    );
  }

  if ('journey' in card) {
    const output = card.output;
    if (!output) return null;
    return (
      <div className="mt-6 border-t border-ink/10 pt-5">
        <button
          type="button"
          onClick={toggleCollapsed}
          className="mb-4 inline-flex items-center gap-2 rounded-md border border-ink/10 px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink"
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {isCollapsed ? 'Expand lever' : 'Collapse lever'}
        </button>
        {!isCollapsed && (
        <div className="grid gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">Card Template</div>
            <div className="mt-2 rounded-md border border-ink/10 bg-surface-card p-4">
              <div className="font-medium text-ink">{output.card_template.title}</div>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{output.card_template.instruction}</p>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                {Math.round(output.card_template.time_cap_seconds / 60)} min · {output.card_template.lever_id}
              </div>
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">Questions / Sub Cards</div>
            <div className="mt-2 flex flex-col gap-3">
              {output.sub_card_templates.map((subCard) => (
                <div key={`${subCard.sequence_index}-${subCard.title}`} className="rounded-md border border-ink/10 bg-surface-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium text-ink">{subCard.sequence_index}. {subCard.title}</div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className="rounded-sm bg-ink/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                          {subCard.interaction_type}
                        </span>
                        <span className="rounded-sm bg-ink/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                          {subCard.sub_card_type}
                        </span>
                        <span className="rounded-sm bg-ink/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                          {subCard.response_expected ? 'response' : 'display'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => beginEditSubCard(card.id, subCard)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 px-2.5 py-1.5 text-xs text-ink-muted hover:text-ink"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => removeSubCard(card.id, subCard.sequence_index)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 px-2.5 py-1.5 text-xs text-ink-muted hover:text-signal-weak"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>

                  {editingSubCardKey === `${card.id}:${subCard.sequence_index}` ? (
                    <div className="mt-4">
                      <SubCardFieldEditor
                        draft={editingSubCardDraft}
                        setDraft={setEditingSubCardDraft}
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => saveSubCardEdit(card.id, subCard.sequence_index)}
                          className="rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-base hover:bg-ink/90"
                        >
                          Save changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <SubCardBodyPreview body={subCard.body_json} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>
    );
  }

  return null;
}

function SubCardBodyPreview({ body }: { body: Record<string, unknown> }) {
  const entries = Object.entries(body).slice(0, 6);

  if (!entries.length) return null;

  return (
    <div className="mt-4 grid gap-2">
      {entries.map(([key, value]) => (
        <div key={key} className="grid gap-2 rounded-md border border-ink/5 bg-base px-3 py-2 md:grid-cols-[140px_1fr]">
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">{key}</div>
          <div className="text-sm leading-6 text-ink/80">
            {typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
              ? String(value)
              : JSON.stringify(value)}
          </div>
        </div>
      ))}
    </div>
  );
}

function SubCardFieldEditor({
  draft,
  setDraft,
}: {
  draft: EditableSubCardDraft;
  setDraft: React.Dispatch<React.SetStateAction<EditableSubCardDraft>>;
}) {
  const updateTitle = (title: string) => setDraft((current) => ({ ...current, title }));
  const updateField = (key: string, value: unknown) => {
    setDraft((current) => ({ ...current, body: { ...current.body, [key]: value } }));
  };

  return (
    <div className="grid gap-4">
      <FieldShell label="Title">
        <input
          value={draft.title}
          onChange={(event) => updateTitle(event.target.value)}
          className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-black outline-none focus:border-ink/40"
        />
      </FieldShell>

      {Object.entries(draft.body).map(([key, value]) => (
        <FieldShell key={key} label={humanizeKey(key)}>
          <EditableBodyField fieldKey={key} value={value} onChange={(nextValue) => updateField(key, nextValue)} />
        </FieldShell>
      ))}
    </div>
  );
}

function FieldShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

function EditableBodyField({
  fieldKey,
  value,
  onChange,
}: {
  fieldKey: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (typeof value === 'boolean') {
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-fit rounded-md border px-3 py-2 text-sm ${
          value ? 'border-signal-verified/30 bg-signal-verified/10 text-signal-verified' : 'border-ink/10 bg-white text-ink-muted'
        }`}
      >
        {value ? 'Enabled' : 'Disabled'}
      </button>
    );
  }

  if (typeof value === 'number') {
    return (
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-black outline-none focus:border-ink/40"
      />
    );
  }

  if (Array.isArray(value)) {
    if (fieldKey === 'options') {
      return (
        <EditableObjectArrayField
          items={value}
          onChange={onChange}
          fallbackKeys={['label', 'value']}
        />
      );
    }

    if (value.every((item) => item && typeof item === 'object' && !Array.isArray(item))) {
      return <EditableObjectArrayField items={value} onChange={onChange} />;
    }

    return (
      <textarea
        value={value.map((item) => typeof item === 'string' ? item : JSON.stringify(item)).join('\n')}
        onChange={(event) => onChange(event.target.value.split('\n').map((item) => item.trim()).filter(Boolean))}
        className="min-h-[96px] w-full rounded-md border border-ink/10 bg-white p-3 text-sm leading-6 text-black outline-none focus:border-ink/40"
      />
    );
  }

  if (value && typeof value === 'object') {
    return <EditableObjectField value={value as Record<string, unknown>} onChange={onChange} />;
  }

  return (
    <textarea
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-[76px] w-full rounded-md border border-ink/10 bg-white p-3 text-sm leading-6 text-black outline-none focus:border-ink/40"
    />
  );
}

function humanizeKey(key: string) {
  return key.replace(/_/g, ' ');
}

function EditableObjectField({
  value,
  onChange,
}: {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}) {
  const updateField = (key: string, nextValue: unknown) => {
    onChange({ ...value, [key]: nextValue });
  };

  return (
    <div className="grid gap-3 rounded-md border border-ink/10 bg-white p-3">
      {Object.entries(value).map(([key, nestedValue]) => (
        <FieldShell key={key} label={humanizeKey(key)}>
          <EditableBodyField
            fieldKey={key}
            value={nestedValue}
            onChange={(nextValue) => updateField(key, nextValue)}
          />
        </FieldShell>
      ))}
    </div>
  );
}

function EditableObjectArrayField({
  items,
  onChange,
  fallbackKeys,
}: {
  items: unknown[];
  onChange: (value: unknown[]) => void;
  fallbackKeys?: string[];
}) {
  const normalizedItems = items.map((item) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) return item as Record<string, unknown>;
    return { label: String(item) };
  });
  const keys = Array.from(
    new Set([
      ...(fallbackKeys || []),
      ...normalizedItems.flatMap((item) => Object.keys(item)),
    ]),
  ).filter((key) => !['id'].includes(key));

  const updateItem = (index: number, key: string, nextValue: string) => {
    const nextItems = normalizedItems.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      return { ...item, [key]: nextValue };
    });
    onChange(nextItems.map((item, itemIndex) => ({
      id: String(item.id || String.fromCharCode(97 + itemIndex)),
      ...item,
    })));
  };

  const removeItem = (index: number) => {
    onChange(normalizedItems.filter((_, itemIndex) => itemIndex !== index));
  };

  const addItem = () => {
    onChange([...normalizedItems, Object.fromEntries((keys.length ? keys : ['label']).map((key) => [key, '']))]);
  };

  return (
    <div className="grid gap-3">
      {normalizedItems.map((item, index) => (
        <div key={index} className="rounded-md border border-ink/10 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">Item {index + 1}</span>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-xs text-ink-muted hover:text-signal-weak"
            >
              Remove
            </button>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {(keys.length ? keys : Object.keys(item)).map((key) => (
              <FieldShell key={key} label={humanizeKey(key)}>
                <input
                  value={String(item[key] ?? '')}
                  onChange={(event) => updateItem(index, key, event.target.value)}
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-black outline-none focus:border-ink/40"
                />
              </FieldShell>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="w-fit rounded-md border border-ink/10 px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink"
      >
        Add item
      </button>
    </div>
  );
}
