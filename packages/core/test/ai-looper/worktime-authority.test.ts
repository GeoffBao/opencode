import { describe, expect, test } from "bun:test"
import { AILooperOutbox } from "@opencode-ai/core/ai-looper/outbox"

describe("AILooper worktime authority", () => {
  test("allows only the responsible engineer to enqueue a worktime submission", () => {
    expect(
      AILooperOutbox.queueWorktimeSubmission({
        externalWriteID: "write_worktime_1",
        taskRunID: "run_1",
        worktimeDraftID: "draft_1",
        responsibleEngineerID: "engineer_1",
        actorID: "runtime_opencode",
        confirmedMinutes: 90,
        confirmedDescription: "Runtime cannot submit actual worktime.",
        confirmedAt: "2026-07-10T10:00:00.000Z",
        existingWrites: [],
        worktimeDraft: {
          worktime_draft_id: "draft_1",
          task_run_id: "run_1",
          suggested_minutes: 90,
          suggested_description: "Runtime cannot submit actual worktime.",
          excluded_agent_runtime_minutes: 0,
          excluded_idle_wait_minutes: 0,
        },
      }),
    ).toEqual({ status: "unauthorized" })
  })
})
