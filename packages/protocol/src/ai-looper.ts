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

  export const CreateTaskRunRequest = Schema.Struct({
    workspace_ref: Schema.String,
    idempotency_key: Schema.String.pipe(Schema.optional),
  })
  export type CreateTaskRunRequest = typeof CreateTaskRunRequest.Type

  export const PlanDecisionRequest = Schema.Struct({
    plan_id: AiLooper.ID,
    plan_version: Schema.Number,
    decision: Schema.Literals(["approved", "rejected"]),
    comments: Schema.String.pipe(Schema.optional),
  })
  export type PlanDecisionRequest = typeof PlanDecisionRequest.Type

  export const TaskRunResponse = AiLooper.TaskRun
  export type TaskRunResponse = typeof TaskRunResponse.Type

  export const PlanDecisionResponse = AiLooper.ApprovalDecision
  export type PlanDecisionResponse = typeof PlanDecisionResponse.Type

  export const ExternalEventRequest = Schema.Struct({
    source_system: Schema.Literals(["teambition", "ai_looper_ui", "coding_runtime"]),
    source_event_id: Schema.String.pipe(Schema.optional),
    event_type: Schema.String,
    idempotency_key: Schema.String.pipe(Schema.optional),
    payload: Schema.Record(Schema.String, Schema.Unknown),
  })
  export type ExternalEventRequest = typeof ExternalEventRequest.Type

  export const ExternalEventResponse = Schema.Struct({
    external_event_id: AiLooper.ID,
    processed_state: Schema.Literals(["pending", "processed", "ignored_duplicate"]),
  })
  export type ExternalEventResponse = typeof ExternalEventResponse.Type
}
