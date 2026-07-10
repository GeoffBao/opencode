# Tasks: AI Looper MVP

**Input**: Design documents from `/specs/001-ai-looper-mvp/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Verification tasks are REQUIRED by the feature specification and project constitution. Tests must be written before implementation and run from affected package directories, never from the repository root.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish AI Looper package structure, contract placeholders, and feature configuration.

- [X] T001 Create AI Looper schema module placeholder in `packages/schema/src/ai-looper.ts`
- [X] T002 Create AI Looper protocol module placeholder in `packages/protocol/src/ai-looper.ts`
- [X] T003 Create AI Looper core module directory in `packages/core/src/ai-looper/`
- [X] T004 [P] Create AI Looper server handler placeholder in `packages/server/src/handlers/ai-looper.ts`
- [X] T005 [P] Create AI Looper enterprise route placeholder in `packages/enterprise/src/routes/ai-looper.tsx`
- [X] T006 [P] Create AI Looper TaskRun detail route placeholder in `packages/enterprise/src/routes/ai-looper/[taskRunID].tsx`
- [X] T007 Add AI Looper config module following self-export pattern in `packages/core/src/config/ai-looper.ts`
- [X] T008 Update core config exports for AI Looper in `packages/core/src/config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Durable TaskRun domain, contracts, guards, storage, adapters, audit, and verification scaffolding that all user stories depend on.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T009 Define shared SourceTask, TaskCapsule, TaskRun, RoutingDecision, ApprovalDecision, Artifact, Evidence, ExternalEvent, ExternalWrite, WorktimeDraft, KnowledgeAssetCandidate, and PublishedTeamAsset schemas in `packages/schema/src/ai-looper.ts`
- [X] T010 Define AI Looper protocol request/response contracts matching `specs/001-ai-looper-mvp/contracts/ai-looper-api.yaml` in `packages/protocol/src/ai-looper.ts`
- [X] T011 Define RuntimeAdapter input/output types matching `specs/001-ai-looper-mvp/contracts/runtime-adapter.md` in `packages/core/src/ai-looper/runtime.ts`
- [X] T012 Define TeambitionAdapter interface and transport-neutral capability boundary in `packages/core/src/ai-looper/teambition.ts`
- [X] T013 Define TaskRun state machine phases, dispositions, lifecycle, and gate states in `packages/core/src/ai-looper/taskrun.ts`
- [X] T014 Define deterministic transition guard skeleton for allowed edges, evidence, authority, retry budget, and idempotency in `packages/core/src/ai-looper/taskrun.ts`
- [X] T015 Define execution-track routing policy for spec-driven, standard-task, and bugfix in `packages/core/src/ai-looper/routing.ts`
- [X] T016 Define evidence validation and completion guard skeleton in `packages/core/src/ai-looper/evidence.ts`
- [X] T017 Define idempotent outbox/inbox model skeleton for external writes and inbound events in `packages/core/src/ai-looper/outbox.ts`
- [X] T018 Define audit record helper skeleton for transitions, approvals, writes, retries, cancellations, and interventions in `packages/core/src/ai-looper/audit.ts`
- [X] T019 Define AI Looper database schema and migrations following snake_case Drizzle conventions in `packages/core/src/ai-looper/sql.ts`
- [X] T020 [P] Add schema type tests for AI Looper entities in `packages/schema/test/ai-looper.test.ts`
- [X] T021 [P] Add protocol contract tests for AI Looper API shapes in `packages/protocol/test/ai-looper.test.ts`
- [X] T022 [P] Add TaskRun transition guard unit tests in `packages/core/test/ai-looper/taskrun.test.ts`
- [X] T023 [P] Add routing policy unit tests for feature/task/bug and size/risk escalation in `packages/core/test/ai-looper/routing.test.ts`
- [X] T024 [P] Add idempotency unit tests for ExternalEvent and ExternalWrite keys in `packages/core/test/ai-looper/outbox.test.ts`
- [X] T025 [P] Add audit helper unit tests in `packages/core/test/ai-looper/audit.test.ts`
- [X] T026 Register AI Looper server routes in `packages/server/src/routes.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Understand an Assigned Task (Priority: P1) 🎯 MVP

**Goal**: Engineers can see authorized Teambition work items with original source content, work item type, AI interpretation, and execution track.

**Independent Test**: Use prepared Teambition feature/task/bug items and verify the workbench shows authorized tasks, source traceability, missing-content state, source type, and routing decision without starting implementation.

### Tests for User Story 1

- [X] T027 [P] [US1] Add contract test for `GET /ai-looper/tasks` in `packages/server/test/contract/ai-looper-tasks.test.ts`
- [X] T028 [P] [US1] Add contract test for `GET /ai-looper/tasks/{taskCapsuleId}` in `packages/server/test/contract/ai-looper-task-detail.test.ts`
- [X] T029 [P] [US1] Add integration test for authorized personal Teambition task list import in `packages/core/test/ai-looper/teambition-import.test.ts`
- [X] T030 [P] [US1] Add integration test for source content vs AI interpretation separation in `packages/enterprise/test/ai-looper-task-view.test.tsx`
- [X] T031 [P] [US1] Add routing integration test for feature/task/bug to execution tracks in `packages/core/test/ai-looper/routing-integration.test.ts`

### Implementation for User Story 1

- [X] T032 [US1] Implement Teambition assigned work item listing via TeambitionAdapter in `packages/core/src/ai-looper/teambition.ts`
- [X] T033 [US1] Implement SourceTask snapshot creation and visibility states in `packages/core/src/ai-looper/taskrun.ts`
- [X] T034 [US1] Implement TaskCapsule creation and active TaskRun lookup in `packages/core/src/ai-looper/taskrun.ts`
- [X] T035 [US1] Implement routing decision creation for feature/task/bug and size/risk in `packages/core/src/ai-looper/routing.ts`
- [X] T036 [US1] Implement missing, inaccessible, deleted, archived, and reassigned source handling in `packages/core/src/ai-looper/teambition.ts`
- [X] T037 [US1] Implement `GET /ai-looper/tasks` handler in `packages/server/src/handlers/ai-looper.ts`
- [X] T038 [US1] Implement `GET /ai-looper/tasks/{taskCapsuleId}` handler in `packages/server/src/handlers/ai-looper.ts`
- [X] T039 [US1] Render assigned task list with source type and execution track in `packages/enterprise/src/routes/ai-looper.tsx`
- [X] T040 [US1] Render task detail with original source, attachments, acceptance criteria, and AI interpretation sections in `packages/enterprise/src/routes/ai-looper/[taskRunID].tsx`
- [X] T041 [US1] Record audit entries for source retrieval and routing decisions in `packages/core/src/ai-looper/audit.ts`

**Checkpoint**: US1 independently demoable.

---

## Phase 4: User Story 2 - Review and Start an Execution Plan (Priority: P2)

**Goal**: Authorized reviewers approve/reject spec-driven plans; engineers confirm standard-task briefs; bugfix work records reproduction and fix-plan confirmation before implementation.

**Independent Test**: Use prepared spec-driven, standard-task, and bugfix TaskRuns and verify only the required track-specific gate permits runtime execution.

### Tests for User Story 2

- [X] T042 [P] [US2] Add contract test for `POST /ai-looper/tasks/{taskCapsuleId}/runs` in `packages/server/test/contract/ai-looper-create-run.test.ts`
- [X] T043 [P] [US2] Add contract test for `POST /ai-looper/runs/{taskRunId}/plan/decision` in `packages/server/test/contract/ai-looper-plan-decision.test.ts`
- [X] T044 [P] [US2] Add authorization test for reviewer resolution from Teambition task/project config in `packages/core/test/ai-looper/approval-authority.test.ts`
- [X] T045 [P] [US2] Add stale plan approval rejection test in `packages/core/test/ai-looper/plan-version.test.ts`
- [X] T046 [P] [US2] Add standard-task lightweight brief confirmation test in `packages/core/test/ai-looper/lightweight-brief.test.ts`
- [X] T047 [P] [US2] Add bugfix reproduction and high-risk escalation test in `packages/core/test/ai-looper/bugfix-gate.test.ts`

### Implementation for User Story 2

- [X] T048 [US2] Implement TaskRun creation and idempotent reuse in `packages/core/src/ai-looper/taskrun.ts`
- [X] T049 [US2] Implement RequirementInterpretation artifact creation for spec-driven runs in `packages/core/src/ai-looper/taskrun.ts`
- [X] T050 [US2] Implement ExecutionPlan artifact creation and versioning in `packages/core/src/ai-looper/taskrun.ts`
- [X] T051 [US2] Implement LightweightTaskBrief artifact creation and engineer confirmation in `packages/core/src/ai-looper/taskrun.ts`
- [X] T052 [US2] Implement bug reproduction evidence and fix-plan confirmation gate in `packages/core/src/ai-looper/evidence.ts`
- [X] T053 [US2] Implement reviewer resolution from Teambition task/project config in `packages/core/src/ai-looper/teambition.ts`
- [X] T054 [US2] Implement approval decision validation for exact plan version and authority in `packages/core/src/ai-looper/taskrun.ts`
- [X] T055 [US2] Implement `POST /ai-looper/tasks/{taskCapsuleId}/runs` handler in `packages/server/src/handlers/ai-looper.ts`
- [X] T056 [US2] Implement `POST /ai-looper/runs/{taskRunId}/plan/decision` handler in `packages/server/src/handlers/ai-looper.ts`
- [X] T057 [US2] Render plan review, lightweight brief confirmation, and bugfix gate UI in `packages/enterprise/src/routes/ai-looper/[taskRunID].tsx`
- [X] T058 [US2] Record audit entries for approvals, rejections, confirmations, unauthorized attempts, and stale decisions in `packages/core/src/ai-looper/audit.ts`

**Checkpoint**: US2 independently demoable.

---

## Phase 5: User Story 3 - Continue Work Across Interruptions (Priority: P3)

**Goal**: Active TaskRuns survive Agent Session end, process restart, duplicate events, and short service interruption without needing a user progress query.

**Independent Test**: Start an approved or confirmed TaskRun, interrupt after committed progress, restore service, and verify recovery continues, waits, or blocks visibly within 15 minutes without duplicate side effects.

### Tests for User Story 3

- [X] T059 [P] [US3] Add RuntimeAdapter contract test for `RuntimeAdapter.run` input/output in `packages/core/test/ai-looper/runtime-adapter.test.ts`
- [X] T060 [P] [US3] Add recovery scanner test for Agent Session end before acceptance pass in `packages/core/test/ai-looper/recovery-session-end.test.ts`
- [X] T061 [P] [US3] Add process restart recovery test from committed checkpoint in `packages/core/test/ai-looper/recovery-restart.test.ts`
- [X] T062 [P] [US3] Add duplicate and out-of-order event fault-injection test in `packages/core/test/ai-looper/external-event-faults.test.ts`
- [X] T063 [P] [US3] Add service-return 15-minute recovery target test in `packages/core/test/ai-looper/recovery-sla.test.ts`

### Implementation for User Story 3

- [X] T064 [US3] Implement opencode RuntimeAdapter invocation boundary in `packages/core/src/ai-looper/runtime.ts`
- [X] T065 [US3] Implement ExecutionAttempt append-only recording in `packages/core/src/ai-looper/taskrun.ts`
- [X] T066 [US3] Implement promptSnapshot and artifactRefs snapshot validation in `packages/core/src/ai-looper/runtime.ts`
- [X] T067 [US3] Implement recovery scanner for active TaskRuns and `next_wake_at` in `packages/core/src/ai-looper/taskrun.ts`
- [X] T068 [US3] Implement ExternalEvent ingestion and duplicate reconciliation in `packages/core/src/ai-looper/outbox.ts`
- [X] T069 [US3] Implement `POST /ai-looper/events` handler in `packages/server/src/handlers/ai-looper.ts`
- [X] T070 [US3] Implement retry/no-progress escalation policy in `packages/core/src/ai-looper/taskrun.ts`
- [X] T071 [US3] Record audit entries for recovery, retry, duplicate event, and escalation in `packages/core/src/ai-looper/audit.ts`

**Checkpoint**: US3 independently demoable.

---

## Phase 6: User Story 4 - Supervise Progress and Intervention (Priority: P4)

**Goal**: Engineers and reviewers can inspect TaskRun phase, disposition, lifecycle, current role, blocker, evidence, attempts, interventions, and required human action without reading raw Agent logs.

**Independent Test**: Prepare TaskRuns in running, waiting, blocked, escalated, completed, and failed-attempt states and verify each is distinguishable in the execution view.

### Tests for User Story 4

- [X] T072 [P] [US4] Add contract test for `GET /ai-looper/runs/{taskRunId}` detail shape in `packages/server/test/contract/ai-looper-run-detail.test.ts`
- [X] T073 [P] [US4] Add UI integration test for running/waiting/blocked/escalated TaskRun states in `packages/enterprise/test/ai-looper-run-states.test.tsx`
- [X] T074 [P] [US4] Add cancellation contract test for `POST /ai-looper/runs/{taskRunId}/cancel` in `packages/server/test/contract/ai-looper-cancel.test.ts`
- [X] T075 [P] [US4] Add cancellation cleanup/unresolved-effects test in `packages/core/test/ai-looper/cancellation.test.ts`

### Implementation for User Story 4

- [X] T076 [US4] Implement TaskRun detail query with artifacts, evidence, attempts, waits, blockers, and audit records in `packages/core/src/ai-looper/taskrun.ts`
- [X] T077 [US4] Implement `GET /ai-looper/runs/{taskRunId}` handler in `packages/server/src/handlers/ai-looper.ts`
- [X] T078 [US4] Implement `POST /ai-looper/runs/{taskRunId}/cancel` handler in `packages/server/src/handlers/ai-looper.ts`
- [X] T079 [US4] Render phase, disposition, lifecycle, responsible role, next action, blockers, and timestamps in `packages/enterprise/src/routes/ai-looper/[taskRunID].tsx`
- [X] T080 [US4] Render attempts, evidence, artifacts, external writes, and audit timeline in `packages/enterprise/src/routes/ai-looper/[taskRunID].tsx`
- [X] T081 [US4] Implement authorized cancellation and unresolved-effects reporting in `packages/core/src/ai-looper/taskrun.ts`
- [X] T082 [US4] Record audit entries for human interventions and cancellations in `packages/core/src/ai-looper/audit.ts`

**Checkpoint**: US4 independently demoable.

---

## Phase 7: User Story 5 - Complete, Report, and Confirm Worktime (Priority: P5)

**Goal**: Verified TaskRuns generate delivery summaries, write Teambition updates idempotently, suggest worktime, and submit only responsible-engineer-confirmed worktime.

**Independent Test**: Use TaskRuns with passing and missing evidence and verify completion is refused without evidence, delivery summary is idempotent, and worktime cannot be submitted by the Coding Agent or another user.

### Tests for User Story 5

- [X] T083 [P] [US5] Add contract test for `POST /ai-looper/runs/{taskRunId}/human-evidence` in `packages/server/test/contract/ai-looper-human-evidence.test.ts`
- [X] T084 [P] [US5] Add contract test for `POST /ai-looper/runs/{taskRunId}/delivery-summary` in `packages/server/test/contract/ai-looper-delivery-summary.test.ts`
- [X] T085 [P] [US5] Add contract test for `POST /ai-looper/runs/{taskRunId}/worktime` in `packages/server/test/contract/ai-looper-worktime.test.ts`
- [X] T086 [P] [US5] Add completion guard test for missing, stale, conflicting, and unverifiable evidence in `packages/core/test/ai-looper/completion-guard.test.ts`
- [X] T087 [P] [US5] Add human acceptance evidence authorization test in `packages/core/test/ai-looper/human-evidence.test.ts`
- [X] T088 [P] [US5] Add delivery summary and worktime idempotency test in `packages/core/test/ai-looper/teambition-writes.test.ts`
- [X] T089 [P] [US5] Add worktime responsible-engineer boundary test in `packages/core/test/ai-looper/worktime-authority.test.ts`

### Implementation for User Story 5

- [X] T090 [US5] Implement human acceptance evidence recording and validation in `packages/core/src/ai-looper/evidence.ts`
- [X] T091 [US5] Implement completion guard against acceptance criteria and required evidence in `packages/core/src/ai-looper/evidence.ts`
- [X] T092 [US5] Implement delivery summary artifact generation in `packages/core/src/ai-looper/taskrun.ts`
- [X] T093 [US5] Implement Teambition progress note and delivery summary outbox writes in `packages/core/src/ai-looper/outbox.ts`
- [X] T094 [US5] Implement worktime draft generation excluding unattended Agent runtime and idle waiting in `packages/core/src/ai-looper/taskrun.ts`
- [X] T095 [US5] Implement responsible-engineer worktime confirmation and outbox write in `packages/core/src/ai-looper/outbox.ts`
- [X] T096 [US5] Implement `POST /ai-looper/runs/{taskRunId}/human-evidence` handler in `packages/server/src/handlers/ai-looper.ts`
- [X] T097 [US5] Implement `POST /ai-looper/runs/{taskRunId}/delivery-summary` handler in `packages/server/src/handlers/ai-looper.ts`
- [X] T098 [US5] Implement `POST /ai-looper/runs/{taskRunId}/worktime` handler in `packages/server/src/handlers/ai-looper.ts`
- [X] T099 [US5] Render delivery summary, human evidence, and worktime confirmation UI in `packages/enterprise/src/routes/ai-looper/[taskRunID].tsx`
- [X] T100 [US5] Record audit entries for completion evaluation, delivery writes, human evidence, and worktime submission in `packages/core/src/ai-looper/audit.ts`

**Checkpoint**: US5 independently demoable.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verification, generated artifacts, governance candidate capture, documentation, and final quality pass.

- [X] T101 [P] Add KnowledgeAssetCandidate capture tests in `packages/core/test/ai-looper/knowledge-asset-candidate.test.ts`
- [X] T102 Implement non-authoritative reusable Spec/Knowledge/Skill candidate capture in `packages/core/src/ai-looper/taskrun.ts`
- [ ] T103 [P] Add enterprise UI accessibility smoke test for AI Looper routes in `packages/enterprise/test/ai-looper-accessibility.test.tsx`
- [X] T104 [P] Add observability smoke test for TaskRun state, attempts, external writes, and audit diagnostics in `packages/core/test/ai-looper/observability.test.ts`
- [ ] T105 [P] Add task-list and task-detail latency smoke test for the 30-second pilot target in `packages/enterprise/test/ai-looper-latency.test.tsx`
- [ ] T106 [P] Add execution-view key-state visibility smoke test for the 10-second recognition target in `packages/enterprise/test/ai-looper-state-recognition.test.tsx`
- [X] T107 [P] Add fake RuntimeAdapter fixture test for changedArtifacts, commandsRun, and evidenceCandidates recording in `packages/core/test/ai-looper/runtime-adapter-fixture.test.ts`
- [X] T108 [P] Add negative test that KnowledgeAssetCandidate is not automatically published as PublishedTeamAsset in `packages/core/test/ai-looper/knowledge-asset-publication.test.ts`
- [ ] T109 Run generated client update from `packages/client` if public Protocol or Server HttpApi changed
- [ ] T110 Run `bun test` from `packages/core`
- [ ] T111 Run `bun typecheck` from `packages/schema`
- [ ] T112 Run `bun typecheck` from `packages/protocol`
- [ ] T113 Run `bun typecheck` from `packages/core`
- [ ] T114 Run `bun typecheck` from `packages/server`
- [ ] T115 Run `bun typecheck` from `packages/enterprise`
- [ ] T116 Validate quickstart scenario and record evidence in `specs/001-ai-looper-mvp/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Stories (Phase 3-7)**: Depend on Foundational. They can be staffed in parallel after foundational contracts are stable, but the safest delivery order is US1 → US2 → US3 → US4 → US5.
- **Polish (Phase 8)**: Depends on the implemented user stories being validated.

### User Story Dependencies

- **US1 Understand an Assigned Task**: First MVP increment after foundation.
- **US2 Review and Start an Execution Plan**: Depends on US1 task capsules and routing decisions.
- **US3 Continue Work Across Interruptions**: Depends on US2 gates and RuntimeAdapter invocation boundary.
- **US4 Supervise Progress and Intervention**: Depends on TaskRun state and audit/events from US1-US3 but can build UI read models independently after foundation.
- **US5 Complete, Report, and Confirm Worktime**: Depends on evidence, outbox, and authority boundaries from foundation and US2-US3.

### Within Each User Story

- Tests must be written and fail before implementation.
- Schemas/contracts before core services.
- Core services before server handlers.
- Server handlers before enterprise UI integration.
- Audit and authorization checks complete before story checkpoint.

## Parallel Opportunities

- Setup placeholders T004-T006 can run in parallel.
- Foundational tests T020-T025 can run in parallel after schemas/interfaces are drafted.
- US1 tests T027-T031 can run in parallel.
- US2 tests T042-T047 can run in parallel.
- US3 tests T059-T063 can run in parallel.
- US4 tests T072-T075 can run in parallel.
- US5 tests T083-T089 can run in parallel.
- Cross-cutting tests T101, T103, T104, T105, T106, T107, and T108 can run in
  parallel.

## Parallel Example: User Story 1

```bash
Task: "Add contract test for GET /ai-looper/tasks in packages/server/test/contract/ai-looper-tasks.test.ts"
Task: "Add contract test for GET /ai-looper/tasks/{taskCapsuleId} in packages/server/test/contract/ai-looper-task-detail.test.ts"
Task: "Add integration test for authorized personal Teambition task list import in packages/core/test/ai-looper/teambition-import.test.ts"
Task: "Add integration test for source content vs AI interpretation separation in packages/enterprise/test/ai-looper-task-view.test.tsx"
Task: "Add routing integration test for feature/task/bug to execution tracks in packages/core/test/ai-looper/routing-integration.test.ts"
```

## Parallel Example: User Story 5

```bash
Task: "Add completion guard test for missing, stale, conflicting, and unverifiable evidence in packages/core/test/ai-looper/completion-guard.test.ts"
Task: "Add delivery summary and worktime idempotency test in packages/core/test/ai-looper/teambition-writes.test.ts"
Task: "Add worktime responsible-engineer boundary test in packages/core/test/ai-looper/worktime-authority.test.ts"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 so engineers can see authorized Teambition work items and routing.
3. Stop and validate US1 independently with prepared feature/task/bug fixtures.

### Incremental Delivery

1. Add US2 to support track-specific planning and approval gates.
2. Add US3 to make execution durable across interruptions.
3. Add US4 to make supervision and intervention usable.
4. Add US5 to close the enterprise loop with evidence, delivery summary, and worktime.

### Team Strategy

After Phase 2:

- Developer A: US1 and enterprise workbench entry.
- Developer B: US2 gates and authority.
- Developer C: US3 recovery and runtime adapter.
- Developer D: US5 evidence/outbox/worktime, then US4 UI timeline integration.

## Notes

- `[P]` tasks touch different files or isolated test files and can run in parallel.
- `[US#]` labels map tasks to user stories for traceability.
- Do not run tests from repository root.
- If Protocol or Server HttpApi changes, run generation from `packages/client` and do not edit generated client files directly.
- Automatic Teambition task-status transitions and automatic publication of team assets remain out of MVP scope.
