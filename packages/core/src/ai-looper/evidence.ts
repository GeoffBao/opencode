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

  export function hasBugReproductionEvidence(evidence: ReadonlyArray<Pick<AiLooper.Evidence, "evidence_type" | "result">>) {
    return evidence.some((item) => item.evidence_type === "bug_reproduction" && item.result === "pass")
  }

  export function canConfirmBugfixPlan(input: {
    readonly highRisk: boolean
    readonly evidence: ReadonlyArray<Pick<AiLooper.Evidence, "evidence_type" | "result">>
  }) {
    if (input.highRisk) return "requires_formal_approval" as const
    if (!hasBugReproductionEvidence(input.evidence)) return "requires_reproduction" as const
    return "can_confirm" as const
  }
}
