/** @jsxImportSource solid-js */

import { describe, expect, test } from "bun:test"
import { taskRunSections } from "../src/routes/ai-looper/view-model"

describe("AI Looper task detail latency", () => {
  test("builds the task detail read model within the 30-second pilot budget", () => {
    const startedAt = performance.now()
    const sections = taskRunSections(task())

    expect(sections.status.taskRunID).toBe("run_1")
    expect(performance.now() - startedAt).toBeLessThan(30_000)
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
    run: {
      taskRunID: "run_1",
      phase: "implementing",
      disposition: "running" as const,
      lifecycle: "active" as const,
      latestCommittedStep: "提交检查点",
      updatedAt: "2026-07-10T10:00:00.000Z",
      attempts: [],
      artifacts: [],
      evidence: [],
      externalWrites: [],
      auditRecords: [],
    },
  }
}
