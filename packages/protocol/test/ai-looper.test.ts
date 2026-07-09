import { describe, expect, test } from "bun:test"
import { Schema } from "effect"
import { AiLooperProtocol } from "../src/ai-looper"

describe("AiLooperProtocol", () => {
  test("decodes task list responses", () => {
    const response = Schema.decodeUnknownSync(AiLooperProtocol.TaskListResponse)({
      tasks: [
        {
          task_capsule_id: "cap_1",
          source_task_id: "tb_1",
          title: "Implement feature",
          work_item_type: "feature",
          execution_track: "spec_driven",
        },
      ],
    })

    expect(response.tasks[0]?.execution_track).toBe("spec_driven")
  })
})
