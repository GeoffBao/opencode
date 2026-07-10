/** @jsxImportSource solid-js */

type AILooperTaskSummary = {
  readonly taskCapsuleID: string
  readonly sourceTaskID: string
  readonly title: string
  readonly sourceStatus: string
  readonly workItemType: "feature" | "task" | "bug" | "unknown"
  readonly executionTrack: "spec_driven" | "standard_task" | "bugfix"
}

const sampleTasks: AILooperTaskSummary[] = [
  {
    taskCapsuleID: "cap_feature",
    sourceTaskID: "tb_feature",
    title: "大型功能：端到端研发自动化",
    sourceStatus: "visible",
    workItemType: "feature",
    executionTrack: "spec_driven",
  },
  {
    taskCapsuleID: "cap_task",
    sourceTaskID: "tb_task",
    title: "轻量任务：补充字段校验",
    sourceStatus: "visible",
    workItemType: "task",
    executionTrack: "standard_task",
  },
  {
    taskCapsuleID: "cap_bug",
    sourceTaskID: "tb_bug",
    title: "缺陷：修复工时提交重试",
    sourceStatus: "missing",
    workItemType: "bug",
    executionTrack: "bugfix",
  },
]

export function AILooperTaskList(props: { readonly tasks: ReadonlyArray<AILooperTaskSummary> }) {
  return (
    <main>
      <h1>AI Looper</h1>
      <p>Teambition assigned work items with source type, source state, and deterministic execution track.</p>
      <ul>
        {props.tasks.map((task) => (
          <li data-task-capsule-id={task.taskCapsuleID}>
            <h2>{task.title}</h2>
            <dl>
              <dt>Source task</dt>
              <dd>{task.sourceTaskID}</dd>
              <dt>Source status</dt>
              <dd>{task.sourceStatus}</dd>
              <dt>Work item type</dt>
              <dd>{task.workItemType}</dd>
              <dt>Execution track</dt>
              <dd>{task.executionTrack}</dd>
            </dl>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default function AILooper() {
  return <AILooperTaskList tasks={sampleTasks} />
}
