# Implementation Plan: AI Looper MVP

**Branch**: `001-ai-looper` | **Date**: 2026-07-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-looper-mvp/spec.md`

## Summary

Build AI Looper as an enterprise task control plane inside the opencode codebase.
The MVP ingests authorized Teambition feature, task, and bug work items, creates
a durable TaskRun, routes the item into an execution track, generates requirement
and plan artifacts where required, gates implementation on human approval, invokes
one configured Coding Runtime through an adapter, verifies completion evidence,
writes an attributable delivery summary, and submits only engineer-confirmed
worktime.

The core design choice is to keep AI Looper's product model independent of any
single agent runtime. opencode is the first Coding Runtime adapter because it is
the local development framework we are extending, but TaskRun state, approvals,
evidence, Teambition writes, and recovery are owned by AI Looper control-plane
services. LLM output is accepted only as proposals that deterministic guards
validate before durable state changes.

## Technical Context

**Language/Version**: TypeScript on Bun, following the existing opencode package
layout and Effect-based service style where already used.
**Primary Dependencies**: Existing opencode packages; Effect; Drizzle/SQLite
through existing core database patterns; existing Server HttpApi/Protocol
generation flow; Teambition API or MCP adapter; one opencode Coding Runtime
adapter.
**Storage**: Existing local SQLite-backed core database patterns for MVP TaskRun,
events, approvals, artifacts, evidence, external write outbox, and audit records.
The schema must use snake_case fields and generated database artifacts must follow
repo generation rules.
**Testing**: Package-scoped Bun tests from affected package directories only;
contract tests for API/event contracts; integration tests around durable TaskRun
state; fault-injection tests for restart, duplicate event, retry, stale approval,
missing evidence, and worktime boundaries.
**Target Platform**: opencode local/server runtime in a single enterprise
environment. Mobile remote control, multi-tenant operation, and multi-runtime
selection are future extensions.
**Project Type**: Monorepo feature spanning schema/protocol/core/server plus the
enterprise UI package.
**Performance Goals**: Authorized engineers can open a task with source context
within 30 seconds during pilot; TaskRun execution view exposes phase, blocker, and
evidence within 10 seconds; after service returns from a short interruption,
active TaskRuns continue, wait, or enter visible blocked state within 15 minutes.
**Constraints**: No automatic Teambition status transitions in MVP; all external
writes are idempotent and auditable; responsible engineer alone confirms actual
worktime; plan reviewers are resolved from Teambition task/project configuration;
large feature/task items use the spec-driven track with formal approval; small
tasks may use an OpenSpec-style lightweight brief with responsible engineer
confirmation; bug items use reproduce-first bugfix and high-risk bugs escalate to
formal approval; Coding Runtime, model, and provider remain behind versioned
adapter contracts.
**Scale/Scope**: Single enterprise pilot, one configured Coding Runtime per
TaskRun, personal Teambition task lists, no Gerrit/Jenkins/test-platform full
automation, no Bot channel, no multi-tenant administration.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Durable task truth is independent of Agent Session and process lifetime.
      TaskRun owns phase, disposition, lifecycle, checkpoints, attempts, waits,
      and recovery deadlines.
- [x] LLM decisions are proposals validated by deterministic transition guards.
      Requirement, plan, runtime, and completion suggestions do not commit state
      until guards validate allowed edges, evidence, authority, and idempotency.
- [x] Completion evidence and acceptance criteria are explicitly modeled. The
      data model includes acceptance-criterion-bound Evidence and structured
      human acceptance evidence.
- [x] External writes and callback processing have idempotency designs. Teambition
      delivery/worktime writes and external events use stable idempotency keys and
      an outbox/inbox model.
- [x] Human authority, least privilege, and segregation of duties are preserved.
      Plan approval and actual worktime submission require authorized humans;
      the Coding Agent cannot approve its own plan or submit worktime.
- [x] Agent Runtime, model, and provider dependencies are behind versioned
      contracts. opencode is the first adapter, not the durable product model.
- [x] Memory, Knowledge, Template, and Skill evolution is governed and reversible.
      MVP does not publish evolved Skills/Knowledge; runtime prompts record
      versioned asset snapshots only.
- [x] Recovery, external events, permissions, observability, and tests are
      addressed. Research, data model, contracts, and quickstart cover these
      areas.
- [x] The plan follows applicable `AGENTS.md` dependency, generation, style, test,
      and type-check rules.

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-looper-mvp/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ai-looper-api.yaml
│   └── runtime-adapter.md
├── checklists/
│   └── requirements.md
└── tasks.md              # Generated later by speckit-tasks
```

### Source Code (repository root)

```text
packages/schema/src/
└── ai-looper.ts          # Shared schema types for TaskRun domain objects

packages/protocol/src/
└── ai-looper.ts          # Public protocol contracts for AI Looper APIs/events

packages/core/src/
├── ai-looper/
│   ├── routing.ts        # Work item type and execution-track decision logic
│   ├── taskrun.ts        # Durable TaskRun state machine and guards
│   ├── teambition.ts     # Teambition API/MCP adapter boundary
│   ├── runtime.ts        # Coding Runtime adapter contract
│   ├── evidence.ts       # Evidence validation and completion checks
│   ├── outbox.ts         # Idempotent external write scheduling
│   ├── audit.ts          # Audit record creation/query helpers
│   └── sql.ts            # Database schema/migrations following repo patterns
└── config/
    └── ai-looper.ts      # Feature configuration, exported by existing pattern

packages/server/src/handlers/
└── ai-looper.ts          # HTTP handlers that expose protocol operations

packages/enterprise/src/routes/
├── ai-looper.tsx         # Task list and TaskRun workspace
└── ai-looper/
    └── [taskRunID].tsx   # Execution detail, approvals, evidence, worktime

packages/client/src/
└── generated*            # Regenerated only through package script if Protocol changes
```

**Structure Decision**: Use the existing monorepo package boundaries. Schema owns
portable data definitions; Protocol exposes API/event contracts; Core owns durable
state, guards, storage, Teambition integration, runtime adapter contracts, and
audit/outbox logic; Server exposes handlers; Enterprise provides the human-facing
workbench. This keeps dependencies aligned with `AGENTS.md` and prevents the
enterprise UI or server handlers from defining TaskRun truth.

## Complexity Tracking

No Constitution violations are required. The design adds multiple domain modules,
but they correspond to existing package boundaries and required enterprise
controls rather than optional abstraction.

## Phase 0 Research

Research decisions are recorded in [research.md](./research.md). The chosen
approach is:

- durable AI Looper control plane with TaskRun as execution truth;
- Teambition feature/task/bug source type preserved with auditable routing into
  spec-driven, standard-task, or bugfix execution tracks;
- opencode as first Coding Runtime adapter, not platform kernel;
- Teambition API/MCP integration through idempotent inbox/outbox boundaries, with
  MVP writes limited to progress notes, delivery summaries, and
  responsible-engineer-confirmed worktime;
- deterministic transition guard for all LLM-proposed state changes;
- explicit human authorization for plan approval and worktime submission;
- governed future expansion for mobile remote control, automatic task-status
  transitions, multi-runtime routing, Bot channels, and governed sharing of Spec
  documents, templates, Knowledge, and Skills.

## Phase 1 Design

Design artifacts are:

- [data-model.md](./data-model.md) for entities, relationships, validation rules,
  and TaskRun state transitions.
- [contracts/ai-looper-api.yaml](./contracts/ai-looper-api.yaml) for MVP HTTP
  API contracts and event payload shapes.
- [contracts/runtime-adapter.md](./contracts/runtime-adapter.md) for the Coding
  Runtime adapter input/output contract.
- [quickstart.md](./quickstart.md) for implementation and verification flow.

## Post-Design Constitution Check

- [x] TaskRun persistence, recovery, and 15-minute post-return recovery target are
      represented in the data model and quickstart verification.
- [x] Work item type and execution-track routing are represented in the data
      model and quickstart verification.
- [x] Track-specific approval and confirmation gates are represented: formal
      approval for spec-driven, engineer confirmation for standard-task, and
      reproduction plus fix-plan confirmation for bugfix.
- [x] LLM proposals are separated from deterministic transition commits in the
      TaskRun model and API contract.
- [x] Completion requires acceptance-criterion-bound evidence, plan approval,
      delivery summary, and worktime confirmation.
- [x] Teambition writes use outbox records with stable idempotency keys; inbound
      events use source-event identity for dedupe.
- [x] Human plan approval and responsible-engineer worktime confirmation remain
      explicit API operations.
- [x] opencode runtime execution uses the RuntimeAdapter contract and can be
      replaced in future without changing TaskRun state.
- [x] Memory/Skill/Spec evolution and cross-team publishing remain out of MVP
      scope while asset snapshots and reusable asset candidates are recorded for
      runtime reproducibility and later governance.
- [x] Required recovery, external event, permission, observability, and test
      categories are covered by quickstart checks.
- [x] Package placement and verification commands follow `AGENTS.md`; generated
      client artifacts are not edited directly.
