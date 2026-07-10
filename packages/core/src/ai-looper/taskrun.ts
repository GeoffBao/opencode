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
