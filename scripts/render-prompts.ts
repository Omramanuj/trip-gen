import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
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

const outDir = join(process.cwd(), "evals/recruitment-os-prompts/.generated");

function renderPrompt(spec: PromptSpec) {
  return [
    `# ${spec.id}`,
    "",
    `Purpose: ${spec.purpose}`,
    `Temperature: ${spec.temperature}`,
    `Max output tokens: ${spec.maxOutputTokens}`,
    "",
    ...spec.messages.flatMap((message) => [
      `## ${message.role.toUpperCase()}`,
      "",
      message.content,
      "",
    ]),
  ].join("\n");
}

const promptSpecs = [
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
  buildLeverContentPrompt({
    brief: extractedFintechBrief,
    inferenceCards: approvedInferenceCards,
    journey: { ...confirmedAssignmentJourney, lever_id: "quiz" },
  }),
  buildLeverContentPrompt({
    brief: extractedFintechBrief,
    inferenceCards: approvedInferenceCards,
    journey: { ...confirmedAssignmentJourney, lever_id: "rapid_fire" },
  }),
  buildLeverContentPrompt({
    brief: extractedFintechBrief,
    inferenceCards: approvedInferenceCards,
    journey: confirmedAssignmentJourney,
    hmConstraint: confirmedAssignmentJourney.hm_constraint,
  }),
  buildLeverContentPrompt({
    brief: extractedFintechBrief,
    inferenceCards: approvedInferenceCards,
    journey: { ...confirmedAssignmentJourney, lever_id: "demo" },
  }),
];

mkdirSync(outDir, { recursive: true });

const manifest = promptSpecs.map((spec) => {
  const fileName = `${spec.id}.txt`;
  writeFileSync(join(outDir, fileName), renderPrompt(spec));
  return {
    id: spec.id,
    purpose: spec.purpose,
    file: fileName,
    message_count: spec.messages.length,
    temperature: spec.temperature,
    max_output_tokens: spec.maxOutputTokens,
  };
});

writeFileSync(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Rendered ${manifest.length} Recruitment OS prompts to ${outDir}`);
