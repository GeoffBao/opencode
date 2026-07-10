import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { AiLooperProtocol } from "../ai-looper"
import { AiLooperTaskNotFoundError, ConflictError, ForbiddenError, ServiceUnavailableError } from "../errors"

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
  .add(
    HttpApiEndpoint.post("aiLooper.taskRun.create", "/api/ai-looper/tasks/:taskCapsuleID/runs", {
      params: { taskCapsuleID: AiLooperProtocol.TaskCapsuleSummary.fields.task_capsule_id },
      payload: AiLooperProtocol.CreateTaskRunRequest,
      success: AiLooperProtocol.TaskRunResponse,
      error: [AiLooperTaskNotFoundError, ServiceUnavailableError],
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.aiLooper.taskRun.create",
        summary: "Create or reuse AI Looper TaskRun",
        description: "Start or reuse an active durable TaskRun for a task capsule and workspace.",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.post("aiLooper.plan.decide", "/api/ai-looper/runs/:taskRunID/plan/decision", {
      params: { taskRunID: AiLooperProtocol.TaskRunResponse.fields.task_run_id },
      payload: AiLooperProtocol.PlanDecisionRequest,
      success: AiLooperProtocol.PlanDecisionResponse,
      error: [ForbiddenError, ConflictError, ServiceUnavailableError],
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.aiLooper.plan.decide",
        summary: "Approve or reject AI Looper execution plan",
        description: "Record an authorized decision for the exact current execution plan version.",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.post("aiLooper.event.ingest", "/api/ai-looper/events", {
      payload: AiLooperProtocol.ExternalEventRequest,
      success: AiLooperProtocol.ExternalEventResponse,
      error: ServiceUnavailableError,
    }).annotateMerge(
      OpenApi.annotations({
        identifier: "v2.aiLooper.event.ingest",
        summary: "Ingest AI Looper external event",
        description: "Accept Teambition, UI, or runtime adapter events with duplicate reconciliation.",
      }),
    ),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "AI Looper",
      description: "Durable enterprise AI software delivery control-plane routes.",
    }),
  )
