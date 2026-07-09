import { describe, expect, test } from "bun:test"
import { canStartImplementation, canTransition } from "@opencode-ai/core/ai-looper/taskrun"

describe("AILooper TaskRun guards", () => {
  test("requires formal approval for spec-driven implementation", () => {
    expect(canStartImplementation({ execution_track: "spec_driven", gate_state: "awaiting_formal_approval" })).toBe(
      false,
    )
    expect(canStartImplementation({ execution_track: "spec_driven", gate_state: "formally_approved" })).toBe(true)
  })

  test("refuses completion without required evidence", () => {
    expect(
      canTransition({
        phase: "verifying",
        lifecycle: "active",
        nextPhase: "completed",
        gateState: "formally_approved",
      }),
    ).toBe(false)
  })
})
