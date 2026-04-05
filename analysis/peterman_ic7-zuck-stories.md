---
type: podcast-analysis
series: The Peterman Pod
host: Ryan Peterman
guest: Michael Novati (Meta IC7 / Senior Staff Engineer)
title: Meta IC7 on Zuck Stories, Rapid Growth, and Code Machine Archetype
duration_minutes: ~110
date: 2026-04-05
source: YouTube ASR subtitles
youtube_id: OzlK68kcuHc
---

# Podcast Analysis — Michael Novati on The Peterman Pod

## Guest Profile

Michael Novati joined Facebook as an intern in May 2009 (between undergrad and grad school — was about to start a PhD at University of Washington in HCI). Stayed and grew from intern to Senior Staff Engineer (IC7) at a company of ~200 engineers. Now founder of Formation, a company helping engineers prepare for interviews and understand offers. One of the most prolific code committers in Facebook history. Known internally as a "coding machine."

---

## Structural Map

| Segment | Approx Position | Topic |
|---------|----------------|-------|
| Intro / Joining Meta | Opening | Why he picked Facebook in 2009, 220 engineers, culture fit |
| Culture & PHP/Hack | Early | Engineering-first culture, PHP stigma, evolution to Hack |
| Move Fast & Break Things | Early-Mid | What the motto really meant, first principles thinking |
| Culture Evolution | Mid | Engineer empowerment declining, IPO as turning point |
| The IPO Experience | Mid | NASDAQ bell at campus, Zuck's parents, vesting, stock |
| Financial Advice | Mid | Stock fluctuations, prioritize company fit over comp |
| The Weekly Novati | Mid | Internal newsletter, controversial posts, HR pushback |
| Zuck Stories | Mid | Hackathon with Zuck (emoji reactions 2009), Zuck merging a PR, the lockdown period vs Google+ |
| The Ripstick Saga | Mid | Bet with Zuck, ripstick ban, HR buying in from opponents |
| Code Heritage & Role Models | Mid-Late | Evan Priestley, early engineers, Phabricator, product infra team |
| Coding Machine Archetype | Mid-Late | What makes a coding machine, context dependency, Preparables refactoring |
| LLMs & Future of Coding | Mid-Late | Vim workflow → AI tools, 5x productivity, agentic flows, future of engineering |
| Specialist vs Coding Machine | Late | React/framework engineers, email protocol specialists, sports team analogy |
| Career Growth to IC7 | Late | 30/70 split, reporting structure, raw output vs taste/judgment |
| Taste & Judgment | Late | Cast iron patina metaphor, speed skating analogy, building intuition |
| Landing Code Fast | Late | Do-feedback-iterate cycle, three mistakes people make |
| IC7+ Group Traits | Late | Sharpness, diligence, OCD channeled productively |
| Why He Left Meta | Late | Cultural shift to "business relationship," 80% pay cut from vesting |
| Talent vs Hard Work | End | 50/50 luck, talent discovery, Formation's mission |
| Advice to Younger Self | End | Stop seeking approval, treat feedback as improvement not grades |

---

## Main Arguments

1. **The coding machine archetype is real and valuable** — One exceptional coder can outperform 4-6 senior engineers in the right context (familiar codebase). The value comes from doing things others thought impossible.

2. **Raw output stays constant; taste and judgment grow** — Michael's code volume was roughly the same from week one. What changed was his ability to make good judgment calls about what to change, when, and how to manage the social consequences.

3. **Move fast and break things was about breaking norms, not causing havoc** — The motto was about first principles thinking, not recklessness. Its removal was partly PR-driven.

4. **Engineer empowerment peaked early and declined with scale** — When Facebook was small, engineers had veto power over product decisions. As the company grew, decision-making shifted to VP-level negotiations.

5. **LLMs amplify existing skill, not replace it** — Experienced engineers with strong taste benefit most from LLMs. The tools accelerate output for people who already know what they want to build.

6. **Feedback must be treated as improvement signal, not judgment** — The most common mistake ambitious people make is seeking approval rather than genuinely internalizing feedback to grow.

7. **Internal writing can backfire despite good intentions** — The Weekly Novati was driven by Facebook's openness values but caused friction with executives and HR. In retrospect, he would not do it again.

---

## Key Stories (8)

### 1. Emoji Reactions Hackathon with Zuck (2009)
- Zuck proposed anyone should be able to put any emoji on any post as a reaction
- Michael and Tom Whitner worked with Zuck to build it during a hackathon
- Code was too bad to ship — but the idea eventually became the standard reactions feature years later
- Illustrates Zuck's product vision being years ahead

### 2. Zuck's Merged PR During Google+ Lockdown (2010)
- Facebook had a lockdown period fearing Google+ would steal users
- Michael bet Zuck at a company Q&A that Zuck couldn't commit code by end of lockdown
- If Zuck committed, Michael would stop ripsticking indoors
- Zuck actually merged a PR — winning the bet

### 3. The Ripstick Ban & HR's Buy-In Technique
- Ripsticks (two-wheeled skateboards) were scattered throughout Facebook offices, causing injuries
- Rumored that Facebook's health insurance premiums were significantly higher due to ripstick injuries
- Head of HR emailed the 5 most prominent ripstickers asking for feedback on the ban draft
- Classic technique: getting buy-in from opponents by including them in the process

### 4. The 11,000-Line Hackathon Diff
- Michael added rich text editing to Facebook Notes in a single hackathon — 11,000 lines of code
- Had to organize an in-person code review meeting because no one could review 11,000 lines
- Acknowledges "not how you build code" — illustrative of raw output without judgment

### 5. Merging Mantatuna and Cortana Task Tools
- In his first week, found two competing UIs for the same internal task management tool
- Merged the codebases without telling anyone — took the speed of the slim one with all features of the bloated one
- Posted to entire company: "The tools are merged. It's done. Deal with it."
- Overall positive reception but learned this isn't how to handle changes affecting hundreds of people

### 6. The Preparables Refactoring
- Thousands of classes using an old framework (Preparables) throughout the codebase
- Single-handedly refactored and removed every single one over several months (3,000-6,000 classes)
- Would not have happened without one person's drive — too many resources needed otherwise

### 7. "I Will Resign" — Building Trust with Push Team
- No CI at the time — the push team controlled what shipped to production
- After burning credibility by shipping something too fast, had to rebuild trust
- Told push team: "This needs to get in and if it breaks the site, I will resign"
- Says he would have actually resigned — the self-imposed pressure made him triple-check everything

### 8. Walking Out of Meetings
- Admits to walking out of meetings he deemed unproductive
- Feels bad about it in retrospect — the meeting runner probably felt terrible
- Acknowledges it was arrogant behavior he would tell his younger self to avoid

---

## Frameworks & Concepts

### The Coding Machine Archetype
- Not magic — comes from hard work, keeping code in mental RAM, obsessing over details
- Context-dependent: put a coding machine on an unfamiliar codebase and they're initially slow
- One coding machine > 4 senior engineers in a familiar codebase
- Different from the specialist/framework architect archetype

### Taste & Judgment (Cast Iron Patina Metaphor)
- Built through accumulated experience, like layers burned into a cast iron pan
- Cannot be rushed — requires years of doing, failing, learning
- Covers both code quality AND social judgment (when to change what, impact on teams)
- The speed skating analogy: reading a book about speed skating doesn't make you a speed skater

### The Do-Feedback-Iterate Cycle
Three mistakes that break the cycle:
1. Not doing anything (thinking too much, not coding enough)
2. Getting feedback from wrong people (bootcamp grad teaching bootcamp grads)
3. Treating feedback as judgment/grade rather than improvement signal

### IC7+ Traits (Common across all archetypes)
- Extreme diligence and conscientiousness
- Exceptional sharpness — can move through complex concepts very fast
- High attention to detail
- OCD channeled productively
- Can be in a room and very quickly identify issues with a proposal

### The 30/70 Split
- 30% mental space on team work (still present, reviewing code, mentoring)
- 70% on codebase-wide initiatives, refactorings, frameworks
- Worked because managers saw their job as enabling maximum impact
- Reported to junior managers but effectively dotted-line to skip+

---

## Quotable Moments

1. "This needs to get in and if it breaks the site, I will resign."
2. "This is so much better than Zuck's code." (on the reactions feature finally shipping properly)
3. "The tools are merged. It's done. Deal with it."
4. "I don't see the answer to it... If I don't have it in my head, I can't do that super fast."
5. "I was that person. I wanted to get the highest grades and I didn't really know what I was learning."
6. "Some people have more talent than others... but hard work is the one thing within your control."
7. "Put in the practice and the reps... you can't build it overnight."
8. "It was like I sat down and it just felt like I was home." (on joining Facebook)

---

## Cross-References (from summaries/_index.md)

| Vault Content | Connection |
|---------------|-----------|
| [[Meta IC9 on Influencing Engineers Failures and Learnings]] | Adam Ernst — different IC7+ archetype (influence-focused vs coding machine) |
| [[25 Year Old Staff Eng at Meta - Evan King]] | Evan King — another Meta coding machine story, different era |
| [[Meta Senior Manager on Career Growth PIPs and Culture - Stefan Mai]] | Stefan Mai — manager perspective on Meta culture evolution |
| [[How Corporate Politics Work - Best]] | Ethan Evans — empire building vs Michael's anti-political coding approach |
| [[Amazon VP on Stack Ranking PIPs and Bezos - Ethan Evans]] | Ethan Evans — contrasting culture (Amazon stack ranking vs Meta's coding machine) |
| [[Deep Work - Cal Newport]] | Meeting minimization, protecting focus time |
| [[Mastery - Robert Greene]] | Apprenticeship phase, building taste through deliberate practice |
| [[Peak - Anders Ericsson]] | Deliberate practice, feedback loops, the do-feedback-iterate cycle |
| [[So Good They Can't Ignore You - Cal Newport]] | Career capital theory — coding machine as ultimate career capital |

---

## Diagram Opportunities (7)

### 1. Michael's Career Arc at Facebook (Timeline)
Intern 2009 → Full-time → IC growth → IPO 2012 → Culture shift → IC7 → Departure → Formation founder

### 2. Coding Machine vs Specialist Archetype (Comparison)
Two branches: Coding Machine (breadth, refactoring, cleanup, volume) vs Specialist (depth, abstractions, frameworks, elegance)

### 3. The Do-Feedback-Iterate Cycle (Cycle)
Do something → Get feedback from experienced people → Action the feedback → Repeat (with three failure modes branching off)

### 4. Facebook Culture Evolution (Timeline/Flow)
Engineer-driven decisions → IPO pressure → Business relationship → VP-level negotiations → Coding machine still valued but differently

### 5. Taste & Judgment Growth Model (Flowchart)
Raw output (constant) + Accumulated experience → Better judgment calls → Wider scope of impact → IC7

### 6. IC7+ Common Traits (Concept Map)
Central node: IC7+ traits → Sharpness, Diligence, Detail obsession, OCD channeled productively, Speed of concept navigation

### 7. LLM Impact on Engineering (Flowchart)
Vim era → Modern IDE → LLM-assisted coding (current) → Agentic flows (emerging) → AI-autonomous coding (future)
