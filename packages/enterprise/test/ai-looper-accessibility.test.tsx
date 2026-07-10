/** @jsxImportSource solid-js */

import { describe, expect, test } from "bun:test"
import { taskRunSections } from "../src/routes/ai-looper/view-model"

describe("AI Looper accessibility", () => {
  test("exposes unique labels for every enterprise task detail region", () => {
    const labels = taskRunSections(task()).accessibility.labels

    expect(labels).toEqual([
      "Original source requirement",
      "AI interpretation",
      "Execution gates",
      "TaskRun status",
      "Execution attempts",
      "Artifacts",
      "Evidence",
      "Delivery and worktime confirmation",
      "External writes",
      "Audit timeline",
    ])
    expect(new Set(labels).size).toBe(labels.length)
  })
})

function task() {
  return {
    title: "退款状态机",
    sourceTaskID: "tb_1",
    sourceSystem: "teambition" as const,
    sourceDescription: "原始需求",
    sourceStatus: "visible",
    workItemType: "task" as const,
    attachmentRefs: [],
    acceptanceCriteria: [],
    interpretationGoal: "实现退款状态机",
    interpretationRisks: [],
    executionTrack: "standard_task" as const,
  }
}
