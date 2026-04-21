export const fintechBackendBrief = {
  rawText:
    "We need a senior backend engineer who's built payment systems at scale. Ideally from a fintech company, Series B or C stage, not a massive corp. Must be in Bangalore or willing to relocate. Budget is 45-55 LPA. Need them within 6 weeks. The person will own our payment infrastructure and work directly with the CTO. Must be a strong systems thinker, not just a feature builder.",
  contextTags: ["Confidential", "1st principle thinker", "AI tool power user"],
};

export const extractedFintechBrief = {
  designation: "Senior Backend Engineer",
  experience_years: "6-8 years",
  location: "Bangalore or willing to relocate",
  wfh_mode: "WFO",
  salary_range: "45-55 LPA",
  industry_type: "fintech/payments",
  company_type: "Series B/C startup",
  experience_type: "0-to-1 payment infrastructure ownership",
  must_haves: ["payment systems at scale", "systems thinking", "high ownership", "CTO-facing communication"],
  disqualifiers: ["massive corp only"],
  red_flags: ["pure feature builder", "no system-level ownership"],
  search_strategy: "Direct source from mid-stage fintech and payments companies.",
  context_tags: fintechBackendBrief.contextTags,
  evidence_map: {
    designation: ["senior backend engineer"],
    industry_type: ["fintech", "payment systems"],
  },
};

export const approvedInferenceCards = {
  ideal_candidate: {
    content:
      "A senior backend engineer from a mid-stage fintech/payments environment who has owned payment infrastructure and can work directly with the CTO.",
    confidence: "inferred",
    provenance: "payment systems at scale + Series B/C + CTO-facing ownership",
  },
  location_comp: {
    content: "Bangalore or relocation | 45-55 LPA | WFO",
    confidence: "verified",
    provenance: "explicit brief constraints",
  },
  teachable_vs_innate: {
    already_exist: ["payment systems at scale", "systems thinking", "high ownership"],
    can_be_taught: ["internal tooling", "company-specific compliance", "team rituals"],
    provenance: "must own payment infrastructure",
  },
  must_haves_red_flags: {
    must_haves: ["payment systems at scale", "systems thinking", "CTO-facing communication"],
    red_flags: ["pure feature builder", "massive corp only"],
    provenance: "explicit and inferred from brief",
  },
  search_playbook: {
    content: "Source from Razorpay, Cashfree, Pine Labs, Juspay, and adjacent fintech infra teams.",
    target_companies: ["Razorpay", "Cashfree", "Pine Labs", "Juspay"],
    avoid_companies_or_pools: ["large legacy IT services", "pure MNC feature teams"],
    provenance: "fintech/payments + not massive corp",
  },
  skill_table: {
    core: ["distributed systems", "payment architecture", "backend ownership"],
    micro: ["idempotency", "ledger correctness", "failure recovery", "high-throughput APIs"],
    domain: "fintech payments infrastructure",
    primary_skill: "Designing resilient payment systems",
    sub_skills: ["idempotency design", "failure recovery", "ledger correctness"],
    target_band: "3",
    target_rung: "C",
    provenance: "payment infra ownership",
  },
  tension_cards: [
    {
      title: "TIMELINE VS SCARCITY",
      body: "The 6-week timeline is tight for passive senior fintech infrastructure candidates.",
      tradeoffs: ["Broaden adjacent fintech infra", "Increase outbound volume", "Relax WFO requirement"],
    },
  ],
};

export const confirmedAssignmentJourney = {
  journey_number: 2,
  title: "Payment Failure Recovery Work Sample",
  description: "Validate how the candidate reasons through payment failure modes and operational recovery.",
  lever_id: "assignment",
  lever_rationale: "A written work sample checks depth without asking for a long take-home.",
  structure_hint: "Brief, written response, optional proof upload.",
  target_signals: ["idempotency", "failure recovery", "ledger correctness"],
  skill_frame: {
    domain: "fintech payments infrastructure",
    skill: "Designing resilient payment systems",
    sub_skill: "idempotency design",
    band: "3",
    rung: "C",
    target_depth: "L2-L3",
    knowledge_slice: ["P", "C"],
  },
  estimated_minutes: 10,
  dropout_risk: "medium",
  hm_constraint: "Focus on payment idempotency. Keep under 10 minutes.",
};
