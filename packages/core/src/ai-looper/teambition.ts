import { Schema } from "effect"
import { AiLooper } from "@opencode-ai/schema/ai-looper"

export namespace AILooperTeambition {
  export const SourceSystem = Schema.Literal("teambition")
  export type SourceSystem = typeof SourceSystem.Type

  export interface Adapter {
    listAssignedWorkItems(engineerID: string): Promise<ReadonlyArray<AiLooper.SourceTask>>
    getWorkItemDetail(sourceTaskID: string): Promise<AiLooper.SourceTask>
    resolveReviewerPolicy(sourceTask: AiLooper.SourceTask): Promise<ReadonlyArray<string>>
    writeProgressNote(taskRunID: string, payloadRef: string, idempotencyKey: string): Promise<void>
    writeDeliverySummary(taskRunID: string, payloadRef: string, idempotencyKey: string): Promise<void>
    submitWorktime(taskRunID: string, payloadRef: string, idempotencyKey: string): Promise<void>
  }
}
