export const initialLedger = [
  {
    id: "hist-001",
    meetingTitle: "Sprint 12 Commitment Sync",
    date: "Oct 18, 2026",
    topic: "Release Milestone",
    decision: "Public beta release date is firmly locked for November 15th, 2026.",
    speaker: "Sarah (Lead PM)",
    quote: "Team, we committed to our stakeholders: launch date is locked for Nov 15th.",
    status: "active",
    supersededBy: null
  },
  {
    id: "hist-002",
    meetingTitle: "Sprint 12 Commitment Sync",
    date: "Oct 18, 2026",
    topic: "Payments Architecture",
    decision: "Stripe Connect is designated as the primary payment processor for V1 launch.",
    speaker: "Rahul (Backend Lead)",
    quote: "Let's stick strictly to Stripe for V1 so we don't blow past the Nov 15 deadline.",
    status: "active",
    supersededBy: null
  },
  {
    id: "hist-003",
    meetingTitle: "UX & Conversion Review",
    date: "Oct 22, 2026",
    topic: "Checkout Flow",
    decision: "Simplify the checkout experience into a 1-step accordion form.",
    speaker: "Alex (Design Lead)",
    quote: "A single step checkout increases conversion by 18% in our internal usability tests.",
    status: "active",
    supersededBy: null
  },
  {
    id: "hist-004",
    meetingTitle: "Security & Compliance Check",
    date: "Oct 25, 2026",
    topic: "Compliance & Auditing",
    decision: "Mandatory SOC2 Type II compliance audit checkpoints required before production traffic.",
    speaker: "Priya (Security Lead)",
    quote: "We cannot enable live credit card transactions without the compliance signoff.",
    status: "active",
    supersededBy: null
  }
];

export const demoScenarios = [
  {
    id: "scenario-launch-conflict",
    name: "Scenario 1: Sprint 14 Sync (Launch Date Conflict)",
    badge: "Recommended for Judges",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    description: "Contains self-corrections, moves launch from Nov 15 to Nov 22, and tests conflict detection.",
    transcript: `Sarah: Alright everyone, let's jump into the sprint sync. Um, first off, looking at the QA backlog and where backend is at right now... honestly, there is no way we can hit November 15 for the public beta. No wait, let me rephrase that—if we ship on the 15th, load testing won't be finished. So I think we have to push the public launch to November 22nd instead. Everyone okay with that?

Rahul: Yeah Sarah, that gives me breathing room. On my end, I'll wrap up the core Stripe webhook pipeline before tackling anything else. I will have the Stripe webhooks done by Friday November 6th without fail.

Sarah: Perfect. Priya, what about you? Can you run the stress tests?

Priya: Yeah, I mean, uh, once Rahul deploys to staging, I can run the k6 load scripts for 5,000 concurrent checkouts. Let's say by November 12th.

Alex: Um, I guess I should probably update the marketing deck and press release whenever you guys confirm.

Sarah: Thanks Alex. Also someone needs to write up the apology note for early-access signups before Nov 14 so they know about the delay.`
  },
  {
    id: "scenario-infra-incident",
    name: "Scenario 2: Emergency Bug Triage (Overload Clash)",
    badge: "Technical Incident",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/30",
    description: "Rambling outage discussion with missing assignees and rapid-fire decisions.",
    transcript: `Dev: Okay, quick huddle. We're seeing Redis memory spike to 94% right now. It started right after PR #402 merged. We have to revert 402 right now, wait no, let me drain connections first then roll back. 

Sarah: Do whatever keeps the API up Dev. I'm pulling the trigger on the revert right after this standup. Also let's agree: agreed, no new services ship without circuit breakers.

Dev: I'll also add the Datadog alert for connection spikes by tomorrow morning.

Sarah: Great. We'll definitely need an incident report written before Monday so leadership knows why the dashboard froze.`
  },
  {
    id: "scenario-product-pivot",
    name: "Scenario 3: Product Strategy & Growth Sync",
    badge: "Growth & Pricing",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    description: "Pricing changes, referral experiment, and tentative team assignments.",
    transcript: `Sarah: Hey team, looking at our customer churn data. The $49 tier is getting resistance from freelance PMs. Let's introduce a $29 Starter plan starting next Monday.

Alex: Sounds good. I'll design the updated pricing tier comparison card by Thursday. Um, wait, actually Friday would be safer so I can test mobile viewports.

Rahul: I can update the Stripe product catalogue and checkout pricing table by next Tuesday.

Sarah: Awesome. We also talked about the viral referral loop—give $10, get $10. We should build that soon, someone please spec it out.`
  }
];
