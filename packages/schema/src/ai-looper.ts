import { Schema } from "effect"

export namespace AiLooper {
  export const ID = Schema.String
  export type ID = typeof ID.Type

  export const WorkItemType = Schema.Literals(["feature", "task", "bug", "unknown"])
  export type WorkItemType = typeof WorkItemType.Type

  export const SourceSystem = Schema.Literal("teambition")
  export type SourceSystem = typeof SourceSystem.Type

  export const VisibilityState = Schema.Literals(["visible", "missing", "inaccessible", "deleted", "archived", "reassigned"])
  export type VisibilityState = typeof VisibilityState.Type

  export const ExecutionTrack = Schema.Literals(["spec_driven", "standard_task", "bugfix"])
  export type ExecutionTrack = typeof ExecutionTrack.Type

  export const AssessedSize = Schema.Literals(["small", "medium", "large", "unknown"])
  export type AssessedSize = typeof AssessedSize.Type

  export const AssessedRisk = Schema.Literals(["low", "medium", "high", "unknown"])
  export type AssessedRisk = typeof AssessedRisk.Type

  export const GatePolicy = Schema.Literals(["formal_approval", "engineer_confirmation", "reproduction_then_confirmation"])
  export type GatePolicy = typeof GatePolicy.Type

  export const Phase = Schema.Literals([
    "received",
    "analyzing",
    "planning",
    "plan_review",
    "implementing",
    "verifying",
    "reporting",
    "time_confirmation",
    "completed",
    "cancelled",
  ])
  export type Phase = typeof Phase.Type

  export const Disposition = Schema.Literals(["running", "waiting", "blocked", "escalated"])
  export type Disposition = typeof Disposition.Type

  export const Lifecycle = Schema.Literals(["active", "completed", "cancelled", "archived"])
  export type Lifecycle = typeof Lifecycle.Type

  export const GateState = Schema.Literals([
    "not_required",
    "awaiting_confirmation",
    "confirmed",
    "awaiting_formal_approval",
    "formally_approved",
    "rejected",
    "escalated",
  ])
  export type GateState = typeof GateState.Type

  export const AcceptanceCriterion = Schema.Struct({
    acceptance_criterion_id: ID,
    text: Schema.String,
    source_ref: Schema.String,
  })
  export type AcceptanceCriterion = typeof AcceptanceCriterion.Type

  export const SourceTask = Schema.Struct({
    source_task_id: ID,
    source_system: SourceSystem,
    title: Schema.String,
    description: Schema.String.pipe(Schema.optional),
    source_status: Schema.String.pipe(Schema.optional),
    priority: Schema.String.pipe(Schema.optional),
    deadline: Schema.String.pipe(Schema.optional),
    work_item_type: WorkItemType,
    assignee_ids: Schema.Array(ID),
    project_id: ID.pipe(Schema.optional),
    project_config_ref: Schema.String.pipe(Schema.optional),
    attachment_refs: Schema.Array(Schema.String),
    acceptance_criteria: Schema.Array(AcceptanceCriterion),
    source_version: Schema.String,
    retrieved_at: Schema.String,
    visibility_state: VisibilityState,
  })
  export type SourceTask = typeof SourceTask.Type

  export const TaskCapsule = Schema.Struct({
    task_capsule_id: ID,
    source_task_id: ID,
    responsible_engineer_id: ID,
    workspace_ref: Schema.String,
    active_task_run_id: ID.pipe(Schema.optional),
    created_at: Schema.String,
    updated_at: Schema.String,
  })
  export type TaskCapsule = typeof TaskCapsule.Type

  export const TaskRun = Schema.Struct({
    task_run_id: ID,
    task_capsule_id: ID,
    execution_track: ExecutionTrack,
    gate_state: GateState,
    phase: Phase,
    disposition: Disposition,
    lifecycle: Lifecycle,
    latest_committed_step: Schema.String,
    next_expected_action: Schema.String.pipe(Schema.optional),
    responsible_role: Schema.String.pipe(Schema.optional),
    retry_count: Schema.Number,
    retry_budget: Schema.Number,
    last_attempt_at: Schema.String.pipe(Schema.optional),
    next_wake_at: Schema.String.pipe(Schema.optional),
    blocked_reason: Schema.String.pipe(Schema.optional),
    blocked_owner: Schema.String.pipe(Schema.optional),
    blocked_since: Schema.String.pipe(Schema.optional),
    escalation_reason: Schema.String.pipe(Schema.optional),
    escalated_at: Schema.String.pipe(Schema.optional),
    created_at: Schema.String,
    updated_at: Schema.String,
    completed_at: Schema.String.pipe(Schema.optional),
    cancelled_at: Schema.String.pipe(Schema.optional),
  })
  export type TaskRun = typeof TaskRun.Type

  export const RoutingDecision = Schema.Struct({
    routing_decision_id: ID,
    task_run_id: ID,
    source_task_id: ID,
    source_version: Schema.String,
    source_work_item_type: WorkItemType,
    assessed_size: AssessedSize,
    assessed_risk: AssessedRisk,
    execution_track: ExecutionTrack,
    gate_policy: GatePolicy,
    reason: Schema.String,
    decided_by: Schema.Literals(["system", "authorized_user", "policy"]),
    decided_at: Schema.String,
  })
  export type RoutingDecision = typeof RoutingDecision.Type

  export const ApprovalDecision = Schema.Struct({
    approval_decision_id: ID,
    task_run_id: ID,
    artifact_type: Schema.String,
    artifact_id: ID,
    artifact_version: Schema.Number,
    decision: Schema.Literals(["approved", "rejected"]),
    actor_id: ID,
    authority_source: Schema.String,
    comments: Schema.String.pipe(Schema.optional),
    decided_at: Schema.String,
  })
  export type ApprovalDecision = typeof ApprovalDecision.Type

  export const ArtifactType = Schema.Literals([
    "source_snapshot",
    "requirement_interpretation",
    "execution_plan",
    "lightweight_task_brief",
    "code_change",
    "test_result",
    "delivery_summary",
    "bug_reproduction",
    "worktime_draft",
    "knowledge_asset_candidate",
    "attachment",
  ])
  export type ArtifactType = typeof ArtifactType.Type

  export const Artifact = Schema.Struct({
    artifact_id: ID,
    task_run_id: ID,
    artifact_type: ArtifactType,
    version: Schema.Number,
    content_ref: Schema.String.pipe(Schema.optional),
    provenance: Schema.String,
    created_at: Schema.String,
  })
  export type Artifact = typeof Artifact.Type

  export const EvidenceResult = Schema.Literals(["pass", "fail", "inconclusive"])
  export type EvidenceResult = typeof EvidenceResult.Type

  export const EvidenceType = Schema.Literals([
    "automated_test",
    "static_check",
    "runtime_observation",
    "bug_reproduction",
    "human_acceptance",
    "external_ack",
    "manual_note",
  ])
  export type EvidenceType = typeof EvidenceType.Type

  export const Evidence = Schema.Struct({
    evidence_id: ID,
    task_run_id: ID,
    acceptance_criterion_id: ID.pipe(Schema.optional),
    evidence_type: EvidenceType,
    result: EvidenceResult,
    artifact_refs: Schema.Array(ID),
    actor_id: ID.pipe(Schema.optional),
    runtime_adapter: Schema.String.pipe(Schema.optional),
    explanation: Schema.String.pipe(Schema.optional),
    observed_at: Schema.String,
    audit_record_id: ID.pipe(Schema.optional),
  })
  export type Evidence = typeof Evidence.Type

  export const ExternalWriteType = Schema.Literals(["progress_note", "delivery_summary", "worktime"])
  export type ExternalWriteType = typeof ExternalWriteType.Type

  export const ExternalEvent = Schema.Struct({
    external_event_id: ID,
    source_system: Schema.Literals(["teambition", "ai_looper_ui", "coding_runtime"]),
    source_event_id: Schema.String.pipe(Schema.optional),
    event_type: Schema.String,
    payload_ref: Schema.String,
    received_at: Schema.String,
    dedupe_key: Schema.String,
    processed_state: Schema.Literals(["pending", "processed", "ignored_duplicate", "failed"]),
  })
  export type ExternalEvent = typeof ExternalEvent.Type

  export const ExternalWrite = Schema.Struct({
    external_write_id: ID,
    task_run_id: ID,
    target_system: SourceSystem,
    write_type: ExternalWriteType,
    idempotency_key: Schema.String,
    payload_ref: Schema.String,
    status: Schema.Literals(["pending", "sent", "acknowledged", "retrying", "failed", "cancelled"]),
    attempt_count: Schema.Number,
    next_retry_at: Schema.String.pipe(Schema.optional),
    last_error: Schema.String.pipe(Schema.optional),
    created_at: Schema.String,
    updated_at: Schema.String,
    acknowledged_at: Schema.String.pipe(Schema.optional),
  })
  export type ExternalWrite = typeof ExternalWrite.Type

  export const WorktimeDraft = Schema.Struct({
    worktime_draft_id: ID,
    task_run_id: ID,
    suggested_minutes: Schema.Number,
    suggested_description: Schema.String,
    excluded_agent_runtime_minutes: Schema.Number,
    excluded_idle_wait_minutes: Schema.Number,
    confirmed_minutes: Schema.Number.pipe(Schema.optional),
    confirmed_description: Schema.String.pipe(Schema.optional),
    confirmed_by: ID.pipe(Schema.optional),
    confirmed_at: Schema.String.pipe(Schema.optional),
    submission_write_id: ID.pipe(Schema.optional),
  })
  export type WorktimeDraft = typeof WorktimeDraft.Type

  export const KnowledgeAssetCandidate = Schema.Struct({
    knowledge_asset_candidate_id: ID,
    task_run_id: ID,
    asset_type: Schema.Literals(["spec_document", "template", "checklist", "lesson", "prompt", "skill"]),
    title: Schema.String,
    content_ref: Schema.String,
    provenance_artifact_refs: Schema.Array(ID),
    suggested_scope: Schema.Literals(["project", "department", "enterprise"]),
    owner_candidate: Schema.String.pipe(Schema.optional),
    evaluation_refs: Schema.Array(ID),
    status: Schema.Literals(["draft", "needs_review", "approved_for_publication", "rejected", "superseded"]),
    created_at: Schema.String,
    updated_at: Schema.String,
  })
  export type KnowledgeAssetCandidate = typeof KnowledgeAssetCandidate.Type

  export const PublishedTeamAsset = Schema.Struct({
    published_asset_id: ID,
    source_candidate_id: ID,
    asset_type: Schema.Literals(["spec_document", "template", "checklist", "lesson", "prompt", "skill"]),
    version: Schema.String,
    scope: Schema.Literals(["project", "department", "enterprise"]),
    owner_id: ID,
    approval_decision_id: ID,
    access_policy_ref: Schema.String,
    rollback_ref: Schema.String,
    published_at: Schema.String,
    deprecated_at: Schema.String.pipe(Schema.optional),
  })
  export type PublishedTeamAsset = typeof PublishedTeamAsset.Type

  export const AuditRecord = Schema.Struct({
    audit_record_id: ID,
    task_run_id: ID,
    actor_or_source: Schema.String,
    action_type: Schema.String,
    reason_or_evidence: Schema.String.pipe(Schema.optional),
    before_state_ref: Schema.String.pipe(Schema.optional),
    after_state_ref: Schema.String.pipe(Schema.optional),
    related_artifact_refs: Schema.Array(ID),
    created_at: Schema.String,
  })
  export type AuditRecord = typeof AuditRecord.Type
}
