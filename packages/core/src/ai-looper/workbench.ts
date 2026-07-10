import { Context, Effect, Layer, Schema } from "effect"
import { AiLooper } from "@opencode-ai/schema/ai-looper"
import { makeGlobalNode } from "../effect/app-node"
import type { TaskRunDetail } from "./taskrun"

export namespace AILooperWorkbench {
  export type TaskSummary = {
    readonly task_capsule_id: AiLooper.ID
    readonly source_task_id: AiLooper.ID
    readonly title: string
    readonly source_status?: string
    readonly work_item_type: AiLooper.WorkItemType
    readonly execution_track?: AiLooper.ExecutionTrack
    readonly active_task_run_id?: AiLooper.ID
  }

  export type TaskDetail = {
    readonly task_capsule: TaskSummary
    readonly source_task: AiLooper.SourceTask
    readonly current_task_run?: AiLooper.TaskRun
  }

  export class UnavailableError extends Schema.TaggedErrorClass<UnavailableError>()("AILooperWorkbench.UnavailableError", {
    message: Schema.String,
  }) {}

  export interface Interface {
    readonly listTasks: () => Effect.Effect<TaskSummary[]>
    readonly getTask: (taskCapsuleID: AiLooper.ID) => Effect.Effect<TaskDetail | undefined>
    readonly createTaskRun: (input: {
      readonly taskCapsuleID: AiLooper.ID
      readonly workspaceRef: string
      readonly idempotencyKey?: string
    }) => Effect.Effect<AiLooper.TaskRun, UnavailableError>
    readonly getRunDetail: (taskRunID: AiLooper.ID) => Effect.Effect<TaskRunDetail | undefined, UnavailableError>
    readonly cancelTaskRun: (input: {
      readonly taskRunID: AiLooper.ID
      readonly reason: string
    }) => Effect.Effect<AiLooper.TaskRun | undefined, UnavailableError>
    readonly recordHumanEvidence: (input: {
      readonly taskRunID: AiLooper.ID
      readonly acceptanceCriterionID: AiLooper.ID
      readonly result: AiLooper.EvidenceResult
      readonly explanation: string
    }) => Effect.Effect<AiLooper.Evidence | undefined, UnavailableError>
    readonly queueDeliverySummary: (input: {
      readonly taskRunID: AiLooper.ID
      readonly deliverySummaryArtifactID: AiLooper.ID
      readonly deliverySummaryVersion: number
    }) => Effect.Effect<AiLooper.ExternalWrite | undefined, UnavailableError>
    readonly submitWorktime: (input: {
      readonly taskRunID: AiLooper.ID
      readonly worktimeDraftID: AiLooper.ID
      readonly confirmedMinutes: number
      readonly confirmedDescription: string
    }) => Effect.Effect<AiLooper.ExternalWrite | undefined, UnavailableError>
    readonly decidePlan: (input: {
      readonly taskRunID: AiLooper.ID
      readonly planID: AiLooper.ID
      readonly planVersion: number
      readonly decision: "approved" | "rejected"
      readonly comments?: string
    }) => Effect.Effect<AiLooper.ApprovalDecision, UnavailableError>
    readonly ingestExternalEvent: (input: {
      readonly sourceSystem: "teambition" | "ai_looper_ui" | "coding_runtime"
      readonly sourceEventID?: string
      readonly eventType: string
      readonly idempotencyKey?: string
      readonly payload: Record<string, unknown>
    }) => Effect.Effect<{ readonly external_event_id: AiLooper.ID; readonly processed_state: "pending" | "processed" | "ignored_duplicate" }, UnavailableError>
  }

  export class Service extends Context.Service<Service, Interface>()("@opencode/AILooperWorkbench") {}

  const layer = Layer.succeed(
    Service,
    Service.of({
      listTasks: Effect.fn("AILooperWorkbench.listTasks")(function* () {
        return []
      }),
      getTask: Effect.fn("AILooperWorkbench.getTask")(function* () {
        return undefined
      }),
      createTaskRun: Effect.fn("AILooperWorkbench.createTaskRun")(function* () {
        return yield* new UnavailableError({ message: "AI Looper TaskRun creation is not implemented yet" })
      }),
      getRunDetail: Effect.fn("AILooperWorkbench.getRunDetail")(function* () {
        return yield* new UnavailableError({ message: "AI Looper TaskRun detail is not implemented yet" })
      }),
      cancelTaskRun: Effect.fn("AILooperWorkbench.cancelTaskRun")(function* () {
        return yield* new UnavailableError({ message: "AI Looper TaskRun cancellation is not implemented yet" })
      }),
      recordHumanEvidence: Effect.fn("AILooperWorkbench.recordHumanEvidence")(function* () {
        return yield* new UnavailableError({ message: "AI Looper human evidence recording is not implemented yet" })
      }),
      queueDeliverySummary: Effect.fn("AILooperWorkbench.queueDeliverySummary")(function* () {
        return yield* new UnavailableError({ message: "AI Looper delivery summary queueing is not implemented yet" })
      }),
      submitWorktime: Effect.fn("AILooperWorkbench.submitWorktime")(function* () {
        return yield* new UnavailableError({ message: "AI Looper worktime submission is not implemented yet" })
      }),
      decidePlan: Effect.fn("AILooperWorkbench.decidePlan")(function* () {
        return yield* new UnavailableError({ message: "AI Looper plan decision is not implemented yet" })
      }),
      ingestExternalEvent: Effect.fn("AILooperWorkbench.ingestExternalEvent")(function* () {
        return yield* new UnavailableError({ message: "AI Looper external event ingestion is not implemented yet" })
      }),
    }),
  )

  export const node = makeGlobalNode({ service: Service, layer, deps: [] })
}
