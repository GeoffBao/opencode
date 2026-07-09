import { describe, expect, test } from "bun:test"
import { AiLooper } from "@opencode-ai/schema/ai-looper"
import { Schema } from "effect"
import { selectExecutionTrack } from "@opencode-ai/core/ai-looper/routing"

const decodeSourceTask = Schema.decodeUnknownSync(AiLooper.SourceTask)

describe("AILooper routing integration", () => {
  test("routes decoded Teambition feature, task, and bug source tasks", () => {
    expect(selectExecutionTrack({ workItemType: sourceTask("feature").work_item_type })).toBe("standard_task")
    expect(selectExecutionTrack({ workItemType: sourceTask("feature").work_item_type, assessedSize: "large" })).toBe(
      "spec_driven",
    )
    expect(selectExecutionTrack({ workItemType: sourceTask("task").work_item_type })).toBe("standard_task")
    expect(selectExecutionTrack({ workItemType: sourceTask("bug").work_item_type })).toBe("bugfix")
  })
})

function sourceTask(workItemType: AiLooper.WorkItemType) {
  return decodeSourceTask({
    source_system: "teambition",
    source_task_id: `tb_${workItemType}`,
    title: `Teambition ${workItemType}`,
    work_item_type: workItemType,
    assignee_ids: ["user_1"],
    visibility_state: "visible",
    acceptance_criteria: [],
    attachment_refs: [],
    source_version: "v1",
    retrieved_at: "2026-07-09T00:00:00.000Z",
  })
}
