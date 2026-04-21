import { z } from "zod";

export const mandatoryBriefFields = [
  "designation",
  "experience_years",
  "location",
  "wfh_mode",
  "salary_range",
  "industry_type",
  "company_type",
  "experience_type",
  "must_haves",
  "disqualifiers",
  "red_flags",
  "search_strategy",
] as const;

export const leverIds = ["quiz", "rapid_fire", "assignment", "demo"] as const;

export const contextBands = [1, 2, 3, 4] as const;
export const complexityRungs = ["A", "B", "C", "D", "E"] as const;

export const briefExtractionSchema = z.object({
  designation: z.string().nullable(),
  experience_years: z.string().nullable(),
  location: z.string().nullable(),
  wfh_mode: z.string().nullable(),
  salary_range: z.string().nullable(),
  industry_type: z.string().nullable(),
  company_type: z.string().nullable(),
  experience_type: z.string().nullable(),
  must_haves: z.array(z.string()),
  disqualifiers: z.array(z.string()),
  red_flags: z.array(z.string()),
  search_strategy: z.string().nullable(),
  context_tags: z.array(z.string()),
  evidence_map: z.record(z.string(), z.array(z.string())),
});

export const clarifyingQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        field: z.enum(mandatoryBriefFields),
        question: z.string().min(8).max(180),
      }),
    )
    .min(1)
    .max(3),
});

export const inferenceCardsSchema = z.object({
  ideal_candidate: z.object({
    content: z.string().min(20).max(360),
    confidence: z.enum(["verified", "inferred", "weak"]),
    provenance: z.string().min(3).max(180),
  }),
  location_comp: z.object({
    content: z.string().min(10).max(240),
    confidence: z.enum(["verified", "inferred", "weak"]),
    provenance: z.string().min(3).max(180),
  }),
  teachable_vs_innate: z.object({
    already_exist: z.array(z.string()).min(1).max(5),
    can_be_taught: z.array(z.string()).min(1).max(5),
    provenance: z.string().min(3).max(180),
  }),
  must_haves_red_flags: z.object({
    must_haves: z.array(z.string()).min(1).max(7),
    red_flags: z.array(z.string()).max(7),
    provenance: z.string().min(3).max(180),
  }),
  search_playbook: z.object({
    content: z.string().min(20).max(500),
    target_companies: z.array(z.string()).max(8),
    avoid_companies_or_pools: z.array(z.string()).max(8),
    provenance: z.string().min(3).max(180),
  }),
  skill_table: z.object({
    core: z.array(z.string()).min(1).max(3),
    micro: z.array(z.string()).min(3).max(6),
    domain: z.string().min(2).max(80),
    primary_skill: z.string().min(2).max(80),
    sub_skills: z.array(z.string()).min(1).max(4),
    target_band: z.enum(["1", "2", "3", "4"]),
    target_rung: z.enum(complexityRungs),
    provenance: z.string().min(3).max(180),
  }),
  tension_cards: z.array(
    z.object({
      title: z.string().min(3).max(80),
      body: z.string().min(20).max(280),
      tradeoffs: z.array(z.string()).min(2).max(5),
    }),
  ),
});

export const applicationFormSchema = z.object({
  journey_number: z.literal(1),
  title: z.string().max(80),
  description: z.string().max(240),
  dropout_risk: z.enum(["low", "medium", "high"]),
  estimated_minutes: z.number().int().min(2).max(12),
  form_sections: z
    .array(
      z.object({
        section_id: z.string().min(2).max(40),
        title: z.string().min(3).max(80),
        description: z.string().max(180),
        fields: z
          .array(
            z.object({
              field_id: z.string().min(2).max(60),
              label: z.string().min(2).max(90),
              field_type: z.enum([
                "short_text",
                "long_text",
                "email",
                "phone",
                "url",
                "file",
                "number",
                "single_select",
                "multi_select",
                "location",
                "salary",
                "notice_period",
                "audio",
              ]),
              required: z.boolean(),
              placeholder: z.string().max(120).nullable(),
              options: z.array(z.string().min(1).max(80)).max(8),
              help_text: z.string().max(160).nullable(),
              target_signal: z.string().min(2).max(100),
              reasoning: z.string().min(8).max(220),
            }),
          )
          .min(1)
          .max(8),
      }),
    )
    .min(2)
    .max(5),
  knockout_fields: z.array(z.string()).max(5),
  privacy_note: z.string().min(20).max(240),
});

export const outreachDraftSchema = z.object({
  platform: z.enum(["linkedin", "email", "whatsapp"]),
  tone: z.enum(["formal", "casual", "direct"]),
  sender: z.enum(["self", "recruiter", "founder", "hiring_manager"]),
  message_text: z.string().min(20).max(900),
  cta_placeholder: z.literal("[Application Link]"),
});

export const journeyPlanSchema = z.object({
  journeys: z
    .array(
      z.object({
        journey_number: z.number().int().min(2),
        title: z.string().min(5).max(90),
        description: z.string().min(20).max(260),
        lever_id: z.enum(leverIds),
        lever_rationale: z.string().min(12).max(180),
        structure_hint: z.string().min(8).max(220),
        target_signals: z.array(z.string()).min(1).max(5),
        skill_frame: z.object({
          domain: z.string().min(2).max(80),
          skill: z.string().min(2).max(80),
          sub_skill: z.string().min(2).max(80),
          band: z.enum(["1", "2", "3", "4"]),
          rung: z.enum(complexityRungs),
          target_depth: z.enum(["L1", "L2", "L3", "L4", "L2-L3", "L2-L4", "L3-L4"]),
          knowledge_slice: z.array(z.enum(["D", "P", "C"])).min(1).max(3),
        }),
        estimated_minutes: z.number().int().min(2).max(90),
        dropout_risk: z.enum(["low", "medium", "high"]),
      }),
    )
    .min(1)
    .max(5),
});

const choiceOptionSchema = z.object({
  id: z.string().min(1).max(32),
  label: z.string().min(1).max(80),
  value: z.string().min(1).max(80),
});

const subCardBaseSchema = z.object({
  sequence_index: z.number().int().min(1),
  sub_card_type: z.enum(["briefing", "task", "reflection", "transition"]),
  interaction_type: z.enum(["display", "ordered_steps", "choice_buttons", "short_text", "long_text", "file_upload"]),
  title: z.string().min(1).max(90),
  body_text: z.string().nullable(),
  response_expected: z.boolean(),
  body_json: z.record(z.string(), z.unknown()),
});

export const leverContentSchema = z.object({
  card_template: z.object({
    lever_id: z.enum(leverIds),
    title: z.string().min(5).max(90),
    instruction: z.string().min(8).max(220),
    time_cap_seconds: z.number().int().min(60).max(5400),
    required: z.boolean(),
    is_enabled: z.boolean(),
    rubric_json: z.object({
      signals: z.array(z.string()).min(1).max(6),
      scoring: z.string().min(3).max(160),
    }),
  }),
  sub_card_templates: z.array(subCardBaseSchema).min(2).max(12),
});

export type BriefExtraction = z.infer<typeof briefExtractionSchema>;
export type InferenceCards = z.infer<typeof inferenceCardsSchema>;
export type JourneyPlan = z.infer<typeof journeyPlanSchema>;
export type LeverContent = z.infer<typeof leverContentSchema>;

export function validateChoiceOptions(value: unknown) {
  return z.array(choiceOptionSchema).min(2).max(4).safeParse(value);
}
