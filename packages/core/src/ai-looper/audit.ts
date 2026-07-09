import { Schema } from "effect"

export namespace AILooperAudit {
  export const ActionType = Schema.String
  export type ActionType = typeof ActionType.Type

  export interface EntryInput {
    readonly taskRunID: string
    readonly actorOrSource: string
    readonly actionType: string
    readonly reasonOrEvidence?: string
    readonly relatedArtifactRefs?: ReadonlyArray<string>
    readonly now?: string
  }

  export function create(input: EntryInput) {
    return {
      audit_record_id: crypto.randomUUID(),
      task_run_id: input.taskRunID,
      actor_or_source: input.actorOrSource,
      action_type: input.actionType,
      reason_or_evidence: input.reasonOrEvidence,
      related_artifact_refs: [...(input.relatedArtifactRefs ?? [])],
      created_at: input.now ?? new Date().toISOString(),
    }
  }
}
