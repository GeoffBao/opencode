import { describe, expect, test } from "bun:test"
import { AiLooper } from "@opencode-ai/schema/ai-looper"
import { Schema } from "effect"
import { AILooperTeambition } from "@opencode-ai/core/ai-looper/teambition"

const decodeSourceTask = Schema.decodeUnknownSync(AiLooper.SourceTask)

describe("AILooper approval authority", () => {
  test("resolves reviewers from Teambition task/project policy", async () => {
    const adapter: AILooperTeambition.Adapter = {
      async listAssignedWorkItems() {
        return []
      },
      async getWorkItemDetail() {
        return sourceTask()
      },
      async resolveReviewerPolicy() {
        return ["reviewer_1", "reviewer_1", ""]
      },
      async writeProgressNote() {},
      async writeDeliverySummary() {},
      async submitWorktime() {},
    }

    const reviewers = await AILooperTeambition.resolveAuthorizedReviewers(adapter, sourceTask())

    expect(reviewers).toEqual(["reviewer_1"])
    expect(AILooperTeambition.canReviewPlan(reviewers, "reviewer_1")).toBe(true)
    expect(AILooperTeambition.canReviewPlan(reviewers, "eng_1")).toBe(false)
  })
})

function sourceTask() {
  return decodeSourceTask({
    source_task_id: "tb_1",
    source_system: "teambition",
    title: "Spec-driven task",
    work_item_type: "feature",
    assignee_ids: ["eng_1"],
    project_config_ref: "teambition://project/reviewers",
    visibility_state: "visible",
    acceptance_criteria: [],
    attachment_refs: [],
    source_version: "v1",
    retrieved_at: "2026-07-10T00:00:00.000Z",
  })
}
