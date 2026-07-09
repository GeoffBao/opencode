import { describe, expect, test } from "bun:test"
import { AILooperOutbox } from "@opencode-ai/core/ai-looper/outbox"

describe("AILooper outbox keys", () => {
  test("creates stable delivery summary idempotency keys", () => {
    expect(AILooperOutbox.deliverySummaryKey("trn_1", "art_1", 2)).toBe("delivery_summary:trn_1:art_1:2")
  })

  test("creates stable worktime idempotency keys", () => {
    expect(AILooperOutbox.worktimeKey("trn_1", "eng_1", "2026-07-10T00:00:00.000Z")).toBe(
      "worktime:trn_1:eng_1:2026-07-10T00:00:00.000Z",
    )
  })
})
