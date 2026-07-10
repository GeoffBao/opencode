import { describe, expect, test } from "bun:test"
import { AiLooper } from "@opencode-ai/schema/ai-looper"
import { Schema } from "effect"
import { AILooperTeambition } from "@opencode-ai/core/ai-looper/teambition"

const decodeSourceTask = Schema.decodeUnknownSync(AiLooper.SourceTask)

describe("AILooper Teambition import", () => {
  test("imports only work items assigned to the requested engineer", async () => {
    const adapter: AILooperTeambition.Adapter = {
      async listAssignedWorkItems() {
        return [
          sourceTask("feature", "eng_1", "visible"),
          sourceTask("task", "eng_1", "visible"),
          sourceTask("bug", "eng_1", "visible"),
          sourceTask("task", "eng_2", "visible"),
        ]
      },
      async getWorkItemDetail() {
        return sourceTask("feature", "eng_1", "visible")
      },
      async resolveReviewerPolicy() {
        return ["reviewer_1"]
      },
      async writeProgressNote() {},
      async writeDeliverySummary() {},
      async submitWorktime() {},
    }

    const sourceTasks = await AILooperTeambition.listAuthorizedAssignedWorkItems(adapter, "eng_1")

    expect(sourceTasks.map((sourceTask) => sourceTask.source_task_id)).toEqual([
      "tb_feature_eng_1",
      "tb_task_eng_1",
      "tb_bug_eng_1",
    ])
    expect(sourceTasks.map((sourceTask) => sourceTask.work_item_type)).toEqual(["feature", "task", "bug"])
    expect(sourceTasks.every((sourceTask) => sourceTask.source_system === "teambition")).toBe(true)
  })

  test("keeps unavailable source states visible but filters reassigned tasks", async () => {
    const adapter: AILooperTeambition.Adapter = {
      async listAssignedWorkItems() {
        return [
          sourceTask("feature", "eng_1", "missing"),
          sourceTask("task", "eng_1", "inaccessible"),
          sourceTask("bug", "eng_1", "deleted"),
          sourceTask("task", "eng_1", "archived"),
          sourceTask("feature", "eng_1", "reassigned"),
        ]
      },
      async getWorkItemDetail() {
        return sourceTask("feature", "eng_1", "missing")
      },
      async resolveReviewerPolicy() {
        return ["reviewer_1"]
      },
      async writeProgressNote() {},
      async writeDeliverySummary() {},
      async submitWorktime() {},
    }

    const sourceTasks = await AILooperTeambition.listAuthorizedAssignedWorkItems(adapter, "eng_1")

    expect(sourceTasks.map((sourceTask) => sourceTask.visibility_state)).toEqual([
      "missing",
      "inaccessible",
      "deleted",
      "archived",
    ])
    expect(sourceTasks.every((sourceTask) => !AILooperTeambition.isSourceContentAvailable(sourceTask))).toBe(true)
  })
})

function sourceTask(
  workItemType: AiLooper.WorkItemType,
  engineerID: string,
  visibilityState: AiLooper.VisibilityState,
) {
  return decodeSourceTask({
    source_task_id: `tb_${workItemType}_${engineerID}`,
    source_system: "teambition",
    title: `Teambition ${workItemType}`,
    work_item_type: workItemType,
    assignee_ids: [engineerID],
    visibility_state: visibilityState,
    acceptance_criteria: [],
    attachment_refs: [],
    source_version: "v1",
    retrieved_at: "2026-07-10T00:00:00.000Z",
  })
}
