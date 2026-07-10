/** @jsxImportSource solid-js */

import { taskRunSections, type AILooperTaskDetail } from "./view-model"

const sampleTask: AILooperTaskDetail = {
  title: "端到端研发自动化",
  sourceTaskID: "tb_feature",
  sourceSystem: "teambition",
  sourceDescription: "老板要求需求分析、规划、计划审核、实现、测试与迭代端到端闭环。",
  sourceStatus: "visible",
  workItemType: "feature",
  attachmentRefs: ["architecture.html"],
  acceptanceCriteria: ["研发可查看原始需求", "AI 理解不得覆盖原始 Teambition 内容"],
  interpretationGoal: "AI Looper 将 Teambition 任务转成可审批、可恢复、可审计的 TaskRun。",
  interpretationRisks: ["计划审批缺失时不得进入实现", "工时必须由研发人工确认"],
  executionTrack: "spec_driven",
  planReviewStatus: "awaiting_formal_approval",
  lightweightBriefStatus: "not_required",
  bugfixGateStatus: "not_required",
  run: {
    taskRunID: "run_feature",
    phase: "plan_review",
    disposition: "waiting",
    lifecycle: "active",
    responsibleRole: "方案审核负责人",
    latestCommittedStep: "已生成结构化需求理解和执行计划",
    nextExpectedAction: "await_formal_plan_approval",
    updatedAt: "2026-07-10T01:00:00.000Z",
    attempts: [
      {
        executionAttemptID: "attempt_analysis",
        attemptType: "analysis",
        outcome: "succeeded",
        progressSummary: "完成 Teambition 原始需求解析",
        startedAt: "2026-07-10T00:10:00.000Z",
        endedAt: "2026-07-10T00:20:00.000Z",
      },
    ],
    artifacts: [
      {
        artifactID: "art_plan",
        artifactType: "execution_plan",
        version: 1,
        contentRef: "execution_plan:run_feature:1",
        provenance: "ai-looper",
        createdAt: "2026-07-10T00:20:00.000Z",
      },
    ],
    evidence: [
      {
        evidenceID: "ev_plan_review_ready",
        evidenceType: "manual_note",
        result: "pass",
        explanation: "计划已准备提交审核",
        observedAt: "2026-07-10T00:21:00.000Z",
      },
    ],
    externalWrites: [
      {
        externalWriteID: "write_progress",
        targetSystem: "teambition",
        writeType: "progress_note",
        status: "pending",
        attemptCount: 0,
        updatedAt: "2026-07-10T00:22:00.000Z",
      },
    ],
    auditRecords: [
      {
        auditRecordID: "audit_plan_created",
        actorOrSource: "ai-looper",
        actionType: "plan.generated",
        reasonOrEvidence: "artifact:art_plan:version:1",
        createdAt: "2026-07-10T00:20:00.000Z",
      },
    ],
  },
}

export function AILooperTaskRunView(props: { readonly task: AILooperTaskDetail }) {
  const sections = taskRunSections(props.task)

  return (
    <main>
      <h1>{props.task.title}</h1>
      <section aria-label="Original source requirement">
        <h2>{sections.source.title}</h2>
        <dl>
          <dt>Source system</dt>
          <dd>{sections.source.sourceSystem}</dd>
          <dt>Source task</dt>
          <dd>{sections.source.sourceTaskID}</dd>
          <dt>Source status</dt>
          <dd>{sections.source.sourceStatus}</dd>
          <dt>Work item type</dt>
          <dd>{sections.source.workItemType}</dd>
        </dl>
        <p>{sections.source.sourceDescription}</p>
        <h3>Attachments</h3>
        <ul>{sections.source.attachmentRefs.map((attachment) => <li>{attachment}</li>)}</ul>
        <h3>Acceptance criteria</h3>
        <ul>{sections.source.acceptanceCriteria.map((criterion) => <li>{criterion}</li>)}</ul>
      </section>
      <section aria-label="AI interpretation">
        <h2>{sections.interpretation.title}</h2>
        <p>{sections.interpretation.goal}</p>
        <dl>
          <dt>Execution track</dt>
          <dd>{sections.interpretation.executionTrack}</dd>
        </dl>
        <h3>Risks</h3>
        <ul>{sections.interpretation.risks.map((risk) => <li>{risk}</li>)}</ul>
      </section>
      <section aria-label="Execution gates">
        <h2>{sections.gates.title}</h2>
        <dl>
          <dt>Plan review</dt>
          <dd>{sections.gates.planReviewStatus}</dd>
          <dt>Lightweight brief</dt>
          <dd>{sections.gates.lightweightBriefStatus}</dd>
          <dt>Bugfix gate</dt>
          <dd>{sections.gates.bugfixGateStatus}</dd>
        </dl>
      </section>
      <section aria-label="TaskRun status">
        <h2>{sections.status.title}</h2>
        <dl>
          <dt>TaskRun</dt>
          <dd>{sections.status.taskRunID}</dd>
          <dt>Phase</dt>
          <dd>{sections.status.phase}</dd>
          <dt>Disposition</dt>
          <dd>{sections.status.disposition}</dd>
          <dt>Lifecycle</dt>
          <dd>{sections.status.lifecycle}</dd>
          <dt>Responsible role</dt>
          <dd>{sections.status.responsibleRole}</dd>
          <dt>Latest committed step</dt>
          <dd>{sections.status.latestCommittedStep}</dd>
          <dt>Next expected action</dt>
          <dd>{sections.status.nextExpectedAction}</dd>
          <dt>Updated at</dt>
          <dd>{sections.status.updatedAt}</dd>
          {sections.status.blockedReason ? (
            <>
              <dt>Blocked reason</dt>
              <dd>{sections.status.blockedReason}</dd>
            </>
          ) : null}
          {sections.status.escalationReason ? (
            <>
              <dt>Escalation reason</dt>
              <dd>{sections.status.escalationReason}</dd>
            </>
          ) : null}
        </dl>
      </section>
      <section aria-label="Execution attempts">
        <h2>{sections.attempts.title}</h2>
        <ul>
          {sections.attempts.items.map((attempt) => (
            <li data-attempt-id={attempt.executionAttemptID}>
              {attempt.attemptType} · {attempt.outcome} · {attempt.progressSummary}
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="Artifacts">
        <h2>{sections.artifacts.title}</h2>
        <ul>
          {sections.artifacts.items.map((artifact) => (
            <li data-artifact-id={artifact.artifactID}>
              {artifact.artifactType} v{artifact.version} · {artifact.provenance}
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="Evidence">
        <h2>{sections.evidence.title}</h2>
        <ul>
          {sections.evidence.items.map((evidence) => (
            <li data-evidence-id={evidence.evidenceID}>
              {evidence.evidenceType} · {evidence.result} · {evidence.explanation}
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="External writes">
        <h2>{sections.externalWrites.title}</h2>
        <ul>
          {sections.externalWrites.items.map((write) => (
            <li data-external-write-id={write.externalWriteID}>
              {write.targetSystem} · {write.writeType} · {write.status} · attempt {write.attemptCount}
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="Audit timeline">
        <h2>{sections.audit.title}</h2>
        <ol>
          {sections.audit.items.map((record) => (
            <li data-audit-record-id={record.auditRecordID}>
              {record.createdAt} · {record.actorOrSource} · {record.actionType} · {record.reasonOrEvidence}
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}

export default function AILooperTaskRun() {
  return <AILooperTaskRunView task={sampleTask} />
}
