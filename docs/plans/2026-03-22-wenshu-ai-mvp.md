# 文枢AI MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a V1 MVP of WenShu AI that lets users log in, manage novels and chapters, write in an online editor, generate outlines/openings/continuations with AI, manage character cards, scan sensitive words, and use a basic membership/quota system.

**Architecture:** Use a single repository with two apps: `apps/web` for the Next.js client and `apps/api` for the NestJS API. Keep the runtime architecture as a single deployable system conceptually, but separate frontend/backend code in-repo for maintainability. Start with REST APIs, PostgreSQL for core relational data, Redis for rate limit and generation jobs, and third-party LLM APIs for AI features.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, NestJS, PostgreSQL, Prisma, Redis, Tiptap, Docker, Jest, Playwright

---

## Recommended Repository Layout

```text
.
├─ apps/
│  ├─ web/
│  │  ├─ src/app/
│  │  ├─ src/components/
│  │  ├─ src/lib/
│  │  └─ tests/
│  └─ api/
│     ├─ src/modules/
│     ├─ prisma/
│     └─ test/
├─ docs/
│  └─ plans/
├─ infra/
│  └─ docker-compose.yml
└─ package.json
```

## Milestones

1. Foundation: workspace, code quality, infra, database, auth scaffold
2. Alpha: novel/chapter management, editor, AI generation core
3. Beta: character cards, sensitive words, export, membership/quota
4. Launch: polish, monitoring, backups, e2e, deployment

## Assumptions

- The repo is currently empty, so this plan defines the initial project structure.
- V1 uses responsive Web only, no native app and no offline mode.
- WeChat login is implemented as the primary auth path; phone binding can be deferred until after core flow is stable.
- Payments can start with a mocked membership toggle in staging, then connect WeChat Pay before production.
- AI generation uses third-party APIs only; there is no model fine-tuning in V1.

### Task 1: Bootstrap the workspace

**Files:**
- Create: `package.json`
- Create: `apps/web/package.json`
- Create: `apps/api/package.json`
- Create: `infra/docker-compose.yml`
- Create: `.gitignore`
- Create: `.editorconfig`
- Create: `README.md`

**Step 1: Initialize the root workspace**

Run: `npm init -y`

Expected: root `package.json` exists.

**Step 2: Create the frontend app**

Run: `npx create-next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack`

Expected: `apps/web` boots locally.

**Step 3: Create the backend app**

Run: `npx @nestjs/cli new apps/api --package-manager npm`

Expected: `apps/api` starts with the default Nest app.

**Step 4: Add local infra**

Create `infra/docker-compose.yml` with PostgreSQL and Redis services.

Expected: `docker compose -f infra/docker-compose.yml up -d` starts both services.

**Step 5: Commit**

Run: `git add . && git commit -m "chore: bootstrap wenshu ai workspace"`

### Task 2: Establish shared engineering standards

**Files:**
- Modify: `package.json`
- Create: `.nvmrc`
- Create: `.npmrc`
- Create: `apps/web/.env.example`
- Create: `apps/api/.env.example`
- Create: `.github/workflows/ci.yml`

**Step 1: Add root scripts**

Add workspace scripts for `dev`, `lint`, `test`, `build`, and `format`.

**Step 2: Add environment templates**

Define placeholders for database URL, Redis URL, JWT secret, WeChat app keys, OSS keys, and AI provider keys.

**Step 3: Add CI**

Run lint, unit tests, and build checks on every push.

**Step 4: Verify**

Run: `npm run lint` and `npm run build`

Expected: both apps pass baseline checks.

**Step 5: Commit**

Run: `git add . && git commit -m "chore: add repo standards and ci"`

### Task 3: Model the database

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/*`
- Create: `apps/api/src/modules/prisma/prisma.module.ts`
- Create: `apps/api/src/modules/prisma/prisma.service.ts`
- Test: `apps/api/test/prisma/schema.e2e-spec.ts`

**Step 1: Define the first schema**

Add models for `User`, `Novel`, `Chapter`, `Character`, `Outline`, and `GenerationLog`.

**Step 2: Capture required V1 fields**

Include membership type, expiry time, novel genre/synopsis, chapter word count/sort order, and generation metadata.

**Step 3: Create the initial migration**

Run: `npx prisma migrate dev --name init_core_models`

Expected: migration files are created successfully.

**Step 4: Add a schema smoke test**

Run: `npm run test --workspace apps/api -- schema`

Expected: test can connect and read/write a seeded row.

**Step 5: Commit**

Run: `git add . && git commit -m "feat: add core database schema"`

### Task 4: Build auth and user profile foundations

**Files:**
- Create: `apps/api/src/modules/auth/auth.module.ts`
- Create: `apps/api/src/modules/auth/auth.controller.ts`
- Create: `apps/api/src/modules/auth/auth.service.ts`
- Create: `apps/api/src/modules/users/users.module.ts`
- Create: `apps/api/src/modules/users/users.controller.ts`
- Create: `apps/api/src/modules/users/users.service.ts`
- Create: `apps/web/src/app/login/page.tsx`
- Create: `apps/web/src/app/settings/page.tsx`
- Create: `apps/web/src/lib/auth.ts`
- Test: `apps/api/test/auth/auth.e2e-spec.ts`

**Step 1: Add WeChat login callback flow**

Support openid-based account creation and session issuance.

**Step 2: Add current-user endpoint**

Expose profile data for nickname, avatar, preferred genre, and membership status.

**Step 3: Add settings update flow**

Allow nickname, avatar, and genre updates.

**Step 4: Verify**

Run: `npm run test --workspace apps/api -- auth`

Expected: login callback creates or reuses a user and returns a valid session.

**Step 5: Commit**

Run: `git add . && git commit -m "feat: add auth and profile foundation"`

### Task 5: Implement novel CRUD

**Files:**
- Create: `apps/api/src/modules/novels/novels.module.ts`
- Create: `apps/api/src/modules/novels/novels.controller.ts`
- Create: `apps/api/src/modules/novels/novels.service.ts`
- Create: `apps/web/src/app/dashboard/page.tsx`
- Create: `apps/web/src/app/novels/new/page.tsx`
- Create: `apps/web/src/components/novel/novel-card.tsx`
- Test: `apps/api/test/novels/novels.e2e-spec.ts`

**Step 1: Add create/list/delete endpoints**

Support title, genre, synopsis, and update-time ordering.

**Step 2: Add dashboard page**

Render card list with total word count and update time.

**Step 3: Add create-novel form**

Enforce required fields for title and genre.

**Step 4: Verify**

Run: `npm run test --workspace apps/api -- novels`

Expected: novel CRUD works for the authenticated user only.

**Step 5: Commit**

Run: `git add . && git commit -m "feat: add novel management"`

### Task 6: Implement chapter CRUD and ordering

**Files:**
- Create: `apps/api/src/modules/chapters/chapters.module.ts`
- Create: `apps/api/src/modules/chapters/chapters.controller.ts`
- Create: `apps/api/src/modules/chapters/chapters.service.ts`
- Create: `apps/web/src/app/novels/[novelId]/page.tsx`
- Create: `apps/web/src/components/chapter/chapter-list.tsx`
- Create: `apps/web/src/components/chapter/chapter-row.tsx`
- Test: `apps/api/test/chapters/chapters.e2e-spec.ts`

**Step 1: Add create/edit/delete/reorder endpoints**

Return chapter word count and sort order.

**Step 2: Build chapter list UI**

Support add chapter, rename chapter, delete with confirmation, and drag-sort or explicit move actions.

**Step 3: Keep aggregate counts updated**

Recalculate novel total words when chapter content changes.

**Step 4: Verify**

Run: `npm run test --workspace apps/api -- chapters`

Expected: ordering and ownership rules work correctly.

**Step 5: Commit**

Run: `git add . && git commit -m "feat: add chapter management"`

### Task 7: Build the writing editor

**Files:**
- Create: `apps/web/src/app/novels/[novelId]/chapters/[chapterId]/page.tsx`
- Create: `apps/web/src/components/editor/writer-editor.tsx`
- Create: `apps/web/src/components/editor/editor-toolbar.tsx`
- Create: `apps/web/src/components/editor/editor-status-bar.tsx`
- Create: `apps/web/src/lib/word-count.ts`
- Modify: `apps/api/src/modules/chapters/chapters.controller.ts`
- Test: `apps/web/tests/editor.spec.ts`

**Step 1: Integrate Tiptap**

Provide simple formatting only: paragraph, bold, italic, separators.

**Step 2: Add autosave**

Save every 30 seconds and on idle blur.

**Step 3: Add word count and total count**

Show current chapter count and novel total count in the status bar.

**Step 4: Add full-screen mode**

Provide a button and keyboard shortcut.

**Step 5: Verify**

Run: `npm run test --workspace apps/web -- editor`

Expected: typing persists and autosave survives refresh.

### Task 8: Add outline management

**Files:**
- Create: `apps/api/src/modules/outlines/outlines.module.ts`
- Create: `apps/api/src/modules/outlines/outlines.controller.ts`
- Create: `apps/api/src/modules/outlines/outlines.service.ts`
- Create: `apps/web/src/components/ai/outline-panel.tsx`
- Test: `apps/api/test/outlines/outlines.e2e-spec.ts`

**Step 1: Add outline CRUD**

Allow multiple versions per novel.

**Step 2: Link outline selection to the editor**

Selected outline version should be available to AI generation requests.

**Step 3: Verify**

Run: `npm run test --workspace apps/api -- outlines`

Expected: versioned outlines are saved and retrieved correctly.

**Step 4: Commit**

Run: `git add . && git commit -m "feat: add outline management"`

### Task 9: Implement character card management

**Files:**
- Create: `apps/api/src/modules/characters/characters.module.ts`
- Create: `apps/api/src/modules/characters/characters.controller.ts`
- Create: `apps/api/src/modules/characters/characters.service.ts`
- Create: `apps/web/src/app/novels/[novelId]/characters/page.tsx`
- Create: `apps/web/src/components/character/character-form.tsx`
- Create: `apps/web/src/components/character/character-card.tsx`
- Test: `apps/api/test/characters/characters.e2e-spec.ts`

**Step 1: Add character CRUD**

Support name, identity, personality, appearance, background, and extra settings.

**Step 2: Build the character page**

Show cards with edit/delete actions.

**Step 3: Add select-for-generation support**

Return chosen character cards in the AI request payload.

**Step 4: Verify**

Run: `npm run test --workspace apps/api -- characters`

Expected: characters remain scoped to a single novel and user.

**Step 5: Commit**

Run: `git add . && git commit -m "feat: add character cards"`

### Task 10: Build the AI generation backend

**Files:**
- Create: `apps/api/src/modules/ai/ai.module.ts`
- Create: `apps/api/src/modules/ai/ai.controller.ts`
- Create: `apps/api/src/modules/ai/ai.service.ts`
- Create: `apps/api/src/modules/ai/providers/provider.interface.ts`
- Create: `apps/api/src/modules/ai/providers/claude.provider.ts`
- Create: `apps/api/src/modules/ai/providers/qwen.provider.ts`
- Create: `apps/api/src/modules/ai/providers/deepseek.provider.ts`
- Create: `apps/api/src/modules/ai/prompt-builder.ts`
- Create: `apps/api/src/modules/generation-logs/generation-logs.service.ts`
- Test: `apps/api/test/ai/ai.e2e-spec.ts`

**Step 1: Add generation request types**

Support `outline`, `opening`, `continuation`, `expand`, `shorten`, `rewrite`, and `inspiration`.

**Step 2: Implement prompt assembly**

Inject selected character cards, selected outline, recent two chapters, and optional user instructions.

**Step 3: Stream results**

Return token streams for better perceived performance.

**Step 4: Persist generation logs**

Store type, prompt snapshot, result, model, and related novel/chapter IDs.

**Step 5: Verify**

Run: `npm run test --workspace apps/api -- ai`

Expected: provider adapter can be mocked and generation requests produce logged outputs.

### Task 11: Build the AI generation UI

**Files:**
- Create: `apps/web/src/components/ai/generation-drawer.tsx`
- Create: `apps/web/src/components/ai/generation-form.tsx`
- Create: `apps/web/src/components/ai/generation-result.tsx`
- Create: `apps/web/src/components/ai/selection-actions.tsx`
- Test: `apps/web/tests/ai-generation.spec.ts`

**Step 1: Add entry points**

Expose buttons for outline generation, opening generation, continuation, and selected-text actions.

**Step 2: Add dual-result comparison**

For outline and opening requests, show two candidate versions side by side.

**Step 3: Add insert/replace/save flows**

Allow users to insert content into the current chapter or save it as an outline version.

**Step 4: Verify**

Run: `npm run test --workspace apps/web -- ai-generation`

Expected: streamed text renders progressively and user actions apply the chosen output correctly.

**Step 5: Commit**

Run: `git add . && git commit -m "feat: add ai generation ui"`

### Task 12: Add sensitive word scanning

**Files:**
- Create: `apps/api/src/modules/compliance/compliance.module.ts`
- Create: `apps/api/src/modules/compliance/compliance.controller.ts`
- Create: `apps/api/src/modules/compliance/compliance.service.ts`
- Create: `apps/api/src/modules/compliance/sensitive-words.ts`
- Create: `apps/web/src/components/compliance/sensitive-word-panel.tsx`
- Test: `apps/api/test/compliance/compliance.e2e-spec.ts`

**Step 1: Add scan endpoint**

Return flagged words with offsets and replacement suggestions.

**Step 2: Add editor integration**

Highlight findings and allow one-click replacement.

**Step 3: Add post-generation scan**

Every AI output should be scanned before user insertion.

**Step 4: Verify**

Run: `npm run test --workspace apps/api -- compliance`

Expected: flagged words are returned consistently for chapter scans and AI results.

**Step 5: Commit**

Run: `git add . && git commit -m "feat: add sensitive word scanning"`

### Task 13: Add free quota and membership controls

**Files:**
- Create: `apps/api/src/modules/membership/membership.module.ts`
- Create: `apps/api/src/modules/membership/membership.controller.ts`
- Create: `apps/api/src/modules/membership/membership.service.ts`
- Create: `apps/web/src/app/membership/page.tsx`
- Create: `apps/web/src/components/membership/membership-card.tsx`
- Modify: `apps/api/src/modules/ai/ai.service.ts`
- Test: `apps/api/test/membership/membership.e2e-spec.ts`

**Step 1: Add quota rules**

Free users get 30 AI generations per day. Members bypass the daily limit.

**Step 2: Count generation usage**

Track daily usage per user in Redis or database.

**Step 3: Build membership page**

Show current plan, expiry time, and upgrade options.

**Step 4: Stub payment integration**

For MVP development, add a service boundary for WeChat Pay without completing settlement logic yet.

**Step 5: Verify**

Run: `npm run test --workspace apps/api -- membership`

Expected: free-user overages are blocked and members continue normally.

### Task 14: Add export and backup-friendly data flows

**Files:**
- Create: `apps/api/src/modules/export/export.module.ts`
- Create: `apps/api/src/modules/export/export.controller.ts`
- Create: `apps/api/src/modules/export/export.service.ts`
- Create: `apps/web/src/components/export/export-button.tsx`
- Test: `apps/api/test/export/export.e2e-spec.ts`

**Step 1: Add chapter TXT export**

Generate a single chapter plain-text file.

**Step 2: Add full novel TXT export**

Concatenate chapters in sort order with clean separators.

**Step 3: Verify**

Run: `npm run test --workspace apps/api -- export`

Expected: exported content preserves chapter order and text content.

**Step 4: Commit**

Run: `git add . && git commit -m "feat: add txt export"`

### Task 15: Harden the product for launch

**Files:**
- Create: `apps/web/tests/e2e/onboarding.spec.ts`
- Create: `apps/web/tests/e2e/write-and-generate.spec.ts`
- Create: `apps/web/tests/e2e/compliance-and-export.spec.ts`
- Create: `apps/api/src/common/filters/http-exception.filter.ts`
- Create: `apps/api/src/common/interceptors/logging.interceptor.ts`
- Create: `docs/launch-checklist.md`
- Modify: `README.md`

**Step 1: Add end-to-end coverage**

Cover login, create novel, add chapter, write, generate, scan, and export.

**Step 2: Add observability basics**

Structured request logging, error normalization, and health-check endpoints.

**Step 3: Add launch checklist**

Include env setup, database backup, Redis config, OSS config, and content moderation checks.

**Step 4: Verify**

Run: `npm run test:e2e --workspace apps/web`

Expected: the main author workflow passes in staging-like configuration.

**Step 5: Commit**

Run: `git add . && git commit -m "chore: prepare launch checklist and e2e coverage"`

## Delivery Order

1. Task 1-3: foundation and schema
2. Task 4-7: login, work management, editor
3. Task 8-11: outlines, characters, AI generation
4. Task 12-14: compliance, quota, export
5. Task 15: launch hardening

## Out-of-Scope for This MVP

- Knowledge graph consistency engine
- Custom style fine-tuning or LoRA
- Multi-user collaboration
- Native desktop/mobile app
- One-click submission to novel platforms
- Originality detection and plagiarism scanning

## Suggested Sprint Split

- Sprint 1: Task 1-4
- Sprint 2: Task 5-7
- Sprint 3: Task 8-11
- Sprint 4: Task 12-15

## Risks to Watch While Implementing

- WeChat login and WeChat Pay are both external integration risks; isolate them behind service interfaces early.
- AI cost control depends on context trimming and generation caps; measure token usage from the first integration.
- Tiptap data format must stay stable between frontend and backend; decide early whether source-of-truth content is HTML or JSON.
- Sensitive-word detection should expose exact offsets, or the editor highlight experience will be fragile.

Plan complete and saved to `docs/plans/2026-03-22-wenshu-ai-mvp.md`.

Two execution options:

1. Subagent-Driven (this session) - Implement task-by-task in this session and review after each block.
2. Parallel Session (separate) - Use the plan as a dedicated execution handoff and build in a separate session.
