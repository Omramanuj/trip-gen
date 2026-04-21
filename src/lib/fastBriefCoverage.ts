export type CoverageFieldId =
  | 'designation'
  | 'experience_years'
  | 'location'
  | 'wfh_mode'
  | 'salary_range'
  | 'industry_type'
  | 'company_type'
  | 'experience_type'
  | 'must_haves'
  | 'disqualifiers'
  | 'red_flags'
  | 'search_strategy';

export type CoverageHit = {
  field: CoverageFieldId;
  label: string;
  value: string;
  confidence: 'high' | 'medium' | 'low';
};

export type FastCoverageResult = {
  coveredFields: Set<CoverageFieldId>;
  hits: CoverageHit[];
  missingMandatory: CoverageFieldId[];
  elapsedMs: number;
};

const mandatoryFields: CoverageFieldId[] = [
  'designation',
  'experience_years',
  'location',
  'wfh_mode',
  'salary_range',
];

const designationTerms = [
  'engineer',
  'developer',
  'designer',
  'manager',
  'lead',
  'architect',
  'recruiter',
  'sales',
  'marketer',
  'analyst',
  'founder',
  'cto',
  'head of',
];

const industryTerms = [
  'fintech',
  'payments',
  'payment',
  'saas',
  'healthcare',
  'edtech',
  'ecommerce',
  'e-commerce',
  'logistics',
  'banking',
  'insurance',
  'gaming',
  'ai',
  'ml',
  'crypto',
  'web3',
];

const companyTerms = [
  'startup',
  'series a',
  'series b',
  'series c',
  'mnc',
  'enterprise',
  'agency',
  'consulting',
  'product company',
  'services',
  'faang',
  'bootstrapped',
];

const cityTerms = [
  'bangalore',
  'bengaluru',
  'mumbai',
  'delhi',
  'gurgaon',
  'gurugram',
  'noida',
  'hyderabad',
  'pune',
  'chennai',
  'kolkata',
  'ahmedabad',
  'remote',
  'relocate',
];

function uniquePush(hits: CoverageHit[], hit: CoverageHit) {
  if (!hits.some((existing) => existing.field === hit.field && existing.value === hit.value)) {
    hits.push(hit);
  }
}

function firstMatch(text: string, pattern: RegExp) {
  return text.match(pattern)?.[0]?.trim() || null;
}

function findTerm(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  return terms.find((term) => lower.includes(term)) || null;
}

function cleanValue(value: string) {
  return value.replace(/\s+/g, ' ').replace(/[,.]$/, '').trim();
}

export function fastExtractBriefCoverage(rawText: string): FastCoverageResult {
  const start = performance.now();
  const text = rawText.trim();
  const hits: CoverageHit[] = [];

  if (!text) {
    return {
      coveredFields: new Set(),
      hits: [],
      missingMandatory: mandatoryFields,
      elapsedMs: 0,
    };
  }

  const lower = text.toLowerCase();

  const designationPattern = new RegExp(
    `(?:senior|sr\\.?|junior|jr\\.?|lead|principal|staff|founding|head of)?\\s*(?:${designationTerms.join('|')})(?:\\s+[a-z][a-z+/-]*){0,4}`,
    'i',
  );
  const designation = firstMatch(text, designationPattern);
  if (designation) {
    uniquePush(hits, {
      field: 'designation',
      label: 'Designation',
      value: cleanValue(designation),
      confidence: 'medium',
    });
  }

  const experience = firstMatch(
    text,
    /\b(?:\d{1,2}\s*(?:-|to)\s*\d{1,2}|\d{1,2}\+?)\s*(?:years?|yrs?|yoe)\b/i,
  );
  if (experience) {
    uniquePush(hits, {
      field: 'experience_years',
      label: 'Experience',
      value: cleanValue(experience),
      confidence: 'high',
    });
  }

  const salary = firstMatch(
    text,
    /(?:₹|rs\.?|inr|\$)?\s*\d+(?:\.\d+)?\s*(?:-|to)?\s*(?:₹|rs\.?|inr|\$)?\s*\d*(?:\.\d+)?\s*(?:lpa|lakhs?|lakh|cr|crore|k|usd|inr|pa|per annum)\b/i,
  );
  if (salary || lower.includes('no upper salary cap')) {
    uniquePush(hits, {
      field: 'salary_range',
      label: 'Salary',
      value: cleanValue(salary || 'No upper salary cap'),
      confidence: salary ? 'high' : 'medium',
    });
  }

  const location = findTerm(text, cityTerms);
  if (location) {
    uniquePush(hits, {
      field: 'location',
      label: 'Location',
      value: location,
      confidence: 'medium',
    });
  }

  const workMode = firstMatch(text, /\b(?:wfo|wfh|remote|hybrid|onsite|on-site|office)\b/i);
  if (workMode) {
    uniquePush(hits, {
      field: 'wfh_mode',
      label: 'WFO/WFH',
      value: cleanValue(workMode),
      confidence: 'high',
    });
  }

  const industry = findTerm(text, industryTerms);
  if (industry) {
    uniquePush(hits, {
      field: 'industry_type',
      label: 'Industry',
      value: industry,
      confidence: 'medium',
    });
  }

  const company = findTerm(text, companyTerms);
  if (company) {
    uniquePush(hits, {
      field: 'company_type',
      label: 'Company type',
      value: company,
      confidence: 'medium',
    });
  }

  if (/\b(?:0-to-1|zero to one|scale|at scale|ownership|owned|built|hands-on|cto-facing|client-facing)\b/i.test(text)) {
    uniquePush(hits, {
      field: 'experience_type',
      label: 'Experience type',
      value: 'role exposure signal',
      confidence: 'low',
    });
  }

  if (/\b(?:must have|must-have|required|need|needs|should have|strong in|expert in|hands-on with)\b/i.test(text)) {
    uniquePush(hits, {
      field: 'must_haves',
      label: 'Must haves',
      value: 'requirement phrase detected',
      confidence: 'medium',
    });
  }

  if (/\b(?:avoid|strictly avoid|not from|no |never|disqualif(?:y|ier)|reject)\b/i.test(text)) {
    uniquePush(hits, {
      field: 'disqualifiers',
      label: 'Disqualifier',
      value: 'avoidance phrase detected',
      confidence: 'medium',
    });
  }

  if (/\b(?:red flag|red flags|warning sign|bad sign|pure feature builder|job hopper|low ownership)\b/i.test(text)) {
    uniquePush(hits, {
      field: 'red_flags',
      label: 'Red flags',
      value: 'red-flag phrase detected',
      confidence: 'medium',
    });
  }

  if (/\b(?:source|sourcing|search|target companies|target pools|look at|look for|hire from|companies like|avoid companies)\b/i.test(text)) {
    uniquePush(hits, {
      field: 'search_strategy',
      label: 'Search strategy',
      value: 'sourcing phrase detected',
      confidence: 'medium',
    });
  }

  const coveredFields = new Set(hits.map((hit) => hit.field));
  const missingMandatory = mandatoryFields.filter((field) => !coveredFields.has(field));

  return {
    coveredFields,
    hits,
    missingMandatory,
    elapsedMs: Math.max(0, performance.now() - start),
  };
}
