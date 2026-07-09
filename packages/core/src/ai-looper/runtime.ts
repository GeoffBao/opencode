import { Schema } from "effect"

export namespace AILooperRuntime {
  export const Adapter = Schema.Literal("opencode")
  export type Adapter = typeof Adapter.Type

  export const Outcome = Schema.Literals(["succeeded", "failed", "blocked", "interrupted", "no_progress"])
  export type Outcome = typeof Outcome.Type

  export interface AttemptInput {
    readonly taskRunId: string
    readonly workspaceRef: string
    readonly executionPlanVersion: number
    readonly allowedTools: ReadonlyArray<string>
    readonly promptSnapshot: string
    readonly artifactRefs: ReadonlyArray<string>
  }

  export interface AttemptResult {
    readonly taskRunId: string
    readonly runtimeAdapter: Adapter
    readonly runtimeSessionId?: string
    readonly outcome: Outcome
    readonly changedArtifacts: ReadonlyArray<string>
    readonly commandsRun: ReadonlyArray<string>
    readonly evidenceCandidates: ReadonlyArray<string>
    readonly blocker?: string
    readonly nextActionProposal?: string
    readonly logsSummary: string
    readonly startedAt: string
    readonly endedAt: string
    readonly costMetadata?: Record<string, unknown>
    readonly timeMetadata?: Record<string, unknown>
    readonly diagnosticRefs?: ReadonlyArray<string>
  }

  export interface AdapterService {
    run(input: AttemptInput): Promise<AttemptResult>
  }
}
