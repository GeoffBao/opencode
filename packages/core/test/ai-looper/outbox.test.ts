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

  test("reconciles duplicate external events by idempotency key", () => {
    expect(
      AILooperOutbox.reconcileExternalEvent({
        event: {
          externalEventID: "evt_1",
          sourceSystem: "teambition",
          sourceEventID: "tb_evt_1",
          eventType: "task.updated",
          idempotencyKey: "teambition:tb_evt_1",
          payloadRef: "payload://1",
          receivedAt: "2026-07-10T00:00:00.000Z",
        },
        existingDedupeKeys: new Set(["teambition:tb_evt_1"]),
      }),
    ).toMatchObject({
      dedupe_key: "teambition:tb_evt_1",
      processed_state: "ignored_duplicate",
    })
  })
})
