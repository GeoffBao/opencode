import { describe, expect, test } from "bun:test"
import { recoverableTaskRuns } from "@opencode-ai/core/ai-looper/taskrun"
import { taskRun } from "./taskrun-fixture"

describe("AILooper process restart recovery", () => {
  test("scans active TaskRuns due for recovery from committed checkpoints", () => {
    const due = taskRun({ taskRunID: "run_due", lifecycle: "active", nextWakeAt: "2026-07-10T00:00:00.000Z" })
    const waiting = taskRun({ taskRunID: "run_wait", lifecycle: "active", nextWakeAt: "2026-07-10T00:30:00.000Z" })
    const completed = taskRun({ taskRunID: "run_done", lifecycle: "completed" })

    expect(recoverableTaskRuns([due, waiting, completed], "2026-07-10T00:10:00.000Z").map((item) => item.task_run_id)).toEqual([
      "run_due",
    ])
  })
})
