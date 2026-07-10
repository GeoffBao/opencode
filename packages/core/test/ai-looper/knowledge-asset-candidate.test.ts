import { describe, expect, test } from "bun:test"
import { captureKnowledgeAssetCandidate } from "@opencode-ai/core/ai-looper/taskrun"

describe("AILooper knowledge asset candidate", () => {
  test("captures a reusable Skill candidate with provenance and review-required status", () => {
    expect(
      captureKnowledgeAssetCandidate({
        candidateID: "candidate_1",
        taskRunID: "run_1",
        assetType: "skill",
        title: "退款状态机验证清单",
        contentRef: "artifact:delivery_1",
        provenanceArtifactRefs: ["artifact:plan_1", "evidence:test_1"],
        suggestedScope: "project",
        ownerCandidate: "engineering-platform",
        evaluationRefs: ["evidence:test_1"],
        createdAt: "2026-07-10T10:00:00.000Z",
      }),
    ).toEqual({
      knowledge_asset_candidate_id: "candidate_1",
      task_run_id: "run_1",
      asset_type: "skill",
      title: "退款状态机验证清单",
      content_ref: "artifact:delivery_1",
      provenance_artifact_refs: ["artifact:plan_1", "evidence:test_1"],
      suggested_scope: "project",
      owner_candidate: "engineering-platform",
      evaluation_refs: ["evidence:test_1"],
      status: "needs_review",
      created_at: "2026-07-10T10:00:00.000Z",
      updated_at: "2026-07-10T10:00:00.000Z",
    })
  })
})
