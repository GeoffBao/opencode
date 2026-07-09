import { describe, expect, test } from "bun:test"
import { selectExecutionTrack, selectGatePolicy } from "@opencode-ai/core/ai-looper/routing"

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
})
