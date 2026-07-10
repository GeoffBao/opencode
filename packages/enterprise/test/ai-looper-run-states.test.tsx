/** @jsxImportSource solid-js */

import { describe, expect, test } from "bun:test"
import { taskRunSections, type AILooperRunDetail, type AILooperTaskDetail } from "../src/routes/ai-looper/view-model"

describe("AI Looper run state view model", () => {
  test("represents running, waiting, blocked, and escalated TaskRun states", () => {
    expect(taskRunSections(taskWithRun(run("running"))).status).toMatchObject({
      phase: "implementing",
      disposition: "running",
      nextExpectedAction: "continue_runtime_attempt",
    })
    expect(taskRunSections(taskWithRun(run("waiting"))).status).toMatchObject({
      phase: "plan_review",
      disposition: "waiting",
      nextExpectedAction: "await_formal_plan_approval",
    })
    expect(taskRunSections(taskWithRun(run("blocked"))).status).toMatchObject({
      disposition: "blocked",
      blockedReason: "Teambition attachment is inaccessible",
      blockedOwner: "engineer",
    })
    expect(taskRunSections(taskWithRun(run("escalated"))).status).toMatchObject({
      disposition: "escalated",
      escalationReason: "No progress retry budget exhausted",
      responsibleRole: "方案审核负责人",
    })
  })

  test("keeps attempts, artifacts, evidence, and audit timeline visible", () => {
    const sections = taskRunSections(taskWithRun(run("running")))

    expect(sections.attempts.items).toHaveLength(1)
    expect(sections.attempts.items[0]).toMatchObject({ attemptType: "implementation", outcome: "succeeded" })
    expect(sections.artifacts.items[0]).toMatchObject({ artifactType: "code_change", version: 1 })
    expect(sections.evidence.items[0]).toMatchObject({ evidenceType: "automated_test", result: "pass" })
    expect(sections.externalWrites.items[0]).toMatchObject({ targetSystem: "teambition", writeType: "progress_note" })
    expect(sections.audit.items[0]).toMatchObject({ actorOrSource: "ai-looper", actionType: "runtime.attempt_completed" })
  })
})

function taskWithRun(taskRun: AILooperRunDetail): AILooperTaskDetail {
  return {
    title: "端到端研发自动化",
    sourceTaskID: "tb_1",
    sourceSystem: "teambition",
    sourceDescription: "原始需求",
    sourceStatus: "visible",
    workItemType: "feature",
    attachmentRefs: [],
    acceptanceCriteria: [],
    interpretationGoal: "结构化需求理解",
    interpretationRisks: [],
    executionTrack: "spec_driven",
    run: taskRun,
  }
}

function run(disposition: AILooperRunDetail["disposition"]): AILooperRunDetail {
  return {
    taskRunID: `run_${disposition}`,
    phase: disposition === "waiting" ? "plan_review" : "implementing",
    disposition,
    lifecycle: "active",
    responsibleRole: disposition === "escalated" ? "方案审核负责人" : "engineer",
    latestCommittedStep: "checkpoint",
    nextExpectedAction: disposition === "waiting" ? "await_formal_plan_approval" : "continue_runtime_attempt",
    blockedReason: disposition === "blocked" ? "Teambition attachment is inaccessible" : undefined,
    blockedOwner: disposition === "blocked" ? "engineer" : undefined,
    blockedSince: disposition === "blocked" ? "2026-07-10T00:30:00.000Z" : undefined,
    escalationReason: disposition === "escalated" ? "No progress retry budget exhausted" : undefined,
    escalatedAt: disposition === "escalated" ? "2026-07-10T00:45:00.000Z" : undefined,
    updatedAt: "2026-07-10T01:00:00.000Z",
    attempts: [
      {
        executionAttemptID: "attempt_1",
        attemptType: "implementation",
        outcome: "succeeded",
        progressSummary: "Committed code changes",
        startedAt: "2026-07-10T00:10:00.000Z",
        endedAt: "2026-07-10T00:20:00.000Z",
      },
    ],
    artifacts: [
      {
        artifactID: "art_1",
        artifactType: "code_change",
        version: 1,
        provenance: "opencode",
        createdAt: "2026-07-10T00:20:00.000Z",
      },
    ],
    evidence: [
      {
        evidenceID: "ev_1",
        evidenceType: "automated_test",
        result: "pass",
        explanation: "AI Looper tests passed",
        observedAt: "2026-07-10T00:21:00.000Z",
      },
    ],
    externalWrites: [
      {
        externalWriteID: "write_1",
        targetSystem: "teambition",
        writeType: "progress_note",
        status: "acknowledged",
        attemptCount: 1,
        updatedAt: "2026-07-10T00:21:30.000Z",
      },
    ],
    auditRecords: [
      {
        auditRecordID: "audit_1",
        actorOrSource: "ai-looper",
        actionType: "runtime.attempt_completed",
        createdAt: "2026-07-10T00:22:00.000Z",
      },
    ],
  }
}
