import { describe, expect, test } from "bun:test"
import { aiLooperTaskDetail, aiLooperTasks } from "./ai-looper-model"

describe("AI Looper app pages", () => {
  test("lists the three supported Teambition work item tracks", () => {
    expect(aiLooperTasks.map((task) => task.executionTrack)).toEqual(["spec_driven", "standard_task", "bugfix"])
    expect(aiLooperTasks.map((task) => task.workItemType)).toEqual(["feature", "task", "bug"])
  })

  test("exposes a complete TaskRun detail for the detail route", () => {
    expect(aiLooperTaskDetail.taskRun.taskRunID).toBe("run_feature")
    expect(aiLooperTaskDetail.sections).toEqual([
      "source",
      "interpretation",
      "gates",
      "status",
      "attempts",
      "artifacts",
      "evidence",
      "completion",
    ])
  })
})
