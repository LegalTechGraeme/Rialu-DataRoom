# Architecture

This document describes how Rialu is structured and the main design choices behind the implementation.

## System overview

Rialu is an npm **monorepo** with two workspaces:

| Package | Role |
|---------|------|
| `client` | SPA served by Vite in dev; static build in production |
| `server` | REST API on port 3001; Vite proxies `/api` in development |

There is no separate database. Persistent state uses the filesystem:

| Store | Location | Purpose |
|-------|----------|---------|
| Simulation seed | `simulation/manifest.json` + `simulation/files/` | Read-only demo matter `matter-acme` |
| User matters | `data/matters/{id}/` | Created at runtime; **gitignored** |
| Document reviews | `data/reviews/` | Per-document diligence flags and notes |
| AI analyses | `data/analyses/` | Cached Groq analysis JSON |
| Workflow tasks | `server/data/tasks/` | Per-matter task JSON |

## Request flow

```
Browser → client (React)
       → fetch("/api/…")  [Vite proxy in dev]
       → server/src/index.js
       → route handler / store / AI service
       → JSON response
```

## Server modules

### Core (`server/src/`)

| Module | Responsibility |
|--------|----------------|
| `index.js` | Express app, route mounting, upload & export endpoints |
| `matterStore.js` | Matter CRUD, folder trees, document index |
| `simulationLoader.js` | Loads and caches `simulation/manifest.json` |
| `fileResolver.js` | Resolves `storagePath` to absolute file on disk |
| `reviewStore.js` | Document review persistence |
| `uploadService.js` | Multipart ingest, auto-classification, refile |
| `documentTextService.js` | Text extraction for interactive preview |
| `taskStore.js` | Workflow task CRUD, comments, demo seed |
| `ddOrchestrator.js` | Full-matter AI review job orchestration |
| `aiJobManager.js` | Background job queue for batch analysis |
| `exportService.js` | PPTX and XLSX diligence report generation |

### Routes (`server/src/routes/`)

| Router | Prefix | Notes |
|--------|--------|-------|
| `taskRoutes.js` | `/api` | Users, tasks, summary |
| `aiRoutes.js` | `/api` | Analyze, synthesize, chat |

### AI (`server/src/ai/`)

| Module | Responsibility |
|--------|----------------|
| `groqClient.js` | HTTP client for Groq chat completions |
| `documentAnalyzer.js` | Per-document prompt + structured JSON output |
| `documentClassifier.js` | Folder/category assignment on upload |
| `simulationCatalogText.js` | Rich `previewText` fallback for demo PDFs |

## Client modules

### Pages (`client/src/pages/`)

Route-level containers: matters list, matter dashboard, data room explorer, document viewer, workflow, diligence report, risks, chat.

### Components (`client/src/components/`)

Organised by domain:

- `document/` — viewer, interactive preview, workflow side panel
- `explorer/` — folder tree, document table
- `workflow/` — tasks, assignment modals, team workload
- `layout/` — shell, sidebar, topbar
- `auth/` — role picker, user badge

### Services (`client/src/services/`)

Thin typed wrappers around `fetch("/api/…")`. Keeps components free of URL strings and response parsing.

### Hooks (`client/src/hooks/`)

Shared client logic (e.g. `useDocumentText` — loads preview text with catalog fallback).

## Key design decisions

### 1. Catalog text for demo PDFs

Many demo PDFs are image-based or thin on extractable text. For `matter-acme`, `previewText` in the simulation manifest provides rich content for the interactive review tab. `documentTextService.js` prefers catalog text when PDF extraction returns fewer than ~80 characters.

### 2. JSON file stores instead of a database

Appropriate for a portfolio demo: zero infra, easy to inspect, and clear separation between committed seed data (`simulation/`) and local runtime state (`data/`, gitignored). A production system would use Postgres + object storage.

### 3. Role-based demo auth (no persistence)

`UserContext` holds the selected demo user in memory only. Full page reload returns to the role picker — intentional for demo and portfolio review.

### 4. Task deep-linking with text offsets

Workflow tasks can reference a document passage via `selectedText` and optional `textStart`/`textEnd`. The document viewer highlights the passage when opened with `?task={id}`. Offset matching uses normalized substring search (`client/src/lib/textMatch.ts`).

### 5. Monorepo with npm workspaces

Single `npm install` at the root, shared lockfile, and `concurrently` for local dev. CI runs `npm run build -w client` only; server is plain Node.js with no compile step.

## API surface (selected)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/matters` | List matters |
| `GET` | `/api/matters/:id` | Matter detail + dashboard stats |
| `GET` | `/api/matters/:id/folders/tree` | Folder hierarchy |
| `GET` | `/api/matters/:id/folders/:folderId/documents` | Documents in folder subtree |
| `GET` | `/api/matters/:id/documents/:docId` | Document metadata + review |
| `GET` | `/api/matters/:id/documents/:docId/text` | Extracted / catalog text |
| `GET` | `/api/matters/:id/documents/:docId/file` | Raw file stream |
| `PUT` | `/api/matters/:id/documents/:docId/review` | Upsert diligence review |
| `GET` | `/api/matters/:id/tasks` | Workflow tasks |
| `POST` | `/api/matters/:id/tasks` | Create task |
| `GET` | `/api/users` | Demo team roster |

Full list: see route definitions in `server/src/index.js` and `server/src/routes/`.

## Regenerating demo data

```bash
npm run dataroom:generate   # PDFs + folder tree → demo-data-rooms/
npm run simulate:generate   # Pack into simulation/manifest.json + files/
```

The committed `simulation/` directory is what the app loads for `matter-acme` out of the box.
