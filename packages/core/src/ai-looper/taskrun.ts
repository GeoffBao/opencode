import { AiLooper } from "@opencode-ai/schema/ai-looper"

export const Phase = AiLooper.Phase
export const Disposition = AiLooper.Disposition
export const Lifecycle = AiLooper.Lifecycle
export const GateState = AiLooper.GateState

export interface TransitionInput {
  readonly phase: AiLooper.Phase
  readonly lifecycle: AiLooper.Lifecycle
  readonly nextPhase: AiLooper.Phase
  readonly gateState: AiLooper.GateState
  readonly requiredEvidencePresent?: boolean
}

export interface SourceTaskSnapshotInput {
  readonly artifactID: AiLooper.ID
  readonly taskRunID: AiLooper.ID
  readonly sourceTask: AiLooper.SourceTask
  readonly createdAt: string
  readonly provenance?: string
}

export interface TaskCapsuleInput {
  readonly taskCapsuleID: AiLooper.ID
  readonly sourceTask: AiLooper.SourceTask
  readonly responsibleEngineerID: AiLooper.ID
  readonly workspaceRef: string
  readonly activeTaskRunID?: AiLooper.ID
  readonly createdAt: string
}

export interface PlanDecisionValidationInput {
  readonly currentPlanID: AiLooper.ID
  readonly currentPlanVersion: number
  readonly requestedPlanID: AiLooper.ID
  readonly requestedPlanVersion: number
  readonly reviewerIDs: ReadonlyArray<string>
  readonly actorID: AiLooper.ID
}

export interface LightweightBriefConfirmationInput {
  readonly taskRun: Pick<AiLooper.TaskRun, "execution_track" | "gate_state">
  readonly confirmedBy: AiLooper.ID
  readonly responsibleEngineerID: AiLooper.ID
}

export interface TaskRunCreationInput {
  readonly taskRunID: AiLooper.ID
  readonly taskCapsuleID: AiLooper.ID
  readonly executionTrack: AiLooper.ExecutionTrack
  readonly existingTaskRuns?: ReadonlyArray<AiLooper.TaskRun>
  readonly createdAt: string
}

export interface VersionedArtifactInput {
  readonly artifactID: AiLooper.ID
  readonly taskRunID: AiLooper.ID
  readonly sourceVersion?: string
  readonly version: number
  readonly createdAt: string
  readonly createdBy: string
}

export interface ExecutionAttempt {
  readonly execution_attempt_id: AiLooper.ID
  readonly task_run_id: AiLooper.ID
  readonly attempt_type: "analysis" | "planning" | "runtime_execution" | "verification" | "recovery" | "external_write"
  readonly runtime_adapter?: "opencode"
  readonly input_artifact_refs: ReadonlyArray<string>
  readonly output_artifact_refs: ReadonlyArray<string>
  readonly evidence_refs: ReadonlyArray<string>
  readonly commands_run?: ReadonlyArray<string>
  readonly diagnostic_refs?: ReadonlyArray<string>
  readonly started_at: string
  readonly ended_at: string
  readonly outcome: "succeeded" | "failed" | "no_progress" | "interrupted" | "blocked"
  readonly failure_reason?: string
  readonly progress_summary: string
}

export interface ExecutionAttemptSummary {
  readonly execution_attempt_id: AiLooper.ID
  readonly task_run_id: AiLooper.ID
  readonly attempt_type: "analysis" | "planning" | "implementation" | "validation" | "reporting" | "recovery"
  readonly outcome: "succeeded" | "failed" | "blocked" | "cancelled"
  readonly started_at: string
  readonly ended_at?: string
  readonly progress_summary?: string
}

export interface TaskRunDetailQueryInput {
  readonly taskRun: AiLooper.TaskRun
  readonly artifacts?: ReadonlyArray<AiLooper.Artifact>
  readonly evidence?: ReadonlyArray<AiLooper.Evidence>
  readonly attempts?: ReadonlyArray<ExecutionAttempt>
  readonly auditRecords?: ReadonlyArray<AiLooper.AuditRecord>
}

export interface TaskRunDetail {
  readonly task_run: AiLooper.TaskRun
  readonly artifacts: ReadonlyArray<AiLooper.Artifact>
  readonly evidence: ReadonlyArray<AiLooper.Evidence>
  readonly attempts: ReadonlyArray<ExecutionAttemptSummary>
  readonly audit_records: ReadonlyArray<AiLooper.AuditRecord>
}

export interface TaskRunCancellationInput {
  readonly taskRun: AiLooper.TaskRun
  readonly actorID: AiLooper.ID
  readonly authorizedActorIDs: ReadonlyArray<AiLooper.ID>
  readonly reason: string
  readonly now: string
  readonly attempts?: ReadonlyArray<ExecutionAttempt>
  readonly externalWrites?: ReadonlyArray<AiLooper.ExternalWrite>
}

export function createSourceTaskSnapshotArtifact(input: SourceTaskSnapshotInput): AiLooper.Artifact {
  return {
    artifact_id: input.artifactID,
    task_run_id: input.taskRunID,
    artifact_type: "source_snapshot",
    version: 1,
    content_ref: `source_task:${input.sourceTask.source_system}:${input.sourceTask.source_task_id}:${input.sourceTask.source_version}`,
    provenance: input.provenance ?? input.sourceTask.source_system,
    created_at: input.createdAt,
  }
}

export function canViewSourceTask(sourceTask: AiLooper.SourceTask, userID: AiLooper.ID) {
  return sourceTask.visibility_state === "visible" && sourceTask.assignee_ids.includes(userID)
}

export function createTaskCapsule(input: TaskCapsuleInput): AiLooper.TaskCapsule {
  return {
    task_capsule_id: input.taskCapsuleID,
    source_task_id: input.sourceTask.source_task_id,
    responsible_engineer_id: input.responsibleEngineerID,
    workspace_ref: input.workspaceRef,
    active_task_run_id: input.activeTaskRunID,
    created_at: input.createdAt,
    updated_at: input.createdAt,
  }
}

export function findActiveTaskRun(taskRuns: ReadonlyArray<AiLooper.TaskRun>) {
  return taskRuns.find((taskRun) => taskRun.lifecycle === "active")
}

export function appendExecutionAttempt(attempts: ReadonlyArray<ExecutionAttempt>, attempt: ExecutionAttempt) {
  return [...attempts, attempt]
}

export function recoverableTaskRuns(taskRuns: ReadonlyArray<AiLooper.TaskRun>, now: string) {
  return taskRuns.filter((taskRun) => taskRun.lifecycle === "active" && (!taskRun.next_wake_at || taskRun.next_wake_at <= now))
}

export function recoveryDeadline(serviceReturnedAt: string) {
  return new Date(new Date(serviceReturnedAt).getTime() + 15 * 60 * 1000).toISOString()
}

export function applyAttemptOutcome(input: {
  readonly taskRun: AiLooper.TaskRun
  readonly attempt: Pick<ExecutionAttempt, "outcome" | "ended_at" | "failure_reason">
  readonly nextWakeAt: string
}) {
  if (input.attempt.outcome === "no_progress") return applyNoProgress(input.taskRun, input.attempt, input.nextWakeAt)
  if (input.attempt.outcome === "blocked") {
    return {
      ...input.taskRun,
      disposition: "blocked" as const,
      blocked_reason: input.attempt.failure_reason ?? "Runtime attempt blocked",
      blocked_since: input.attempt.ended_at,
      last_attempt_at: input.attempt.ended_at,
      updated_at: input.attempt.ended_at,
    }
  }
  return {
    ...input.taskRun,
    last_attempt_at: input.attempt.ended_at,
    updated_at: input.attempt.ended_at,
  }
}

export function cancelTaskRun(input: TaskRunCancellationInput) {
  if (!input.authorizedActorIDs.includes(input.actorID)) {
    return { status: "unauthorized" as const, taskRun: input.taskRun }
  }
  if (input.taskRun.lifecycle !== "active") {
    return { status: "not_active" as const, taskRun: input.taskRun }
  }
  return {
    status: "cancelled" as const,
    taskRun: {
      ...input.taskRun,
      phase: "cancelled" as const,
      lifecycle: "cancelled" as const,
      latest_committed_step: "TaskRun cancelled by authorized human",
      next_expected_action: "review_unresolved_cancellation_effects",
      cancelled_at: input.now,
      updated_at: input.now,
    } satisfies AiLooper.TaskRun,
    unresolvedEffects: {
      execution_attempt_ids: unresolvedAttemptIDs(input.attempts ?? []),
      external_write_ids: unresolvedExternalWriteIDs(input.externalWrites ?? []),
    },
  }
}

export function createTaskRunDetail(input: TaskRunDetailQueryInput) {
  return {
    task_run: input.taskRun,
    artifacts: byTaskRun(input.artifacts ?? [], input.taskRun.task_run_id),
    evidence: byTaskRun(input.evidence ?? [], input.taskRun.task_run_id),
    attempts: (input.attempts ?? [])
      .filter((attempt) => attempt.task_run_id === input.taskRun.task_run_id)
      .map((attempt) => ({
        execution_attempt_id: attempt.execution_attempt_id,
        task_run_id: attempt.task_run_id,
        attempt_type: detailAttemptType(attempt.attempt_type),
        outcome: detailAttemptOutcome(attempt.outcome),
        started_at: attempt.started_at,
        ended_at: attempt.ended_at,
        progress_summary: attempt.progress_summary,
      })),
    audit_records: byTaskRun(input.auditRecords ?? [], input.taskRun.task_run_id),
  } satisfies TaskRunDetail
}

export function createTaskRunDiagnostics(input: {
  readonly taskRun: AiLooper.TaskRun
  readonly attempts: ReadonlyArray<Pick<ExecutionAttempt, "task_run_id">>
  readonly externalWrites: ReadonlyArray<Pick<AiLooper.ExternalWrite, "task_run_id" | "status">>
  readonly auditRecords: ReadonlyArray<Pick<AiLooper.AuditRecord, "task_run_id" | "action_type">>
}) {
  const taskRunAuditRecords = input.auditRecords.filter((record) => record.task_run_id === input.taskRun.task_run_id)
  return {
    taskRunID: input.taskRun.task_run_id,
    phase: input.taskRun.phase,
    disposition: input.taskRun.disposition,
    lifecycle: input.taskRun.lifecycle,
    attemptCount: input.attempts.filter((attempt) => attempt.task_run_id === input.taskRun.task_run_id).length,
    unresolvedExternalWriteCount: input.externalWrites.filter(
      (write) =>
        write.task_run_id === input.taskRun.task_run_id &&
        (write.status === "pending" || write.status === "sent" || write.status === "retrying"),
    ).length,
    auditRecordCount: taskRunAuditRecords.length,
    latestAuditAction: taskRunAuditRecords.at(-1)?.action_type,
  }
}

export function createOrReuseTaskRun(input: TaskRunCreationInput) {
  const existing = findActiveTaskRun(input.existingTaskRuns ?? [])
  if (existing) return { taskRun: existing, reused: true as const }

  return {
    taskRun: {
      task_run_id: input.taskRunID,
      task_capsule_id: input.taskCapsuleID,
      execution_track: input.executionTrack,
      gate_state: initialGateState(input.executionTrack),
      phase: initialPhase(input.executionTrack),
      disposition: initialDisposition(input.executionTrack),
      lifecycle: "active",
      latest_committed_step: "TaskRun created",
      next_expected_action: initialNextAction(input.executionTrack),
      retry_count: 0,
      retry_budget: 3,
      created_at: input.createdAt,
      updated_at: input.createdAt,
    } satisfies AiLooper.TaskRun,
    reused: false as const,
  }
}

export function createRequirementInterpretationArtifact(input: VersionedArtifactInput): AiLooper.Artifact {
  return versionedArtifact(input, "requirement_interpretation", `requirement_interpretation:${input.taskRunID}:${input.version}`)
}

export function createExecutionPlanArtifact(input: VersionedArtifactInput): AiLooper.Artifact {
  return versionedArtifact(input, "execution_plan", `execution_plan:${input.taskRunID}:${input.version}`)
}

export function createLightweightTaskBriefArtifact(input: VersionedArtifactInput): AiLooper.Artifact {
  return versionedArtifact(input, "lightweight_task_brief", `lightweight_task_brief:${input.taskRunID}:${input.version}`)
}

export function createDeliverySummaryArtifact(input: VersionedArtifactInput): AiLooper.Artifact {
  return versionedArtifact(input, "delivery_summary", `delivery_summary:${input.taskRunID}:${input.version}`)
}

export function createWorktimeDraft(input: {
  readonly worktimeDraftID: AiLooper.ID
  readonly taskRunID: AiLooper.ID
  readonly observedMinutes: number
  readonly unattendedAgentRuntimeMinutes: number
  readonly idleWaitMinutes: number
  readonly suggestedDescription: string
}): AiLooper.WorktimeDraft {
  return {
    worktime_draft_id: input.worktimeDraftID,
    task_run_id: input.taskRunID,
    suggested_minutes: Math.max(0, input.observedMinutes - input.unattendedAgentRuntimeMinutes - input.idleWaitMinutes),
    suggested_description: input.suggestedDescription,
    excluded_agent_runtime_minutes: input.unattendedAgentRuntimeMinutes,
    excluded_idle_wait_minutes: input.idleWaitMinutes,
  }
}

export function captureKnowledgeAssetCandidate(input: {
  readonly candidateID: AiLooper.ID
  readonly taskRunID: AiLooper.ID
  readonly assetType: AiLooper.KnowledgeAssetCandidate["asset_type"]
  readonly title: string
  readonly contentRef: string
  readonly provenanceArtifactRefs: ReadonlyArray<AiLooper.ID>
  readonly suggestedScope: AiLooper.KnowledgeAssetCandidate["suggested_scope"]
  readonly ownerCandidate?: string
  readonly evaluationRefs: ReadonlyArray<AiLooper.ID>
  readonly createdAt: string
}): AiLooper.KnowledgeAssetCandidate {
  return {
    knowledge_asset_candidate_id: input.candidateID,
    task_run_id: input.taskRunID,
    asset_type: input.assetType,
    title: input.title,
    content_ref: input.contentRef,
    provenance_artifact_refs: [...input.provenanceArtifactRefs],
    suggested_scope: input.suggestedScope,
    owner_candidate: input.ownerCandidate,
    evaluation_refs: [...input.evaluationRefs],
    status: "needs_review",
    created_at: input.createdAt,
    updated_at: input.createdAt,
  }
}

export function validatePlanDecision(input: PlanDecisionValidationInput) {
  if (!input.reviewerIDs.includes(input.actorID)) return "unauthorized" as const
  if (input.currentPlanID !== input.requestedPlanID) return "stale_plan" as const
  if (input.currentPlanVersion !== input.requestedPlanVersion) return "stale_plan" as const
  return "accepted" as const
}

export function canConfirmLightweightBrief(input: LightweightBriefConfirmationInput) {
  return (
    input.taskRun.execution_track === "standard_task" &&
    input.taskRun.gate_state === "awaiting_confirmation" &&
    input.confirmedBy === input.responsibleEngineerID
  )
}

export function canStartImplementation(taskRun: Pick<AiLooper.TaskRun, "execution_track" | "gate_state">) {
  if (taskRun.execution_track === "spec_driven") return taskRun.gate_state === "formally_approved"
  if (taskRun.execution_track === "standard_task") return taskRun.gate_state === "confirmed"
  if (taskRun.execution_track === "bugfix") return taskRun.gate_state === "confirmed" || taskRun.gate_state === "formally_approved"
  return false
}

export function canTransition(input: TransitionInput) {
  if (input.lifecycle !== "active") return false
  if (input.nextPhase === "implementing") {
    return input.gateState === "confirmed" || input.gateState === "formally_approved"
  }
  if (input.nextPhase === "completed") return input.requiredEvidencePresent === true
  return true
}

function initialGateState(executionTrack: AiLooper.ExecutionTrack): AiLooper.GateState {
  if (executionTrack === "spec_driven") return "awaiting_formal_approval"
  if (executionTrack === "standard_task") return "awaiting_confirmation"
  return "awaiting_confirmation"
}

function initialPhase(executionTrack: AiLooper.ExecutionTrack): AiLooper.Phase {
  if (executionTrack === "spec_driven") return "plan_review"
  return "planning"
}

function initialDisposition(executionTrack: AiLooper.ExecutionTrack): AiLooper.Disposition {
  if (executionTrack === "spec_driven") return "waiting"
  return "running"
}

function initialNextAction(executionTrack: AiLooper.ExecutionTrack) {
  if (executionTrack === "spec_driven") return "await_formal_plan_approval"
  if (executionTrack === "standard_task") return "await_engineer_brief_confirmation"
  return "record_bug_reproduction"
}

function versionedArtifact(input: VersionedArtifactInput, artifactType: AiLooper.ArtifactType, contentRef: string) {
  return {
    artifact_id: input.artifactID,
    task_run_id: input.taskRunID,
    artifact_type: artifactType,
    version: input.version,
    content_ref: input.sourceVersion ? `${contentRef}:source:${input.sourceVersion}` : contentRef,
    provenance: input.createdBy,
    created_at: input.createdAt,
  } satisfies AiLooper.Artifact
}

function applyNoProgress(
  taskRun: AiLooper.TaskRun,
  attempt: Pick<ExecutionAttempt, "ended_at" | "failure_reason">,
  nextWakeAt: string,
) {
  const retryCount = taskRun.retry_count + 1
  if (retryCount >= taskRun.retry_budget) {
    return {
      ...taskRun,
      retry_count: retryCount,
      disposition: "escalated" as const,
      escalation_reason: attempt.failure_reason ?? "No progress retry budget exhausted",
      escalated_at: attempt.ended_at,
      last_attempt_at: attempt.ended_at,
      updated_at: attempt.ended_at,
    }
  }
  return {
    ...taskRun,
    retry_count: retryCount,
    disposition: "waiting" as const,
    next_wake_at: nextWakeAt,
    last_attempt_at: attempt.ended_at,
    updated_at: attempt.ended_at,
  }
}

function unresolvedAttemptIDs(attempts: ReadonlyArray<ExecutionAttempt>) {
  return attempts
    .filter(
      (attempt) =>
        attempt.outcome === "interrupted" || attempt.outcome === "blocked" || attempt.outcome === "no_progress",
    )
    .map((attempt) => attempt.execution_attempt_id)
}

function unresolvedExternalWriteIDs(externalWrites: ReadonlyArray<AiLooper.ExternalWrite>) {
  return externalWrites
    .filter(
      (externalWrite) =>
        externalWrite.status === "pending" || externalWrite.status === "sent" || externalWrite.status === "retrying",
    )
    .map((externalWrite) => externalWrite.external_write_id)
}

function byTaskRun<T extends { readonly task_run_id: AiLooper.ID }>(items: ReadonlyArray<T>, taskRunID: AiLooper.ID) {
  return items.filter((item) => item.task_run_id === taskRunID)
}

function detailAttemptType(attemptType: ExecutionAttempt["attempt_type"]): ExecutionAttemptSummary["attempt_type"] {
  if (attemptType === "runtime_execution") return "implementation"
  if (attemptType === "verification") return "validation"
  if (attemptType === "external_write") return "reporting"
  return attemptType
}

function detailAttemptOutcome(outcome: ExecutionAttempt["outcome"]): ExecutionAttemptSummary["outcome"] {
  if (outcome === "succeeded") return "succeeded"
  if (outcome === "blocked") return "blocked"
  return "failed"
}
