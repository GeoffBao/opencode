import { AiLooper } from "@opencode-ai/schema/ai-looper"
import { Schema } from "effect"

export namespace AiLooperProtocol {
  export const namespace = "ai-looper"

  export const TaskCapsuleSummary = Schema.Struct({
    task_capsule_id: AiLooper.ID,
    source_task_id: AiLooper.ID,
    title: Schema.String,
    source_status: Schema.String.pipe(Schema.optional),
    work_item_type: AiLooper.WorkItemType,
    execution_track: AiLooper.ExecutionTrack.pipe(Schema.optional),
    active_task_run_id: AiLooper.ID.pipe(Schema.optional),
  })
  export type TaskCapsuleSummary = typeof TaskCapsuleSummary.Type

  export const TaskListResponse = Schema.Struct({
    tasks: Schema.Array(TaskCapsuleSummary),
  })
  export type TaskListResponse = typeof TaskListResponse.Type

  export const TaskDetailResponse = Schema.Struct({
    task_capsule: TaskCapsuleSummary,
    source_task: AiLooper.SourceTask,
    current_task_run: AiLooper.TaskRun.pipe(Schema.optional),
  })
  export type TaskDetailResponse = typeof TaskDetailResponse.Type

  export const TaskRunResponse = AiLooper.TaskRun
  export type TaskRunResponse = typeof TaskRunResponse.Type
}
