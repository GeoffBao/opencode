import { describe, expect, test } from "bun:test"
import { canConfirmLightweightBrief } from "@opencode-ai/core/ai-looper/taskrun"

describe("AILooper lightweight brief confirmation", () => {
  test("allows only responsible engineers to confirm standard-task briefs", () => {
    expect(
      canConfirmLightweightBrief({
        taskRun: { execution_track: "standard_task", gate_state: "awaiting_confirmation" },
        confirmedBy: "eng_1",
        responsibleEngineerID: "eng_1",
      }),
    ).toBe(true)
    expect(
      canConfirmLightweightBrief({
        taskRun: { execution_track: "standard_task", gate_state: "awaiting_confirmation" },
        confirmedBy: "reviewer_1",
        responsibleEngineerID: "eng_1",
      }),
    ).toBe(false)
  })
})
