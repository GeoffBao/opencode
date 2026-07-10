import { Schema } from "effect"

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
}
