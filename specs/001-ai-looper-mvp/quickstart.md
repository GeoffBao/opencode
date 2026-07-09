# Quickstart: AI Looper MVP

This quickstart describes the intended implementation and verification path. It
is not an instruction to run tests from the repository root.

## 1. Review the feature artifacts

Read these files before implementation:

- `specs/001-ai-looper-mvp/spec.md`
- `specs/001-ai-looper-mvp/plan.md`
- `specs/001-ai-looper-mvp/research.md`
- `specs/001-ai-looper-mvp/data-model.md`
- `specs/001-ai-looper-mvp/contracts/ai-looper-api.yaml`

## 2. Implement package layers in dependency order

1. Add shared AI Looper schemas in `packages/schema/src/ai-looper.ts`.
2. Add protocol contracts in `packages/protocol/src/ai-looper.ts`.
3. Add core durable services under `packages/core/src/ai-looper/`.
4. Add server handlers in `packages/server/src/handlers/ai-looper.ts`.
5. Add enterprise UI routes under `packages/enterprise/src/routes/ai-looper*`.
6. If public Protocol or Server `HttpApi` changes, run `bun run generate` from
   `packages/client` and do not edit generated files manually.

## 3. MVP happy-path scenario

Use a prepared Teambition task assigned to the signed-in engineer.

1. List assigned tasks in the AI Looper workbench.
2. Open a task and verify original Teambition source content, work item type, and
   AI interpretation are visibly separate.
3. Start or reuse a TaskRun for the authorized workspace.
4. Record a routing decision:
   - large feature or large task → `spec_driven`;
   - smaller task or small requirement → `standard_task` with an OpenSpec-style
     lightweight task brief;
   - bug → `bugfix`.
5. For `spec_driven`, generate requirement interpretation and execution plan.
6. For `standard_task`, confirm the lightweight task brief as the responsible
   engineer unless policy, size, or risk escalates it to formal approval.
7. For `bugfix`, record reproduction evidence or a non-reproducible blocker and
   confirm the fix plan; escalate high-risk bugs to formal approval.
8. Resolve authorized reviewer from Teambition task/project configuration when
   formal approval is required.
9. Approve the exact execution plan version when the selected track requires it.
10. Invoke the opencode Coding Runtime adapter using
    `contracts/runtime-adapter.md`.
11. Record changed artifacts and verification evidence.
12. Generate a delivery summary and enqueue an idempotent Teambition write.
13. Generate a worktime draft.
14. Have the responsible engineer edit or confirm the actual worktime and enqueue
    an idempotent Teambition worktime write.
15. Optionally record reusable Spec, template, lesson, prompt, checklist, or Skill
    candidates as non-authoritative asset candidates for later governed review.

## 4. Required failure and boundary checks

Implementation is not complete until these checks exist in affected package test
suites:

- Source task missing, inaccessible, deleted, archived, or reassigned.
- Source task work item type missing, unsupported, or changed after routing.
- Large feature/task routes to spec-driven and blocks implementation until plan
  approval exists.
- Small task routes to standard-task and blocks implementation until the
  responsible engineer confirms the lightweight task brief.
- Bug routes to bugfix and blocks completion until reproduction evidence or a
  non-reproducible blocker exists.
- High-risk bug escalates to formal approval.
- Plan reviewer cannot be resolved from Teambition task/project configuration.
- Unauthorized user attempts to approve a plan.
- Reviewer approves a stale plan version.
- Coding Runtime reports success but required evidence is missing.
- Human acceptance evidence is missing actor, time, criterion, or explanation.
- Agent Session ends before acceptance criteria pass.
- Process restarts after committed progress.
- Service returns after interruption and active TaskRuns continue, wait, or enter
  visible blocked state within 15 minutes.
- Duplicate approval event, duplicate delivery-summary write, duplicate worktime
  submission, and out-of-order external event.
- Service interruption occurs during Teambition write.
- Responsible engineer has not confirmed worktime.
- Non-responsible user or Coding Runtime attempts to submit worktime.
- User cancels active TaskRun and cleanup/unresolved effects are visible.
- Reusable Spec/Knowledge/Skill candidates are recorded as candidates only and
  are not automatically published to a project, department, or enterprise catalog.

## 5. Verification commands

Run commands only from affected package directories, following `AGENTS.md`.
Expected commands after implementation will include:

```bash
cd packages/schema
bun typecheck

cd ../protocol
bun typecheck

cd ../core
bun test
bun typecheck

cd ../server
bun test
bun typecheck

cd ../enterprise
bun test
bun typecheck
```

If generated client artifacts are affected:

```bash
cd packages/client
bun run generate
bun typecheck
```

## 6. Release-readiness evidence

Before declaring the MVP complete, collect:

- TaskRun state-transition test results.
- Recovery and duplicate-event fault-injection test results.
- Authorization test results for task visibility, plan approval, human evidence,
  cancellation, and worktime submission.
- Teambition outbox idempotency evidence.
- Sample audit records for approvals, transitions, writes, retries,
  cancellations, and human interventions.
- A pilot task transcript showing source task, requirement interpretation, plan,
  approval, runtime attempt, evidence, delivery summary, and confirmed worktime.
