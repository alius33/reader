---
date: 2026-04-04
type: podcast-analysis
tags: [podcast-analysis, peterman-pod, software-engineering, meta, ios, influence, career-growth, ic-track, infrastructure]
host: Ryan Peterman
guest: Adam Ernst
series: The Peterman Pod
episode-number:
title: Meta Distinguished Eng (IC9) On Influencing Engs, Failures, and Learnings
source-file: peterman-pod_ic9-influence.txt
podcast-type: interview
duration-minutes: ~45
---

# Analysis — Meta IC9 on Influencing Engineers, Failures, and Learnings

## Podcast Type

**Interview** — Ryan Peterman interviews Adam Ernst, a Distinguished Engineer (IC9) at Meta who has spent his entire Meta career on iOS infrastructure. The conversation follows Adam's career chronologically: early coding, joining Facebook pre-IPO, three major projects (mem models, ComponentKit, ComponentScript), lessons on influence, and reflections on the IC track.

## Core Topic

How a coding-focused IC built influence across a massive organisation without authority — through code review, doing the work for others, finding allies, and knowing when to kill a failing project.

## Host & Guest

- **Host:** Ryan Peterman — ex-Instagram Staff Engineer, tech career content creator
- **Guest:** Adam Ernst — Distinguished Engineer (IC9) at Meta. Joined Facebook in 2012, weeks before the IPO. Built iOS infrastructure (mem models, ComponentKit). Has stayed on mobile/iOS his entire Meta career. Self-described "coding machine."

## Structural Map

| Timestamp Range | Topic | Key Content |
|----------------|-------|-------------|
| Opening | CosmicSoft — middle school software company | Adam sold testing software written in RealBasic to teachers across the US. Received checks in the mail as an eighth grader. |
| Early career | Joining Facebook pre-IPO (2012) | Hired as E5. All iOS engineers fit in one conference room. The HTML5-to-native rewrite was underway. |
| E6 promo | Core Data replacement (mem models) | Apple's Core Data didn't scale. Built immutable model system. Convinced sceptics by doing the migration work himself. 1,600 diff reviews in 6 months. |
| Influence tips | How to influence without authority | Talk in person. Be sympathetic. Give data. Do the work for them. Code review as organic influence. |
| E7 promo | ComponentKit (2014) | React-inspired declarative UI for iOS, pre-Swift/SwiftUI/React Native. Major internal adoption battle. Found allies. Compromise with Panels team. |
| Failed project | ComponentScript (~2 years) | Cross-platform UI framework. Technically excellent but failed: no target audience, GraphQL baggage, went too wide. Total failure — deleted entirely. |
| Postmortem culture | Publishing the retrospective | Cathartic, ripped the band-aid off, hoped to influence future decisions. Got goodwill for cleaning up responsibly. |
| Performance reviews | Getting a "meets most" | Performance review did its job — signalled the project wasn't working. New manager saw it with fresh eyes. |
| Management vs IC | Why he chose IC permanently | Loves writing code. Less good at direction-setting removed from code. Communication is strongest in technical context. |
| Domain choice | Staying on iOS for 12+ years | Organic — never sought transfers. Deep knowledge became a superpower. Wouldn't necessarily pick mobile if starting today. |
| Technical depth vs breadth | Diving 8 levels deep | When blocked by another system, debug it yourself instead of filing a ticket. Organic learning > planned study. |
| Level anxiety | Handling IC9 expectations | "Flipped the switch off." Checks in with manager to ensure working on important problems, then just does the work. |
| Other exceptional engineers | Who he admires and why | Dustin Shahidehpour (coding machine), Wei Han (fixer/debugger), Michael Bolan (project starter), Bob Baldwin & Oliver Ricard (communicators), Nolan O'Brien (alignment driver, Apple relationship). |
| Career advice | What he'd tell his younger self | Nothing — it worked out. General advice: do what you love. Productivity comes from genuine enthusiasm. |

## Main Arguments & Claims

### 1. Do the work for them (Adam Ernst)
- **Claim:** The most effective way to drive adoption of infrastructure is to do the migration yourself rather than asking teams to do it
- **Evidence:** Successfully migrated teams off Core Data by writing the code himself; teams only had to say "yes, this is fine"
- **Strength:** Strong — backed by E6 promo and repeated success at Meta
- **Nuance:** Adam acknowledges this is getting harder as Meta's codebase grows; one person can't do entire migrations anymore

### 2. Code review is the highest-leverage influence tool (Adam Ernst)
- **Claim:** Reviewing others' code gives organic openings to influence how engineers write code across the organisation
- **Evidence:** 1,600 diffs in 6 months. His review style — explain why, not just what to change — spread virally through reviewers
- **Strength:** Strong — concrete numbers, clear mechanism (viral spread through review culture)

### 3. Technical excellence alone doesn't win (Adam Ernst)
- **Claim:** ComponentScript checked every technical box but failed because it had no target audience, carried GraphQL baggage, and went too wide
- **Evidence:** Two years of work, real features built on it, but no team went all-in. A simpler competitor that skipped data consistency won instead.
- **Strength:** Very strong — honest postmortem from someone who lived it

### 4. Kill failing projects cleanly (Adam Ernst)
- **Claim:** Winding down a project responsibly generates more goodwill than dragging it out
- **Evidence:** Migrated all teams off ComponentScript, completely deleted the framework, published a public retrospective. Got a "positive bump" afterward.
- **Strength:** Strong — counterintuitive but backed by personal experience

### 5. Deep diving builds organic breadth (Adam Ernst)
- **Claim:** Instead of studying systems from first principles, debug problems 8 levels deep when they block you — this builds both depth and breadth organically
- **Evidence:** Adam knows GraphQL codegen internals, Buck build system, etc. because he debugged into them when blocked
- **Strength:** Moderate-strong — works for his personality type, may not generalise

### 6. Passion is not cliche advice (Both)
- **Claim:** Loving the work produces order-of-magnitude more output than tolerating it
- **Evidence:** Adam's extraordinary code output, curiosity-driven deep dives, 14+ years on the same team
- **Strength:** Moderate — survivorship bias possible, but the productivity mechanism is real

## Key Stories & Anecdotes

### 1. CosmicSoft — The Eighth-Grade Software Company
- Adam discovered programming through his teacher mother's classroom
- Wrote testing software in RealBasic (cross-platform Visual Basic clone)
- Sold it on a service called Eccelerate — an early online software store
- Teachers across the US mailed him checks for $19.95
- He would email them an unlock code
- **Illustrates:** Early entrepreneurship, self-directed learning, the "coding machine" identity forming early

### 2. The Core Data Crisis (2012-2013)
- Facebook's iOS app used Apple's Core Data as its database
- Worked fine at 15-20 engineers; fell over completely at 100-200
- Teams were banging on the door wanting native rewrites while infrastructure was crumbling
- Adam's team disassembled Core Data's closed-source binary to understand why it was slow
- Built "mem models" — an immutable model system solving thread safety and mutation issues
- Convinced holdouts by doing the migration work himself
- **Illustrates:** Infrastructure crisis as career opportunity, "do the work for them" strategy

### 3. The Apple Framework Holdouts
- Some engineers insisted on using vanilla Apple frameworks (Core Data, etc.)
- Their argument: "I'm an iOS engineer, we should use Apple's tools"
- Adam's counter: empathy first ("I prefer vanilla Apple frameworks too"), then data (disassembled Core Data internals), then migration help
- Over years, this debate has largely resolved as Meta's scale made Apple's limitations obvious
- **Illustrates:** Influence through empathy + data + doing the work

### 4. ComponentKit's Adoption Battle (2014)
- Lee Byron (co-inventor of GraphQL) suggested applying React concepts to iOS
- Adam built ComponentKit — declarative UI, immutable components, background rendering
- Predated Swift, SwiftUI, and React Native
- Massive pushback from iOS engineers who found it alien
- Called in mediators (other senior engineers like Alan Kennaro)
- Found allies — Clement Gendmer and Greg Mech carried weight and helped convince others
- Compromised with the Panels team by adopting their data source technology
- **Illustrates:** Finding allies, strategic compromise, leveraging existing credibility (React's reputation)

### 5. ComponentScript — The Total and Complete Failure
- Manager Ari Grant pushed for cross-platform UI (iOS + Android)
- React Native didn't work for Meta's architecture (native app with small cross-platform pieces)
- Adam built ComponentScript: a paired-down React-like API on top of ComponentKit + Litho
- Technically excellent: type-safe, bi-directional embedding, GraphQL integration
- Three fatal mistakes:
  - No clear target audience (iOS engineers didn't want JavaScript; web engineers wanted React)
  - GraphQL dependency was slow and janky
  - Went too wide — many small pings of interest but no team went all-in
- A competitor skipped data consistency entirely and won ("60-80% of products don't care")
- Adam refused to compromise on GraphQL — this was a problem
- Killed after getting a "meets most" performance rating
- **Illustrates:** Technical excellence is necessary but not sufficient; product-market fit applies to internal tools too

### 6. The Clean Shutdown
- Migrated all teams off ComponentScript to native or React Native
- Completely deleted the code from the repo — left no mess
- Published a detailed public retrospective
- Got goodwill and a "positive bump" from doing the cleanup responsibly
- Irony: the Groups team decided to go all-in on ComponentScript just as he killed it
- **Illustrates:** How to fail well, the value of clean exits

### 7. Sleepless Nights and Ignoring Gut Feelings
- For the last year of ComponentScript's two-year life, Adam knew it wasn't working
- Had literal sleepless nights
- His "coding machine" instinct was to write more code — the wrong response
- Should have listened to his gut and pivoted sooner
- **Illustrates:** Sunk cost fallacy, the coding-machine trap

### 8. Debugging Eight Levels Deep
- When GraphQL codegen blocked his work, instead of filing a ticket, he dove into the internals
- Either fixed it himself (impressing the GraphQL team) or showed up with the problem already diagnosed
- Over time, this built encyclopaedic knowledge across multiple systems
- **Illustrates:** Organic breadth through curiosity, the "just go figure it out" mindset

## Frameworks & Mental Models

### 1. The "Do The Work For Them" Model
- Don't build scaffolding and then try to convince others to do the migration
- Show up with the work already done; the conversation becomes "just say yes"
- Limitation: doesn't scale at extreme codebase sizes

### 2. Code Review as Influence Vector
- Review volume (14/day) creates constant openings for organic influence
- Style matters: explain why, not just what; be flexible; acknowledge you might be wrong
- Influence spreads virally — your review comments shape how the diff author reviews others

### 3. The Three-Part Persuasion Model (implicit)
- **Empathy:** "I prefer vanilla Apple frameworks too"
- **Data:** "We disassembled Core Data and here's what we found"
- **Action:** "I already did the work; just sign off"

### 4. Archetype: Coding Machine
- Adam identifies with this archetype — high volume, loves writing code
- Acknowledges mixed feelings about archetypes generally
- Contrasts with other archetypes: fixer (Wei Han), project starter (Michael Bolan), communicator (Bob Baldwin/Oliver Ricard), alignment driver (Nolan O'Brien)

### 5. Target Audience for Internal Tools
- ComponentKit succeeded because iOS engineers could see the code was simpler and faster
- ComponentScript failed because it had no clear target audience
- Lesson: internal developer tools need product-market fit just like external products

### 6. The Responsible Shutdown Framework
- Migrate dependent teams first
- Delete the code completely — leave no mess
- Publish a retrospective — be candid about what went wrong
- Result: goodwill, not blame

## Quotable Moments

1. "If you show up and you're like, 'Hey, I did the work already for you' — much easier conversation."
2. "ComponentScript was a total and complete failure, and I worked on it for like two years."
3. "Just because it was technically excellent didn't mean it was going to win."
4. "I've flipped the switch off. I just don't care." (on level anxiety at IC9)
5. "I should have listened to my gut... my reaction was I just need to write more code."

## Cross-References

Check `summaries/_index.md` for related books:

- **[[How to Win Friends and Influence People - Dale Carnegie]]** — influence without authority
- **[[Never Split the Difference - Chris Voss]]** — tactical empathy in persuasion
- **[[The 48 Laws of Power - Robert Greene]]** — Law 1 (never outshine), strategic compromise
- **[[Turn the Ship Around - L. David Marquet]]** — leader-leader model, pushing authority down
- **[[Staff Engineer - Will Larson]]** — IC career track, archetypes
- **[[An Elegant Puzzle - Will Larson]]** — engineering management, migrations
- **[[How Corporate Politics Work - Best]]** — the Ethan Evans episode on influence and politics
- **[[25 Year Old Staff Eng at Meta - Evan King]]** — another Meta IC career story, speed budget concept

## Diagram Opportunities

### 1. Adam Ernst's Career Arc (Timeline)
`flowchart LR` — CosmicSoft (2000) → Princeton → Self-employed iOS → Facebook E5 (2012) → E6 (mem models) → E7 (ComponentKit) → ComponentScript failure → IC9

### 2. The Influence Without Authority Model (Concept Map)
`flowchart TB` — Central: "Influence Without Authority" → branches: Talk in Person, Show Empathy, Give Data, Do the Work, Code Review, Find Allies

### 3. ComponentScript Failure Analysis (Cause-Effect)
`flowchart TB` — Three mistakes converging: No Target Audience + GraphQL Baggage + Went Too Wide → No Momentum → Project Death

### 4. Why ComponentKit Won vs ComponentScript Lost (Comparison)
`flowchart LR` — Parallel branches showing what worked (CK) vs what didn't (CS)

### 5. Engineer Archetypes at Meta (Concept Map)
`flowchart TB` — Five archetypes with named examples: Coding Machine, Fixer, Project Starter, Communicator, Alignment Driver

### 6. The Responsible Project Shutdown Framework (Process)
`flowchart TB` — Recognise failure → Migrate dependents → Delete code → Publish retrospective → Goodwill

### 7. Code Review Influence Cycle (Cycle)
`flowchart` — Review diff → Explain why (not just what) → Author internalises → Author reviews others the same way → Viral spread

### 8. Organic Depth-Building Loop (Cycle)
`flowchart` — Hit a blocker → Debug 8 levels deep → Fix or diagnose → Learn new system → Repeat → Encyclopaedic knowledge

## Summarisation Notes

### Recommended Structure
Interview format — question-driven sections following Adam's career chronologically, then thematic sections on influence, failure, and IC identity.

### Suggested Sections
1. The Coding Machine Identity (CosmicSoft + early career)
2. Infrastructure Crisis as Opportunity (Core Data / E6)
3. Influence Without Authority (tips + code review philosophy)
4. ComponentKit: Winning the Adoption Battle (E7)
5. ComponentScript: A Total and Complete Failure
6. The Art of the Clean Shutdown
7. The IC9 Mindset (management, domain, depth, level anxiety)
8. Engineers He Admires

### Essential Stories (must include)
1. CosmicSoft — eighth-grade software company
2. Core Data disassembly and mem models migration
3. ComponentKit adoption battle and ally-finding
4. ComponentScript's three fatal mistakes
5. The clean shutdown and retrospective

### Suggested Diagrams (minimum 4, target 6-8)
1. Career timeline (LR flowchart)
2. Influence without authority model (TB concept map)
3. ComponentScript failure analysis (TB cause-effect)
4. ComponentKit vs ComponentScript comparison
5. Engineer archetypes at Meta
6. Code review influence cycle
7. Responsible shutdown framework
