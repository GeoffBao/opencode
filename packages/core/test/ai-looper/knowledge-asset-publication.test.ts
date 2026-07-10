import { describe, expect, test } from "bun:test"
import { captureKnowledgeAssetCandidate } from "@opencode-ai/core/ai-looper/taskrun"

describe("AILooper knowledge asset publication boundary", () => {
  test("does not publish a captured candidate without an approved governed publication flow", () => {
    const candidate = captureKnowledgeAssetCandidate({
      candidateID: "candidate_1",
      taskRunID: "run_1",
      assetType: "spec_document",
      title: "退款流程规格",
      contentRef: "artifact:delivery_1",
      provenanceArtifactRefs: ["artifact:delivery_1"],
      suggestedScope: "department",
      evaluationRefs: [],
      createdAt: "2026-07-10T10:00:00.000Z",
    })

    expect(candidate.status).toBe("needs_review")
    expect(candidate).not.toHaveProperty("published_asset_id")
    expect(candidate).not.toHaveProperty("approval_decision_id")
  })
})
