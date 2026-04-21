import { CrystallizationCardData, TensionCardData, TripProposalData } from './types';

export const MOCK_INPUT = "We need a senior backend engineer who's built payment systems at scale. Ideally from a fintech company, Series B or C stage — not a massive corp. Must be in Bangalore or willing to relocate. Budget is 45-55 LPA. I need them fast, ideally within 6 weeks. The person will own our entire payment infrastructure and work directly with the CTO. Must be a strong systems thinker, not just a feature builder.";

export const MOCK_CRYSTALLIZATION_CARDS: CrystallizationCardData[] = [
  {
    id: 'c1',
    category: 'Ideal Candidate',
    content: 'A senior backend engineer (6-8 yrs) from a Series B/C fintech environment who has built scalable payment infrastructure from scratch.',
    confidence: 'inferred',
    provenance: 'systems thinker + Series B/C + own infrastructure',
    status: 'pending'
  },
  {
    id: 'c2',
    category: 'Location, Compensation & Work Mode',
    content: 'Bangalore (or willing to relocate) | 45-55 LPA base | Work from Office (Standard)',
    confidence: 'verified',
    provenance: 'explicitly stated constraints',
    status: 'pending'
  },
  {
    id: 'c3',
    category: 'What can be taught vs what should already exist',
    content: 'ALREADY EXIST: Deep understanding of idempotency, failure modes, scale. \nCAN BE TAUGHT: Specific language stacks, domain-specific regulatory compliance, internal tooling.',
    confidence: 'inferred',
    provenance: 'not a massive corp + not just a feature builder',
    status: 'pending'
  },
  {
    id: 'c4',
    category: 'Must haves and red flags',
    content: 'MUST HAVES: 0-to-1 payment architecture experience, high agency. \nRED FLAGS: Pure feature builders, exclusively MNC background, lack of system level thinking.',
    confidence: 'verified',
    provenance: 'Budget is 45-55 LPA',
    status: 'pending'
  },
  {
    id: 'c5',
    category: 'Search strategy or sourcing playbook',
    content: 'Direct sourcing mid-stage fintechs (Razorpay, Pine Labs, Cashfree). Outreach narrative: "Own our 0-1 infrastructure."',
    confidence: 'inferred',
    provenance: 'need them fast + within 6 weeks',
    status: 'pending'
  },
  {
    id: 'c6',
    category: 'Skill and micro skill table',
    content: 'Core: System Design, Distributed Systems, Payment Gateways.\nMicro: Idempotency keys, Two-phase commit logic, High-throughput API design.',
    confidence: 'inferred',
    provenance: 'location constraint + domain requirement + seniority level',
    status: 'pending'
  }
];

export const MOCK_TENSION_CARDS: TensionCardData[] = [
  {
    id: 't1',
    title: 'TIMELINE vs COMPENSATION',
    description: 'Your 6-week timeline targets passive senior candidates, but the compensation range (45-55L) sits ~15% below market median for this profile in Bangalore.',
    tradeoffs: [
      'Relax location to include remote/hybrid (broadens pool 3x)',
      'Adjust range to 55-65L (aligns with market)',
      'Broaden to adjacent profiles (fintech-adjacent, not fintech-only)',
      'Extend timeline to 10 weeks (allows passive outreach cycles)'
    ],
    status: 'pending'
  }
];

export const MOCK_TRIPS: TripProposalData[] = [
  {
    id: 'trip2',
    title: 'Intent & Context Fit',
    duration: '~20 min',
    purpose: 'Surface motivation clarity, communication quality, and role understanding before deeper evaluation.',
    blocks: [
      { id: 'b1', name: 'Contxt' },
      { id: 'b2', name: 'Prompt' },
      { id: 'b3', name: 'Reflct' }
    ],
    signals: ['intent', 'communication', 'role-fit'],
    dropoutRisk: 'Low',
    funnelPosition: 'After initial screen',
    status: 'pending'
  },
  {
    id: 'trip3',
    title: 'System Design Proof',
    duration: '~60 min',
    purpose: 'Validate ability to architect scalable payment infrastructure and articulate trade-offs.',
    blocks: [
      { id: 'b4', name: 'Brief' },
      { id: 'b5', name: 'Design' },
      { id: 'b6', name: 'Defend' }
    ],
    signals: ['systems thinking', 'domain depth', 'trade-off analysis'],
    dropoutRisk: 'Medium',
    funnelPosition: 'Before CTO interview',
    status: 'pending'
  }
];
