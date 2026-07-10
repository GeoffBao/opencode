import { describe, expect, test } from "bun:test"
import { createDeliverySummaryArtifact } from "@opencode-ai/core/ai-looper/taskrun"

describe("AILooper delivery summary", () => {
  test("creates a versioned delivery summary artifact for one TaskRun", () => {
    expect(
      createDeliverySummaryArtifact({
        artifactID: "artifact_delivery_1",
        taskRunID: "run_1",
        version: 2,
        createdAt: "2026-07-10T10:00:00.000Z",
        createdBy: "ai-looper",
      }),
    ).toEqual({
      artifact_id: "artifact_delivery_1",
      task_run_id: "run_1",
      artifact_type: "delivery_summary",
      version: 2,
      content_ref: "delivery_summary:run_1:2",
      provenance: "ai-looper",
      created_at: "2026-07-10T10:00:00.000Z",
    })
  })
})
