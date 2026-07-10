import { Schema } from "effect"
import { AiLooper } from "@opencode-ai/schema/ai-looper"

export namespace AILooperTeambition {
  export const SourceSystem = Schema.Literal("teambition")
  export type SourceSystem = typeof SourceSystem.Type

  const decodeSourceTask = Schema.decodeUnknownSync(AiLooper.SourceTask)

  export interface Adapter {
    listAssignedWorkItems(engineerID: string): Promise<ReadonlyArray<AiLooper.SourceTask>>
    getWorkItemDetail(sourceTaskID: string): Promise<AiLooper.SourceTask>
    resolveReviewerPolicy(sourceTask: AiLooper.SourceTask): Promise<ReadonlyArray<string>>
    writeProgressNote(taskRunID: string, payloadRef: string, idempotencyKey: string): Promise<void>
    writeDeliverySummary(taskRunID: string, payloadRef: string, idempotencyKey: string): Promise<void>
    submitWorktime(taskRunID: string, payloadRef: string, idempotencyKey: string): Promise<void>
  }

  export async function listAuthorizedAssignedWorkItems(adapter: Adapter, engineerID: string) {
    return (await adapter.listAssignedWorkItems(engineerID))
      .map(decodeSourceTask)
      .filter((sourceTask) => canImportForEngineer(sourceTask, engineerID))
  }

  export function canImportForEngineer(sourceTask: AiLooper.SourceTask, engineerID: string) {
    if (sourceTask.visibility_state === "reassigned") return false
    return sourceTask.assignee_ids.includes(engineerID)
  }

  export function isSourceContentAvailable(sourceTask: AiLooper.SourceTask) {
    return sourceTask.visibility_state === "visible"
  }

  export async function resolveAuthorizedReviewers(adapter: Adapter, sourceTask: AiLooper.SourceTask) {
    return [...new Set(await adapter.resolveReviewerPolicy(decodeSourceTask(sourceTask)))].filter(
      (reviewerID) => reviewerID.length > 0,
    )
  }

  export function canReviewPlan(reviewerIDs: ReadonlyArray<string>, actorID: string) {
    return reviewerIDs.includes(actorID)
  }
}
