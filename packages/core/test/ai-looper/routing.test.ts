import { describe, expect, test } from "bun:test"
import { AiLooper } from "@opencode-ai/schema/ai-looper"
import { Schema } from "effect"
import { createRoutingDecision, selectExecutionTrack, selectGatePolicy } from "@opencode-ai/core/ai-looper/routing"

const decodeSourceTask = Schema.decodeUnknownSync(AiLooper.SourceTask)

describe("AILooper routing", () => {
  test("routes bugs to bugfix", () => {
    expect(selectExecutionTrack({ workItemType: "bug" })).toBe("bugfix")
    expect(selectGatePolicy({ workItemType: "bug" })).toBe("reproduction_then_confirmation")
  })

  test("routes high-risk tasks to spec-driven formal approval", () => {
    const input = { workItemType: "task" as const, changesAuthorization: true }

    expect(selectExecutionTrack(input)).toBe("spec_driven")
    expect(selectGatePolicy(input)).toBe("formal_approval")
  })

  test("creates auditable routing decisions from source task versions", () => {
    expect(
      createRoutingDecision({
        routingDecisionID: "route_1",
        taskRunID: "run_1",
        sourceTask: sourceTask("bug"),
        assessedRisk: "high",
        decidedAt: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({
      source_task_id: "tb_bug",
      source_version: "v1",
      source_work_item_type: "bug",
      execution_track: "bugfix",
      gate_policy: "formal_approval",
      decided_by: "system",
    })
  })
})

function sourceTask(workItemType: AiLooper.WorkItemType) {
  return decodeSourceTask({
    source_task_id: `tb_${workItemType}`,
    source_system: "teambition",
    title: `Teambition ${workItemType}`,
    work_item_type: workItemType,
    assignee_ids: ["eng_1"],
    visibility_state: "visible",
    acceptance_criteria: [],
    attachment_refs: [],
    source_version: "v1",
    retrieved_at: "2026-07-10T00:00:00.000Z",
  })
}
