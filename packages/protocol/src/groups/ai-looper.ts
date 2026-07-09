import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { AiLooperProtocol } from "../ai-looper"

export const AILooperGroup = HttpApiGroup.make("server.aiLooper")
  .add(
    HttpApiEndpoint.get("aiLooper.task.list", "/api/ai-looper/tasks", {
      success: AiLooperProtocol.TaskListResponse,
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.aiLooper.task.list",
        summary: "List AI Looper tasks",
        description: "List Teambition-backed AI Looper task capsules assigned to the current engineer.",
      }),
    ),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "AI Looper",
      description: "Durable enterprise AI software delivery control-plane routes.",
    }),
  )
