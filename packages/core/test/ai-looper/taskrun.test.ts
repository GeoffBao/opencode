import { describe, expect, test } from "bun:test"
import { AiLooper } from "@opencode-ai/schema/ai-looper"
import { Schema } from "effect"
import {
  canStartImplementation,
  canTransition,
  canViewSourceTask,
  createExecutionPlanArtifact,
  createLightweightTaskBriefArtifact,
  createOrReuseTaskRun,
  createRequirementInterpretationArtifact,
  createSourceTaskSnapshotArtifact,
  createTaskRunDetail,
  createTaskCapsule,
  findActiveTaskRun,
} from "@opencode-ai/core/ai-looper/taskrun"

const decodeSourceTask = Schema.decodeUnknownSync(AiLooper.SourceTask)
const decodeTaskRun = Schema.decodeUnknownSync(AiLooper.TaskRun)

describe("AILooper TaskRun guards", () => {
  test("requires formal approval for spec-driven implementation", () => {
    expect(canStartImplementation({ execution_track: "spec_driven", gate_state: "awaiting_formal_approval" })).toBe(
      false,
    )
    expect(canStartImplementation({ execution_track: "spec_driven", gate_state: "formally_approved" })).toBe(true)
  })

  test("refuses completion without required evidence", () => {
    expect(
      canTransition({
        phase: "verifying",
        lifecycle: "active",
        nextPhase: "completed",
        gateState: "formally_approved",
      }),
    ).toBe(false)
  })

  test("creates source snapshots and gates source visibility", () => {
    const sourceTask = teambitionTask("feature", "visible")

    expect(
      createSourceTaskSnapshotArtifact({
        artifactID: "art_source_1",
        taskRunID: "run_1",
        sourceTask,
        createdAt: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({
      artifact_type: "source_snapshot",
      content_ref: "source_task:teambition:tb_feature:v1",
      provenance: "teambition",
    })
    expect(canViewSourceTask(sourceTask, "eng_1")).toBe(true)
    expect(canViewSourceTask(teambitionTask("feature", "inaccessible"), "eng_1")).toBe(false)
  })

  test("creates task capsules and finds the active TaskRun", () => {
    const capsule = createTaskCapsule({
      taskCapsuleID: "cap_1",
      sourceTask: teambitionTask("task", "visible"),
      responsibleEngineerID: "eng_1",
      workspaceRef: "workspace://repo",
      activeTaskRunID: "run_active",
      createdAt: "2026-07-10T00:00:00.000Z",
    })

    expect(capsule).toMatchObject({
      task_capsule_id: "cap_1",
      source_task_id: "tb_task",
      responsible_engineer_id: "eng_1",
      active_task_run_id: "run_active",
    })
    expect(findActiveTaskRun([taskRun("completed"), taskRun("active")])?.task_run_id).toBe("run_active")
  })

  test("creates TaskRuns once and reuses active runs idempotently", () => {
    expect(
      createOrReuseTaskRun({
        taskRunID: "run_1",
        taskCapsuleID: "cap_1",
        executionTrack: "spec_driven",
        createdAt: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({
      reused: false,
      taskRun: {
        gate_state: "awaiting_formal_approval",
        phase: "plan_review",
        disposition: "waiting",
      },
    })
    expect(
      createOrReuseTaskRun({
        taskRunID: "run_new",
        taskCapsuleID: "cap_1",
        executionTrack: "standard_task",
        existingTaskRuns: [taskRun("active")],
        createdAt: "2026-07-10T00:00:00.000Z",
      }),
    ).toMatchObject({ reused: true, taskRun: { task_run_id: "run_active" } })
  })

  test("creates versioned requirement, plan, and lightweight brief artifacts", () => {
    const input = {
      artifactID: "art_1",
      taskRunID: "run_1",
      sourceVersion: "v1",
      version: 2,
      createdAt: "2026-07-10T00:00:00.000Z",
      createdBy: "ai-looper",
    }

    expect(createRequirementInterpretationArtifact(input)).toMatchObject({
      artifact_type: "requirement_interpretation",
      version: 2,
      content_ref: "requirement_interpretation:run_1:2:source:v1",
    })
    expect(createExecutionPlanArtifact(input)).toMatchObject({
      artifact_type: "execution_plan",
      version: 2,
      content_ref: "execution_plan:run_1:2:source:v1",
    })
    expect(createLightweightTaskBriefArtifact(input)).toMatchObject({
      artifact_type: "lightweight_task_brief",
      version: 2,
      content_ref: "lightweight_task_brief:run_1:2:source:v1",
    })
  })

  test("creates TaskRun detail read models for UI and API consumers", () => {
    expect(
      createTaskRunDetail({
        taskRun: taskRun("active"),
        artifacts: [
          artifact("art_plan", "run_active"),
          artifact("art_other", "run_other"),
        ],
        evidence: [evidence("ev_test", "run_active")],
        attempts: [
          {
            execution_attempt_id: "attempt_1",
            task_run_id: "run_active",
            attempt_type: "runtime_execution",
            runtime_adapter: "opencode",
            input_artifact_refs: ["art_plan"],
            output_artifact_refs: [],
            evidence_refs: [],
            started_at: "2026-07-10T00:10:00.000Z",
            ended_at: "2026-07-10T00:20:00.000Z",
            outcome: "no_progress",
            progress_summary: "No code changes committed",
          },
        ],
        auditRecords: [auditRecord("audit_1", "run_active"), auditRecord("audit_other", "run_other")],
      }),
    ).toMatchObject({
      task_run: { task_run_id: "run_active" },
      artifacts: [{ artifact_id: "art_plan" }],
      evidence: [{ evidence_id: "ev_test" }],
      attempts: [
        {
          execution_attempt_id: "attempt_1",
          attempt_type: "implementation",
          outcome: "failed",
          progress_summary: "No code changes committed",
        },
      ],
      audit_records: [{ audit_record_id: "audit_1" }],
    })
  })
})

function teambitionTask(workItemType: AiLooper.WorkItemType, visibilityState: AiLooper.VisibilityState) {
  return decodeSourceTask({
    source_task_id: `tb_${workItemType}`,
    source_system: "teambition",
    title: `Teambition ${workItemType}`,
    work_item_type: workItemType,
    assignee_ids: ["eng_1"],
    visibility_state: visibilityState,
    acceptance_criteria: [],
    attachment_refs: [],
    source_version: "v1",
    retrieved_at: "2026-07-10T00:00:00.000Z",
  })
}

function taskRun(lifecycle: AiLooper.Lifecycle) {
  return decodeTaskRun({
    task_run_id: lifecycle === "active" ? "run_active" : "run_done",
    task_capsule_id: "cap_1",
    execution_track: "standard_task",
    gate_state: "confirmed",
    phase: lifecycle === "active" ? "implementing" : "completed",
    disposition: "running",
    lifecycle,
    latest_committed_step: "checkpoint",
    retry_count: 0,
    retry_budget: 3,
    created_at: "2026-07-10T00:00:00.000Z",
    updated_at: "2026-07-10T00:00:00.000Z",
  })
}

function artifact(artifactID: AiLooper.ID, taskRunID: AiLooper.ID) {
  return {
    artifact_id: artifactID,
    task_run_id: taskRunID,
    artifact_type: "execution_plan",
    version: 1,
    provenance: "ai-looper",
    created_at: "2026-07-10T00:00:00.000Z",
  } satisfies AiLooper.Artifact
}

function evidence(evidenceID: AiLooper.ID, taskRunID: AiLooper.ID) {
  return {
    evidence_id: evidenceID,
    task_run_id: taskRunID,
    evidence_type: "automated_test",
    result: "pass",
    artifact_refs: [],
    observed_at: "2026-07-10T00:00:00.000Z",
  } satisfies AiLooper.Evidence
}

function auditRecord(auditRecordID: AiLooper.ID, taskRunID: AiLooper.ID) {
  return {
    audit_record_id: auditRecordID,
    task_run_id: taskRunID,
    actor_or_source: "ai-looper",
    action_type: "taskrun.detail_viewed",
    related_artifact_refs: [],
    created_at: "2026-07-10T00:00:00.000Z",
  } satisfies AiLooper.AuditRecord
}
