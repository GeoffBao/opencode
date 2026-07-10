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
    </main>
  )
}

export default function AILooperTaskRun() {
  return <AILooperTaskRunView task={sampleTask} />
}
