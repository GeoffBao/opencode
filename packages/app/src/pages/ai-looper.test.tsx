import { describe, expect, test } from "bun:test"
import { aiLooperTaskDetail, aiLooperTasks, mapTaskListResponse } from "./ai-looper-model"

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

  test("maps protocol task summaries into the app task view model", () => {
    expect(
      mapTaskListResponse({
        tasks: [
          {
            task_capsule_id: "cap_1",
            source_task_id: "TB-1",
            title: "真实任务",
            work_item_type: "feature",
            execution_track: "spec_driven",
            active_task_run_id: "run_1",
          },
        ],
      }),
    ).toEqual([
      {
        taskCapsuleID: "cap_1",
        sourceTaskID: "TB-1",
        title: "真实任务",
        sourceStatus: "未知",
        workItemType: "feature",
        executionTrack: "spec_driven",
        phase: "执行中",
        disposition: "running",
      },
    ])
  })
})
