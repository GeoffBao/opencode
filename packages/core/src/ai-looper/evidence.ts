import { Schema } from "effect"
import { AiLooper } from "@opencode-ai/schema/ai-looper"

export namespace AILooperEvidence {
  export const Result = Schema.Literals(["pass", "fail", "inconclusive"])
  export type Result = typeof Result.Type

  export function isPassing(evidence: Pick<AiLooper.Evidence, "result">) {
    return evidence.result === "pass"
  }

  export function isStructuredHumanAcceptance(
    evidence: Pick<AiLooper.Evidence, "evidence_type" | "acceptance_criterion_id" | "actor_id" | "explanation" | "audit_record_id">,
  ) {
    return (
      evidence.evidence_type === "human_acceptance" &&
      evidence.acceptance_criterion_id !== undefined &&
      evidence.actor_id !== undefined &&
      evidence.explanation !== undefined &&
      evidence.audit_record_id !== undefined
    )
  }
}
