import { Schema } from "effect"
import { AiLooper } from "@opencode-ai/schema/ai-looper"

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

  export function sourceRetrieved(input: {
    readonly taskRunID: string
    readonly sourceTaskID: string
    readonly actorOrSource: string
    readonly visibilityState: AiLooper.VisibilityState
    readonly now?: string
  }) {
    return create({
      taskRunID: input.taskRunID,
      actorOrSource: input.actorOrSource,
      actionType: "source.retrieved",
      reasonOrEvidence: `source_task:${input.sourceTaskID}:visibility:${input.visibilityState}`,
      now: input.now,
    })
  }

  export function routingDecided(input: {
    readonly taskRunID: string
    readonly routingDecisionID: string
    readonly actorOrSource?: string
    readonly executionTrack: AiLooper.ExecutionTrack
    readonly gatePolicy: AiLooper.GatePolicy
    readonly now?: string
  }) {
    return create({
      taskRunID: input.taskRunID,
      actorOrSource: input.actorOrSource ?? "system",
      actionType: "routing.decided",
      reasonOrEvidence: `execution_track:${input.executionTrack}:gate_policy:${input.gatePolicy}`,
      relatedArtifactRefs: [`routing_decision:${input.routingDecisionID}`],
      now: input.now,
    })
  }

  export function planDecisionRecorded(input: {
    readonly taskRunID: string
    readonly actorID: string
    readonly artifactID: string
    readonly artifactVersion: number
    readonly decision: "approved" | "rejected"
    readonly now?: string
  }) {
    return create({
      taskRunID: input.taskRunID,
      actorOrSource: input.actorID,
      actionType: input.decision === "approved" ? "plan.approved" : "plan.rejected",
      reasonOrEvidence: `artifact:${input.artifactID}:version:${input.artifactVersion}`,
      now: input.now,
    })
  }

  export function confirmationRecorded(input: {
    readonly taskRunID: string
    readonly actorID: string
    readonly confirmationType: "lightweight_brief" | "bugfix_plan"
    readonly now?: string
  }) {
    return create({
      taskRunID: input.taskRunID,
      actorOrSource: input.actorID,
      actionType: `${input.confirmationType}.confirmed`,
      now: input.now,
    })
  }

  export function unauthorizedAttempt(input: {
    readonly taskRunID: string
    readonly actorID: string
    readonly attemptedAction: string
    readonly now?: string
  }) {
    return create({
      taskRunID: input.taskRunID,
      actorOrSource: input.actorID,
      actionType: "authorization.denied",
      reasonOrEvidence: input.attemptedAction,
      now: input.now,
    })
  }

  export function staleDecisionRejected(input: {
    readonly taskRunID: string
    readonly actorID: string
    readonly requestedVersion: number
    readonly currentVersion: number
    readonly now?: string
  }) {
    return create({
      taskRunID: input.taskRunID,
      actorOrSource: input.actorID,
      actionType: "plan.stale_decision_rejected",
      reasonOrEvidence: `requested:${input.requestedVersion}:current:${input.currentVersion}`,
      now: input.now,
    })
  }
}
