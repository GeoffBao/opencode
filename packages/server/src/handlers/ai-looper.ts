import { AiLooperTaskNotFoundError } from "@opencode-ai/protocol/errors"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Api } from "../api"

export const AILooperHandler = HttpApiBuilder.group(Api, "server.aiLooper", (handlers) =>
  handlers
    .handle("aiLooper.task.list", () => Effect.succeed({ tasks: [] }))
    .handle(
      "aiLooper.task.get",
      Effect.fn(function* (ctx) {
        return yield* new AiLooperTaskNotFoundError({
          taskCapsuleID: ctx.params.taskCapsuleID,
          message: `AI Looper task capsule not found: ${ctx.params.taskCapsuleID}`,
        })
      }),
    ),
)
