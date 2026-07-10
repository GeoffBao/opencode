import { AILooperWorkbench } from "@opencode-ai/core/ai-looper/workbench"
import {
  AiLooperTaskNotFoundError,
  AiLooperTaskRunNotFoundError,
  ServiceUnavailableError,
} from "@opencode-ai/protocol/errors"
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
    .handle(
      "aiLooper.taskRun.create",
      Effect.fn(function* (ctx) {
        const workbench = yield* AILooperWorkbench.Service
        return yield* workbench.createTaskRun({
          taskCapsuleID: ctx.params.taskCapsuleID,
          workspaceRef: ctx.payload.workspace_ref,
          idempotencyKey: ctx.payload.idempotency_key,
        }).pipe(Effect.mapError((error) => new ServiceUnavailableError({ message: error.message })))
      }),
    )
    .handle(
      "aiLooper.run.detail",
      Effect.fn(function* (ctx) {
        const workbench = yield* AILooperWorkbench.Service
        const detail = yield* workbench
          .getRunDetail(ctx.params.taskRunID)
          .pipe(Effect.mapError((error) => new ServiceUnavailableError({ message: error.message })))
        if (detail) return detail
        return yield* new AiLooperTaskRunNotFoundError({
          taskRunID: ctx.params.taskRunID,
          message: `AI Looper TaskRun not found: ${ctx.params.taskRunID}`,
        })
      }),
    )
    .handle(
      "aiLooper.run.cancel",
      Effect.fn(function* (ctx) {
        const workbench = yield* AILooperWorkbench.Service
        const taskRun = yield* workbench
          .cancelTaskRun({ taskRunID: ctx.params.taskRunID, reason: ctx.payload.reason })
          .pipe(Effect.mapError((error) => new ServiceUnavailableError({ message: error.message })))
        if (taskRun) return taskRun
        return yield* new AiLooperTaskRunNotFoundError({
          taskRunID: ctx.params.taskRunID,
          message: `AI Looper TaskRun not found: ${ctx.params.taskRunID}`,
        })
      }),
    )
    .handle(
      "aiLooper.run.humanEvidence",
      Effect.fn(function* (ctx) {
        const workbench = yield* AILooperWorkbench.Service
        const evidence = yield* workbench
          .recordHumanEvidence({
            taskRunID: ctx.params.taskRunID,
            acceptanceCriterionID: ctx.payload.acceptance_criterion_id,
            result: ctx.payload.result,
            explanation: ctx.payload.explanation,
          })
          .pipe(Effect.mapError((error) => new ServiceUnavailableError({ message: error.message })))
        if (evidence) return evidence
        return yield* new AiLooperTaskRunNotFoundError({
          taskRunID: ctx.params.taskRunID,
          message: `AI Looper TaskRun not found: ${ctx.params.taskRunID}`,
        })
      }),
    )
    .handle(
      "aiLooper.run.deliverySummary",
      Effect.fn(function* (ctx) {
        const workbench = yield* AILooperWorkbench.Service
        const write = yield* workbench
          .queueDeliverySummary({
            taskRunID: ctx.params.taskRunID,
            deliverySummaryArtifactID: ctx.payload.delivery_summary_artifact_id,
            deliverySummaryVersion: ctx.payload.delivery_summary_version,
          })
          .pipe(Effect.mapError((error) => new ServiceUnavailableError({ message: error.message })))
        if (write) return write
        return yield* new AiLooperTaskRunNotFoundError({
          taskRunID: ctx.params.taskRunID,
          message: `AI Looper TaskRun not found: ${ctx.params.taskRunID}`,
        })
      }),
    )
    .handle(
      "aiLooper.run.worktime",
      Effect.fn(function* (ctx) {
        const workbench = yield* AILooperWorkbench.Service
        const write = yield* workbench
          .submitWorktime({
            taskRunID: ctx.params.taskRunID,
            worktimeDraftID: ctx.payload.worktime_draft_id,
            confirmedMinutes: ctx.payload.confirmed_minutes,
            confirmedDescription: ctx.payload.confirmed_description,
          })
          .pipe(Effect.mapError((error) => new ServiceUnavailableError({ message: error.message })))
        if (write) return write
        return yield* new AiLooperTaskRunNotFoundError({
          taskRunID: ctx.params.taskRunID,
          message: `AI Looper TaskRun not found: ${ctx.params.taskRunID}`,
        })
      }),
    )
    .handle(
      "aiLooper.plan.decide",
      Effect.fn(function* (ctx) {
        const workbench = yield* AILooperWorkbench.Service
        return yield* workbench.decidePlan({
          taskRunID: ctx.params.taskRunID,
          planID: ctx.payload.plan_id,
          planVersion: ctx.payload.plan_version,
          decision: ctx.payload.decision,
          comments: ctx.payload.comments,
        }).pipe(Effect.mapError((error) => new ServiceUnavailableError({ message: error.message })))
      }),
    )
    .handle(
      "aiLooper.event.ingest",
      Effect.fn(function* (ctx) {
        const workbench = yield* AILooperWorkbench.Service
        return yield* workbench.ingestExternalEvent({
          sourceSystem: ctx.payload.source_system,
          sourceEventID: ctx.payload.source_event_id,
          eventType: ctx.payload.event_type,
          idempotencyKey: ctx.payload.idempotency_key,
          payload: ctx.payload.payload,
        }).pipe(Effect.mapError((error) => new ServiceUnavailableError({ message: error.message })))
      }),
    ),
)
