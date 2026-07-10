export type ExecutionTrack = "spec_driven" | "standard_task" | "bugfix"
export type WorkItemType = "feature" | "task" | "bug"

export type AILooperTask = {
  readonly taskCapsuleID: string
  readonly sourceTaskID: string
  readonly title: string
  readonly sourceStatus: string
  readonly workItemType: WorkItemType
  readonly executionTrack: ExecutionTrack
  readonly phase: string
  readonly disposition: "running" | "waiting" | "blocked"
}

export type AILooperTaskDetail = {
  readonly taskRun: {
    readonly taskRunID: string
    readonly phase: string
    readonly disposition: string
    readonly lifecycle: string
    readonly nextExpectedAction: string
  }
  readonly sections: ReadonlyArray<string>
  readonly source: {
    readonly title: string
    readonly description: string
    readonly acceptanceCriteria: ReadonlyArray<string>
  }
  readonly artifacts: ReadonlyArray<string>
  readonly evidence: ReadonlyArray<string>
}

export const aiLooperTasks: ReadonlyArray<AILooperTask> = [
  { taskCapsuleID: "cap_feature", sourceTaskID: "TB-FEATURE-001", title: "大型功能：端到端研发自动化", sourceStatus: "进行中", workItemType: "feature", executionTrack: "spec_driven", phase: "计划审核", disposition: "waiting" },
  { taskCapsuleID: "cap_task", sourceTaskID: "TB-TASK-042", title: "轻量任务：补充字段校验", sourceStatus: "待处理", workItemType: "task", executionTrack: "standard_task", phase: "规划", disposition: "running" },
  { taskCapsuleID: "cap_bug", sourceTaskID: "TB-BUG-017", title: "缺陷：修复工时提交重试", sourceStatus: "阻塞", workItemType: "bug", executionTrack: "bugfix", phase: "验证", disposition: "blocked" },
]

export const aiLooperTaskDetail: AILooperTaskDetail = {
  taskRun: { taskRunID: "run_feature", phase: "计划审核", disposition: "waiting", lifecycle: "active", nextExpectedAction: "等待方案审核负责人批准执行计划" },
  sections: ["source", "interpretation", "gates", "status", "attempts", "artifacts", "evidence", "completion"],
  source: { title: "大型功能：端到端研发自动化", description: "将需求分析、规划、实现、测试与交付串成可恢复的企业研发流程。", acceptanceCriteria: ["TaskRun 跨 Agent Session 持续存在", "计划审批后才能开始实现", "交付摘要与工时可审计"] },
  artifacts: ["需求理解 v1", "执行计划 v1"],
  evidence: ["计划审核等待中", "暂无实现验证证据"],
}
