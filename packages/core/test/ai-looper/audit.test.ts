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

  test("records plan decisions, confirmations, unauthorized attempts, and stale decisions", () => {
    expect(
      AILooperAudit.planDecisionRecorded({
        taskRunID: "trn_1",
        actorID: "reviewer_1",
        artifactID: "plan_1",
        artifactVersion: 2,
        decision: "approved",
        now: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({
      action_type: "plan.approved",
      reason_or_evidence: "artifact:plan_1:version:2",
    })
    expect(
      AILooperAudit.confirmationRecorded({
        taskRunID: "trn_1",
        actorID: "eng_1",
        confirmationType: "lightweight_brief",
        now: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({ action_type: "lightweight_brief.confirmed" })
    expect(
      AILooperAudit.unauthorizedAttempt({
        taskRunID: "trn_1",
        actorID: "eng_1",
        attemptedAction: "plan.approve",
        now: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({ action_type: "authorization.denied", reason_or_evidence: "plan.approve" })
    expect(
      AILooperAudit.staleDecisionRejected({
        taskRunID: "trn_1",
        actorID: "reviewer_1",
        requestedVersion: 1,
        currentVersion: 2,
        now: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({ action_type: "plan.stale_decision_rejected", reason_or_evidence: "requested:1:current:2" })
  })

  test("records recovery, retry, duplicate event, and escalation events", () => {
    expect(AILooperAudit.recoveryRecorded({ taskRunID: "trn_1", now: "2026-07-10T00:00:00.000Z" })).toMatchObject({
      action_type: "recovery.scanned",
      actor_or_source: "recovery_scanner",
    })
    expect(
      AILooperAudit.retryRecorded({
        taskRunID: "trn_1",
        retryCount: 2,
        retryBudget: 3,
        now: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({ action_type: "retry.scheduled", reason_or_evidence: "retry:2:budget:3" })
    expect(
      AILooperAudit.duplicateEventIgnored({
        taskRunID: "trn_1",
        dedupeKey: "coding_runtime:evt_1",
        now: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({
      action_type: "external_event.duplicate_ignored",
      reason_or_evidence: "coding_runtime:evt_1",
    })
    expect(
      AILooperAudit.escalationRecorded({
        taskRunID: "trn_1",
        reason: "No progress retry budget exhausted",
        now: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({ action_type: "taskrun.escalated" })
  })

  test("records human interventions and cancellations", () => {
    expect(
      AILooperAudit.interventionRecorded({
        taskRunID: "trn_1",
        actorID: "lead_1",
        interventionType: "manual_unblock",
        reason: "Dependency clarified in Teambition",
        now: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({
      actor_or_source: "lead_1",
      action_type: "intervention.manual_unblock",
      reason_or_evidence: "Dependency clarified in Teambition",
    })
    expect(
      AILooperAudit.cancellationRecorded({
        taskRunID: "trn_1",
        actorID: "lead_1",
        reason: "Requirement withdrawn",
        unresolvedEffectRefs: ["external_write:write_1", "execution_attempt:attempt_1"],
        now: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({
      actor_or_source: "lead_1",
      action_type: "taskrun.cancelled",
      reason_or_evidence: "Requirement withdrawn",
      related_artifact_refs: ["external_write:write_1", "execution_attempt:attempt_1"],
    })
  })

  test("records completion evaluation, human evidence, delivery writes, and worktime submissions", () => {
    expect(
      AILooperAudit.completionEvaluated({
        taskRunID: "trn_1",
        result: "complete",
        evidenceRefs: ["evidence:ev_1"],
        now: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({
      action_type: "completion.evaluated",
      reason_or_evidence: "result:complete",
      related_artifact_refs: ["evidence:ev_1"],
    })
    expect(
      AILooperAudit.humanEvidenceRecorded({
        taskRunID: "trn_1",
        actorID: "reviewer_1",
        evidenceID: "ev_1",
        acceptanceCriterionID: "criterion_1",
        now: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({
      actor_or_source: "reviewer_1",
      action_type: "human_evidence.recorded",
      related_artifact_refs: ["evidence:ev_1", "acceptance_criterion:criterion_1"],
    })
    expect(
      AILooperAudit.deliveryWriteQueued({
        taskRunID: "trn_1",
        externalWriteID: "write_delivery_1",
        deliverySummaryArtifactID: "artifact_delivery_1",
        now: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({
      actor_or_source: "teambition_outbox",
      action_type: "delivery_summary.queued",
      related_artifact_refs: ["external_write:write_delivery_1", "artifact:artifact_delivery_1"],
    })
    expect(
      AILooperAudit.worktimeSubmissionQueued({
        taskRunID: "trn_1",
        actorID: "eng_1",
        externalWriteID: "write_worktime_1",
        worktimeDraftID: "draft_1",
        now: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({
      actor_or_source: "eng_1",
      action_type: "worktime.queued",
      related_artifact_refs: ["external_write:write_worktime_1", "worktime_draft:draft_1"],
    })
  })
})
