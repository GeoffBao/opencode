import { describe, expect, test } from "bun:test"
import { AILooperAudit } from "@opencode-ai/core/ai-looper/audit"

describe("AILooper audit", () => {
  test("creates attributable audit records", () => {
    const record = AILooperAudit.create({
      taskRunID: "trn_1",
      actorOrSource: "eng_1",
      actionType: "plan.approved",
      now: "2026-07-10T00:00:00.000Z",
    })

    expect(record.task_run_id).toBe("trn_1")
    expect(record.actor_or_source).toBe("eng_1")
    expect(record.action_type).toBe("plan.approved")
  })

  test("records source retrieval and routing decisions", () => {
    expect(
      AILooperAudit.sourceRetrieved({
        taskRunID: "trn_1",
        sourceTaskID: "tb_1",
        actorOrSource: "teambition",
        visibilityState: "missing",
        now: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({
      action_type: "source.retrieved",
      reason_or_evidence: "source_task:tb_1:visibility:missing",
    })

    expect(
      AILooperAudit.routingDecided({
        taskRunID: "trn_1",
        routingDecisionID: "route_1",
        executionTrack: "spec_driven",
        gatePolicy: "formal_approval",
        now: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({
      actor_or_source: "system",
      action_type: "routing.decided",
      reason_or_evidence: "execution_track:spec_driven:gate_policy:formal_approval",
      related_artifact_refs: ["routing_decision:route_1"],
    })
  })
})
