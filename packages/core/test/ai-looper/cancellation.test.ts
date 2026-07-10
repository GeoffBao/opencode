import { describe, expect, test } from "bun:test"
import { AiLooper } from "@opencode-ai/schema/ai-looper"
import { Schema } from "effect"
import { cancelTaskRun, type ExecutionAttempt } from "@opencode-ai/core/ai-looper/taskrun"

const decodeTaskRun = Schema.decodeUnknownSync(AiLooper.TaskRun)
const decodeExternalWrite = Schema.decodeUnknownSync(AiLooper.ExternalWrite)

describe("AILooper TaskRun cancellation", () => {
  test("cancels active runs and reports unresolved effects", () => {
    const result = cancelTaskRun({
      taskRun: taskRun("active"),
      actorID: "lead_1",
      authorizedActorIDs: ["lead_1"],
      reason: "Owner explicitly stopped the task",
      now: "2026-07-10T01:00:00.000Z",
      attempts: [
        attempt("attempt_done", "succeeded"),
        attempt("attempt_blocked", "blocked"),
        attempt("attempt_interrupted", "interrupted"),
      ],
      externalWrites: [
        externalWrite("write_pending", "pending"),
        externalWrite("write_ack", "acknowledged"),
        externalWrite("write_retry", "retrying"),
      ],
    })

    expect(result).toMatchObject({
      status: "cancelled",
      taskRun: {
        phase: "cancelled",
        lifecycle: "cancelled",
        cancelled_at: "2026-07-10T01:00:00.000Z",
        next_expected_action: "review_unresolved_cancellation_effects",
      },
      unresolvedEffects: {
        execution_attempt_ids: ["attempt_blocked", "attempt_interrupted"],
        external_write_ids: ["write_pending", "write_retry"],
      },
    })
  })

  test("preserves task state when actor is unauthorized or run is not active", () => {
    expect(
      cancelTaskRun({
        taskRun: taskRun("active"),
        actorID: "eng_1",
        authorizedActorIDs: ["lead_1"],
        reason: "No longer needed",
        now: "2026-07-10T01:00:00.000Z",
      }),
    ).toMatchObject({ status: "unauthorized", taskRun: { lifecycle: "active" } })
    expect(
      cancelTaskRun({
        taskRun: taskRun("completed"),
        actorID: "lead_1",
        authorizedActorIDs: ["lead_1"],
        reason: "No longer needed",
        now: "2026-07-10T01:00:00.000Z",
      }),
    ).toMatchObject({ status: "not_active", taskRun: { lifecycle: "completed" } })
  })
})

function taskRun(lifecycle: AiLooper.Lifecycle) {
  return decodeTaskRun({
    task_run_id: "run_1",
    task_capsule_id: "cap_1",
    execution_track: "standard_task",
    gate_state: "confirmed",
    phase: lifecycle === "completed" ? "completed" : "implementing",
    disposition: "running",
    lifecycle,
    latest_committed_step: "editing files",
    retry_count: 1,
    retry_budget: 3,
    created_at: "2026-07-10T00:00:00.000Z",
    updated_at: "2026-07-10T00:30:00.000Z",
    completed_at: lifecycle === "completed" ? "2026-07-10T00:45:00.000Z" : undefined,
  })
}

function attempt(executionAttemptID: string, outcome: ExecutionAttempt["outcome"]): ExecutionAttempt {
  return {
    execution_attempt_id: executionAttemptID,
    task_run_id: "run_1",
    attempt_type: "runtime_execution",
    runtime_adapter: "opencode",
    input_artifact_refs: [],
    output_artifact_refs: [],
    evidence_refs: [],
    started_at: "2026-07-10T00:30:00.000Z",
    ended_at: "2026-07-10T00:40:00.000Z",
    outcome,
    progress_summary: outcome,
  }
}

function externalWrite(externalWriteID: string, status: AiLooper.ExternalWrite["status"]) {
  return decodeExternalWrite({
    external_write_id: externalWriteID,
    task_run_id: "run_1",
    target_system: "teambition",
    write_type: "progress_note",
    idempotency_key: `progress:${externalWriteID}`,
    payload_ref: `payload://${externalWriteID}`,
    status,
    attempt_count: 1,
    created_at: "2026-07-10T00:35:00.000Z",
    updated_at: "2026-07-10T00:36:00.000Z",
  })
}
