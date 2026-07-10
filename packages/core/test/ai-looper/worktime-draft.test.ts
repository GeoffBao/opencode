import { describe, expect, test } from "bun:test"
import { createWorktimeDraft } from "@opencode-ai/core/ai-looper/taskrun"

describe("AILooper worktime draft", () => {
  test("excludes unattended runtime and idle waiting from suggested worktime", () => {
    expect(
      createWorktimeDraft({
        worktimeDraftID: "draft_1",
        taskRunID: "run_1",
        observedMinutes: 180,
        unattendedAgentRuntimeMinutes: 60,
        idleWaitMinutes: 30,
        suggestedDescription: "实现、验证并整理退款状态机交付。",
      }),
    ).toEqual({
      worktime_draft_id: "draft_1",
      task_run_id: "run_1",
      suggested_minutes: 90,
      suggested_description: "实现、验证并整理退款状态机交付。",
      excluded_agent_runtime_minutes: 60,
      excluded_idle_wait_minutes: 30,
    })
  })
})
