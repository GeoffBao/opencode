import { Context, Effect, Layer } from "effect"
import { AiLooper } from "@opencode-ai/schema/ai-looper"
import { makeGlobalNode } from "../effect/app-node"

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

  export interface Interface {
    readonly listTasks: () => Effect.Effect<TaskSummary[]>
    readonly getTask: (taskCapsuleID: AiLooper.ID) => Effect.Effect<TaskDetail | undefined>
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
    }),
  )

  export const node = makeGlobalNode({ service: Service, layer, deps: [] })
}
