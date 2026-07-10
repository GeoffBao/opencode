import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { AiLooper } from "@opencode-ai/schema/ai-looper"
import { Timestamps } from "../database/schema.sql"

export const AILooperTaskRunTable = sqliteTable(
  "ai_looper_task_run",
  {
    id: text().$type<AiLooper.ID>().primaryKey(),
    source_system: text().$type<AiLooper.SourceSystem>().notNull(),
    source_task_id: text().notNull(),
    work_item_type: text().$type<AiLooper.WorkItemType>().notNull(),
    title: text().notNull(),
    source_task: text({ mode: "json" }).$type<AiLooper.SourceTask>().notNull(),
    task_capsule: text({ mode: "json" }).$type<AiLooper.TaskCapsule>(),
    execution_track: text().$type<AiLooper.ExecutionTrack>().notNull(),
    gate_policy: text().$type<AiLooper.GatePolicy>().notNull(),
    phase: text().$type<AiLooper.Phase>().notNull(),
    lifecycle: text().$type<AiLooper.Lifecycle>().notNull(),
    gate_state: text().$type<AiLooper.GateState>().notNull(),
    current_disposition: text().$type<AiLooper.Disposition>().notNull(),
    owner_user_id: text().notNull(),
    reviewer_user_id: text(),
    workspace_ref: text(),
    runtime_id: text(),
    execution_plan_version: integer(),
    attempt_count: integer().notNull().default(0),
    high_risk: integer({ mode: "boolean" }).notNull().default(false),
    estimated_hours: integer(),
    last_blocker: text(),
    next_wake_at: integer(),
    time_approved: integer(),
    time_completed: integer(),
    ...Timestamps,
  },
  (table) => [
    uniqueIndex("ai_looper_task_run_source_idx").on(table.source_system, table.source_task_id),
    index("ai_looper_task_run_owner_phase_idx").on(table.owner_user_id, table.phase),
    index("ai_looper_task_run_recovery_idx").on(table.lifecycle, table.next_wake_at),
  ],
)

export const AILooperArtifactTable = sqliteTable(
  "ai_looper_artifact",
  {
    id: text().$type<AiLooper.ID>().primaryKey(),
    task_run_id: text()
      .$type<AiLooper.ID>()
      .notNull()
      .references(() => AILooperTaskRunTable.id, { onDelete: "cascade" }),
    type: text().$type<AiLooper.ArtifactType>().notNull(),
    version: integer().notNull(),
    content: text().$type<NonNullable<AiLooper.Artifact["content_ref"]>>().notNull(),
    created_by: text().notNull(),
    ...Timestamps,
  },
  (table) => [
    uniqueIndex("ai_looper_artifact_task_type_version_idx").on(table.task_run_id, table.type, table.version),
    index("ai_looper_artifact_task_idx").on(table.task_run_id),
  ],
)

export const AILooperEvidenceTable = sqliteTable(
  "ai_looper_evidence",
  {
    id: text().$type<AiLooper.ID>().primaryKey(),
    task_run_id: text()
      .$type<AiLooper.ID>()
      .notNull()
      .references(() => AILooperTaskRunTable.id, { onDelete: "cascade" }),
    type: text().$type<AiLooper.EvidenceType>().notNull(),
    result: text().$type<AiLooper.EvidenceResult>().notNull(),
    ref: text().notNull(),
    metadata: text().$type<AiLooper.Evidence["explanation"]>(),
    ...Timestamps,
  },
  (table) => [index("ai_looper_evidence_task_result_idx").on(table.task_run_id, table.result)],
)

export const AILooperExternalEventTable = sqliteTable(
  "ai_looper_external_event",
  {
    source_system: text().$type<AiLooper.SourceSystem>().notNull(),
    external_event_id: text().notNull(),
    source_task_id: text().notNull(),
    received_at: integer().notNull(),
    payload: text().$type<AiLooper.ExternalEvent["payload_ref"]>().notNull(),
    processed_at: integer(),
    ...Timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.source_system, table.external_event_id] }),
    index("ai_looper_external_event_task_idx").on(table.source_system, table.source_task_id),
  ],
)

export const AILooperExternalWriteTable = sqliteTable(
  "ai_looper_external_write",
  {
    id: text().$type<AiLooper.ID>().primaryKey(),
    task_run_id: text()
      .$type<AiLooper.ID>()
      .notNull()
      .references(() => AILooperTaskRunTable.id, { onDelete: "cascade" }),
    source_system: text().$type<AiLooper.SourceSystem>().notNull(),
    idempotency_key: text().notNull(),
    type: text().$type<AiLooper.ExternalWriteType>().notNull(),
    payload: text().$type<AiLooper.ExternalWrite["payload_ref"]>().notNull(),
    status: text().$type<AiLooper.ExternalWrite["status"]>().notNull(),
    attempts: integer().notNull().default(0),
    last_error: text(),
    next_retry_at: integer(),
    ...Timestamps,
  },
  (table) => [
    uniqueIndex("ai_looper_external_write_idempotency_idx").on(table.source_system, table.idempotency_key),
    index("ai_looper_external_write_task_idx").on(table.task_run_id),
    index("ai_looper_external_write_retry_idx").on(table.status, table.next_retry_at),
  ],
)

export const AILooperWorktimeDraftTable = sqliteTable("ai_looper_worktime_draft", {
  task_run_id: text()
    .$type<AiLooper.ID>()
    .primaryKey()
    .references(() => AILooperTaskRunTable.id, { onDelete: "cascade" }),
  source_task_id: text().notNull(),
  suggested_minutes: integer().notNull(),
  confirmed_minutes: integer(),
  confirmed_by: text(),
  submitted_write_id: text().references(() => AILooperExternalWriteTable.id, { onDelete: "set null" }),
  ...Timestamps,
})

export const AILooperKnowledgeAssetCandidateTable = sqliteTable(
  "ai_looper_knowledge_asset_candidate",
  {
    id: text().$type<AiLooper.ID>().primaryKey(),
    task_run_id: text()
      .$type<AiLooper.ID>()
      .notNull()
      .references(() => AILooperTaskRunTable.id, { onDelete: "cascade" }),
    title: text().notNull(),
    scope: text().notNull(),
    content_ref: text().notNull(),
    evaluation_state: text().$type<AiLooper.KnowledgeAssetCandidate["status"]>().notNull(),
    ...Timestamps,
  },
  (table) => [index("ai_looper_knowledge_asset_candidate_task_idx").on(table.task_run_id)],
)

export const AILooperAuditRecordTable = sqliteTable(
  "ai_looper_audit_record",
  {
    id: text().$type<AiLooper.ID>().primaryKey(),
    task_run_id: text()
      .$type<AiLooper.ID>()
      .notNull()
      .references(() => AILooperTaskRunTable.id, { onDelete: "cascade" }),
    actor_id: text().notNull(),
    action: text().notNull(),
    before: text().$type<AiLooper.AuditRecord["before_state_ref"]>(),
    after: text().$type<AiLooper.AuditRecord["after_state_ref"]>(),
    reason: text(),
    time_created: integer()
      .notNull()
      .$default(() => Date.now()),
  },
  (table) => [index("ai_looper_audit_record_task_time_idx").on(table.task_run_id, table.time_created)],
)
