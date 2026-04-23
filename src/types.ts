export type Phase = 'EXPRESS' | 'PROMPT_LAB' | 'CRYSTALLIZE' | 'JOURNEY_OUTREACH' | 'EVALUATION_JOURNEYS' | 'PREVIEW' | 'LAUNCHED' | 'COMMAND_SURFACE';

export type MentalMode = 'DEFINE' | 'SOURCE' | 'EVALUATE' | 'CLOSE';

export type UserRole = 'HM' | 'VENDOR';

export type Confidence = 'verified' | 'inferred' | 'weak' | 'task-demonstrated' | 'recruiter-observed' | 'self-claimed' | 'contested' | 'employer-confirmed';

export interface CrystallizationCardData {
  id: string;
  category: string;
  content: string;
  confidence: Confidence;
  provenance: string;
  status: 'pending' | 'accepted' | 'rejected' | 'pinned';
}

export interface TensionCardData {
  id: string;
  title: string;
  description: string;
  tradeoffs: string[];
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface RoleSystemStore {
  approvedBrief: import('./prompts/recruitmentOsSchemas').BriefExtraction | null;
  approvedInferenceCards: import('./prompts/recruitmentOsSchemas').InferenceCards | null;
  cardStatuses: Record<string, CrystallizationCardData['status']>;
  cardEdits: Record<string, string>;
  updatedAt: string | null;
}

export interface ApplicationFormFieldData {
  field_id: string;
  label: string;
  field_type: string;
  required: boolean;
  placeholder: string | null;
  options: string[];
  help_text: string | null;
  target_signal: string;
  reasoning: string;
}

export interface ApplicationFormSectionData {
  section_id: string;
  title: string;
  description: string;
  fields: ApplicationFormFieldData[];
}

export interface ApplicationFormData {
  journey_number: 1;
  title: string;
  description: string;
  dropout_risk: 'low' | 'medium' | 'high';
  estimated_minutes: number;
  form_sections: ApplicationFormSectionData[];
  knockout_fields: string[];
  privacy_note: string;
}

export interface JourneyPlanItemData {
  journey_number: number;
  title: string;
  description: string;
  lever_id: 'quiz' | 'rapid_fire' | 'assignment' | 'demo';
  lever_rationale: string;
  structure_hint: string;
  target_signals: string[];
  skill_frame: {
    domain: string;
    skill: string;
    sub_skill: string;
    band: '1' | '2' | '3' | '4';
    rung: 'A' | 'B' | 'C' | 'D' | 'E';
    target_depth: string;
    knowledge_slice: string[];
  };
  estimated_minutes: number;
  dropout_risk: 'low' | 'medium' | 'high';
}

export interface LeverContentData {
  card_template: {
    lever_id: string;
    title: string;
    instruction: string;
    time_cap_seconds: number;
    required: boolean;
    is_enabled: boolean;
    rubric_json: {
      signals: string[];
      scoring: string;
    };
  };
  sub_card_templates: {
    sequence_index: number;
    sub_card_type: string;
    interaction_type: string;
    title: string;
    body_text: string | null;
    response_expected: boolean;
    body_json: Record<string, unknown>;
  }[];
}

export interface TripBlock {
  id: string;
  name: string;
}

export interface TripProposalData {
  id: string;
  title: string;
  duration: string;
  purpose: string;
  blocks: TripBlock[];
  signals: string[];
  dropoutRisk: 'Low' | 'Medium' | 'High';
  funnelPosition: string;
  status: 'pending' | 'included' | 'removed';
}

export interface Candidate {
  id: string;
  name: string;
  headline: string;
  source: string;
  submittedAt: string;
  stage: 'Screening' | 'Journey A' | 'Journey B' | 'Ready for interview' | 'Offered';
  evidenceStrength: number; // 1-5
  signals: Signal[];
  trips: { name: string; status: 'Complete' | 'In Progress' | 'Pending'; evidenceReady?: boolean }[];
  isOverlap?: boolean;
  overlapDetails?: string;
  recommendations?: string[];
}

export interface Signal {
  dimension: string;
  score: number; // 1-5
  confidence: Confidence;
}

export interface ActivityEvent {
  id: string;
  type: 'submission' | 'movement' | 'question' | 'system';
  title: string;
  time: string;
  details: string[];
  actionable?: boolean;
  actionLabel?: string;
}
