import { AiLooper } from "@opencode-ai/schema/ai-looper"

export const Phase = AiLooper.Phase
export const Disposition = AiLooper.Disposition
export const Lifecycle = AiLooper.Lifecycle
export const GateState = AiLooper.GateState

export interface TransitionInput {
  readonly phase: AiLooper.Phase
  readonly lifecycle: AiLooper.Lifecycle
  readonly nextPhase: AiLooper.Phase
  readonly gateState: AiLooper.GateState
  readonly requiredEvidencePresent?: boolean
}

export function canStartImplementation(taskRun: Pick<AiLooper.TaskRun, "execution_track" | "gate_state">) {
  if (taskRun.execution_track === "spec_driven") return taskRun.gate_state === "formally_approved"
  if (taskRun.execution_track === "standard_task") return taskRun.gate_state === "confirmed"
  if (taskRun.execution_track === "bugfix") return taskRun.gate_state === "confirmed" || taskRun.gate_state === "formally_approved"
  return false
}

export function canTransition(input: TransitionInput) {
  if (input.lifecycle !== "active") return false
  if (input.nextPhase === "implementing") {
    return input.gateState === "confirmed" || input.gateState === "formally_approved"
  }
  if (input.nextPhase === "completed") return input.requiredEvidencePresent === true
  return true
}
