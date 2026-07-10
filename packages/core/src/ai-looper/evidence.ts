import { Schema } from "effect"
import { AiLooper } from "@opencode-ai/schema/ai-looper"

export namespace AILooperEvidence {
  export const Result = Schema.Literals(["pass", "fail", "inconclusive"])
  export type Result = typeof Result.Type

  export interface CompletionEvaluationInput {
    readonly acceptanceCriterionIDs: ReadonlyArray<AiLooper.ID>
    readonly evidence: ReadonlyArray<
      Pick<
        AiLooper.Evidence,
        "evidence_id" | "acceptance_criterion_id" | "evidence_type" | "result" | "artifact_refs" | "actor_id" | "explanation" | "audit_record_id"
      >
    >
    readonly currentArtifactRefs: ReadonlySet<AiLooper.ID>
  }

  export interface HumanAcceptanceEvidenceInput {
    readonly evidenceID: AiLooper.ID
    readonly auditRecordID: AiLooper.ID
    readonly taskRunID: AiLooper.ID
    readonly acceptanceCriterionID: AiLooper.ID
    readonly actorID: AiLooper.ID
    readonly authorizedActorIDs: ReadonlyArray<AiLooper.ID>
    readonly result: AiLooper.EvidenceResult
    readonly explanation: string
    readonly observedAt: string
  }

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

  export function evaluateCompletion(input: CompletionEvaluationInput) {
    const relevantEvidence = input.evidence.filter(
      (evidence) => evidence.acceptance_criterion_id !== undefined && input.acceptanceCriterionIDs.includes(evidence.acceptance_criterion_id),
    )
    const conflictingCriteria = input.acceptanceCriterionIDs.filter((criterionID) => {
      const result = relevantEvidence.filter((evidence) => evidence.acceptance_criterion_id === criterionID).map((evidence) => evidence.result)
      return result.includes("pass") && result.includes("fail")
    })
    if (conflictingCriteria.length > 0) return { status: "conflicting_evidence" as const, acceptanceCriterionIDs: conflictingCriteria }

    const staleEvidence = relevantEvidence.filter(
      (evidence) => evidence.artifact_refs.length > 0 && evidence.artifact_refs.some((artifactRef) => !input.currentArtifactRefs.has(artifactRef)),
    )
    if (staleEvidence.length > 0) return { status: "stale_evidence" as const, evidenceIDs: staleEvidence.map((evidence) => evidence.evidence_id) }

    const unverifiableEvidence = relevantEvidence.filter(
      (evidence) =>
        evidence.result === "pass" &&
        evidence.artifact_refs.length === 0 &&
        !isStructuredHumanAcceptance(evidence),
    )
    if (unverifiableEvidence.length > 0) {
      return { status: "unverifiable_evidence" as const, evidenceIDs: unverifiableEvidence.map((evidence) => evidence.evidence_id) }
    }

    const missingCriteria = input.acceptanceCriterionIDs.filter(
      (criterionID) => !relevantEvidence.some((evidence) => evidence.acceptance_criterion_id === criterionID && evidence.result === "pass"),
    )
    if (missingCriteria.length > 0) return { status: "missing_evidence" as const, acceptanceCriterionIDs: missingCriteria }
    return { status: "complete" as const }
  }

  export function recordHumanAcceptanceEvidence(input: HumanAcceptanceEvidenceInput) {
    if (!input.authorizedActorIDs.includes(input.actorID)) return { status: "unauthorized" as const }
    return {
      status: "recorded" as const,
      evidence: {
        evidence_id: input.evidenceID,
        task_run_id: input.taskRunID,
        acceptance_criterion_id: input.acceptanceCriterionID,
        evidence_type: "human_acceptance" as const,
        result: input.result,
        artifact_refs: [],
        actor_id: input.actorID,
        explanation: input.explanation,
        observed_at: input.observedAt,
        audit_record_id: input.auditRecordID,
      } satisfies AiLooper.Evidence,
    }
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
