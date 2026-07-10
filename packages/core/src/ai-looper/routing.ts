import { AiLooper } from "@opencode-ai/schema/ai-looper"

export const ExecutionTrack = AiLooper.ExecutionTrack
export const WorkItemType = AiLooper.WorkItemType

export interface RoutingInput {
  readonly workItemType: AiLooper.WorkItemType
  readonly assessedSize?: AiLooper.AssessedSize
  readonly assessedRisk?: AiLooper.AssessedRisk
  readonly crossesMultipleModules?: boolean
  readonly changesPublicApi?: boolean
  readonly changesDatabaseSchema?: boolean
  readonly changesAuthorization?: boolean
  readonly changesProductionDelivery?: boolean
  readonly estimatedEngineerDays?: number
}

export interface RoutingDecisionInput extends Omit<RoutingInput, "workItemType"> {
  readonly routingDecisionID: AiLooper.ID
  readonly taskRunID: AiLooper.ID
  readonly sourceTask: AiLooper.SourceTask
  readonly decidedAt: string
  readonly decidedBy?: AiLooper.RoutingDecision["decided_by"]
  readonly reason?: string
}

export function selectExecutionTrack(input: RoutingInput): AiLooper.ExecutionTrack {
  if (input.workItemType === "bug") return "bugfix"
  if (isLargeOrHighRisk(input)) return "spec_driven"
  return "standard_task"
}

export function createRoutingDecision(input: RoutingDecisionInput): AiLooper.RoutingDecision {
  const routingInput = { ...input, workItemType: input.sourceTask.work_item_type }
  const executionTrack = selectExecutionTrack(routingInput)
  const gatePolicy = selectGatePolicy(routingInput)

  return {
    routing_decision_id: input.routingDecisionID,
    task_run_id: input.taskRunID,
    source_task_id: input.sourceTask.source_task_id,
    source_version: input.sourceTask.source_version,
    source_work_item_type: input.sourceTask.work_item_type,
    assessed_size: input.assessedSize ?? "unknown",
    assessed_risk: input.assessedRisk ?? "unknown",
    execution_track: executionTrack,
    gate_policy: gatePolicy,
    reason: input.reason ?? `Selected ${executionTrack} for ${input.sourceTask.work_item_type}`,
    decided_by: input.decidedBy ?? "system",
    decided_at: input.decidedAt,
  }
}

export function selectGatePolicy(input: RoutingInput): AiLooper.GatePolicy {
  if (input.workItemType === "bug") return isLargeOrHighRisk(input) ? "formal_approval" : "reproduction_then_confirmation"
  return selectExecutionTrack(input) === "spec_driven" ? "formal_approval" : "engineer_confirmation"
}

export function isLargeOrHighRisk(input: RoutingInput) {
  return (
    input.assessedSize === "large" ||
    input.assessedRisk === "high" ||
    input.crossesMultipleModules === true ||
    input.changesPublicApi === true ||
    input.changesDatabaseSchema === true ||
    input.changesAuthorization === true ||
    input.changesProductionDelivery === true ||
    (input.estimatedEngineerDays ?? 0) > 1
  )
}
