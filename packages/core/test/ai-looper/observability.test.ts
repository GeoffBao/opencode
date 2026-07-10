import { describe, expect, test } from "bun:test"
import { createTaskRunDiagnostics } from "@opencode-ai/core/ai-looper/taskrun"
import { taskRun, runtimeAttempt } from "./taskrun-fixture"

describe("AILooper TaskRun observability", () => {
  test("summarizes TaskRun state, attempts, external writes, and audit diagnostics", () => {
    expect(
      createTaskRunDiagnostics({
        taskRun: taskRun(),
        attempts: [runtimeAttempt("succeeded"), runtimeAttempt("blocked")],
        externalWrites: [
          { task_run_id: "run_1", status: "pending" },
          { task_run_id: "run_1", status: "acknowledged" },
          { task_run_id: "run_other", status: "pending" },
        ],
        auditRecords: [
          { task_run_id: "run_1", action_type: "runtime.attempt_completed" },
          { task_run_id: "run_other", action_type: "ignored" },
        ],
      }),
    ).toEqual({
      taskRunID: "run_1",
      phase: "implementing",
      disposition: "running",
      lifecycle: "active",
      attemptCount: 2,
      unresolvedExternalWriteCount: 1,
      auditRecordCount: 1,
      latestAuditAction: "runtime.attempt_completed",
    })
  })
})
