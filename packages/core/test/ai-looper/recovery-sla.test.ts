import { describe, expect, test } from "bun:test"
import { applyAttemptOutcome, recoveryDeadline } from "@opencode-ai/core/ai-looper/taskrun"
import { taskRun, runtimeAttempt } from "./taskrun-fixture"

describe("AILooper recovery SLA", () => {
  test("sets service-return recovery deadline within 15 minutes", () => {
    expect(recoveryDeadline("2026-07-10T00:00:00.000Z")).toBe("2026-07-10T00:15:00.000Z")
  })

  test("escalates repeated no-progress attempts after retry budget", () => {
    const recovered = applyAttemptOutcome({
      taskRun: taskRun({ retryCount: 2, retryBudget: 3 }),
      attempt: runtimeAttempt("no_progress"),
      nextWakeAt: "2026-07-10T00:15:00.000Z",
    })

    expect(recovered.retry_count).toBe(3)
    expect(recovered.disposition).toBe("escalated")
    expect(recovered.escalation_reason).toBe("runtime no progress")
  })
})
