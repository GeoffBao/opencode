import { Schema } from "effect"
import { AiLooper } from "@opencode-ai/schema/ai-looper"

export namespace AILooperOutbox {
  export const WriteType = Schema.Literals(["progress_note", "delivery_summary", "worktime"])
  export type WriteType = typeof WriteType.Type

  export interface ExternalEventInput {
    readonly externalEventID: string
    readonly sourceSystem: "teambition" | "ai_looper_ui" | "coding_runtime"
    readonly sourceEventID?: string
    readonly eventType: string
    readonly idempotencyKey?: string
    readonly payloadRef: string
    readonly receivedAt: string
  }

  export function deliverySummaryKey(taskRunID: string, artifactID: string, version: number) {
    return ["delivery_summary", taskRunID, artifactID, version].join(":")
  }

  export function worktimeKey(taskRunID: string, engineerID: string, confirmedAt: string) {
    return ["worktime", taskRunID, engineerID, confirmedAt].join(":")
  }

  export function worktimeDraftKey(taskRunID: string, worktimeDraftID: string, engineerID: string) {
    return ["worktime", taskRunID, worktimeDraftID, engineerID].join(":")
  }

  export function progressNoteKey(taskRunID: string, artifactID: string, version: number) {
    return ["progress_note", taskRunID, artifactID, version].join(":")
  }

  export function externalEventDedupeKey(input: Pick<ExternalEventInput, "sourceSystem" | "sourceEventID" | "idempotencyKey">) {
    if (input.idempotencyKey) return input.idempotencyKey
    return [input.sourceSystem, input.sourceEventID ?? "missing_source_event"].join(":")
  }

  export function reconcileExternalEvent(input: {
    readonly event: ExternalEventInput
    readonly existingDedupeKeys: ReadonlySet<string>
  }) {
    const dedupeKey = externalEventDedupeKey(input.event)
    return {
      external_event_id: input.event.externalEventID,
      source_system: input.event.sourceSystem,
      source_event_id: input.event.sourceEventID,
      event_type: input.event.eventType,
      payload_ref: input.event.payloadRef,
      received_at: input.event.receivedAt,
      dedupe_key: dedupeKey,
      processed_state: input.existingDedupeKeys.has(dedupeKey) ? ("ignored_duplicate" as const) : ("pending" as const),
    }
  }

  export function queueDeliverySummary(input: {
    readonly externalWriteID: string
    readonly taskRunID: string
    readonly artifactID: string
    readonly artifactVersion: number
    readonly createdAt: string
    readonly existingWrites: ReadonlyArray<AiLooper.ExternalWrite>
  }) {
    const idempotencyKey = deliverySummaryKey(input.taskRunID, input.artifactID, input.artifactVersion)
    const existing = input.existingWrites.find((write) => write.idempotency_key === idempotencyKey)
    if (existing) return { status: "queued" as const, write: existing, reused: true as const }
    return {
      status: "queued" as const,
      reused: false as const,
      write: {
        external_write_id: input.externalWriteID,
        task_run_id: input.taskRunID,
        target_system: "teambition" as const,
        write_type: "delivery_summary" as const,
        idempotency_key: idempotencyKey,
        payload_ref: `delivery_summary:${input.artifactID}:${input.artifactVersion}`,
        status: "pending" as const,
        attempt_count: 0,
        created_at: input.createdAt,
        updated_at: input.createdAt,
      } satisfies AiLooper.ExternalWrite,
    }
  }

  export function queueProgressNote(input: {
    readonly externalWriteID: string
    readonly taskRunID: string
    readonly artifactID: string
    readonly artifactVersion: number
    readonly createdAt: string
    readonly existingWrites: ReadonlyArray<AiLooper.ExternalWrite>
  }) {
    const idempotencyKey = progressNoteKey(input.taskRunID, input.artifactID, input.artifactVersion)
    const existing = input.existingWrites.find((write) => write.idempotency_key === idempotencyKey)
    if (existing) return { status: "queued" as const, write: existing, reused: true as const }
    return {
      status: "queued" as const,
      reused: false as const,
      write: {
        external_write_id: input.externalWriteID,
        task_run_id: input.taskRunID,
        target_system: "teambition" as const,
        write_type: "progress_note" as const,
        idempotency_key: idempotencyKey,
        payload_ref: `progress_note:${input.artifactID}:${input.artifactVersion}`,
        status: "pending" as const,
        attempt_count: 0,
        created_at: input.createdAt,
        updated_at: input.createdAt,
      } satisfies AiLooper.ExternalWrite,
    }
  }

  export function queueWorktimeSubmission(input: {
    readonly externalWriteID: string
    readonly taskRunID: string
    readonly worktimeDraftID: string
    readonly responsibleEngineerID: string
    readonly actorID: string
    readonly confirmedMinutes: number
    readonly confirmedDescription: string
    readonly confirmedAt: string
    readonly existingWrites: ReadonlyArray<AiLooper.ExternalWrite>
    readonly worktimeDraft: AiLooper.WorktimeDraft
  }) {
    if (input.actorID !== input.responsibleEngineerID) return { status: "unauthorized" as const }
    const idempotencyKey = worktimeDraftKey(input.taskRunID, input.worktimeDraftID, input.responsibleEngineerID)
    const existing = input.existingWrites.find((write) => write.idempotency_key === idempotencyKey)
    if (existing) return { status: "queued" as const, write: existing, worktimeDraft: input.worktimeDraft, reused: true as const }
    return {
      status: "queued" as const,
      reused: false as const,
      write: {
        external_write_id: input.externalWriteID,
        task_run_id: input.taskRunID,
        target_system: "teambition" as const,
        write_type: "worktime" as const,
        idempotency_key: idempotencyKey,
        payload_ref: `worktime:${input.worktimeDraftID}:${input.confirmedMinutes}:${input.confirmedDescription}:${input.confirmedAt}`,
        status: "pending" as const,
        attempt_count: 0,
        created_at: input.confirmedAt,
        updated_at: input.confirmedAt,
      } satisfies AiLooper.ExternalWrite,
      worktimeDraft: {
        ...input.worktimeDraft,
        confirmed_minutes: input.confirmedMinutes,
        confirmed_description: input.confirmedDescription,
        confirmed_by: input.actorID,
        confirmed_at: input.confirmedAt,
        submission_write_id: input.externalWriteID,
      } satisfies AiLooper.WorktimeDraft,
    }
  }
}
