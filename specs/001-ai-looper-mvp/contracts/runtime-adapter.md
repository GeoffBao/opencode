# Contract: Coding Runtime Adapter

The Coding Runtime Adapter isolates AI Looper control-plane state from a concrete
coding executor. opencode is the first MVP adapter, but the contract must be
stable enough for future Codex, Claude Code, Hermes-style, DeepCode-style, or
internal adapters.

## Invocation

```ts
RuntimeAdapter.run({
  taskRunId,
  workspaceRef,
  executionPlanVersion,
  allowedTools,
  promptSnapshot,
  artifactRefs,
}) -> RuntimeAttemptResult
```

## RuntimeAttemptInput

- `taskRunId`: durable TaskRun identity.
- `workspaceRef`: authorized local/company workspace reference. The adapter must
  not operate outside this workspace.
- `executionPlanVersion`: approved or confirmed plan/brief version used for this
  attempt. For `spec_driven`, this is the formally approved execution plan
  version. For `standard_task`, this is the confirmed lightweight task brief
  version. For `bugfix`, this is the confirmed fix plan version.
- `allowedTools`: least-privilege tool permissions for the attempt.
- `promptSnapshot`: immutable prompt/context snapshot including relevant source
  task, requirement interpretation, plan or brief, constraints, and policy notes.
- `artifactRefs`: immutable references to source artifacts, attachments, prior
  evidence, and approved/confirmed planning artifacts.

## RuntimeAttemptResult

Required fields:

- `taskRunId`.
- `runtimeAdapter`: `opencode` for the MVP.
- `runtimeSessionId`: adapter-specific session identity when available.
- `outcome`: `succeeded`, `failed`, `blocked`, `interrupted`, or `no_progress`.
- `changedArtifacts`: changed file refs, patch refs, branch refs, or commit refs.
- `commandsRun`: commands or checks run by the adapter, with exit summaries.
- `evidenceCandidates`: candidate evidence produced by the runtime. Candidates
  are not completion evidence until AI Looper validates and records them.
- `blocker`: visible blocker reason when outcome is `blocked`.
- `nextActionProposal`: optional LLM/runtime proposal for the next action.
- `logsSummary`: bounded summary of relevant logs.
- `startedAt`, `endedAt`.

Optional fields:

- `costMetadata`: token, model, or provider usage when available.
- `timeMetadata`: active runtime time and idle/wait time when available.
- `diagnosticRefs`: references to longer logs, screenshots, traces, or reports.

## Rules

- The adapter never commits TaskRun state directly.
- The adapter never approves plans, confirms worktime, or changes Teambition task
  status.
- The adapter may propose next actions, evidence, blockers, or completion, but AI
  Looper guards must validate every durable transition.
- Runtime results are append-only ExecutionAttempts and must be safe to retry by
  `executionAttemptId`.
- Prompt and artifact snapshots are versioned so resumed work does not silently
  change behavior.
