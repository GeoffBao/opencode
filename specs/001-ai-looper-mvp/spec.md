# Feature Specification: AI Looper MVP

**Feature Branch**: `001-ai-looper`
**Created**: 2026-07-09
**Status**: Draft
**Input**: Build an AI Looper MVP that receives assigned Teambition tasks,
guides them through analysis, planning, approval, implementation, verification,
reporting, and worktime confirmation, and continues reliably across Agent Session
and process interruptions.

## Scope

### In Scope

- Show Teambition tasks assigned to the signed-in engineer in the unified R&D
  workspace.
- Preserve Teambition work item type as feature, task, or bug and route each item
  into an appropriate AI Looper execution track.
- Present the original task description, attachments, acceptance criteria, and
  source identity without silently changing the source content.
- Generate a structured requirement interpretation and an execution plan.
- Require an authorized plan reviewer to approve or reject the plan before
  implementation starts.
- Execute an approved plan through one configurable Coding Agent.
- Verify implementation results against the task's acceptance criteria.
- Persist task execution independently of Agent Session and process lifetime.
- Show phase, progress, role assignments, blockers, artifacts, evidence, and
  intervention history.
- Generate and submit a delivery summary to Teambition.
- Let the engineer review, adjust, and confirm actual worktime before submission.

### Out of Scope

- Fully automated Gerrit review, Jenkins build, or enterprise test-platform
  orchestration.
- Parallel execution or review by multiple domain experts.
- Feishu, DingTalk, WeCom, Slack, or other Bot channels.
- Automatic publication of enterprise Skills or Knowledge.
- Dynamic selection among multiple Coding Runtimes within one TaskRun.
- Multi-tenant organization administration and cross-tenant data sharing.
- Replacement of Teambition as the team's authoritative task system.
- Automatic Teambition task-status transitions such as marking tasks in
  progress, under review, or completed.

### Future Extensions

- Mobile remote supervision and control, similar to using the ChatGPT mobile app
  to access remote Codex capabilities against company-managed local Codex
  Projects. This future capability should let authorized users monitor, wake,
  steer, pause, or approve TaskRuns from a mobile client while execution remains
  anchored to the approved company workspace, identity, permissions, audit trail,
  and enterprise network boundary.
- Human-authorized or policy-validated Teambition task-status automation, such as
  marking tasks in progress, under review, or completed after the TaskRun control
  plane has enough evidence and authority checks to do so safely.
- Multi-runtime orchestration that can choose among opencode, Codex, Claude Code,
  Hermes-style long-memory agents, DeepCode-style code-generation workflows, or
  internal enterprise agents according to task type, permissions, evidence
  requirements, and runtime availability.
- Bot-based interaction channels for notifications, approvals, blockers, and
  progress summaries after the core TaskRun and approval model is stable.
- Governed sharing of Spec documents, reusable templates, Knowledge, and Skills
  across departments and project teams. TaskRuns may produce asset candidates,
  but publishing them to a team or department catalog requires ownership,
  provenance, evaluation evidence, approval, versioning, access scope, and
  rollback.

## Clarifications

### Session 2026-07-09

- Q: In the MVP, should AI Looper automatically update Teambition task status? → A: No. It only writes delivery summaries and engineer-confirmed worktime.
- Q: What recovery target should define a short service interruption in the MVP? → A: Within 15 minutes after service returns, continue or enter a visible waiting or blocked state.
- Q: When automated verification is insufficient, may the MVP use human acceptance evidence? → A: Yes, if it is structured, auditable, and bound to an acceptance criterion, authorized actor, time, and explanation.
- Q: How should the MVP determine authorized plan reviewers? → A: Map authorized reviewers from Teambition task or project configuration.
- Q: Who may confirm and submit actual worktime in the MVP? → A: Only the responsible engineer may confirm and submit actual worktime; AI Looper may suggest it, but the engineer manually fills or confirms it.
- Q: How should Teambition feature/task/bug items enter AI Looper? → A: Preserve the source type and create a routing decision. Large features and large tasks use a spec-driven track; bugs use a reproduce-first bugfix track.
- Q: What approval boundary applies to each execution track? → A: spec-driven requires formal plan approval; standard-task requires responsible engineer confirmation of a lightweight plan; bugfix requires reproduction evidence and fix-plan confirmation, with high-risk bugs escalated to formal approval.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Understand an Assigned Task (Priority: P1)

As an enterprise software engineer, I can open a task assigned to me and see its
authoritative source content, Teambition work item type, and structured AI
interpretation, so I can understand the goal, constraints, acceptance criteria,
and recommended execution track without switching between disconnected tools.

**Why this priority**: Every later action depends on the engineer and the system
sharing the same task context.

**Independent Test**: Use a prepared assigned task containing description,
attachments, and acceptance criteria. Verify that the engineer can open it, trace
every displayed source item back to Teambition, and distinguish original content
from AI interpretation.

**Acceptance Scenarios**:

1. **Given** an engineer has assigned Teambition tasks, **When** the engineer opens
   the work list, **Then** the system shows the tasks the engineer is authorized
   to see with their current source status.
2. **Given** an assigned task contains requirements, attachments, and acceptance
   criteria, **When** the engineer opens it, **Then** the system displays the
   original task content and a separately labeled structured interpretation.
3. **Given** the Teambition item is a feature, task, or bug, **When** the engineer
   opens it, **Then** the system shows the preserved source type and the selected
   AI Looper execution track.
4. **Given** a required task item cannot be retrieved, **When** the task is opened,
   **Then** the system identifies the missing item and does not invent replacement
   content.

---

### User Story 2 - Review and Start an Execution Plan (Priority: P2)

As an authorized solution reviewer, I can inspect, approve, or reject the
AI-generated execution plan before code changes begin, so implementation starts
only from an accountable and agreed plan.

**Why this priority**: Plan approval is the first enterprise responsibility gate
and prevents uncontrolled implementation.

**Independent Test**: Use a prepared task interpretation and generated plan.
Verify that an authorized reviewer can approve or reject with comments, that an
unauthorized user cannot decide, and that implementation starts only after
approval.

**Acceptance Scenarios**:

1. **Given** requirement analysis is complete, **When** the system creates an
   execution plan, **Then** the plan identifies intended outcomes, work units,
   risks, verification activities, and unresolved questions.
2. **Given** a plan awaits review, **When** an authorized reviewer approves it,
   **Then** the approval identity, time, plan version, and comments are recorded
   and implementation becomes eligible to start.
3. **Given** a plan awaits review, **When** the reviewer rejects it with comments,
   **Then** the task returns for plan revision and cannot enter implementation.
4. **Given** a user lacks approval authority, **When** that user attempts to
   approve the plan, **Then** the decision is refused and recorded as an
   unauthorized attempt.

---

### User Story 3 - Continue Work Across Interruptions (Priority: P3)

As an engineer, I can rely on an approved task continuing from committed progress
after an Agent Session ends, a process restarts, or a short service interruption
occurs, so I do not have to ask for progress or restart the task manually.

**Why this priority**: Durable execution is the defining behavior that separates
AI Looper from a session-bound Agent.

**Independent Test**: Start an approved implementation, interrupt it after at
least one committed step, restore service, and verify that the same TaskRun
continues from recorded progress without repeating completed business actions.

**Acceptance Scenarios**:

1. **Given** a TaskRun has committed progress, **When** its Agent Session ends
   before acceptance criteria pass, **Then** the TaskRun remains active and
   schedules or awaits the next valid action.
2. **Given** execution is interrupted by a process restart, **When** service
   returns, **Then** the TaskRun resumes from its latest committed progress.
3. **Given** a completed action is retried after recovery, **When** the system
   evaluates the retry, **Then** it does not duplicate an external write, approval,
   artifact, or worktime entry.
4. **Given** recovery cannot safely determine the next action, **When** the
   uncertainty is detected, **Then** the TaskRun is blocked or escalated with a
   visible reason rather than guessed forward.

---

### User Story 4 - Supervise Progress and Intervention (Priority: P4)

As an engineer or reviewer, I can see the current phase, progress, assigned role,
blocker, artifacts, verification evidence, and required human action, so I can
supervise automation without reading raw Agent conversations.

**Why this priority**: Enterprise users need control and explainability, not only
an autonomous black box.

**Independent Test**: Prepare TaskRuns in running, waiting, blocked, escalated,
completed, and failed-attempt conditions. Verify that each condition is
distinguishable and its evidence and next expected action are visible.

**Acceptance Scenarios**:

1. **Given** a TaskRun is active, **When** a user opens its execution view, **Then**
   the current phase, latest committed action, responsible role, and next expected
   action are visible.
2. **Given** the TaskRun waits for a normal approval, **When** the reviewer opens
   it, **Then** the required decision and approval context are shown separately
   from abnormal escalation.
3. **Given** an external dependency is unavailable, **When** progress cannot
   continue, **Then** the original phase is preserved and the TaskRun shows a
   blocked reason, dependency, start time, and next check or owner.
4. **Given** the system exceeds an allowed retry, time, confidence, or cost
   boundary, **When** automatic execution stops, **Then** the TaskRun is escalated
   with attempted actions, evidence, and a recommended human next step.

---

### User Story 5 - Complete, Report, and Confirm Worktime (Priority: P5)

As an engineer, I can complete a verified task, review its delivery summary, and
confirm actual worktime before the results are submitted to Teambition, so the
enterprise record is accurate and attributable.

**Why this priority**: A technical result has not completed the enterprise
workflow until delivery and worktime records are confirmed.

**Independent Test**: Use a TaskRun with passing verification evidence. Verify
that completion is refused without required evidence, that the summary is
reviewable, and that only engineer-confirmed worktime is submitted.

**Acceptance Scenarios**:

1. **Given** implementation ends but one acceptance criterion lacks passing
   evidence, **When** completion is evaluated, **Then** the task remains active,
   retries, blocks, or escalates instead of completing.
2. **Given** all required acceptance criteria and approvals pass, **When** the
   TaskRun enters reporting, **Then** the system prepares a delivery summary that
   references the relevant artifacts and verification evidence.
3. **Given** a delivery summary is ready, **When** it is submitted, **Then** the
   Teambition update is attributable and a repeated submission does not create
   duplicate progress records.
4. **Given** the system suggests actual worktime, **When** the engineer adjusts
   and confirms it, **Then** only the confirmed value and description are
   submitted.
5. **Given** worktime has not been confirmed, **When** technical delivery is
   otherwise complete, **Then** the system marks worktime confirmation as pending
   and does not submit worktime on the engineer's behalf.

### Edge Cases

- The Teambition task is deleted, archived, reassigned, or made inaccessible while
  a TaskRun is active.
- Source task content changes after requirement interpretation or plan approval.
- The Teambition work item type is missing, unsupported, or changed after routing.
- A feature or task is too large for a single implementation attempt and requires
  decomposition before plan approval.
- A bug cannot be reproduced before a fix is proposed.
- Two callbacks or user actions report the same approval or progress event.
- An external event arrives before the TaskRun begins waiting for it.
- Events arrive late or out of order.
- A reviewer approves an outdated plan version.
- The Coding Agent reports success but required files, tests, or acceptance
  evidence are missing.
- A Coding Agent repeatedly produces no progress or repeats the same failed action.
- The engineer steers the active task while an execution step is in progress.
- A user cancels the task during implementation or verification.
- Service interruption occurs during an external write.
- The worktime suggestion includes unattended Agent runtime or idle waiting time.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST show each signed-in engineer the Teambition tasks
  assigned to them that they are authorized to view.
- **FR-002**: The system MUST preserve the Teambition task identity and clearly
  distinguish source content from AI-generated interpretation.
- **FR-003**: The system MUST show available original requirements, attachments,
  acceptance criteria, assignees, priority, deadline, and source status.
- **FR-004**: The system MUST identify missing or inaccessible source information
  without fabricating replacement content.
- **FR-004a**: The system MUST preserve the Teambition work item type as feature,
  task, or bug when available and MUST visibly flag missing or unsupported source
  types.
- **FR-004b**: The system MUST create an auditable routing decision that selects
  one execution track for each TaskRun: spec-driven, standard-task, or bugfix.
- **FR-004c**: Large feature and large task work items MUST enter the spec-driven
  track, which guides the engineer and AI through structured requirement
  interpretation, planning, plan approval, implementation, verification, and
  delivery.
- **FR-004d**: Bug work items MUST enter a reproduce-first bugfix track that
  records reproduction evidence or a visible non-reproducible blocker before a
  fix may be treated as complete.
- **FR-004e**: Small tasks and small requirements MAY enter the standard-task
  track using a lightweight OpenSpec-style task brief instead of a full
  spec-driven package, provided the brief records scope, acceptance checks,
  implementation plan, risk level, and responsible engineer confirmation.
- **FR-004f**: The default routing policy MUST treat work as large or high-risk
  when it crosses more than one code module, changes public APIs, database schema,
  authentication or authorization, production delivery behavior, or is estimated
  above one engineer-day; such work MUST route to spec-driven or formal approval
  unless an authorized reviewer records an exception.
- **FR-005**: The system MUST generate a structured requirement interpretation
  containing goal, scope, constraints, acceptance criteria, risks, and unresolved
  questions.
- **FR-006**: The system MUST generate a versioned execution plan containing work
  units, expected outcomes, risks, verification activities, and unresolved
  questions.
- **FR-007**: The system MUST enforce the approval or confirmation gate required
  by the selected execution track before a Coding Agent may begin implementation.
- **FR-007a**: The system MUST determine authorized plan reviewers by mapping
  Teambition task or project configuration to enterprise identities and MUST
  record when no eligible reviewer can be resolved.
- **FR-007b**: The spec-driven track MUST require formal plan approval from an
  authorized plan reviewer before implementation.
- **FR-007c**: The standard-task track MUST require the responsible engineer to
  confirm a lightweight plan before implementation, but MUST NOT require formal
  reviewer approval unless policy, size, or risk escalates it.
- **FR-007d**: The bugfix track MUST require reproduction evidence or a visible
  non-reproducible blocker plus responsible engineer confirmation of the fix plan;
  high-risk bugs MUST escalate to formal plan approval.
- **FR-008**: A plan rejection MUST include reviewer feedback and return the task
  to plan revision.
- **FR-009**: Approval MUST bind to the exact plan version reviewed; changing the
  plan MUST invalidate approval for the previous version.
- **FR-010**: The system MUST invoke one configured Coding Agent only after the
  applicable approval requirements pass.
- **FR-011**: The system MUST maintain a durable TaskRun independently of Agent
  Session, client connection, and process lifetime.
- **FR-012**: Ending an Agent Session MUST NOT complete a TaskRun whose acceptance
  criteria have not passed.
- **FR-013**: The system MUST continue, retry, wait, block, escalate, cancel, or
  complete a TaskRun according to its recorded state and policies.
- **FR-014**: The system MUST resume interrupted work from committed progress and
  MUST NOT depend on a user progress query as a wake-up mechanism.
- **FR-015**: The system MUST prevent recovery and retry from duplicating completed
  approvals, artifacts, external updates, or worktime entries.
- **FR-016**: The system MUST retain the original business phase when marking a
  TaskRun blocked or escalated.
- **FR-017**: The system MUST distinguish normal waiting, external blocking, and
  escalation requiring human intervention.
- **FR-018**: The system MUST show the current phase, disposition, lifecycle,
  latest committed action, responsible role, next expected action, and timestamps.
- **FR-019**: The system MUST show blockers, retry history, human interventions,
  artifacts, and evidence relevant to each state decision.
- **FR-020**: The system MUST evaluate completion against the recorded acceptance
  criteria and required approval and verification evidence.
- **FR-021**: The system MUST refuse completion when required evidence is missing,
  stale, conflicting, or unverifiable.
- **FR-021a**: When automated verification is insufficient, the system MAY accept
  human acceptance evidence only if it is structured, auditable, and bound to a
  recorded acceptance criterion, authorized actor, time, and explanation.
- **FR-022**: The system MUST generate a delivery summary referencing completed
  work, changed artifacts, verification evidence, known limitations, and remaining
  risks.
- **FR-023**: The system MUST submit an attributable delivery update to the
  authoritative Teambition task without creating duplicate updates when retried,
  and MUST NOT automatically change the Teambition task status in the MVP.
- **FR-023a**: The MVP Teambition write boundary MUST be limited to permitted
  progress notes, delivery summaries, and responsible-engineer-confirmed worktime.
  Task status updates MUST NOT be performed automatically; any manual status
  operation must require explicit human action and audit, or be deferred to a
  future feature.
- **FR-024**: The system MUST present an editable actual-worktime suggestion that
  excludes unattended Agent execution and idle waiting by default.
- **FR-025**: The system MUST submit actual worktime only after the responsible
  engineer explicitly confirms the value and description. The MVP MUST NOT allow
  the Coding Agent or another user to submit actual worktime on the responsible
  engineer's behalf.
- **FR-026**: The system MUST preserve an audit trail for approvals, state
  transitions, external writes, retries, cancellations, and human interventions.
- **FR-027**: The system MUST enforce source-task visibility, plan-review authority,
  Coding Agent permissions, and worktime-submission authority independently.
- **FR-028**: The system MUST allow an authorized user to cancel an active TaskRun
  and MUST visibly report the resulting cleanup or unresolved effects.

### Operational & Governance Requirements

- **OR-001 Recovery**: A TaskRun, its committed progress, pending approval, blocker,
  artifacts, and evidence MUST survive Agent Session termination, process restart,
  and a short service interruption. Recovery MUST resume or wait from the latest
  committed state without requiring a user prompt. For the MVP, after service
  returns from a short interruption, each active TaskRun MUST continue, wait, or
  enter a visible blocked state within 15 minutes.
- **OR-002 External Events**: The MVP MUST process task updates, approvals,
  execution results, and delivery acknowledgements in a way that safely handles
  duplicate, delayed, missing, and out-of-order events. Full Gerrit, Jenkins, and
  enterprise test-platform automation is deferred.
- **OR-003 Authority**: Users MUST see only authorized tasks and evidence. Plan
  approval and actual worktime submission MUST require authorized human action.
  The Coding Agent MUST NOT approve its own plan or worktime and MUST operate only
  within the task's authorized workspace.
- **OR-004 Observability**: Users and operators MUST be able to inspect the
  TaskRun's phase, disposition, lifecycle, role, attempts, waits, decisions,
  evidence, external updates, and intervention history without reconstructing
  them from raw chat logs.
- **OR-005 Verification**: Verification MUST cover primary user journeys,
  authorization failures, interrupted execution, repeated execution, duplicate
  and out-of-order events, stale approvals, missing evidence, cancellation, and
  worktime-confirmation boundaries.

### Key Entities

- **Source Task**: The authoritative Teambition task identity, latest accessible
  source content, work item type, and task or project configuration used to
  resolve assigned engineers and authorized plan reviewers.
- **Task Capsule**: The local task-facing view that links the Source Task,
  structured interpretation, authorized workspace, acceptance criteria, and active
  TaskRuns.
- **Routing Decision**: An auditable decision that maps the Source Task's work
  item type and assessed size or risk to a TaskRun execution track.
- **TaskRun**: A durable execution instance with phase, disposition, lifecycle,
  execution track, attempt history, waits, blocker or escalation context, and
  completion status.
- **Requirement Interpretation**: A versioned, AI-generated representation of
  goal, scope, constraints, risks, acceptance criteria, and unresolved questions.
- **Execution Plan**: A versioned proposal of work units, outcomes, risks, and
  verification activities.
- **Lightweight Task Brief**: An OpenSpec-style lightweight plan for small tasks
  and small requirements, containing scope, acceptance checks, implementation
  steps, risk level, and responsible engineer confirmation.
- **Approval Decision**: An authorized human decision bound to an exact artifact
  version, actor, time, result, and comments.
- **Role Assignment**: The process or domain role responsible for an execution or
  review activity.
- **Execution Attempt**: One bounded attempt by a Coding Agent or verifier,
  including start, outcome, progress, and failure context.
- **Artifact**: A requirement, plan, code change, report, summary, attachment, or
  other versioned task output.
- **Knowledge Asset Candidate**: A reusable Spec document, template, lesson,
  prompt, checklist, or Skill candidate produced from task execution but not yet
  authoritative for any team.
- **Published Team Asset**: A reviewed and versioned Spec, Skill, template, or
  Knowledge asset shared to a project, department, or enterprise scope with an
  owner, access policy, evaluation evidence, and rollback path.
- **Evidence**: A traceable observation used to evaluate an acceptance criterion
  or state transition. Human acceptance evidence records the acceptance criterion,
  authorized actor, time, explanation, and audit reference.
- **External Event**: An attributable occurrence from Teambition, an Agent, a user,
  or another connected system that may affect a TaskRun.
- **Worktime Draft**: A suggested actual-worktime value and description that
  remains non-authoritative until confirmed by the responsible engineer.
- **Audit Record**: An immutable account of a significant decision, transition,
  external write, retry, cancellation, or intervention.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In pilot evaluation, at least 90% of authorized engineers can find
  and open an assigned task with its source context in under 30 seconds.
- **SC-002**: 100% of plan approvals and rejections identify the reviewer, exact
  plan version, decision time, and comments where required.
- **SC-003**: In all defined interruption tests, active TaskRuns recover from the
  latest committed progress without a user asking for status and without repeating
  a completed business action. After service returns from a short interruption,
  each active TaskRun continues, waits, or enters a visible blocked state within
  15 minutes.
- **SC-004**: In all duplicate and out-of-order event tests, the system produces no
  duplicate approval, task update, artifact, or worktime record and does not skip a
  required phase.
- **SC-005**: Users can identify a TaskRun's current phase, condition, blocker or
  required intervention, and supporting evidence within 10 seconds of opening its
  execution view.
- **SC-006**: Zero evaluated tasks are marked complete when any mandatory
  acceptance criterion, approval, or verification evidence is absent or failing.
  Human acceptance evidence counts only when it is structured, auditable, and
  bound to the relevant acceptance criterion and authorized actor.
- **SC-007**: 100% of submitted actual-worktime records have an explicit engineer
  confirmation and exclude unattended Agent runtime and idle waiting unless the
  engineer deliberately adds that time.
- **SC-008**: 100% of audited state transitions, external writes, approvals,
  cancellations, and human interventions identify their actor or source, time,
  TaskRun, and reason or evidence.
- **SC-009**: An authorized reviewer can reject a plan and return it for revision,
  while an unauthorized user succeeds in zero approval attempts.
- **SC-010**: A complete pilot task can move from assigned task through analysis,
  plan approval, implementation, verification, delivery summary, and worktime
  confirmation without requiring the user to re-enter Teambition source content.
- **SC-011**: 100% of pilot Teambition feature, task, and bug items show their
  preserved source type and selected execution track before implementation
  begins.
- **SC-012**: 100% of bug pilot items record reproduction evidence or an explicit
  non-reproducible blocker before completion can be evaluated.

## Assumptions

- Teambition remains the authoritative team task system; the MVP does not recreate
  full project-management functionality.
- Teambition exposes or can be mapped to three MVP work item types: feature, task,
  and bug.
- Teambition integration can use validated API or MCP access to retrieve a
  responsible engineer's personal task list and write permitted progress notes,
  delivery summaries, and responsible-engineer-confirmed worktime, subject to the
  MVP's human authorization boundaries. Automatic task status writes are outside
  the MVP.
- Enterprise identity can map the signed-in product user to a Teambition user and
  to plan-review and worktime permissions.
- Pilot tasks identify an authorized code workspace and provide sufficient
  acceptance criteria for implementation and verification.
- The MVP uses one configured Coding Agent per TaskRun; changing or comparing
  Coding Runtimes is deferred.
- TaskRuns may record reusable Spec/Knowledge/Skill candidates and the asset
  versions they consumed, but automatic publication to project, department, or
  enterprise catalogs is deferred.
- Requirement interpretation and planning may request human correction when task
  source information is insufficient.
- Source-task changes after plan approval require visible reconciliation before
  implementation may continue under the old plan.
- External systems may be temporarily unavailable; pending writes remain visible
  and retryable rather than being reported as successful.
- Suggested worktime is advisory. The responsible engineer remains accountable for
  the submitted value and description.
- The MVP is evaluated in a single enterprise environment; cross-tenant isolation
  and administration are deferred.
