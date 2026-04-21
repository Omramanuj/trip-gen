import {
  buildApplicationFormPrompt,
  buildBriefExtractionPrompt,
  buildClarifyingQuestionsPrompt,
  buildInferenceCardsPrompt,
  buildJourneyPlannerPrompt,
  buildLeverContentPrompt,
  buildOutreachPrompt,
  type PromptSpec,
} from "../src/prompts/recruitmentOsPrompts";
import {
  approvedInferenceCards,
  confirmedAssignmentJourney,
  extractedFintechBrief,
  fintechBackendBrief,
} from "../src/prompts/recruitmentOsFixtures";
import { leverIds, mandatoryBriefFields } from "../src/prompts/recruitmentOsSchemas";

type CheckResult = {
  id: string;
  pass: boolean;
  failures: string[];
};

function collectPromptSpecs() {
  return [
    buildBriefExtractionPrompt(fintechBackendBrief),
    buildClarifyingQuestionsPrompt({
      brief: { ...extractedFintechBrief, red_flags: [] },
      missingFields: ["red_flags", "search_strategy"],
    }),
    buildInferenceCardsPrompt({ brief: extractedFintechBrief }),
    buildApplicationFormPrompt({
      brief: extractedFintechBrief,
      inferenceCards: approvedInferenceCards,
    }),
    buildOutreachPrompt({
      brief: extractedFintechBrief,
      inferenceCards: approvedInferenceCards,
      platform: "linkedin",
      tone: "direct",
      sender: "recruiter",
    }),
    buildJourneyPlannerPrompt({
      brief: extractedFintechBrief,
      inferenceCards: approvedInferenceCards,
    }),
    ...leverIds.map((lever_id) =>
      buildLeverContentPrompt({
        brief: extractedFintechBrief,
        inferenceCards: approvedInferenceCards,
        journey: { ...confirmedAssignmentJourney, lever_id },
        hmConstraint: lever_id === "assignment" ? confirmedAssignmentJourney.hm_constraint : undefined,
      }),
    ),
  ];
}

function textOf(spec: PromptSpec) {
  return spec.messages.map((message) => message.content).join("\n\n");
}

function checkSpec(spec: PromptSpec): CheckResult {
  const text = textOf(spec);
  const failures: string[] = [];

  if (!spec.id || /\s/.test(spec.id)) failures.push("id must be non-empty and contain no spaces");
  if (spec.messages.length < 2) failures.push("prompt must contain system and user messages");
  if (spec.messages[0]?.role !== "system") failures.push("first message must be system");
  if (!text.includes("Return only valid JSON")) failures.push("missing JSON-only rule");
  if (/```/.test(text)) failures.push("prompt text should not contain markdown fences");
  if (/\{\{[^}]+}}/.test(text)) failures.push("unresolved mustache placeholder remains");
  if (/journey_templates/.test(text)) failures.push("must not reference journey_templates");
  if (/lever_type/.test(text) && spec.id !== "journey_planner") failures.push("use lever_id, not lever_type");

  if (spec.id === "brief_extraction") {
    for (const field of mandatoryBriefFields) {
      if (!text.includes(field)) failures.push(`brief extraction missing mandatory field ${field}`);
    }
  }

  if (spec.id.startsWith("lever_content_")) {
    for (const required of [
      "card_template",
      "sub_card_templates",
      "sequence_index",
      "body_json",
      "response_expected",
      "skill_frame",
      "Context bands",
      "Complexity rungs",
    ]) {
      if (!text.includes(required)) failures.push(`lever prompt missing ${required}`);
    }
    const lever = spec.id.replace("lever_content_", "");
    if (!text.includes(`"lever_id": "${lever}"`)) failures.push(`lever prompt does not lock lever_id=${lever}`);
  }

  if (spec.id === "outreach_draft" && !text.includes("[Application Link]")) {
    failures.push("outreach prompt missing CTA placeholder");
  }

  if (spec.id === "journey_planner") {
    for (const required of ["triad", "30 minutes", "skill_frame", "knowledge_slice", "domain", "sub_skill"]) {
      if (!text.includes(required)) failures.push(`journey planner missing ${required}`);
    }
  }

  return { id: spec.id, pass: failures.length === 0, failures };
}

const results = collectPromptSpecs().map(checkSpec);
const failed = results.filter((result) => !result.pass);

for (const result of results) {
  if (result.pass) {
    console.log(`PASS ${result.id}`);
  } else {
    console.error(`FAIL ${result.id}`);
    for (const failure of result.failures) console.error(`  - ${failure}`);
  }
}

if (failed.length) {
  process.exitCode = 1;
} else {
  console.log(`All ${results.length} Recruitment OS prompt checks passed.`);
}
