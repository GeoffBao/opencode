import { describe, expect, test } from "bun:test"
import { AILooperEvidence } from "@opencode-ai/core/ai-looper/evidence"

describe("AILooper human acceptance evidence", () => {
  test("records structured evidence only for authorized actors", () => {
    expect(
      AILooperEvidence.recordHumanAcceptanceEvidence({
        evidenceID: "evidence_1",
        auditRecordID: "audit_1",
        taskRunID: "run_1",
        acceptanceCriterionID: "criterion_1",
        actorID: "reviewer_1",
        authorizedActorIDs: ["reviewer_1"],
        result: "pass",
        explanation: "验收环境已验证退款状态更新。",
        observedAt: "2026-07-10T10:00:00.000Z",
      }),
    ).toEqual({
      status: "recorded",
      evidence: expect.objectContaining({
        evidence_type: "human_acceptance",
        actor_id: "reviewer_1",
        acceptance_criterion_id: "criterion_1",
        audit_record_id: "audit_1",
      }),
    })

    expect(
      AILooperEvidence.recordHumanAcceptanceEvidence({
        evidenceID: "evidence_2",
        auditRecordID: "audit_2",
        taskRunID: "run_1",
        acceptanceCriterionID: "criterion_1",
        actorID: "runtime_opencode",
        authorizedActorIDs: ["reviewer_1"],
        result: "pass",
        explanation: "Runtime cannot accept its own output.",
        observedAt: "2026-07-10T10:00:00.000Z",
      }),
    ).toEqual({ status: "unauthorized" })
  })
})
