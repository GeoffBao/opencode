import { describe, expect, test } from "bun:test"
import { appendExecutionAttempt, applyAttemptOutcome } from "@opencode-ai/core/ai-looper/taskrun"
import { taskRun, runtimeAttempt } from "./taskrun-fixture"

describe("AILooper recovery after Agent Session end", () => {
  test("records interrupted attempts without completing the TaskRun", () => {
    const attempt = runtimeAttempt("interrupted")
    const attempts = appendExecutionAttempt([], attempt)
    const recovered = applyAttemptOutcome({
      taskRun: taskRun({ lifecycle: "active", phase: "implementing" }),
      attempt,
      nextWakeAt: "2026-07-10T00:15:00.000Z",
    })

    expect(attempts).toHaveLength(1)
    expect(recovered.lifecycle).toBe("active")
    expect(recovered.phase).toBe("implementing")
    expect(recovered.last_attempt_at).toBe("2026-07-10T00:01:00.000Z")
  })
})
