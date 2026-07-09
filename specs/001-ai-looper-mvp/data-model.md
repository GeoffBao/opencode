# Data Model: AI Looper MVP

## Overview

AI Looper models enterprise work as durable TaskRuns that are connected to
authoritative Teambition Source Tasks. Agent Sessions, provider calls, and runtime
attempts are implementation details recorded as attempts and evidence; they do not
own completion state.

## Entities

### SourceTask

Authoritative task content as observed from Teambition.

Fields:

- `source_task_id`: stable Teambition task identity.
- `source_system`: `teambition`.
- `source_url`: human-readable link when available.
- `title`, `description`, `source_status`, `priority`, `deadline`.
- `work_item_type`: `feature`, `task`, `bug`, or `unknown`.
- `assignee_ids`: Teambition users assigned to the task.
- `project_id`: Teambition project identity.
- `project_config_ref`: configuration source used to resolve reviewers.
- `attachment_refs`: source attachment identities and retrieval state.
- `acceptance_criteria`: normalized criteria with source trace references.
- `source_version`: version/hash of observed task content.
- `retrieved_at`: time the source snapshot was fetched.
- `visibility_state`: `visible`, `missing`, `inaccessible`, `deleted`,
  `archived`, or `reassigned`.

Validation:

- Missing or inaccessible source content is recorded explicitly.
- Missing, unsupported, or changed work item type is recorded and routed through a
  visible reconciliation decision.
- AI-generated interpretation never overwrites SourceTask content.
- Source changes after plan approval require reconciliation before continuing
  under the approved plan.

### TaskCapsule

Local task-facing container that ties SourceTask, workspace, interpretations, and
TaskRuns together.

Fields:

- `task_capsule_id`: local stable identity.
- `source_task_id`: link to SourceTask.
- `responsible_engineer_id`: mapped enterprise identity.
- `workspace_ref`: authorized local/company workspace.
- `active_task_run_id`: current TaskRun when one is active.
- `created_at`, `updated_at`.

Validation:

- User access requires SourceTask visibility and mapped enterprise identity.
- A TaskCapsule may have multiple historical TaskRuns but at most one active
  TaskRun unless a future policy allows parallel attempts.

### TaskRun

Durable execution truth for one end-to-end attempt.

Fields:

- `task_run_id`: stable local identity.
- `task_capsule_id`: parent task capsule.
- `execution_track`: `spec_driven`, `standard_task`, or `bugfix`.
- `gate_state`: `not_required`, `awaiting_confirmation`, `confirmed`,
  `awaiting_formal_approval`, `formally_approved`, `rejected`, or `escalated`.
- `phase`: `received`, `analyzing`, `planning`, `plan_review`, `implementing`,
  `verifying`, `reporting`, `time_confirmation`, `completed`, `cancelled`.
- `disposition`: `running`, `waiting`, `blocked`, `escalated`.
- `lifecycle`: `active`, `completed`, `cancelled`, `archived`.
- `latest_committed_step`: durable checkpoint summary.
- `next_expected_action`: machine-readable next action.
- `responsible_role`: current role name such as `engineer`, `plan_reviewer`,
  `coding_runtime`, or `verifier`.
- `retry_count`, `retry_budget`, `last_attempt_at`, `next_wake_at`.
- `blocked_reason`, `blocked_owner`, `blocked_since`.
- `escalation_reason`, `escalated_at`.
- `created_at`, `updated_at`, `completed_at`, `cancelled_at`.

Validation:

- Agent Session end never changes `lifecycle` by itself.
- Execution track is selected before implementation starts and changes only
  through an audited rerouting decision.
- `blocked` and `escalated` preserve the original business `phase`.
- Recovery scans active TaskRuns after service return and moves each to continue,
  wait, or visible blocked state within 15 minutes.

State transition summary:

```text
received
  → analyzing
  → planning
  → plan_review
  → implementing
  → verifying
  → reporting
  → time_confirmation
  → completed
```

Allowed side transitions:

- Any active phase may become `waiting`, `blocked`, or `escalated` without losing
  the original phase.
- `plan_review` can return to `planning` after rejection.
- `implementing` can return to `planning` when source changes invalidate the
  approved plan.
- `bugfix` track requires reproduction evidence or a non-reproducible blocker
  before completion evaluation.
- `spec_driven` track requires structured requirement interpretation, execution
  plan, and plan approval before implementation.
- `standard_task` track requires responsible engineer confirmation of a
  lightweight task brief before implementation.
- High-risk `standard_task` or `bugfix` runs can escalate to formal approval.
- Any active phase can move to `cancelled` through an authorized cancellation.
- `completed`, `cancelled`, and `archived` are terminal for automatic execution.

### RoutingDecision

Auditable mapping from Teambition source type and assessed complexity to an AI
Looper execution track.

Fields:

- `routing_decision_id`, `task_run_id`, `source_task_id`, `source_version`.
- `source_work_item_type`: `feature`, `task`, `bug`, or `unknown`.
- `assessed_size`: `small`, `medium`, `large`, or `unknown`.
- `assessed_risk`: `low`, `medium`, `high`, or `unknown`.
- `execution_track`: `spec_driven`, `standard_task`, or `bugfix`.
- `gate_policy`: `formal_approval`, `engineer_confirmation`, or
  `reproduction_then_confirmation`.
- `reason`.
- `decided_by`: `system`, `authorized_user`, or `policy`.
- `decided_at`.

Validation:

- Large feature and large task items route to `spec_driven`.
- Small task and small requirement items may route to `standard_task`.
- Bug items route to `bugfix`.
- High-risk bugs and high-risk standard tasks escalate to formal approval.
- Default large or high-risk signals include cross-module changes, public API
  changes, database schema changes, authentication or authorization changes,
  production delivery behavior changes, or estimates above one engineer-day.
- Missing or unsupported work item type routes to visible human reconciliation
  before implementation.
- Routing changes are versioned and audited.

### LightweightTaskBrief

OpenSpec-style lightweight plan for small tasks and small requirements.

Fields:

- `lightweight_task_brief_id`, `task_run_id`, `source_version`.
- `scope`.
- `acceptance_checks`.
- `implementation_steps`.
- `risk_level`: `low`, `medium`, or `high`.
- `confirmed_by`: responsible engineer identity.
- `confirmed_at`.

Validation:

- Required before implementation for `standard_task`.
- High-risk briefs escalate to formal plan approval.
- Confirmation is audited and does not replace completion evidence.

### RequirementInterpretation

AI-generated structured understanding of the SourceTask.

Fields:

- `interpretation_id`, `task_run_id`, `source_version`.
- `version`: monotonic artifact version.
- `goal`, `scope`, `constraints`, `risks`, `unresolved_questions`.
- `acceptance_criteria_map`: mapping from SourceTask criteria to interpreted
  testable criteria.
- `created_by`: agent/runtime identity.
- `created_at`.

Validation:

- Must reference the SourceTask version it interpreted.
- Unresolved questions block planning or require human correction.

### ExecutionPlan

Versioned plan requiring human approval.

Fields:

- `execution_plan_id`, `task_run_id`, `version`.
- `work_units`: ordered units with intended outcome and risk.
- `verification_plan`: criteria-to-evidence plan.
- `runtime_requirements`: workspace and tool permissions needed.
- `unresolved_questions`.
- `status`: `draft`, `awaiting_review`, `approved`, `rejected`, `invalidated`.
- `created_at`, `updated_at`.

Validation:

- Implementation cannot start in `spec_driven`, or any escalated track, until the
  exact plan version is approved.
- Changing the plan invalidates previous approval for implementation.
- Reviewer resolution failure blocks `plan_review` with visible reason.

### ApprovalDecision

Human decision bound to a specific artifact version.

Fields:

- `approval_decision_id`.
- `task_run_id`.
- `artifact_type`: `execution_plan`, `human_acceptance_evidence`, or future
  approval artifact.
- `artifact_id`, `artifact_version`.
- `decision`: `approved` or `rejected`.
- `actor_id`: enterprise identity.
- `authority_source`: Teambition task/project configuration mapping.
- `comments`.
- `decided_at`.

Validation:

- Actor must be authorized for the artifact and TaskRun.
- Approval of stale artifact versions is refused and audited.
- Coding Runtime identities cannot approve privileged artifacts.

### RoleAssignment

Current or historical responsibility for a phase or attempt.

Fields:

- `role_assignment_id`, `task_run_id`.
- `role`: `engineer`, `plan_reviewer`, `coding_runtime`, `verifier`,
  `teambition_adapter`, or future role.
- `actor_ref`: human identity, runtime identity, or adapter identity.
- `scope`: permissions and data boundaries.
- `started_at`, `ended_at`.

Validation:

- Roles receive only the minimum permissions needed for their scope.
- Role changes are audited.

### ExecutionAttempt

One bounded attempt by an Agent Runtime, verifier, recovery worker, or adapter.

Fields:

- `execution_attempt_id`, `task_run_id`.
- `attempt_type`: `analysis`, `planning`, `runtime_execution`, `verification`,
  `recovery`, `external_write`.
- `runtime_adapter`: `opencode` for MVP runtime attempts.
- `input_artifact_refs`, `output_artifact_refs`, `evidence_refs`.
- `started_at`, `ended_at`.
- `outcome`: `succeeded`, `failed`, `no_progress`, `interrupted`, `blocked`.
- `failure_reason`, `progress_summary`.

Validation:

- Attempts are append-only.
- Repeated no-progress attempts can escalate according to retry policy.

### Artifact

Versioned output used by the workflow.

Fields:

- `artifact_id`, `task_run_id`.
- `artifact_type`: `source_snapshot`, `requirement_interpretation`,
  `execution_plan`, `lightweight_task_brief`, `code_change`, `test_result`,
  `delivery_summary`, `bug_reproduction`, `worktime_draft`,
  `knowledge_asset_candidate`, or `attachment`.
- `version`.
- `content_ref` or inline bounded content.
- `provenance`: source system, runtime, or actor.
- `created_at`.

Validation:

- Artifacts referenced by approvals or evidence are immutable by version.
- Delivery summary references supporting artifacts and evidence.

### KnowledgeAssetCandidate

Reusable Spec document, template, lesson, checklist, prompt, or Skill candidate
produced from a TaskRun.

Fields:

- `knowledge_asset_candidate_id`, `task_run_id`.
- `asset_type`: `spec_document`, `template`, `checklist`, `lesson`, `prompt`, or
  `skill`.
- `title`.
- `content_ref`.
- `provenance_artifact_refs`.
- `suggested_scope`: `project`, `department`, or `enterprise`.
- `owner_candidate`.
- `evaluation_refs`.
- `status`: `draft`, `needs_review`, `approved_for_publication`, `rejected`, or
  `superseded`.
- `created_at`, `updated_at`.

Validation:

- Candidates are not authoritative and must not be automatically used as team
  policy.
- Publication requires owner, provenance, evaluation evidence, approval, version,
  access scope, and rollback path.
- TaskRuns record consumed asset versions so resumed work does not silently change
  behavior.

### PublishedTeamAsset

Future governed asset shared across a project, department, or enterprise scope.

Fields:

- `published_asset_id`.
- `source_candidate_id`.
- `asset_type`: `spec_document`, `template`, `checklist`, `lesson`, `prompt`, or
  `skill`.
- `version`.
- `scope`: `project`, `department`, or `enterprise`.
- `owner_id`.
- `approval_decision_id`.
- `access_policy_ref`.
- `rollback_ref`.
- `published_at`, `deprecated_at`.

Validation:

- Out of MVP for automatic publication.
- Every published asset must have a rollback or deprecation path.

### Evidence

Traceable observation used for state transition or completion.

Fields:

- `evidence_id`, `task_run_id`.
- `acceptance_criterion_id`: required for completion evidence.
- `evidence_type`: `automated_test`, `static_check`, `runtime_observation`,
  `bug_reproduction`, `human_acceptance`, `external_ack`, or `manual_note`.
- `result`: `pass`, `fail`, `inconclusive`.
- `artifact_refs`.
- `actor_id` or `runtime_adapter`.
- `explanation`.
- `observed_at`.
- `audit_record_id`.

Validation:

- Completion evidence must be `pass` and not stale, conflicting, or
  unverifiable.
- Human acceptance evidence requires acceptance criterion, authorized actor, time,
  explanation, and audit reference.

### ExternalEvent

Inbound event from Teambition, an Agent, a user, or another connected system.

Fields:

- `external_event_id`: local identity.
- `source_system`: `teambition`, `ai_looper_ui`, `coding_runtime`, or future
  system.
- `source_event_id`: stable upstream identity when available.
- `event_type`.
- `payload_ref`.
- `received_at`.
- `dedupe_key`.
- `processed_state`: `pending`, `processed`, `ignored_duplicate`, `failed`.

Validation:

- Duplicate events are ignored without duplicate side effects.
- Events that arrive before the TaskRun waits for them are retained or reconciled
  according to transition guards.

### ExternalWrite

Outbox record for idempotent writes to Teambition or future systems.

Fields:

- `external_write_id`.
- `task_run_id`.
- `target_system`: `teambition`.
- `write_type`: `delivery_summary`, `worktime`, or future `task_status`.
- `idempotency_key`.
- `payload_ref`.
- `status`: `pending`, `sent`, `acknowledged`, `retrying`, `failed`, `cancelled`.
- `attempt_count`, `next_retry_at`, `last_error`.
- `created_at`, `updated_at`, `acknowledged_at`.

Validation:

- Idempotency key is stable for the same business write.
- MVP write types are progress note, delivery summary, and
  engineer-confirmed worktime.
- Automatic task-status writes are not emitted in MVP. Any manual status write
  must be explicit, authorized, and audited, or deferred to a future feature.

### WorktimeDraft

Advisory worktime suggestion awaiting responsible engineer confirmation.

Fields:

- `worktime_draft_id`, `task_run_id`.
- `suggested_minutes`.
- `suggested_description`.
- `excluded_agent_runtime_minutes`.
- `excluded_idle_wait_minutes`.
- `confirmed_minutes`, `confirmed_description`.
- `confirmed_by`, `confirmed_at`.
- `submission_write_id`.

Validation:

- Only the responsible engineer can confirm and submit.
- Coding Runtime and other users cannot submit on the engineer's behalf.
- Unattended Agent runtime and idle waiting are excluded by default.

### AuditRecord

Immutable account of significant decisions and effects.

Fields:

- `audit_record_id`, `task_run_id`.
- `actor_or_source`.
- `action_type`.
- `reason_or_evidence`.
- `before_state_ref`, `after_state_ref`.
- `related_artifact_refs`.
- `created_at`.

Validation:

- Required for approvals, state transitions, external writes, retries,
  cancellations, unauthorized attempts, and human interventions.

## Identity and Permission Relationships

- Enterprise user identity maps to Teambition user identity.
- SourceTask visibility gates task list and TaskCapsule access.
- Plan reviewer authority maps from Teambition task/project configuration.
- Worktime submission authority is restricted to the responsible engineer.
- Coding Runtime permissions are scoped to the authorized workspace and approved
  plan.

## Execution Track Rules

- `spec_driven`: used for large features and large tasks. Requires structured
  requirement interpretation, execution plan, plan approval, implementation,
  verification, delivery summary, and worktime confirmation.
- `standard_task`: used for smaller tasks where a full spec-driven decomposition
  is not required. Uses an OpenSpec-style lightweight task brief and responsible
  engineer confirmation instead of formal reviewer approval unless policy, size,
  or risk escalates it. Still requires durable TaskRun, evidence, delivery
  summary, worktime confirmation, audit, and idempotent writes.
- `bugfix`: used for bug work items. Requires reproduction evidence or a visible
  non-reproducible blocker plus responsible engineer confirmation of the fix plan
  before implementation. High-risk bugs escalate to formal approval. Bugfix work
  follows repository guidance to reproduce first and then verify the fix.

## Teambition Adapter Boundary

Minimum read capabilities:

- list assigned feature/task/bug work items for the signed-in engineer;
- fetch work item detail, attachments, acceptance criteria, source status, and
  source version;
- resolve task/project configuration used for reviewer policy;
- poll or receive source task updates.

Minimum write capabilities:

- write permitted progress notes;
- write delivery summaries;
- submit responsible-engineer-confirmed worktime.

Excluded from automatic MVP writes:

- task status transitions;
- project metadata changes;
- assignee, priority, deadline, or attachment mutation.

## Idempotency Keys

- Delivery summary: `task_run_id + delivery_summary_artifact_id + version`.
- Worktime: `task_run_id + responsible_engineer_id + confirmed_at`.
- Approval event: `task_run_id + artifact_id + artifact_version + actor_id`.
- Runtime attempt result: `execution_attempt_id + runtime_adapter`.
- Source event: upstream `source_event_id` when available, otherwise a stable hash
  of source system, event type, source task, actor, and timestamp bucket.
