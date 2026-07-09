import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Api } from "../api"

export const AILooperHandler = HttpApiBuilder.group(Api, "server.aiLooper", (handlers) =>
  handlers.handle("aiLooper.task.list", () => Effect.succeed({ tasks: [] })),
)
