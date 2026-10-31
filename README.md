# Decisio — Meeting to Execution

A voice-friendly decision journal that turns meeting proposals into reviewed decisions and execution tasks.

## Run locally

```sh
npm install
npm run dev
```

The client normally uses port 5173 and proxies the API to port 3001. If that port is occupied, Vite prints another client port. Set `PORT` and `DECISIO_API_URL` together when using a different API port.

Optional `.env` configuration:

```env
PORT=3001
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

With no key, extraction uses clearly labeled limited offline rules. Conflicts and task commands always use app-owned deterministic rules. No real API request is needed for the demo.

## Implemented workflow

- Capture editable text by typing, pasting, external Wispr Flow dictation, or supported browser speech recognition.
- Extract proposed decisions and commitments, retaining supporting quotes. Unknown information stays unknown.
- Compare dated commitments against active historical decisions. Superseded decisions are ignored.
- Stage supersession, keep-both, or team-review resolutions, then commit approved tasks and new decisions.
- Use a shared execution board with status buttons, drag-and-drop, owner filtering, and manual tasks.
- Search the workspace, inspect explicit decision links and audit history, and export markdown or JSON.
- Save workspace and draft review in this browser across refreshes.

## Supported command examples

```text
Reject task 1
Approve all tasks
Approve all except task 2, assign task 2 to Rahul
Reassign task 2 to Rahul and set priority to High
Set task 2 deadline to Friday
Mark task 2 done
```

Unsupported or ambiguous commands make no changes. During inbox review, task numbers refer to the review table. Elsewhere, they refer to the saved task numbers shown on the board. Dictation fills the command field; submitting applies it.

## Verify and build

```sh
npm test
npm run lint
npm run build
npm run build:hosted
npm test
```

The hosted build includes a same-origin Worker API and embedded frontend assets. Configure optional AI secrets in the hosting service, never in frontend build variables. A plain static build runs browser rules without a hosted AI endpoint.

## Scope

The initial ledger contains sample agreements. New changes are browser-local, not a shared team database. JSON downloads preserve exported data but cannot yet be imported. Offline extraction and conflict checks are intentionally limited. Wispr Flow works as external desktop dictation; microphone buttons use browser speech recognition. Live AI and microphone behavior require real-environment verification.

See [ARCHITECTURE.md](ARCHITECTURE.md) and [DEMO.md](DEMO.md) for architecture and submission guidance.

## Planning and Trello

Open **Planning & tracker** to set exact calendar deadlines, reminder windows, and explicit task-to-decision links. Linked open tasks appear in the meeting review change-impact preview. Reminders are displayed in the app while it is open. Weekly digests are rolling seven-day per-owner drafts with a review/download action; scheduled external delivery is not implemented.

For actual Trello posting, configure `TRELLO_API_KEY`, `TRELLO_TOKEN`, and `TRELLO_LIST_ID` on the backend and restart it. For the hosted app, configure them as server runtime secrets. Keep the destination list fixed. A ChatGPT Trello plugin connection does not transfer credentials into the standalone app.

The app checks the destination list and requires a separate confirmation before sending a task title, source quote, owner text, deadline, and priority to Trello. Only approved tasks can be posted. Calendar deadlines are optional and never inferred from phrases such as Friday. Owner names are written to the description; automatic Trello member mapping and two-way synchronization are not implemented. Retries look for an existing source marker, but distributed concurrent posting is not guaranteed to be exactly-once.
