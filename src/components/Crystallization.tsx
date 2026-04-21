import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CrystallizationCardData, TensionCardData } from '../types';
import { AlertCircle, Check, Edit2, Loader2, Mic, MicOff, RefreshCw, X } from 'lucide-react';
import {
  buildBriefExtractionPrompt,
  buildClarifyingQuestionsPrompt,
  buildInferenceCardsPrompt,
  type PromptSpec,
} from '../prompts/recruitmentOsPrompts';
import { BriefExtraction, InferenceCards, mandatoryBriefFields } from '../prompts/recruitmentOsSchemas';
import { readPromptLabResponse } from '../lib/promptLabClient';

interface CrystallizationProps {
  inputText: string;
  cards: CrystallizationCardData[];
  setCards: React.Dispatch<React.SetStateAction<CrystallizationCardData[]>>;
  tensions: TensionCardData[];
  setTensions: React.Dispatch<React.SetStateAction<TensionCardData[]>>;
  onNext: () => void;
}

type ClarifyingQuestion = {
  field: string;
  question: string;
};

type PipelineStatus = 'idle' | 'extracting' | 'clarifying' | 'inferring' | 'ready' | 'needs_clarification' | 'error';

async function runPrompt(spec: PromptSpec) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 95000);

  const response = await fetch('/api/prompt-lab/run', {
    method: 'POST',
    signal: controller.signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt_id: spec.id,
      temperature: spec.temperature,
      max_tokens: spec.maxOutputTokens,
      messages: spec.messages,
    }),
  }).finally(() => window.clearTimeout(timeout));

  const payload = await readPromptLabResponse(response);

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || `Prompt run failed with ${response.status}`);
  }

  return payload.json;
}

const loadingCopy: Record<Exclude<PipelineStatus, 'idle' | 'ready' | 'needs_clarification' | 'error'>, {
  title: string;
  body: string;
  steps: string[];
}> = {
  extracting: {
    title: 'Reading the role brief',
    body: 'Pulling out designation, experience, location, salary, work mode, must-haves, red flags, and sourcing hints.',
    steps: ['Normalising raw input', 'Mapping signals to mandatory tags', 'Checking coverage gaps'],
  },
  clarifying: {
    title: 'Composing clarifying questions',
    body: 'Only asking for fields that are still missing or too risky to infer.',
    steps: ['Ranking missing fields', 'Grouping related gaps', 'Keeping questions short'],
  },
  inferring: {
    title: 'Generating inferred cards',
    body: 'Building the six hiring-strategy cards from the approved role signals and the skill-depth taxonomy.',
    steps: ['Candidate portrait', 'Comp and location constraints', 'Must-haves and red flags', 'Search playbook', 'Skill and micro-skill frame', 'Tension cards'],
  },
};

const fieldLabels: Record<string, string> = {
  designation: 'Designation',
  experience_years: 'Experience',
  location: 'Location',
  wfh_mode: 'Work mode',
  salary_range: 'Salary',
  industry_type: 'Industry',
  company_type: 'Company type',
  experience_type: 'Experience type',
  must_haves: 'Must haves',
  disqualifiers: 'Disqualifiers',
  red_flags: 'Red flags',
  search_strategy: 'Search strategy',
};

function getMissingFields(brief: Partial<BriefExtraction>) {
  return mandatoryBriefFields.filter((field) => {
    const value = brief[field];
    if (Array.isArray(value)) return value.length === 0;
    return value === null || value === undefined || value === '';
  });
}

function confidenceOf(value: { confidence?: string } | undefined): CrystallizationCardData['confidence'] {
  if (value?.confidence === 'verified' || value?.confidence === 'weak') return value.confidence;
  return 'inferred';
}

function cardsFromInference(inference: InferenceCards): CrystallizationCardData[] {
  return [
    {
      id: 'ideal_candidate',
      category: 'Ideal Candidate',
      content: inference.ideal_candidate.content,
      confidence: confidenceOf(inference.ideal_candidate),
      provenance: inference.ideal_candidate.provenance,
      status: 'pending',
    },
    {
      id: 'location_comp',
      category: 'Location, Compensation & Work Mode',
      content: inference.location_comp.content,
      confidence: confidenceOf(inference.location_comp),
      provenance: inference.location_comp.provenance,
      status: 'pending',
    },
    {
      id: 'teachable_vs_innate',
      category: 'What can be taught vs what should already exist',
      content: `ALREADY EXIST: ${inference.teachable_vs_innate.already_exist.join(', ')}\nCAN BE TAUGHT: ${inference.teachable_vs_innate.can_be_taught.join(', ')}`,
      confidence: 'inferred',
      provenance: inference.teachable_vs_innate.provenance,
      status: 'pending',
    },
    {
      id: 'must_haves_red_flags',
      category: 'Must haves and red flags',
      content: `MUST HAVES: ${inference.must_haves_red_flags.must_haves.join(', ')}\nRED FLAGS: ${inference.must_haves_red_flags.red_flags.join(', ') || 'None specified'}`,
      confidence: 'verified',
      provenance: inference.must_haves_red_flags.provenance,
      status: 'pending',
    },
    {
      id: 'search_playbook',
      category: 'Search strategy or sourcing playbook',
      content: `${inference.search_playbook.content}\nTarget pools: ${inference.search_playbook.target_companies.join(', ') || 'Not specified'}\nAvoid: ${inference.search_playbook.avoid_companies_or_pools.join(', ') || 'Not specified'}`,
      confidence: 'inferred',
      provenance: inference.search_playbook.provenance,
      status: 'pending',
    },
    {
      id: 'skill_table',
      category: 'Skill and micro skill table',
      content: `Core: ${inference.skill_table.core.join(', ')}\nMicro: ${inference.skill_table.micro.join(', ')}\nFrame: ${inference.skill_table.domain} | ${inference.skill_table.primary_skill} | Band ${inference.skill_table.target_band} / Rung ${inference.skill_table.target_rung}`,
      confidence: 'inferred',
      provenance: inference.skill_table.provenance,
      status: 'pending',
    },
  ];
}

function tensionsFromInference(inference: InferenceCards): TensionCardData[] {
  return inference.tension_cards.map((tension, index) => ({
    id: `tension_${index + 1}`,
    title: tension.title,
    description: tension.body,
    tradeoffs: tension.tradeoffs,
    status: 'pending',
  }));
}

export function Crystallization({ inputText, cards, setCards, tensions, setTensions, onNext }: CrystallizationProps) {
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [showInferred, setShowInferred] = useState(false);
  const [status, setStatus] = useState<PipelineStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [extractedBrief, setExtractedBrief] = useState<Partial<BriefExtraction> | null>(null);
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([]);
  const [statusStartedAt, setStatusStartedAt] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const setPipelineStatus = useCallback((nextStatus: PipelineStatus) => {
    setStatus(nextStatus);
    setStatusStartedAt(Date.now());
    setElapsedSeconds(0);
  }, []);

  useEffect(() => {
    if (!['extracting', 'clarifying', 'inferring'].includes(status)) return;

    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - statusStartedAt) / 1000));
    }, 250);

    return () => window.clearInterval(interval);
  }, [status, statusStartedAt]);

  const activeLoadingCopy = useMemo(() => {
    if (status === 'extracting' || status === 'clarifying' || status === 'inferring') {
      return loadingCopy[status];
    }

    return null;
  }, [status]);

  const generateInference = useCallback(async (brief: BriefExtraction) => {
    setPipelineStatus('inferring');
    const inference = await runPrompt(buildInferenceCardsPrompt({ brief })) as InferenceCards;
    setCards(cardsFromInference(inference));
    setTensions(tensionsFromInference(inference));
    setShowInferred(true);
    setPipelineStatus('ready');
  }, [setCards, setPipelineStatus, setTensions]);

  useEffect(() => {
    let cancelled = false;

    async function runInitialPipeline() {
      if (!inputText.trim()) return;

      setError(null);
      setQuestions([]);
      setShowInferred(false);
      setPipelineStatus('extracting');

      try {
        const brief = await runPrompt(buildBriefExtractionPrompt({ rawText: inputText, contextTags: [] })) as BriefExtraction;
        if (cancelled) return;

        setExtractedBrief(brief);
        const missingFields = getMissingFields(brief);

        if (missingFields.length > 0) {
          setPipelineStatus('clarifying');
          const clarification = await runPrompt(buildClarifyingQuestionsPrompt({ brief, missingFields })) as { questions: ClarifyingQuestion[] };
          if (cancelled) return;
          setQuestions(clarification.questions || []);
          setPipelineStatus('needs_clarification');
          return;
        }

        await generateInference(brief);
      } catch (pipelineError) {
        if (cancelled) return;
        const message = pipelineError instanceof Error && pipelineError.name === 'AbortError'
          ? 'The request timed out. Try a faster OpenRouter model or reduce max output tokens.'
          : pipelineError instanceof Error ? pipelineError.message : 'Unable to generate role inference';
        setError(message);
        setPipelineStatus('error');
      }
    }

    void runInitialPipeline();

    return () => {
      cancelled = true;
    };
  }, [generateInference, inputText, setPipelineStatus]);

  const handleSubmitClarification = async () => {
    if (!extractedBrief || !answerText.trim()) return;

    setError(null);
    setPipelineStatus('extracting');

    try {
      const brief = await runPrompt(
        buildBriefExtractionPrompt({
          rawText: `${inputText}\n\nClarifying answers:\n${answerText}`,
          contextTags: [],
        }),
      ) as BriefExtraction;

      setExtractedBrief(brief);
      await generateInference(brief);
    } catch (pipelineError) {
      const message = pipelineError instanceof Error && pipelineError.name === 'AbortError'
        ? 'The request timed out. Try a faster OpenRouter model or reduce max output tokens.'
        : pipelineError instanceof Error ? pipelineError.message : 'Unable to process clarification';
      setError(message);
      setPipelineStatus('error');
    }
  };

  const handleRetry = async () => {
    setError(null);

    if (extractedBrief && getMissingFields(extractedBrief).length === 0) {
      await generateInference(extractedBrief as BriefExtraction);
      return;
    }

    window.location.reload();
  };

  const handleCardAction = (id: string, action: 'accepted' | 'rejected' | 'pinned') => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, status: action } : c));
  };

  const handleEditOpen = (card: CrystallizationCardData) => {
    setEditingCardId(card.id);
    setEditContent(card.content);
  };

  const handleEditSave = (id: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, content: editContent, status: 'accepted' } : c));
    setEditingCardId(null);
  };

  const handleTensionTradeoff = (tensionId: string, tradeoffIndex: number) => {
    setTensions(prev => prev.map(t => t.id === tensionId ? { ...t, status: 'resolved' } : t));
  };

  const handleTensionDismiss = (tensionId: string) => {
    setTensions(prev => prev.map(t => t.id === tensionId ? { ...t, status: 'dismissed' } : t));
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-12">
      
      {activeLoadingCopy ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-surface-card border border-ink/10 p-8 flex flex-col gap-6"
        >
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-ink-muted" />
              <h2 className="font-serif text-2xl text-ink">{activeLoadingCopy.title}</h2>
            </div>
            <div className="rounded-md border border-ink/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              {elapsedSeconds}s
            </div>
          </div>
          <p className="text-sm leading-6 text-ink-muted">
            {activeLoadingCopy.body}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {activeLoadingCopy.steps.map((step, index) => {
              const isActive = index === Math.min(activeLoadingCopy.steps.length - 1, Math.floor(elapsedSeconds / 2));
              const isDone = index < Math.floor(elapsedSeconds / 2);
              return (
                <div
                  key={step}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs ${
                    isDone
                      ? 'border-signal-verified/20 bg-signal-verified/5 text-signal-verified'
                      : isActive
                        ? 'border-ink/20 bg-base text-ink'
                        : 'border-ink/10 text-ink-muted'
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : isActive ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="h-3.5 w-3.5 rounded-full border border-ink/20" />}
                  {step}
                </div>
              );
            })}
          </div>
          {elapsedSeconds > 15 && (
            <div className="rounded-md border border-amber-500/20 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
              Still waiting on OpenRouter. This usually means the selected model is cold, queued, or returning a long JSON payload.
            </div>
          )}
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-surface-card border border-signal-weak/30 p-8 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3 text-signal-weak">
            <AlertCircle className="h-5 w-5" />
            <h2 className="font-serif text-2xl">Generation failed</h2>
          </div>
          <p className="text-sm leading-6 text-ink-muted">{error}</p>
          {error.includes('OPENROUTER_API_KEY') ? (
            <p className="text-xs leading-5 text-ink-muted">
              Make sure `OPENROUTER_API_KEY` is set in `design/recruitment-os/.env` and restart `npm run dev:prompt-lab`.
            </p>
          ) : (
            <p className="text-xs leading-5 text-ink-muted">
              The model responded, but the JSON was not usable. This usually improves by retrying or choosing a model with stricter JSON support.
            </p>
          )}
          <div className="pt-2">
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-base hover:bg-ink/90"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </motion.div>
      ) : !showInferred ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-surface-card border border-signal-warning/30 p-8 flex flex-col gap-7"
        >
          <div>
            <h2 className="font-serif text-2xl text-ink mb-2">Clarifying Questions</h2>
            <p className="text-ink-muted text-sm">A few required signals are still missing. Add them once and we will continue to inferred cards.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: 'Signals extracted', state: 'done' },
              { label: 'Need HM input', state: 'active' },
              { label: 'Inference next', state: 'pending' },
            ].map((step, index) => (
              <div
                key={step.label}
                className={`relative rounded-md border px-4 py-3 text-sm ${
                  step.state === 'done'
                    ? 'border-signal-verified/20 bg-signal-verified/5 text-signal-verified'
                    : step.state === 'active'
                      ? 'border-signal-warning/30 bg-surface-tension text-ink'
                      : 'border-ink/10 text-ink-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  {step.state === 'done' ? (
                    <Check className="h-4 w-4" />
                  ) : step.state === 'active' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-ink/20" />
                  )}
                  <span className="font-medium">{step.label}</span>
                </div>
                {index < 2 && (
                  <div className="absolute right-[-14px] top-1/2 hidden h-px w-7 bg-ink/10 md:block" />
                )}
              </div>
            ))}
          </div>
          
          <div className="grid gap-3">
            {questions.length ? questions.map((question) => (
              <div key={`${question.field}-${question.question}`} className="rounded-md border border-ink/10 bg-base p-4">
                <div className="mb-2 inline-flex rounded-sm bg-ink/5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                  {fieldLabels[question.field] || question.field}
                </div>
                <div className="font-serif text-base leading-6 text-ink">{question.question}</div>
              </div>
            )) : (
              <div className="rounded-md border border-ink/10 bg-base p-4 font-serif text-base leading-6 text-ink">
                Add any missing constraints or red flags before continuing.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center gap-4">
              <button 
                  onClick={() => setIsListening(!isListening)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    isListening 
                      ? 'bg-signal-weak/10 text-signal-weak animate-pulse' 
                      : 'bg-base border border-ink/10 text-ink/60 hover:text-ink hover:border-ink/30'
                  }`}
                >
                  {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <div className="flex flex-col">
                  <span className="font-medium text-sm text-ink">{isListening ? 'Listening...' : 'Tap to speak'}</span>
              </div>
            </div>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Example: Avoid candidates from pure services teams. Red flags: no ownership of production incidents, only feature delivery, no payment or ledger exposure."
              className="w-full min-h-[120px] bg-white border border-ink/10 p-4 font-serif text-sm leading-relaxed text-black caret-black resize-y outline-none focus:border-ink/30 transition-colors placeholder:text-ink-faint"
            />
          </div>

          <div className="flex justify-end mt-4 pt-4 border-t border-ink/10">
            <button 
              onClick={handleSubmitClarification}
              disabled={!answerText.trim()}
              className="px-6 py-2 bg-ink text-base font-sans text-sm font-medium hover:bg-ink/90 transition-colors shadow-sm"
            >
              Submit & Proceed
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
          <div className="mb-4">
            <h2 className="font-serif text-2xl text-ink">Inferred cards</h2>
            <p className="text-ink-muted text-sm mt-1">Take some time to finalise; This is what goes into our design system.</p>
          </div>

          {/* Tensions */}
          {tensions && tensions.filter(t => t.status === 'pending').map((tension, i) => (
            <motion.div
              key={tension.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="w-full border-l-[3px] border-l-amber-500 bg-surface-tension border-y border-r border-ink/10 p-6 flex flex-col gap-4 mb-4 shadow-sm"
            >
              <div className="flex items-center gap-2 text-amber-600 font-mono text-xs uppercase tracking-wider">
                <span>⚠</span>
                <span>Tension Card: {tension.title}</span>
              </div>
              
              <p className="font-serif text-base text-ink leading-relaxed">
                {tension.description}
              </p>
              
              <div className="flex flex-col gap-2 mt-2">
                <div className="text-xs font-mono text-ink-muted mb-1">Suggested tradeoffs:</div>
                {tension.tradeoffs.map((tradeoff, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleTensionTradeoff(tension.id, idx)}
                    className="text-left px-4 py-2 border border-ink/10 hover:border-amber-500/50 hover:bg-amber-50/50 transition-colors text-sm font-sans flex items-center gap-3"
                  >
                    <span className="text-amber-500">→</span>
                    {tradeoff}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-end mt-2">
                <button 
                  onClick={() => handleTensionDismiss(tension.id)}
                  className="text-xs font-mono text-ink-muted hover:text-ink transition-colors"
                >
                  [Dismiss — I'll manage this risk]
                </button>
              </div>
            </motion.div>
          ))}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.filter(c => c.status !== 'rejected').map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex flex-col border p-6 transition-all shadow-sm ${
                  card.status === 'accepted' ? 'bg-[#f4fbf6] border-[#c0eccc]' : 'bg-surface-card border-ink/10 hover:border-ink/20'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                    {card.category}
                  </div>
                </div>
                
                {editingCardId === card.id ? (
                  <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 w-full bg-transparent border border-ink/20 p-2 font-serif text-[14px] leading-relaxed text-ink mb-6 outline-none focus:border-ink/50 min-h-[100px]"
                    autoFocus
                  />
                ) : (
                  <div className="flex-1 font-serif text-[15px] leading-relaxed text-ink mb-6 whitespace-pre-line">
                    {card.content}
                  </div>
                )}
                
                <div className="flex items-center gap-4 pt-4 border-t border-ink/5">
                  {editingCardId === card.id ? (
                    <button 
                      onClick={() => handleEditSave(card.id)}
                      className="flex items-center gap-1.5 text-xs font-sans text-ink hover:underline transition-colors ml-auto font-medium"
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleCardAction(card.id, 'accepted')}
                        className={`flex items-center gap-1.5 text-xs font-sans transition-colors ${
                          card.status === 'accepted' ? 'text-green-700 font-medium' : 'text-ink-muted hover:text-ink'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button 
                        onClick={() => handleEditOpen(card)}
                        className="flex items-center gap-1.5 text-xs font-sans text-ink-muted hover:text-ink transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleCardAction(card.id, 'rejected')}
                        className="flex items-center gap-1.5 text-xs font-sans text-ink-muted hover:text-ink transition-colors ml-auto"
                      >
                        <X className="w-3.5 h-3.5" />
                        Not Required
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-end mt-8">
            <button 
              onClick={onNext}
              className="px-6 py-2.5 bg-ink text-base font-sans text-sm font-medium hover:bg-ink/90 transition-colors shadow-sm"
            >
              Continue to Outreach & Journey
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
