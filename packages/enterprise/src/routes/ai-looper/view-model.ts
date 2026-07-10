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
  readonly run?: AILooperRunDetail
}

export type AILooperRunDetail = {
  readonly taskRunID: string
  readonly phase: string
  readonly disposition: "running" | "waiting" | "blocked" | "escalated"
  readonly lifecycle: "active" | "completed" | "cancelled" | "archived"
  readonly responsibleRole?: string
  readonly latestCommittedStep: string
  readonly nextExpectedAction?: string
  readonly blockedReason?: string
  readonly blockedOwner?: string
  readonly blockedSince?: string
  readonly escalationReason?: string
  readonly escalatedAt?: string
  readonly updatedAt: string
  readonly attempts: ReadonlyArray<AILooperAttempt>
  readonly artifacts: ReadonlyArray<AILooperArtifact>
  readonly evidence: ReadonlyArray<AILooperEvidence>
  readonly externalWrites: ReadonlyArray<AILooperExternalWrite>
  readonly auditRecords: ReadonlyArray<AILooperAuditRecord>
}

export type AILooperAttempt = {
  readonly executionAttemptID: string
  readonly attemptType: string
  readonly outcome: string
  readonly progressSummary?: string
  readonly startedAt: string
  readonly endedAt?: string
}

export type AILooperArtifact = {
  readonly artifactID: string
  readonly artifactType: string
  readonly version: number
  readonly contentRef?: string
  readonly provenance: string
  readonly createdAt: string
}

export type AILooperEvidence = {
  readonly evidenceID: string
  readonly evidenceType: string
  readonly result: string
  readonly explanation?: string
  readonly observedAt: string
}

export type AILooperExternalWrite = {
  readonly externalWriteID: string
  readonly targetSystem: string
  readonly writeType: string
  readonly status: string
  readonly attemptCount: number
  readonly lastError?: string
  readonly updatedAt: string
}

export type AILooperAuditRecord = {
  readonly auditRecordID: string
  readonly actorOrSource: string
  readonly actionType: string
  readonly reasonOrEvidence?: string
  readonly createdAt: string
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
    status: {
      title: "执行状态",
      taskRunID: task.run?.taskRunID ?? "not_started",
      phase: task.run?.phase ?? "received",
      disposition: task.run?.disposition ?? "waiting",
      lifecycle: task.run?.lifecycle ?? "active",
      responsibleRole: task.run?.responsibleRole ?? "engineer",
      latestCommittedStep: task.run?.latestCommittedStep ?? "waiting_for_taskrun",
      nextExpectedAction: task.run?.nextExpectedAction ?? "start_or_reuse_taskrun",
      blockedReason: task.run?.blockedReason,
      blockedOwner: task.run?.blockedOwner,
      blockedSince: task.run?.blockedSince,
      escalationReason: task.run?.escalationReason,
      escalatedAt: task.run?.escalatedAt,
      updatedAt: task.run?.updatedAt,
    },
    attempts: {
      title: "执行尝试",
      items: task.run?.attempts ?? [],
    },
    artifacts: {
      title: "产物",
      items: task.run?.artifacts ?? [],
    },
    evidence: {
      title: "验证证据",
      items: task.run?.evidence ?? [],
    },
    externalWrites: {
      title: "企业系统写入",
      items: task.run?.externalWrites ?? [],
    },
    audit: {
      title: "审计时间线",
      items: task.run?.auditRecords ?? [],
    },
  }
}
