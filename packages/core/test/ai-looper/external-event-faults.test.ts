import { describe, expect, test } from "bun:test"
import { AILooperOutbox } from "@opencode-ai/core/ai-looper/outbox"

describe("AILooper external event faults", () => {
  test("keeps first unseen external event pending and ignores later duplicates", () => {
    const first = AILooperOutbox.reconcileExternalEvent({
      event: {
        externalEventID: "evt_1",
        sourceSystem: "coding_runtime",
        sourceEventID: "runtime_evt_1",
        eventType: "attempt.finished",
        payloadRef: "payload://runtime_evt_1",
        receivedAt: "2026-07-10T00:00:00.000Z",
      },
      existingDedupeKeys: new Set(),
    })
    const duplicate = AILooperOutbox.reconcileExternalEvent({
      event: {
        externalEventID: "evt_2",
        sourceSystem: "coding_runtime",
        sourceEventID: "runtime_evt_1",
        eventType: "attempt.finished",
        payloadRef: "payload://runtime_evt_1_duplicate",
        receivedAt: "2026-07-10T00:01:00.000Z",
      },
      existingDedupeKeys: new Set([first.dedupe_key]),
    })

    expect(first.processed_state).toBe("pending")
    expect(duplicate.processed_state).toBe("ignored_duplicate")
  })
})
