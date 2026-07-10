import { AiLooper } from "@opencode-ai/schema/ai-looper"
import { Schema } from "effect"
import type { ExecutionAttempt } from "@opencode-ai/core/ai-looper/taskrun"

const decodeTaskRun = Schema.decodeUnknownSync(AiLooper.TaskRun)

export function taskRun(input: {
  readonly taskRunID?: string
  readonly lifecycle?: AiLooper.Lifecycle
  readonly phase?: AiLooper.Phase
  readonly nextWakeAt?: string
  readonly retryCount?: number
  readonly retryBudget?: number
} = {}) {
  return decodeTaskRun({
    task_run_id: input.taskRunID ?? "run_1",
    task_capsule_id: "cap_1",
    execution_track: "standard_task",
    gate_state: "confirmed",
    phase: input.phase ?? "implementing",
    disposition: "running",
    lifecycle: input.lifecycle ?? "active",
    latest_committed_step: "checkpoint",
    retry_count: input.retryCount ?? 0,
    retry_budget: input.retryBudget ?? 3,
    next_wake_at: input.nextWakeAt,
    created_at: "2026-07-10T00:00:00.000Z",
    updated_at: "2026-07-10T00:00:00.000Z",
  })
}

export function runtimeAttempt(outcome: ExecutionAttempt["outcome"]): ExecutionAttempt {
  return {
    execution_attempt_id: `attempt_${outcome}`,
    task_run_id: "run_1",
    attempt_type: "runtime_execution",
    runtime_adapter: "opencode",
    input_artifact_refs: ["artifact://plan"],
    output_artifact_refs: [],
    evidence_refs: [],
    started_at: "2026-07-10T00:00:00.000Z",
    ended_at: "2026-07-10T00:01:00.000Z",
    outcome,
    failure_reason: outcome === "no_progress" ? "runtime no progress" : undefined,
    progress_summary: outcome,
  }
}
