import { describe, expect, test } from "bun:test"
import { AILooperOutbox } from "@opencode-ai/core/ai-looper/outbox"

describe("AILooper Teambition writes", () => {
  test("reuses progress-note writes for idempotent retries", () => {
    const progress = AILooperOutbox.queueProgressNote({
      externalWriteID: "write_progress_1",
      taskRunID: "run_1",
      artifactID: "artifact_plan_1",
      artifactVersion: 1,
      createdAt: "2026-07-10T10:00:00.000Z",
      existingWrites: [],
    })
    const progressRetry = AILooperOutbox.queueProgressNote({
      externalWriteID: "write_progress_2",
      taskRunID: "run_1",
      artifactID: "artifact_plan_1",
      artifactVersion: 1,
      createdAt: "2026-07-10T10:01:00.000Z",
      existingWrites: [progress.write],
    })

    expect(progress).toMatchObject({ reused: false, write: { idempotency_key: "progress_note:run_1:artifact_plan_1:1" } })
    expect(progressRetry).toMatchObject({ reused: true, write: { external_write_id: "write_progress_1" } })
  })

  test("reuses delivery summary and worktime writes for idempotent retries", () => {
    const delivery = AILooperOutbox.queueDeliverySummary({
      externalWriteID: "write_delivery_1",
      taskRunID: "run_1",
      artifactID: "artifact_delivery_1",
      artifactVersion: 1,
      createdAt: "2026-07-10T10:00:00.000Z",
      existingWrites: [],
    })
    const deliveryRetry = AILooperOutbox.queueDeliverySummary({
      externalWriteID: "write_delivery_2",
      taskRunID: "run_1",
      artifactID: "artifact_delivery_1",
      artifactVersion: 1,
      createdAt: "2026-07-10T10:01:00.000Z",
      existingWrites: [delivery.write],
    })

    expect(delivery).toMatchObject({ reused: false, write: { idempotency_key: "delivery_summary:run_1:artifact_delivery_1:1" } })
    expect(deliveryRetry).toMatchObject({ reused: true, write: { external_write_id: "write_delivery_1" } })

    const worktime = AILooperOutbox.queueWorktimeSubmission({
      externalWriteID: "write_worktime_1",
      taskRunID: "run_1",
      worktimeDraftID: "draft_1",
      responsibleEngineerID: "engineer_1",
      actorID: "engineer_1",
      confirmedMinutes: 90,
      confirmedDescription: "实现并验证退款状态机。",
      confirmedAt: "2026-07-10T10:00:00.000Z",
      existingWrites: [],
      worktimeDraft: draft(),
    })
    const worktimeRetry = AILooperOutbox.queueWorktimeSubmission({
      externalWriteID: "write_worktime_2",
      taskRunID: "run_1",
      worktimeDraftID: "draft_1",
      responsibleEngineerID: "engineer_1",
      actorID: "engineer_1",
      confirmedMinutes: 90,
      confirmedDescription: "实现并验证退款状态机。",
      confirmedAt: "2026-07-10T10:01:00.000Z",
      existingWrites: [worktime.write],
      worktimeDraft: worktime.worktimeDraft,
    })

    expect(worktime).toMatchObject({
      reused: false,
      write: { idempotency_key: "worktime:run_1:draft_1:engineer_1" },
      worktimeDraft: {
        confirmed_minutes: 90,
        confirmed_description: "实现并验证退款状态机。",
        confirmed_by: "engineer_1",
        confirmed_at: "2026-07-10T10:00:00.000Z",
        submission_write_id: "write_worktime_1",
      },
    })
    expect(worktimeRetry).toMatchObject({ reused: true, write: { external_write_id: "write_worktime_1" } })
  })
})

function draft() {
  return {
    worktime_draft_id: "draft_1",
    task_run_id: "run_1",
    suggested_minutes: 90,
    suggested_description: "实现并验证退款状态机。",
    excluded_agent_runtime_minutes: 0,
    excluded_idle_wait_minutes: 0,
  }
}
