import { Candidate, ActivityEvent } from './types';

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'cand1',
    name: 'Candidate A',
    headline: '8 yrs · Payments · ex-Razorpay',
    source: 'TalentBridge',
    submittedAt: 'Apr 2',
    stage: 'Ready for interview',
    evidenceStrength: 4,
    signals: [
      { dimension: 'Payment systems depth', score: 4, confidence: 'task-demonstrated' },
      { dimension: 'Systems thinking', score: 3, confidence: 'inferred' },
      { dimension: 'Startup adaptability', score: 2, confidence: 'self-claimed' },
      { dimension: 'Leadership potential', score: 3, confidence: 'recruiter-observed' }
    ],
    trips: [
      { name: 'JOURNEY A: Intent & Context', status: 'Complete', evidenceReady: true },
      { name: 'JOURNEY B: System Design Proof', status: 'Complete', evidenceReady: true }
    ],
    recommendations: [
      'Probe stakeholder conflict navigation',
      'Validate depth beyond Razorpay\'s specific architecture',
      'Explore motivation durability (left after 2 yrs)'
    ]
  },
  {
    id: 'cand2',
    name: 'Candidate D',
    headline: '6 yrs · Backend · ex-PhonePe',
    source: 'Internal Team',
    submittedAt: 'Mar 30',
    stage: 'Journey A',
    evidenceStrength: 3,
    signals: [
      { dimension: 'Payment systems depth', score: 3, confidence: 'recruiter-observed' },
      { dimension: 'Systems thinking', score: 4, confidence: 'inferred' }
    ],
    trips: [
      { name: 'JOURNEY A: Intent & Context', status: 'In Progress' }
    ]
  },
  {
    id: 'cand3',
    name: 'Candidate F',
    headline: '7 yrs · Backend + Payments · ex-Paytm',
    source: 'Internal Team',
    submittedAt: 'Mar 31',
    stage: 'Screening',
    evidenceStrength: 2,
    isOverlap: true,
    overlapDetails: 'Sources: Internal Team (contacted Mar 31) + TalentBridge (contacted Apr 3). Provenance: Internal Team has priority (first contact)',
    signals: [
      { dimension: 'Payment systems depth', score: 3, confidence: 'recruiter-observed' },
      { dimension: 'Systems thinking', score: 2, confidence: 'inferred' }
    ],
    trips: [
      { name: 'JOURNEY A: Intent & Context', status: 'In Progress' }
    ]
  }
];

export const MOCK_EVENTS: ActivityEvent[] = [
  {
    id: 'evt1',
    type: 'submission',
    title: 'TalentBridge submitted 3 profiles',
    time: '2 hrs ago',
    details: [
      'Candidate A — 8 yrs payments, ex-Razorpay (verified)',
      'Candidate B — 6 yrs backend, fintech adj. (inferred)',
      'Candidate C — 5 yrs, payments + lending (weak signals)'
    ]
  },
  {
    id: 'evt2',
    type: 'movement',
    title: 'Internal Team moved 2 candidates to screened',
    time: '5 hrs ago',
    details: [
      'Candidate D — Journey A completed, evidence ready',
      'Candidate E — Journey A in progress (est. 4 hrs remaining)'
    ]
  },
  {
    id: 'evt3',
    type: 'question',
    title: 'HireWell requested role clarification',
    time: '1 day ago',
    details: [
      '"Is hybrid Bangalore acceptable, or strictly in-office?"'
    ],
    actionable: true,
    actionLabel: 'Respond'
  },
  {
    id: 'evt4',
    type: 'system',
    title: 'System detected candidate overlap',
    time: '1 day ago',
    details: [
      'Candidate F sourced by both TalentBridge and Internal Team',
      'Provenance: Internal Team contacted first (Mar 31)'
    ],
    actionable: true,
    actionLabel: 'Resolve'
  }
];
