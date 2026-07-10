export type AILooperTaskDetail = {
  readonly title: string
  readonly sourceTaskID: string
  readonly sourceSystem: "teambition"
  readonly sourceDescription: string
  readonly sourceStatus: string
  readonly workItemType: "feature" | "task" | "bug" | "unknown"
  readonly attachmentRefs: ReadonlyArray<string>
  readonly acceptanceCriteria: ReadonlyArray<string>
  readonly interpretationGoal: string
  readonly interpretationRisks: ReadonlyArray<string>
  readonly executionTrack: "spec_driven" | "standard_task" | "bugfix"
  readonly planReviewStatus?: string
  readonly lightweightBriefStatus?: string
  readonly bugfixGateStatus?: string
}

export function taskRunSections(task: AILooperTaskDetail) {
  return {
    source: {
      title: "原始需求",
      sourceTaskID: task.sourceTaskID,
      sourceSystem: task.sourceSystem,
      sourceDescription: task.sourceDescription,
      sourceStatus: task.sourceStatus,
      workItemType: task.workItemType,
      attachmentRefs: task.attachmentRefs,
      acceptanceCriteria: task.acceptanceCriteria,
    },
    interpretation: {
      title: "AI 理解",
      goal: task.interpretationGoal,
      risks: task.interpretationRisks,
      executionTrack: task.executionTrack,
    },
    gates: {
      title: "执行门禁",
      planReviewStatus: task.planReviewStatus ?? "waiting_for_plan_review",
      lightweightBriefStatus: task.lightweightBriefStatus ?? "not_required",
      bugfixGateStatus: task.bugfixGateStatus ?? "not_required",
    },
  }
}
