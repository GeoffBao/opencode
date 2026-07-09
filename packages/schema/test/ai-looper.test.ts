import { describe, expect, test } from "bun:test"
import { Schema } from "effect"
import { AiLooper } from "../src/ai-looper"

describe("AiLooper schema", () => {
  test("decodes a minimal TaskRun", () => {
    const taskRun = Schema.decodeUnknownSync(AiLooper.TaskRun)({
      task_run_id: "trn_1",
      task_capsule_id: "cap_1",
      execution_track: "spec_driven",
      gate_state: "awaiting_formal_approval",
      phase: "plan_review",
      disposition: "waiting",
      lifecycle: "active",
      latest_committed_step: "plan created",
      retry_count: 0,
      retry_budget: 3,
      created_at: "2026-07-10T00:00:00.000Z",
      updated_at: "2026-07-10T00:00:00.000Z",
    })

    expect(taskRun.execution_track).toBe("spec_driven")
  })
})
