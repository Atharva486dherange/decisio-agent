# ⚡ Decisio • Meeting-to-Execution Agent
> **Voice-Native PM Workspace built for the Product Space AI Hackathon with Wispr Flow.**
> *Transforms unscripted, rambling meeting speech into reviewable decision proposals, cross-meeting conflict detection, and live Kanban execution.*

---

## 🌟 Overview
In modern agile product teams, meetings are messy. Real discussions are filled with:
- **Speech disfluencies and filler words** (*"uhm", "like", "you know"*)
- **Mid-sentence self-corrections** (*"let's launch on November 15th... no wait, load testing isn't done, make it November 22nd"*)
- **Lost commitments & ambiguous owners** (*"someone should write up the docs"*)
- **Contradicted historical decisions** (Accidentally postponing or reversing a decision agreed upon two sprints ago)

Traditional transcription tools produce a flat, passive **wall of text**. 

**Decisio turns raw spoken meeting speech into proposed decisions and tasks for human review.**

---

## 🚀 Key Features

### 1. 🎙️ Dictation Intake & Transcript Preview
- Ingests natural, unscripted speech dictated directly via **Wispr Flow** or dictated with supported browser speech recognition.
- **Speech Disfluency Diff Visualizer:** Highlights possible fillers and correction phrases as a display aid. It has no measured intent-accuracy score; original evidence is preserved.

### 2. 🛡️ Cross-Meeting Decision Conflict Ledger
- Maintains an browser-persisted **Decision Ledger** across past sprints.
- When a new meeting contradicts a historical commitment (e.g. Sprint 12 locked Launch for Nov 15, but today's discussion postponed it to Nov 22), Decisio highlights both quotes side-by-side.
- One-click resolution: **[Replace earlier decision]**, **[Keep both]**, or **[Flag for team review]**.

### 3. 🎯 Delivery Risk & Execution Reliability Radar
- Analyzes linguistic commitment strength (**Firm** vs. **Tentative** vs. **High Risk**).
- **Workload indicator:** Flags owners with multiple commitments. Scores are hand-weighted heuristics, not trained predictions or capacity estimates.

### 4. 🗣️ Spoken Review & Voice Modification
- Review and update action items hands-free using Wispr Flow voice commands:
  - *"Reassign task 1 to Rahul" or "Reject task 2"*
- The agent parses intent and mutates the board live.

### 5. 📋 Execution Board & Planning Hub
- Kanban columns with explicit status controls (**To Do**, **In Progress**, **Done**).
- Filter by team member (Rahul, Priya, Alex, Dev).
- Calendar deadlines (`datetime-local`) with configurable reminder thresholds (1h, 24h, 48h) and rolling 7-day per-owner weekly digest downloads.

### 6. 📤 Multi-Format Export
- Formatted **Slack Standup Digest** (ready to paste).
- **Linear / Jira Issue Table**.
- **Personalized Email Summaries** per team member.

---

## 🎙️ Wispr Flow Usage

1. **Usage evidence:** Capture actual Wispr Flow usage during development and dictation in the product. No usage amount or judging weight is claimed here.
2. **Built for Voice:** The product's core input assumes conversational human speech with false starts, interruptions, and natural PM voice commands.
3. **Interactive Demo Scenarios:** Built-in scenarios allow examiners to test realistic voice inputs immediately.

---

## 🛠️ Architecture & Reliability
- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend:** Node.js, Express, Vercel Serverless Functions.
- **Storage:** Browser localStorage restores the workspace. Optional Supabase writes exist, but cloud restore and user isolation are not implemented. The supplied public table policies are unsuitable for private meeting data.
- **Extraction:** Gemini proposes evidence-backed items; deterministic rules provide a limited fallback. Conflicts and task commands use app-owned rules. No uptime or accuracy guarantee is claimed.

---

## 🏃 Quick Start (Local Run)

```bash
# 1. Install dependencies
npm install

# 2. Start frontend & backend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Verification & Testing

```bash
npm test        # Run current tests; review skipped tests too
npm run lint    # Verifies code cleanliness (0 warnings, 0 errors)
npm run build   # Compiles production bundle
```

## Production configuration and remaining verification

Set server-only `GEMINI_API_KEY` and `GEMINI_MODEL=gemini-3.1-flash-lite` in Vercel. Trello requires server-only `TRELLO_API_KEY`, `TRELLO_TOKEN`, and the destination `TRELLO_LIST_ID`. Never prefix private credentials with `VITE_` or commit `.env`. Deploy the updated source after saving production variables.

Trello posting requires an approved task and explicit confirmation. The adapter records the spoken owner in the card description; it does not assign a Trello member or synchronize later edits. The current shared demo destination is not a multi-user account integration. Verify a live card and retry reconciliation before claiming the hosted integration works.

Reminders refresh while the app is open. Per-person digests are reviewable downloads; scheduled external delivery is not implemented. Wispr Flow enters text through the desktop shortcut; direct MCP import and audio-file upload are not implemented.

Before submission, test the hosted transcript-to-review-to-conflict-resolution-to-task-to-Trello flow, reopen the workspace, capture genuine Wispr usage evidence, and record the three-minute demo. Use synthetic meeting content until database ownership policies are secured.
