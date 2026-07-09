import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { AiLooperProtocol } from "../ai-looper"
import { AiLooperTaskNotFoundError } from "../errors"

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
  .add(
    HttpApiEndpoint.get("aiLooper.task.get", "/api/ai-looper/tasks/:taskCapsuleID", {
      params: { taskCapsuleID: AiLooperProtocol.TaskCapsuleSummary.fields.task_capsule_id },
      success: AiLooperProtocol.TaskDetailResponse,
      error: AiLooperTaskNotFoundError,
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.aiLooper.task.get",
        summary: "Get AI Looper task context",
        description: "Read source task context, acceptance criteria, and the current TaskRun when one exists.",
      }),
    ),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "AI Looper",
      description: "Durable enterprise AI software delivery control-plane routes.",
    }),
  )
