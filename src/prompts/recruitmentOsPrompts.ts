import { leverIds, mandatoryBriefFields } from "./recruitmentOsSchemas";

type JsonValue = unknown;

export type PromptMessage = {
  role: "system" | "user";
  content: string;
};

export type PromptSpec = {
  id: string;
  purpose: string;
  temperature: number;
  maxOutputTokens: number;
  messages: PromptMessage[];
};

function pretty(value: JsonValue) {
  return JSON.stringify(value, null, 2);
}

const jsonOnlyRule = `Return only valid JSON. Do not wrap it in markdown fences. Do not include commentary, apology, or analysis text.`;

const recruitmentContext = `Recruitment OS turns a hiring manager's rough role signals into:
1. mandatory clarifying questions,
2. six inferred role cards,
3. Journey 1 application form and outreach,
4. evaluation journeys stored as trip -> card -> sub_card templates.

Storage contract for generated evaluation content:
- one trip has multiple card_templates rows
- card_templates.lever_id must be one of: ${leverIds.join(", ")}
- each card has ordered sub_card_templates rows
- sub_card_templates.sub_card_type must be briefing, task, reflection, or transition
- sub_card_templates.interaction_type must be display, ordered_steps, choice_buttons, short_text, long_text, or file_upload`;

const skillDepthContext = `Skill and depth context:
- Every evaluation journey must be grounded in: domain, skill, sub_skill, context band, and complexity rung.
- Skill decomposition should produce observable micro-skills, not generic traits.
- Knowledge slices: D = declarative know-what, P = procedural know-how, C = conditional know-when/why.
- Context bands: Band 1 familiar/low ambiguity, Band 2 cross-team/moderate ambiguity, Band 3 novel or high-stakes shifting constraints, Band 4 cross-domain/systemic implications.
- Complexity rungs: Rung A clean inputs/single objective, Rung B messy inputs or 2-3 conflicting constraints, Rung C multiple stakeholders or hidden constraints, Rung D moving target or mid-course changes, Rung E systemic/second-order effects.
- Depth anchors: L1 Foundational = explains/follows templates, L2 Functional = applies independently, L3 Advanced = adapts under ambiguity, L4 Mastery = sets standards or creates system-level impact.
- More experience should raise complexity rung, not widen domain.
- Higher expertise should widen context band, not make mechanics artificially harder.
- Each lever should focus on max 1-2 micro-skills so evidence is interpretable.`;

const supportedLeverTaxonomy = `Supported v1 lever taxonomy:
- assignment maps to L1 Task / Assignment: async, applied execution in scoped context, typical depth L2-L3, max 10 minutes.
- demo maps to L2 Sketch / Demo Your Work: async, procedural fluency and tacit know-how, typical depth L2-L4, max 15 minutes.
- quiz maps to L3 Rank & Rationalize Responses or L6 SJT-style choice tasks: async, reasoning, discrimination, and contextual judgment, typical depth L2-L3, max 8-15 minutes.
- rapid_fire maps to L5 Rapid Fire Serious/Joking: sync-like timed interaction, reflexes, values, and instincts, typical depth L2-L4, max 8 minutes.
Future levers L4, L7-L15 are not emitted in v1 unless represented as placeholder text inside an existing supported lever.`;

export function buildBriefExtractionPrompt(input: {
  rawText: string;
  contextTags?: string[];
}): PromptSpec {
  return {
    id: "brief_extraction",
    purpose: "Extract mandatory hiring brief tags from the first-screen signal input.",
    temperature: 0.1,
    maxOutputTokens: 1200,
    messages: [
      {
        role: "system",
        content: `${recruitmentContext}

You are a strict hiring-brief extraction engine. Map every explicit or implied role signal to the closest field. Preserve uncertainty with null rather than inventing facts.

Mandatory fields:
${mandatoryBriefFields.map((field) => `- ${field}`).join("\n")}

Rules:
- Strip filler words and keep values concise.
- Keep arrays deduplicated.
- If a sentence supports a field, quote the source phrase in evidence_map[field].
- Do not infer salary, location, or work mode unless directly stated.
- Context tags are weak signals; include them in context_tags and evidence_map only.
- Missing mandatory fields must be null or [].
${jsonOnlyRule}`,
      },
      {
        role: "user",
        content: `Raw hiring manager input:
${input.rawText}

Selected context tags:
${pretty(input.contextTags || [])}

Return JSON matching this TypeScript shape:
{
  "designation": string | null,
  "experience_years": string | null,
  "location": string | null,
  "wfh_mode": string | null,
  "salary_range": string | null,
  "industry_type": string | null,
  "company_type": string | null,
  "experience_type": string | null,
  "must_haves": string[],
  "disqualifiers": string[],
  "red_flags": string[],
  "search_strategy": string | null,
  "context_tags": string[],
  "evidence_map": Record<string, string[]>
}`,
      },
    ],
  };
}

export function buildClarifyingQuestionsPrompt(input: {
  brief: JsonValue;
  missingFields: string[];
}): PromptSpec {
  return {
    id: "clarifying_questions",
    purpose: "Ask the HM for missing mandatory tags before inference.",
    temperature: 0.2,
    maxOutputTokens: 500,
    messages: [
      {
        role: "system",
        content: `You are briefing a hiring manager. Ask short, specific clarifying questions for missing fields.

Rules:
- Ask no more than 3 questions.
- Each question must map to exactly one missing field.
- Use plain language, not database field names.
- Ask about the highest-risk missing fields first: designation, industry_type, red_flags, search_strategy, salary_range.
- Do not ask for fields already present in the brief.
${jsonOnlyRule}`,
      },
      {
        role: "user",
        content: `Current brief:
${pretty(input.brief)}

Missing fields:
${pretty(input.missingFields)}

Return:
{
  "questions": [
    { "field": "one mandatory field", "question": "short HM-facing question" }
  ]
}`,
      },
    ],
  };
}

export function buildInferenceCardsPrompt(input: {
  brief: JsonValue;
}): PromptSpec {
  return {
    id: "inference_cards",
    purpose: "Generate the six inferred cards and tension cards for HM approval.",
    temperature: 0.25,
    maxOutputTokens: 2200,
    messages: [
      {
        role: "system",
        content: `${recruitmentContext}

You are a senior talent strategist. Generate exactly the six inferred card payloads used by the Recruitment OS crystallization screen.

${skillDepthContext}

Rules:
- Stay grounded in the brief and evidence. Mark confidence as verified, inferred, or weak.
- Do not soften red flags. Keep them factual and usable by recruiters.
- Separate innate/should-exist traits from teachable onboarding items.
- Search playbook should be actionable and may mention example company pools only when justified by the brief.
- Tension cards should identify structural hiring conflicts like compensation vs market, speed vs scarcity, or strict filters vs pool size.
- Skill table must identify domain, primary skill, 1-4 sub-skills, target context band, and target complexity rung for downstream lever design.
${jsonOnlyRule}`,
      },
      {
        role: "user",
        content: `Approved role brief:
${pretty(input.brief)}

Return JSON:
{
  "ideal_candidate": { "content": string, "confidence": "verified|inferred|weak", "provenance": string },
  "location_comp": { "content": string, "confidence": "verified|inferred|weak", "provenance": string },
  "teachable_vs_innate": { "already_exist": string[], "can_be_taught": string[], "provenance": string },
  "must_haves_red_flags": { "must_haves": string[], "red_flags": string[], "provenance": string },
  "search_playbook": { "content": string, "target_companies": string[], "avoid_companies_or_pools": string[], "provenance": string },
  "skill_table": {
    "core": string[],
    "micro": string[],
    "domain": string,
    "primary_skill": string,
    "sub_skills": string[],
    "target_band": "1|2|3|4",
    "target_rung": "A|B|C|D|E",
    "provenance": string
  },
  "tension_cards": [{ "title": string, "body": string, "tradeoffs": string[] }]
}`,
      },
    ],
  };
}

export function buildOutreachPrompt(input: {
  brief: JsonValue;
  inferenceCards: JsonValue;
  platform: "linkedin" | "email" | "whatsapp";
  tone: "formal" | "casual" | "direct";
  sender: "self" | "recruiter" | "founder" | "hiring_manager";
}): PromptSpec {
  return {
    id: "outreach_draft",
    purpose: "Generate outreach copy for the selected channel.",
    temperature: 0.35,
    maxOutputTokens: 700,
    messages: [
      {
        role: "system",
        content: `You write concise recruiter outreach. The message must be specific to the approved role signals and must not overpromise.

Rules:
- CTA placeholder must be exactly [Application Link].
- LinkedIn max 300 characters.
- WhatsApp max 450 characters.
- Email max 3 short paragraphs.
- Mention one concrete hook from the search playbook or ideal candidate card.
- Do not invent company name, compensation, or remote policy if absent.
${jsonOnlyRule}`,
      },
      {
        role: "user",
        content: `Brief:
${pretty(input.brief)}

Approved inference cards:
${pretty(input.inferenceCards)}

Platform: ${input.platform}
Tone: ${input.tone}
Sender: ${input.sender}

Return:
{
  "platform": "${input.platform}",
  "tone": "${input.tone}",
  "sender": "${input.sender}",
  "message_text": string,
  "cta_placeholder": "[Application Link]"
}`,
      },
    ],
  };
}

export function buildApplicationFormPrompt(input: {
  brief: JsonValue;
  inferenceCards: JsonValue;
}): PromptSpec {
  return {
    id: "application_form",
    purpose: "Generate Journey 1 candidate application form configuration.",
    temperature: 0.25,
    maxOutputTokens: 1800,
    messages: [
      {
        role: "system",
        content: `You design the first candidate application form for a role.

Rules:
- Journey 1 is always an application form, not a trip lever.
- Think like a recruiter optimizing for enough signal with low candidate friction.
- Generate actual form fields a candidate would fill, not booleans.
- Always include basic identity/contact fields: full name, email, phone, current location.
- Always include resume or CV upload and LinkedIn URL.
- Add role-specific fields only when they help screen must-haves, red flags, availability, compensation, or proof of work.
- Mark no more than 8 fields required unless the role is compliance-heavy.
- Include 0-2 audio fields only when voice context meaningfully improves signal. Audio must not be mandatory by default.
- Use knockout_fields only for fields that can decide immediate disqualification, such as location constraint, salary range, notice period, mandatory skill, or work authorization.
- Every field must include target_signal and reasoning explaining why it belongs on the form.
- Do not collect protected-class or illegal demographic information.
- Do not ask illegal, demographic, or protected-class questions.
${jsonOnlyRule}`,
      },
      {
        role: "user",
        content: `Brief:
${pretty(input.brief)}

Approved inference cards:
${pretty(input.inferenceCards)}

Return:
{
  "journey_number": 1,
  "title": "Application Form & Initial Context",
  "description": string,
  "dropout_risk": "low|medium|high",
  "estimated_minutes": number,
  "form_sections": [
    {
      "section_id": string,
      "title": string,
      "description": string,
      "fields": [
        {
          "field_id": string,
          "label": string,
          "field_type": "short_text|long_text|email|phone|url|file|number|single_select|multi_select|location|salary|notice_period|audio",
          "required": boolean,
          "placeholder": string | null,
          "options": string[],
          "help_text": string | null,
          "target_signal": string,
          "reasoning": string
        }
      ]
    }
  ],
  "knockout_fields": string[],
  "privacy_note": string
}`,
      },
    ],
  };
}

export function buildJourneyPlannerPrompt(input: {
  brief: JsonValue;
  inferenceCards: JsonValue;
}): PromptSpec {
  return {
    id: "journey_planner",
    purpose: "Suggest evaluation journeys before HM preference gate.",
    temperature: 0.3,
    maxOutputTokens: 1500,
    messages: [
      {
        role: "system",
        content: `${recruitmentContext}

You are designing optional candidate evaluation journeys after Journey 1 application form.

${skillDepthContext}

${supportedLeverTaxonomy}

Rules:
- Suggest only journey_number >= 2.
- Use only supported lever_id values: ${leverIds.join(", ")}.
- Treat the approved inference cards as the HM-approved role system. If they conflict with the original brief, the approved inference cards win.
- Treat skill_table.core and skill_table.micro as explicit target skills. Do not ignore a core skill just because it is not strongly represented in the original brief.
- Cover every skill_table.core item across the journey plan unless two items are clearly duplicates. At minimum, each core skill must appear in target_signals or the journey skill_frame.
- Choose the lowest-friction lever that can validate the signal.
- Include rationale so the HM can override.
- Do not generate full card content here; only plan the sequence.
- Avoid more than 4 evaluation journeys unless the role is very senior/complex.
- Build journeys as a triad where possible: 3 complementary levers form the core trip. Keep total estimated time <= 30 minutes.
- Prefer complementary evidence: execution + procedural fluency + judgment/reflex. Do not repeat the same signal with different packaging.
- Each journey must include a skill_frame with domain, skill, sub_skill, band, rung, target_depth, and knowledge_slice.
${jsonOnlyRule}`,
      },
      {
        role: "user",
        content: `Brief:
${pretty(input.brief)}

Approved inference cards:
${pretty(input.inferenceCards)}

Return:
{
  "journeys": [
    {
      "journey_number": number,
      "title": string,
      "description": string,
      "lever_id": "quiz|rapid_fire|assignment|demo",
      "lever_rationale": string,
      "structure_hint": string,
      "target_signals": string[],
      "skill_frame": {
        "domain": string,
        "skill": string,
        "sub_skill": string,
        "band": "1|2|3|4",
        "rung": "A|B|C|D|E",
        "target_depth": "L1|L2|L3|L4|L2-L3|L2-L4|L3-L4",
        "knowledge_slice": ["D"|"P"|"C"]
      },
      "estimated_minutes": number,
      "dropout_risk": "low|medium|high"
    }
  ]
}`,
      },
    ],
  };
}

export function buildLeverContentPrompt(input: {
  brief: JsonValue;
  inferenceCards: JsonValue;
  journey: JsonValue;
  hmConstraint?: string;
}): PromptSpec {
  const journey = input.journey as { lever_id?: string };
  const leverId = journey?.lever_id || "assignment";
  const leverRules = getLeverRules(leverId);

  return {
    id: `lever_content_${leverId}`,
    purpose: `Generate DB-ready card_template and sub_card_templates for ${leverId}.`,
    temperature: 0.25,
    maxOutputTokens: 2200,
    messages: [
      {
        role: "system",
        content: `${recruitmentContext}

Generate DB-ready evaluation content for exactly one card.

${skillDepthContext}

${supportedLeverTaxonomy}

Universal rules:
- Output one card_template and ordered sub_card_templates.
- card_template.lever_id must equal the requested lever.
- Use sequence_index starting at 1 for sub_card_templates.
- Every response_expected=true sub-card must be answerable by the current runtime interaction_type.
- Keep mobile-safe copy short.
- Treat the approved inference cards as the HM-approved role system. If they conflict with the original brief, approved inference cards win.
- The confirmed journey.skill_frame is the main target for this card, but it must remain aligned with approved inference_cards.skill_table core and micro skills.
- If a skill appears in approved inference_cards.skill_table but not in the original brief, treat it as an intentional HM edit, not noise.
- Use the confirmed journey.skill_frame when present. If absent, infer the smallest usable frame from approved inference cards.
- Scenario framing must be realistic and role-aligned, with no trick wording.
- Declare explicit non-signals in body_json where useful, such as not judging accent, polish, or visual design.
- Body content should reveal evidence for behavior patterns, judgment quality, error recovery, and transfer evidence without using scoring language.
- Do not include markdown.
- Do not create fields outside the requested JSON shape unless they belong inside body_json or rubric_json.

${leverRules}

${input.hmConstraint ? `[HM CONSTRAINT - follow strictly unless it violates schema]\n${input.hmConstraint}\n[END HM CONSTRAINT]` : ""}

${jsonOnlyRule}`,
      },
      {
        role: "user",
        content: `Brief:
${pretty(input.brief)}

Approved inference cards:
${pretty(input.inferenceCards)}

Confirmed journey:
${pretty(input.journey)}

Return:
{
  "card_template": {
    "lever_id": "${leverId}",
    "title": string,
    "instruction": string,
    "time_cap_seconds": number,
    "required": true,
    "is_enabled": true,
    "rubric_json": { "signals": string[], "scoring": string }
  },
  "sub_card_templates": [
    {
      "sequence_index": number,
      "sub_card_type": "briefing|task|reflection|transition",
      "interaction_type": "display|ordered_steps|choice_buttons|short_text|long_text|file_upload",
      "title": string,
      "body_text": string | null,
      "response_expected": boolean,
      "body_json": object
    }
  ]
}`,
      },
    ],
  };
}

function getLeverRules(leverId: string) {
  if (leverId === "quiz") {
    return `Quiz rules:
- Maps to L3 Rank & Rationalize Responses or L6 SJT depending on the skill_frame.
- Use for reasoning, discrimination quality, prioritization, and contextual judgment.
- Prefer scenarios with realistic AI-generated responses/options when testing judgment.
- Target D+P+C where possible: concept recognition, method choice, and when/why trade-offs.
- sub_card 1: briefing/display, response_expected=false, body_json { prompt, subtitle, rules, start_label }
- Generate 4-6 task/choice_buttons questions.
- Use selection_mode="single" for v1 runtime compatibility.
- Max 4 options per question.
- body_json per question { prompt, options, selection_mode, correct_answer, supporting_text }.`;
  }

  if (leverId === "rapid_fire") {
    return `Rapid fire rules:
- Maps to L5 Rapid Fire Serious/Joking.
- Use for reflexes, values, instincts, and fast recognition of serious vs unserious professional claims.
- Avoid trivia. Statements should test practiced judgment and tacit standards.
- Keep max duration around 8 minutes.
- sub_card 1: briefing/display with timer_seconds and auto_advance=true.
- Generate 8-12 task/choice_buttons statements.
- Options must be exactly serious/joking.
- Each prompt <= 90 chars.
- body_json per question { badge, prompt, options, timer_seconds, auto_advance }.`;
  }

  if (leverId === "demo") {
    return `Demo rules:
- Maps to L2 Sketch / Demo Your Work.
- Use for procedural fluency, tacit know-how, mental model structure, audience adaptation, and prioritization.
- Do not judge visual polish or slide-design skill.
- Ask the candidate to show how they would walk a stakeholder, peer, client, or manager through the work.
- Time cap should usually be 10-15 minutes.
- Generate 5 sub_cards:
  1. briefing/display scenario with { prompt, subtitle, blocks }
  2. task/ordered_steps walkthrough spine with { steps }
  3. reflection/display guidance with { guidance, links }
  4. task/long_text written walkthrough with { prompt, placeholder, min_words, max_words }
  5. task/file_upload optional proof with { prompt, required, accepted_file_types, capture_mode, max_duration_seconds, allow_microphone, allow_camera_overlay, allow_retake }
- Demo proof should be optional unless HM explicitly requires proof.`;
  }

  return `Assignment rules:
- Maps to L1 Task / Assignment.
- Use for applied execution in scoped context and procedural reasoning.
- Target 1-2 micro-skills only.
- The task should feel like something the candidate has done at work or can expect to do at work.
- Time cap should usually be 8-10 minutes.
- Generate 3 sub_cards:
  1. briefing/display brief with { prompt, subtitle, blocks, highlight }
  2. task/long_text written response with { prompt, placeholder, sections, max_words, done_looks_like }
  3. task/file_upload optional proof with { prompt, required, accepted_file_types, upload_label }
- File proof should be optional unless HM explicitly requires proof.`;
}

export const promptBuilders = {
  buildBriefExtractionPrompt,
  buildClarifyingQuestionsPrompt,
  buildInferenceCardsPrompt,
  buildOutreachPrompt,
  buildApplicationFormPrompt,
  buildJourneyPlannerPrompt,
  buildLeverContentPrompt,
};
