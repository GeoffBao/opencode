# Research: AI Looper MVP

## Decision: AI Looper Control Plane is the platform kernel

**Rationale**: The durable product truth is TaskRun state, not an Agent Session,
provider stream, chat transcript, or opencode runtime loop. A dedicated control
plane can own approvals, evidence, idempotency, recovery, audit, and Teambition
integration while allowing the coding executor to change later.

**Alternatives considered**:

- **Use opencode Session as the TaskRun**: rejected because repository guidance
  says a Session drain has no durable transcript boundary for business tasks, and
  post-crash continuation needs explicit design.
- **Use Hermes-style memory as the kernel**: rejected because long-term memory is
  useful for context and evolution, but it does not define enterprise completion,
  approval, evidence, or idempotent writes.
- **Use DeepCode-style generation workflow as the kernel**: rejected because it is
  valuable inspiration for coding workflows, but the MVP needs enterprise control
  and audit semantics first.

## Decision: opencode is the first Coding Runtime adapter

**Rationale**: The user wants to build on the opencode project, and opencode is
already organized around local development, sessions, tools, permissions, server
handlers, and enterprise UI packages. Using it as the first runtime gives the MVP
a realistic local coding path while preserving Runtime and Provider Independence.

**Alternatives considered**:

- **Make opencode mandatory and hard-coded**: rejected because future top coding
  quality may require Codex, Claude Code, Hermes, DeepCode, or an internal agent.
- **Start with a fully generic multi-runtime router**: rejected for MVP because
  dynamic runtime selection is explicitly out of scope and would dilute the first
  delivery path.

## Decision: TaskRun state machine uses phase, disposition, and lifecycle

**Rationale**: A single flat status cannot distinguish "planning but waiting for
approval" from "planning blocked by missing source content" or "implementation
escalated for repeated runtime failure." The three-axis model preserves business
phase while making waiting, blocking, escalation, completion, and cancellation
visible.

**Alternatives considered**:

- **Single enum status**: rejected because it either explodes into many mixed
  statuses or hides important operational distinctions.
- **Raw workflow engine history only**: rejected because users need compact,
  queryable product state without reconstructing it from low-level events.

## Decision: Teambition work items route into execution tracks

**Rationale**: Teambition provides three relevant source types for the MVP:
feature, task, and bug. AI Looper should preserve that source type and then create
an auditable routing decision so the workflow can be strict where the work is
large and lightweight where the work is small. Large feature/task items use a
spec-driven track similar to Spec Kit: requirement interpretation, planning, plan
approval, implementation, verification, and delivery. Bug items use a
reproduce-first bugfix track: reproduce or record a non-reproducible blocker
before a fix can be treated as complete.

Small tasks and small requirements can use an OpenSpec-style lightweight task
brief instead of a full spec-driven package. This keeps routine work fast while
still preserving scope, acceptance checks, implementation plan, risk level,
responsible engineer confirmation, evidence, delivery summary, worktime, and
audit.

**Alternatives considered**:

- **Force every item through the full spec-driven track**: rejected because small
  bugs and routine tasks would carry too much process overhead.
- **Let the Coding Agent choose the workflow silently**: rejected because routing
  affects approvals, tests, evidence, and auditability.
- **Use only the Teambition source type with no size/risk assessment**: rejected
  because a Teambition task can still be large enough to require spec-driven
  decomposition and approval.

## Decision: Approval gates differ by execution track

**Rationale**: A single approval policy would either slow down small work or
under-govern large/high-risk work. The MVP uses track-specific gates:

- `spec_driven`: formal plan approval by an authorized reviewer.
- `standard_task`: responsible engineer confirmation of a lightweight
  OpenSpec-style task brief; formal approval only if policy, size, or risk
  escalates it.
- `bugfix`: reproduction evidence or non-reproducible blocker plus responsible
  engineer confirmation of the fix plan; high-risk bugs escalate to formal plan
  approval.

**Alternatives considered**:

- **Require formal approval for every item**: rejected because it makes small
  requirements and bug fixes unnecessarily heavy.
- **Let every item start after engineer confirmation only**: rejected because
  large feature/task work and high-risk bugs need stronger enterprise authority.
- **Let the agent decide approval needs dynamically**: rejected because approval
  boundaries must be deterministic, visible, and auditable.

## Decision: LLMs produce proposals; guards commit transitions

**Rationale**: Requirement interpretation, planning, role suggestions, evidence
classification, and next-action selection benefit from LLM judgment. Durable state
changes require deterministic checks for allowed edges, required evidence,
authorization, idempotency, retry budgets, and policy.

**Alternatives considered**:

- **Let the agent directly set TaskRun status**: rejected due to audit and safety
  risk.
- **No LLM involvement in state decisions**: rejected because it loses useful
  analysis and summarization; the key is to validate proposals before commit.

## Decision: Teambition integration supports API or MCP behind one adapter

**Rationale**: The team has validated that individual engineers can obtain their
personal task list and write permitted progress, status, and worktime data through
Teambition API/MCP access. The MVP should depend on a Teambition adapter contract,
not on one transport. It will read assigned tasks and write delivery summary and
engineer-confirmed worktime; automatic status transitions are future scope. The
MVP write boundary is progress notes, delivery summaries, and
responsible-engineer-confirmed worktime. Status writes require explicit human
action and audit if exposed at all, and automatic status transitions remain
deferred.

**Alternatives considered**:

- **API-only integration**: rejected because MCP access may be the smoother
  enterprise path in some environments.
- **MCP-only integration**: rejected because direct API access may be more stable
  for server-side idempotency and audit in other environments.
- **Automatic status write in MVP**: rejected by clarification; future versions
  may add human-authorized or policy-validated status automation.

## Decision: External writes use outbox and idempotency keys

**Rationale**: Durable execution must retry after process restart, transient
network failures, and ambiguous delivery acknowledgements. Every external write
needs a stable business key so delivery summary and worktime retries cannot create
duplicates.

**Alternatives considered**:

- **Best-effort direct writes from handlers**: rejected because service
  interruption during writes is an explicit edge case.
- **Rely only on Teambition duplicate handling**: rejected because enterprise audit
  requires local attribution, retry state, and proof of idempotency intent.

## Decision: Human acceptance evidence is allowed only as structured evidence

**Rationale**: Some enterprise acceptance criteria cannot be fully automated in
the MVP. Allowing structured human evidence preserves delivery velocity while
still binding evidence to the acceptance criterion, authorized actor, time,
explanation, and audit record.

**Alternatives considered**:

- **Only automated tests count**: rejected because it would block valid pilot
  tasks with UI, integration, or business validation requirements.
- **Free-text evidence**: rejected because it cannot reliably support completion
  audits or later dispute resolution.

## Decision: Recovery target is evaluated after service returns

**Rationale**: The MVP cannot promise high-availability infrastructure, but it can
promise that after service returns, active TaskRuns are scanned and moved to
continue, wait, or visible blocked state within 15 minutes. This directly targets
the Hermes-style "manual progress query wakes the task" failure mode.

**Alternatives considered**:

- **One-minute target**: deferred to later versions because it implies stronger
  operational infrastructure.
- **No timing target**: rejected because it would not create a meaningful
  regression test for durable continuation.

## Decision: Plan reviewers resolve from Teambition task/project configuration

**Rationale**: This keeps AI Looper "senselessly embedded" into existing project
workflow. Engineers should not duplicate organization policy inside AI Looper for
each task, and approval should follow the project management source of truth.

**Alternatives considered**:

- **AI Looper-local fixed reviewer list**: rejected because it creates a second
  authority source.
- **Task creator/owner as automatic reviewer**: rejected because project policy
  may differ across teams.
- **Engineer manually selects reviewer every time**: rejected because it increases
  friction and risks picking unauthorized reviewers.

## Decision: Worktime is suggested by AI Looper and confirmed by the responsible engineer

**Rationale**: The user explicitly wants engineers to fill task worktime, while AI
Looper can reduce effort by suggesting a value and description. The Coding Agent
or another user cannot submit worktime on the engineer's behalf.

**Alternatives considered**:

- **Automatic worktime submission**: rejected because it violates the human
  authorization boundary and may include unattended runtime.
- **Reviewer or manager submission in MVP**: deferred until there is a delegated
  authority model.

## Decision: Spec, Knowledge, and Skill sharing is governed, not automatic

**Rationale**: Enterprise teams need reusable Specs, templates, Skills,
checklists, lessons, and prompt patterns to spread across project teams and
departments. However, automatically publishing task-derived assets would violate
the governance principle for Memory, Knowledge, and Skill evolution. The MVP may
record reusable asset candidates and the asset versions consumed by a TaskRun, but
sharing to a project, department, or enterprise catalog is a future governed
workflow.

The future workflow is:

```text
TaskRun output
  → asset candidate
  → owner assignment
  → provenance and evaluation evidence
  → reviewer approval
  → versioned publication to project/team/department scope
  → usage telemetry
  → rollback or deprecation
```

**Alternatives considered**:

- **Auto-publish every useful Skill or Spec**: rejected because incorrect task
  experience could silently become team policy.
- **Do not capture reusable assets at all**: rejected because it loses the main
  compounding value of an enterprise AI研发平台.
- **Only share files manually outside AI Looper**: rejected for future scope
  because it loses provenance, versioning, evaluation, access control, and
  rollback.
