import { describe, expect, test } from "bun:test"
import { validatePlanDecision } from "@opencode-ai/core/ai-looper/taskrun"

describe("AILooper plan version guard", () => {
  test("rejects stale plan approval decisions", () => {
    expect(
      validatePlanDecision({
        currentPlanID: "plan_2",
        currentPlanVersion: 2,
        requestedPlanID: "plan_1",
        requestedPlanVersion: 1,
        reviewerIDs: ["reviewer_1"],
        actorID: "reviewer_1",
      }),
    ).toBe("stale_plan")
  })

  test("rejects unauthorized reviewers before accepting exact plan versions", () => {
    expect(
      validatePlanDecision({
        currentPlanID: "plan_1",
        currentPlanVersion: 1,
        requestedPlanID: "plan_1",
        requestedPlanVersion: 1,
        reviewerIDs: ["reviewer_1"],
        actorID: "eng_1",
      }),
    ).toBe("unauthorized")
    expect(
      validatePlanDecision({
        currentPlanID: "plan_1",
        currentPlanVersion: 1,
        requestedPlanID: "plan_1",
        requestedPlanVersion: 1,
        reviewerIDs: ["reviewer_1"],
        actorID: "reviewer_1",
      }),
    ).toBe("accepted")
  })
})
