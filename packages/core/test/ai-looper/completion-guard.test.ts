import { describe, expect, test } from "bun:test"
import { AILooperEvidence } from "@opencode-ai/core/ai-looper/evidence"

describe("AILooper completion guard", () => {
  test("refuses completion when an acceptance criterion has no passing evidence", () => {
    expect(
      AILooperEvidence.evaluateCompletion({
        acceptanceCriterionIDs: ["criterion_1"],
        evidence: [],
        currentArtifactRefs: new Set(),
      }),
    ).toEqual({ status: "missing_evidence", acceptanceCriterionIDs: ["criterion_1"] })
  })

  test("refuses completion when evidence is stale, conflicting, or unverifiable", () => {
    expect(
      AILooperEvidence.evaluateCompletion({
        acceptanceCriterionIDs: ["criterion_1"],
        evidence: [evidence({ artifactRefs: ["artifact_old"] })],
        currentArtifactRefs: new Set(["artifact_current"]),
      }),
    ).toEqual({ status: "stale_evidence", evidenceIDs: ["evidence_1"] })

    expect(
      AILooperEvidence.evaluateCompletion({
        acceptanceCriterionIDs: ["criterion_1"],
        evidence: [evidence({ result: "pass" }), evidence({ evidenceID: "evidence_2", result: "fail" })],
        currentArtifactRefs: new Set(["artifact_current"]),
      }),
    ).toEqual({ status: "conflicting_evidence", acceptanceCriterionIDs: ["criterion_1"] })

    expect(
      AILooperEvidence.evaluateCompletion({
        acceptanceCriterionIDs: ["criterion_1"],
        evidence: [evidence({ artifactRefs: [] })],
        currentArtifactRefs: new Set(),
      }),
    ).toEqual({ status: "unverifiable_evidence", evidenceIDs: ["evidence_1"] })
  })

  test("allows completion when every acceptance criterion has current, passing evidence", () => {
    expect(
      AILooperEvidence.evaluateCompletion({
        acceptanceCriterionIDs: ["criterion_1", "criterion_2"],
        evidence: [
          evidence({ acceptanceCriterionID: "criterion_1" }),
          evidence({ evidenceID: "evidence_2", acceptanceCriterionID: "criterion_2" }),
        ],
        currentArtifactRefs: new Set(["artifact_current"]),
      }),
    ).toEqual({ status: "complete" })
  })
})

function evidence(input: {
  readonly evidenceID?: string
  readonly acceptanceCriterionID?: string
  readonly result?: "pass" | "fail" | "inconclusive"
  readonly artifactRefs?: ReadonlyArray<string>
} = {}) {
  return {
    evidence_id: input.evidenceID ?? "evidence_1",
    acceptance_criterion_id: input.acceptanceCriterionID ?? "criterion_1",
    evidence_type: "automated_test" as const,
    result: input.result ?? "pass",
    artifact_refs: input.artifactRefs ?? ["artifact_current"],
  }
}
