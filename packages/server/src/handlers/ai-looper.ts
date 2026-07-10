import { AILooperWorkbench } from "@opencode-ai/core/ai-looper/workbench"
import { AiLooperTaskNotFoundError, ServiceUnavailableError } from "@opencode-ai/protocol/errors"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Api } from "../api"

export const AILooperHandler = HttpApiBuilder.group(Api, "server.aiLooper", (handlers) =>
  handlers
    .handle(
      "aiLooper.task.list",
      Effect.fn(function* () {
        const workbench = yield* AILooperWorkbench.Service
        return { tasks: yield* workbench.listTasks() }
      }),
    )
    .handle(
      "aiLooper.task.get",
      Effect.fn(function* (ctx) {
        const workbench = yield* AILooperWorkbench.Service
        const task = yield* workbench.getTask(ctx.params.taskCapsuleID)
        if (task) return task
        return yield* new AiLooperTaskNotFoundError({
          taskCapsuleID: ctx.params.taskCapsuleID,
          message: `AI Looper task capsule not found: ${ctx.params.taskCapsuleID}`,
        })
      }),
    )
    .handle("aiLooper.taskRun.create", () =>
      Effect.fail(new ServiceUnavailableError({ message: "AI Looper TaskRun creation is not implemented yet" })),
    )
    .handle("aiLooper.plan.decide", () =>
      Effect.fail(new ServiceUnavailableError({ message: "AI Looper plan decision is not implemented yet" })),
    ),
)
