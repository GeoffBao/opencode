import { describe, expect, test } from "bun:test"
import { AILooperAudit } from "@opencode-ai/core/ai-looper/audit"

describe("AILooper audit", () => {
  test("creates attributable audit records", () => {
    const record = AILooperAudit.create({
      taskRunID: "trn_1",
      actorOrSource: "eng_1",
      actionType: "plan.approved",
      now: "2026-07-10T00:00:00.000Z",
    })

    expect(record.task_run_id).toBe("trn_1")
    expect(record.actor_or_source).toBe("eng_1")
    expect(record.action_type).toBe("plan.approved")
  })
})
