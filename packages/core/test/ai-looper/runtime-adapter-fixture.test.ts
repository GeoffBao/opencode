import { describe, expect, test } from "bun:test"
import { AILooperRuntime } from "@opencode-ai/core/ai-looper/runtime"

describe("AILooper RuntimeAdapter fixture", () => {
  test("records changed artifacts, commands, evidence candidates, and diagnostics from a successful adapter result", async () => {
    const result = await AILooperRuntime.runAttempt(
      {
        async run(input) {
          return {
            taskRunId: input.taskRunId,
            runtimeAdapter: "opencode",
            runtimeSessionId: "session_1",
            outcome: "succeeded",
            changedArtifacts: ["patch://refund-state-machine"],
            commandsRun: ["bun test test/refund.test.ts"],
            evidenceCandidates: ["test://refund-pass"],
            diagnosticRefs: ["log://runtime_1"],
            logsSummary: "退款测试通过。",
            startedAt: "2026-07-10T10:00:00.000Z",
            endedAt: "2026-07-10T10:01:00.000Z",
          }
        },
      },
      {
        taskRunId: "run_1",
        workspaceRef: "workspace://payment",
        executionPlanVersion: 1,
        allowedTools: ["shell"],
        promptSnapshot: "prompt://run_1",
        artifactRefs: ["artifact://plan_1"],
      },
    )

    expect(
      AILooperRuntime.recordAttemptResult({
        executionAttemptID: "attempt_1",
        result: result.result!,
      }),
    ).toMatchObject({
      execution_attempt_id: "attempt_1",
      task_run_id: "run_1",
      output_artifact_refs: ["patch://refund-state-machine"],
      commands_run: ["bun test test/refund.test.ts"],
      evidence_refs: ["test://refund-pass"],
      diagnostic_refs: ["log://runtime_1"],
    })
  })
})
