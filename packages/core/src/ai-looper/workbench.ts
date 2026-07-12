import { Context, Effect, Layer, Schema } from "effect"
import { and, eq } from "drizzle-orm"
import { AiLooper } from "@opencode-ai/schema/ai-looper"
import { Database } from "../database/database"
import { makeGlobalNode } from "../effect/app-node"
import { AILooperExternalEventTable, AILooperTaskCapsuleTable, AILooperTaskRunTable } from "./sql"
import { selectExecutionTrack } from "./routing"
import { selectGatePolicy } from "./routing"
import { createOrReuseTaskRun, createTaskCapsule, createTaskRunDetail } from "./taskrun"
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

  export function toTaskSummary(row: {
    readonly id: AiLooper.ID
    readonly source_task_id: string
    readonly title: string
    readonly source_status?: string | null
    readonly work_item_type: AiLooper.WorkItemType
    readonly execution_track?: AiLooper.ExecutionTrack | null
    readonly active_task_run_id?: AiLooper.ID | null
  }): TaskSummary {
    return {
      task_capsule_id: row.id,
      source_task_id: row.source_task_id,
      title: row.title,
      source_status: row.source_status ?? undefined,
      work_item_type: row.work_item_type,
      execution_track: row.execution_track ?? undefined,
      active_task_run_id: row.active_task_run_id ?? undefined,
    }
  }

  const layer = Layer.effect(
    Service,
    Effect.gen(function* () {
      const { db } = yield* Database.Service

      return Service.of({
        listTasks: Effect.fn("AILooperWorkbench.listTasks")(function* () {
          const rows = yield* db.select().from(AILooperTaskCapsuleTable).all().pipe(Effect.orDie)
          return rows.map(toTaskSummary)
        }),
        getTask: Effect.fn("AILooperWorkbench.getTask")(function* (taskCapsuleID) {
          const row = yield* db
            .select()
            .from(AILooperTaskCapsuleTable)
            .where(eq(AILooperTaskCapsuleTable.id, taskCapsuleID))
            .get()
            .pipe(Effect.orDie)
          if (!row) return undefined

          const activeTaskRun = row.active_task_run_id
            ? yield* db
                .select()
                .from(AILooperTaskRunTable)
                .where(eq(AILooperTaskRunTable.id, row.active_task_run_id))
                .get()
                .pipe(Effect.orDie)
            : undefined

          return {
            task_capsule: toTaskSummary(row),
            source_task: row.source_task,
            current_task_run: activeTaskRun ? toTaskRun(activeTaskRun) : undefined,
          }
        }),
        createTaskRun: Effect.fn("AILooperWorkbench.createTaskRun")(function* (input) {
          const capsule = yield* db
            .select()
            .from(AILooperTaskCapsuleTable)
            .where(eq(AILooperTaskCapsuleTable.id, input.taskCapsuleID))
            .get()
            .pipe(Effect.orDie)
          if (!capsule) return yield* new UnavailableError({ message: `Task capsule not found: ${input.taskCapsuleID}` })

          if (capsule.active_task_run_id) {
            const active = yield* db
              .select()
              .from(AILooperTaskRunTable)
              .where(eq(AILooperTaskRunTable.id, capsule.active_task_run_id))
              .get()
              .pipe(Effect.orDie)
            if (active?.lifecycle === "active") return toTaskRun(active)
          }

          const now = new Date().toISOString()
          const taskRun = createOrReuseTaskRun({
            taskRunID: crypto.randomUUID(),
            taskCapsuleID: capsule.id,
            executionTrack: capsule.execution_track ?? selectExecutionTrack({ workItemType: capsule.work_item_type }),
            createdAt: now,
          }).taskRun
          const taskCapsule = createTaskCapsule({
            taskCapsuleID: capsule.id,
            sourceTask: capsule.source_task,
            responsibleEngineerID: capsule.owner_user_id,
            workspaceRef: input.workspaceRef,
            activeTaskRunID: taskRun.task_run_id,
            createdAt: now,
          })

          yield* db
            .insert(AILooperTaskRunTable)
            .values({
              id: taskRun.task_run_id,
              source_system: "teambition",
              source_task_id: capsule.source_task_id,
              work_item_type: capsule.work_item_type,
              title: capsule.title,
              source_task: capsule.source_task,
              task_capsule: taskCapsule,
              execution_track: taskRun.execution_track,
              gate_policy: selectGatePolicy({ workItemType: taskRun.execution_track === "bugfix" ? "bug" : capsule.work_item_type }),
              phase: taskRun.phase,
              lifecycle: taskRun.lifecycle,
              gate_state: taskRun.gate_state,
              current_disposition: taskRun.disposition,
              owner_user_id: capsule.owner_user_id,
              workspace_ref: input.workspaceRef,
              attempt_count: 0,
              high_risk: false,
              time_created: Date.now(),
              time_updated: Date.now(),
            })
            .run()
            .pipe(Effect.orDie)
          yield* db
            .update(AILooperTaskCapsuleTable)
            .set({ active_task_run_id: taskRun.task_run_id, workspace_ref: input.workspaceRef, time_updated: Date.now() })
            .where(eq(AILooperTaskCapsuleTable.id, capsule.id))
            .run()
            .pipe(Effect.orDie)
          return taskRun
        }),
        getRunDetail: Effect.fn("AILooperWorkbench.getRunDetail")(function* (taskRunID) {
          const row = yield* db
            .select()
            .from(AILooperTaskRunTable)
            .where(eq(AILooperTaskRunTable.id, taskRunID))
            .get()
            .pipe(Effect.orDie)
          if (!row) return undefined
          return createTaskRunDetail({ taskRun: toTaskRun(row) })
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
        ingestExternalEvent: Effect.fn("AILooperWorkbench.ingestExternalEvent")(function* (input) {
          if (input.sourceSystem !== "teambition") {
            return yield* new UnavailableError({ message: "Only Teambition task ingestion is supported in this slice" })
          }
          const decoded = Schema.decodeUnknownOption(AiLooper.SourceTask)(input.payload)
          if (decoded._tag === "None") {
            return yield* new UnavailableError({ message: "Teambition event payload is not a valid SourceTask" })
          }
          const sourceTask = decoded.value
          const capsuleID = `capsule_${sourceTask.source_task_id}`
          const externalEventID = input.sourceEventID ?? `${sourceTask.source_task_id}:${sourceTask.source_version}`
          const executionTrack = selectExecutionTrack({ workItemType: sourceTask.work_item_type })

          const existingEvent = yield* db
            .select()
            .from(AILooperExternalEventTable)
            .where(
              and(
                eq(AILooperExternalEventTable.source_system, "teambition"),
                eq(AILooperExternalEventTable.external_event_id, externalEventID),
              ),
            )
            .get()
            .pipe(Effect.orDie)
          if (existingEvent) return { external_event_id: externalEventID, processed_state: "ignored_duplicate" as const }

          yield* db
            .insert(AILooperTaskCapsuleTable)
            .values({
              id: capsuleID,
              source_system: "teambition",
              source_task_id: sourceTask.source_task_id,
              title: sourceTask.title,
              source_status: sourceTask.source_status,
              work_item_type: sourceTask.work_item_type,
              execution_track: executionTrack,
              source_task: sourceTask,
              owner_user_id: sourceTask.assignee_ids[0] ?? "unassigned",
              time_created: Date.now(),
              time_updated: Date.now(),
            })
            .onConflictDoUpdate({
              target: AILooperTaskCapsuleTable.id,
              set: {
                title: sourceTask.title,
                source_status: sourceTask.source_status,
                work_item_type: sourceTask.work_item_type,
                execution_track: executionTrack,
                source_task: sourceTask,
                time_updated: Date.now(),
              },
            })
            .run()
            .pipe(Effect.orDie)

          yield* db
            .insert(AILooperExternalEventTable)
            .values({
              source_system: "teambition",
              external_event_id: externalEventID,
              source_task_id: sourceTask.source_task_id,
              received_at: Date.now(),
              payload: JSON.stringify(input.payload),
              time_created: Date.now(),
              time_updated: Date.now(),
            })
            .run()
            .pipe(Effect.orDie)

          return { external_event_id: externalEventID, processed_state: "processed" as const }
        }),
      })
    }),
  )

  export const node = makeGlobalNode({ service: Service, layer, deps: [Database.node] })
}

function toTaskRun(row: typeof AILooperTaskRunTable.$inferSelect): AiLooper.TaskRun {
  return {
    task_run_id: row.id,
    task_capsule_id: row.task_capsule?.task_capsule_id ?? row.source_task_id,
    execution_track: row.execution_track,
    gate_state: row.gate_state,
    phase: row.phase,
    disposition: row.current_disposition,
    lifecycle: row.lifecycle,
    latest_committed_step: "TaskRun persisted",
    next_expected_action: undefined,
    retry_count: row.attempt_count,
    retry_budget: 3,
    responsible_role: undefined,
    created_at: new Date(row.time_created).toISOString(),
    updated_at: new Date(row.time_updated).toISOString(),
    next_wake_at: row.next_wake_at ? new Date(row.next_wake_at).toISOString() : undefined,
    completed_at: undefined,
    cancelled_at: undefined,
  }
}
