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
