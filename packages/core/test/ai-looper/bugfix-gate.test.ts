import { describe, expect, test } from "bun:test"
import { AILooperEvidence } from "@opencode-ai/core/ai-looper/evidence"

describe("AILooper bugfix gate", () => {
  test("requires reproduction evidence before low-risk bugfix confirmation", () => {
    expect(AILooperEvidence.canConfirmBugfixPlan({ highRisk: false, evidence: [] })).toBe("requires_reproduction")
    expect(
      AILooperEvidence.canConfirmBugfixPlan({
        highRisk: false,
        evidence: [{ evidence_type: "bug_reproduction", result: "pass" }],
      }),
    ).toBe("can_confirm")
  })

  test("escalates high-risk bugs to formal approval", () => {
    expect(
      AILooperEvidence.canConfirmBugfixPlan({
        highRisk: true,
        evidence: [{ evidence_type: "bug_reproduction", result: "pass" }],
      }),
    ).toBe("requires_formal_approval")
  })
})
