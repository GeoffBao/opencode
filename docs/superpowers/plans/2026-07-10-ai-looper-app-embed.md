# AI Looper App Embed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Embed a sample-data AI Looper task list and TaskRun detail page inside the OpenCode Web app.

**Architecture:** Add an App-owned page module and two routes in `packages/app`, with no dependency on `packages/enterprise`. Keep the sample view-model local to the module so a later API adapter can replace it without changing route structure.

**Tech Stack:** SolidJS, `@solidjs/router`, existing App utility classes, Bun tests, TypeScript native preview.

## Global Constraints

- Keep the existing OpenCode session routes and home behavior unchanged.
- Do not add a runtime dependency from App to Enterprise.
- Use existing UI primitives and utility classes; do not add a new UI package.
- Keep Teambition/API integration out of this UI-only slice.
- Run tests and typecheck from `packages/app`, not the repository root.

---

### Task 1: Add App-owned AI Looper page model and views

**Files:**
- Create: `packages/app/src/pages/ai-looper.tsx`
- Create: `packages/app/src/pages/ai-looper.test.tsx`

**Interfaces:**
- Produces `AILooperPage` and `AILooperTaskRunPage` route components for `app.tsx`.
- Keeps sample task/detail values typed locally until the HTTP query layer is ready.

- [ ] **Step 1: Write failing route-view tests** covering list titles, track labels, detail sections, and task links.
- [ ] **Step 2: Run `bun test --preload ./happydom.ts ./src/pages/ai-looper.test.tsx` and verify the module is missing.
- [ ] **Step 3: Implement typed sample data and Solid components with stable `data-component` and `aria-label` attributes.
- [ ] **Step 4: Run the focused test and verify it passes.
- [ ] **Step 5: Run `bun --bun run typecheck` from `packages/app`.

### Task 2: Register routes without changing session routing

**Files:**
- Modify: `packages/app/src/app.tsx` near the page imports and `Routes` function.

**Interfaces:**
- Imports `AILooperPage` and `AILooperTaskRunPage` from `@/pages/ai-looper`.
- Registers `/ai-looper` and `/ai-looper/:taskRunID` outside the existing server-scoped session layouts.

- [ ] **Step 1: Add route assertions to the page test using the exported route components.
- [ ] **Step 2: Add the two routes after `/new-session`, preserving existing route order.
- [ ] **Step 3: Run the focused app tests and typecheck.

### Task 3: Add a discoverable home entry and verify production build

**Files:**
- Modify: `packages/app/src/pages/home.tsx` in the NewHome action/navigation area.
- Test: `packages/app/src/pages/ai-looper.test.tsx`.

**Interfaces:**
- Adds one Home navigation action linking to `/ai-looper`.
- Does not alter session creation or project selection behavior.

- [ ] **Step 1: Add a test-visible AI Looper link with an accessible label.
- [ ] **Step 2: Render the link using the existing navigation/button conventions.
- [ ] **Step 3: Run `bun test --preload ./happydom.ts ./src/pages/ai-looper.test.tsx`.
- [ ] **Step 4: Run `bun --bun run typecheck` from `packages/app`.
- [ ] **Step 5: Run `PATH="/opt/homebrew/bin:$PATH" bun run build` from `packages/app` and confirm Vite exits 0.
- [ ] **Step 6: Commit with `git add packages/app docs/superpowers/plans/2026-07-10-ai-looper-app-embed.md && git commit -m "feat(app): embed ai looper pages"`.

## Self-review

- Spec coverage: route entry, list view, detail view, and build verification are covered; real API and Teambition behavior are explicitly deferred.
- Placeholder scan: no TODO/TBD implementation steps are required; sample data is an intentional, typed boundary.
- Type consistency: both routes consume the page components created in Task 1, and the detail route passes `taskRunID` as a string prop.
