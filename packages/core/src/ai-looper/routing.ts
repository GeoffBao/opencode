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

export function selectExecutionTrack(input: RoutingInput): AiLooper.ExecutionTrack {
  if (input.workItemType === "bug") return "bugfix"
  if (isLargeOrHighRisk(input)) return "spec_driven"
  return "standard_task"
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
