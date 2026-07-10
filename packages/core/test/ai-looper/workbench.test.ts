import { describe, expect, test } from "bun:test"
import { AILooperWorkbench } from "../../src/ai-looper/workbench"

describe("AI Looper workbench persistence mapping", () => {
  test("maps a stored task capsule into the protocol task summary", () => {
    expect(
      AILooperWorkbench.toTaskSummary({
        id: "capsule-1",
        source_task_id: "TB-1",
        title: "真实任务",
        source_status: "进行中",
        work_item_type: "feature",
        execution_track: "spec_driven",
        active_task_run_id: "run-1",
      }),
    ).toEqual({
      task_capsule_id: "capsule-1",
      source_task_id: "TB-1",
      title: "真实任务",
      source_status: "进行中",
      work_item_type: "feature",
      execution_track: "spec_driven",
      active_task_run_id: "run-1",
    })
  })
})
