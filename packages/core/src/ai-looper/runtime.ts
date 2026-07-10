import { Schema } from "effect"

export namespace AILooperRuntime {
  export const Adapter = Schema.Literal("opencode")
  export type Adapter = typeof Adapter.Type

  export const Outcome = Schema.Literals(["succeeded", "failed", "blocked", "interrupted", "no_progress"])
  export type Outcome = typeof Outcome.Type

  export const AttemptInput = Schema.Struct({
    taskRunId: Schema.String,
    workspaceRef: Schema.String,
    executionPlanVersion: Schema.Number,
    allowedTools: Schema.Array(Schema.String),
    promptSnapshot: Schema.String,
    artifactRefs: Schema.Array(Schema.String),
  })
  export type AttemptInput = typeof AttemptInput.Type

  export const AttemptResult = Schema.Struct({
    taskRunId: Schema.String,
    runtimeAdapter: Adapter,
    runtimeSessionId: Schema.String.pipe(Schema.optional),
    outcome: Outcome,
    changedArtifacts: Schema.Array(Schema.String),
    commandsRun: Schema.Array(Schema.String),
    evidenceCandidates: Schema.Array(Schema.String),
    blocker: Schema.String.pipe(Schema.optional),
    nextActionProposal: Schema.String.pipe(Schema.optional),
    logsSummary: Schema.String,
    startedAt: Schema.String,
    endedAt: Schema.String,
    costMetadata: Schema.Record(Schema.String, Schema.Unknown).pipe(Schema.optional),
    timeMetadata: Schema.Record(Schema.String, Schema.Unknown).pipe(Schema.optional),
    diagnosticRefs: Schema.Array(Schema.String).pipe(Schema.optional),
  })
  export type AttemptResult = typeof AttemptResult.Type

  export interface AdapterService {
    run(input: AttemptInput): Promise<AttemptResult>
  }

  const decodeAttemptInput = Schema.decodeUnknownSync(AttemptInput)
  const decodeAttemptResult = Schema.decodeUnknownSync(AttemptResult)

  export function validateAttemptInput(input: AttemptInput) {
    if (input.allowedTools.length === 0) return "missing_allowed_tools" as const
    if (input.promptSnapshot.length === 0) return "missing_prompt_snapshot" as const
    if (input.artifactRefs.length === 0) return "missing_artifact_refs" as const
    return "valid" as const
  }

  export async function runAttempt(adapter: AdapterService, input: AttemptInput) {
    const decoded = decodeAttemptInput(input)
    const validation = validateAttemptInput(decoded)
    if (validation !== "valid") return { validation, result: undefined }
    return { validation, result: decodeAttemptResult(await adapter.run(decoded)) }
  }
}
