import { describe, expect, test } from "bun:test"
import { AILooperRuntime } from "@opencode-ai/core/ai-looper/runtime"

describe("AILooper RuntimeAdapter contract", () => {
  test("validates attempt input snapshots before invoking the adapter", async () => {
    let calls = 0
    const result = await AILooperRuntime.runAttempt(
      {
        async run(input) {
          calls += 1
          return {
            taskRunId: input.taskRunId,
            runtimeAdapter: "opencode",
            outcome: "succeeded",
            changedArtifacts: ["patch://1"],
            commandsRun: ["bun test"],
            evidenceCandidates: ["test://pass"],
            logsSummary: "tests passed",
            startedAt: "2026-07-10T00:00:00.000Z",
            endedAt: "2026-07-10T00:01:00.000Z",
          }
        },
      },
      {
        taskRunId: "run_1",
        workspaceRef: "workspace://repo",
        executionPlanVersion: 1,
        allowedTools: ["shell"],
        promptSnapshot: "prompt://snapshot",
        artifactRefs: ["artifact://plan"],
      },
    )

    expect(calls).toBe(1)
    expect(result.validation).toBe("valid")
    expect(result.result?.runtimeAdapter).toBe("opencode")
    expect(result.result?.outcome).toBe("succeeded")
  })

  test("blocks adapter invocation without immutable prompt and artifact snapshots", async () => {
    let calls = 0
    const result = await AILooperRuntime.runAttempt(
      {
        async run() {
          calls += 1
          throw new Error("unexpected adapter call")
        },
      },
      {
        taskRunId: "run_1",
        workspaceRef: "workspace://repo",
        executionPlanVersion: 1,
        allowedTools: ["shell"],
        promptSnapshot: "",
        artifactRefs: ["artifact://plan"],
      },
    )

    expect(calls).toBe(0)
    expect(result.validation).toBe("missing_prompt_snapshot")
    expect(result.result).toBeUndefined()
  })
})
