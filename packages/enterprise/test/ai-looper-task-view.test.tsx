/** @jsxImportSource solid-js */

import { describe, expect, test } from "bun:test"
import { taskRunSections } from "../src/routes/ai-looper/view-model"

describe("AI Looper task view", () => {
  test("keeps source content separate from AI interpretation", () => {
    const sections = taskRunSections({
      title: "端到端研发自动化",
      sourceTaskID: "tb_1",
      sourceSystem: "teambition",
      sourceDescription: "原始 Teambition 描述：必须支持计划审核。",
      sourceStatus: "visible",
      workItemType: "feature",
      attachmentRefs: ["architecture.html"],
      acceptanceCriteria: ["计划审核通过后才能实现"],
      interpretationGoal: "AI 解释：这是 spec-driven 工作流。",
      interpretationRisks: ["审批缺失会阻塞实现"],
      executionTrack: "spec_driven",
      planReviewStatus: "awaiting_formal_approval",
      lightweightBriefStatus: "not_required",
      bugfixGateStatus: "not_required",
    })

    expect(sections.source.title).toBe("原始需求")
    expect(sections.source.sourceDescription).toBe("原始 Teambition 描述：必须支持计划审核。")
    expect(sections.interpretation.title).toBe("AI 理解")
    expect(sections.interpretation.goal).toBe("AI 解释：这是 spec-driven 工作流。")
    expect(sections.source).not.toHaveProperty("goal")
    expect(sections.interpretation).not.toHaveProperty("sourceDescription")
    expect(sections.gates.title).toBe("执行门禁")
    expect(sections.gates.planReviewStatus).toBe("awaiting_formal_approval")
    expect(sections.gates.lightweightBriefStatus).toBe("not_required")
    expect(sections.gates.bugfixGateStatus).toBe("not_required")
  })
})
