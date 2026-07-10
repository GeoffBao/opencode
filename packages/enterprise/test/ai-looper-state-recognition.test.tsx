/** @jsxImportSource solid-js */

import { describe, expect, test } from "bun:test"
import { taskRunSections } from "../src/routes/ai-looper/view-model"

describe("AI Looper key-state recognition", () => {
  test("keeps phase, blocker, owner, and next action available in the status region", () => {
    expect(taskRunSections(task()).status).toMatchObject({
      phase: "verifying",
      disposition: "blocked",
      blockedReason: "验收环境不可用",
      blockedOwner: "verification-team",
      nextExpectedAction: "await_test_environment",
    })
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
      phase: "verifying",
      disposition: "blocked" as const,
      lifecycle: "active" as const,
      latestCommittedStep: "等待验证环境",
      nextExpectedAction: "await_test_environment",
      blockedReason: "验收环境不可用",
      blockedOwner: "verification-team",
      updatedAt: "2026-07-10T10:00:00.000Z",
      attempts: [],
      artifacts: [],
      evidence: [],
      externalWrites: [],
      auditRecords: [],
    },
  }
}
