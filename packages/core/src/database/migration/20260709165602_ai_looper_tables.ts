import { Effect } from "effect"
import type { DatabaseMigration } from "../migration"

export default {
  id: "20260709165602_ai_looper_tables",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`
        CREATE TABLE \`ai_looper_artifact\` (
          \`id\` text PRIMARY KEY,
          \`task_run_id\` text NOT NULL,
          \`type\` text NOT NULL,
          \`version\` integer NOT NULL,
          \`content\` text NOT NULL,
          \`created_by\` text NOT NULL,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL,
          CONSTRAINT \`fk_ai_looper_artifact_task_run_id_ai_looper_task_run_id_fk\` FOREIGN KEY (\`task_run_id\`) REFERENCES \`ai_looper_task_run\`(\`id\`) ON DELETE CASCADE
        );
      `)
      yield* tx.run(`
        CREATE TABLE \`ai_looper_audit_record\` (
          \`id\` text PRIMARY KEY,
          \`task_run_id\` text NOT NULL,
          \`actor_id\` text NOT NULL,
          \`action\` text NOT NULL,
          \`before\` text,
          \`after\` text,
          \`reason\` text,
          \`time_created\` integer NOT NULL,
          CONSTRAINT \`fk_ai_looper_audit_record_task_run_id_ai_looper_task_run_id_fk\` FOREIGN KEY (\`task_run_id\`) REFERENCES \`ai_looper_task_run\`(\`id\`) ON DELETE CASCADE
        );
      `)
      yield* tx.run(`
        CREATE TABLE \`ai_looper_evidence\` (
          \`id\` text PRIMARY KEY,
          \`task_run_id\` text NOT NULL,
          \`type\` text NOT NULL,
          \`result\` text NOT NULL,
          \`ref\` text NOT NULL,
          \`metadata\` text,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL,
          CONSTRAINT \`fk_ai_looper_evidence_task_run_id_ai_looper_task_run_id_fk\` FOREIGN KEY (\`task_run_id\`) REFERENCES \`ai_looper_task_run\`(\`id\`) ON DELETE CASCADE
        );
      `)
      yield* tx.run(`
        CREATE TABLE \`ai_looper_external_event\` (
          \`source_system\` text NOT NULL,
          \`external_event_id\` text NOT NULL,
          \`source_task_id\` text NOT NULL,
          \`received_at\` integer NOT NULL,
          \`payload\` text NOT NULL,
          \`processed_at\` integer,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL,
          CONSTRAINT \`ai_looper_external_event_pk\` PRIMARY KEY(\`source_system\`, \`external_event_id\`)
        );
      `)
      yield* tx.run(`
        CREATE TABLE \`ai_looper_external_write\` (
          \`id\` text PRIMARY KEY,
          \`task_run_id\` text NOT NULL,
          \`source_system\` text NOT NULL,
          \`idempotency_key\` text NOT NULL,
          \`type\` text NOT NULL,
          \`payload\` text NOT NULL,
          \`status\` text NOT NULL,
          \`attempts\` integer DEFAULT 0 NOT NULL,
          \`last_error\` text,
          \`next_retry_at\` integer,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL,
          CONSTRAINT \`fk_ai_looper_external_write_task_run_id_ai_looper_task_run_id_fk\` FOREIGN KEY (\`task_run_id\`) REFERENCES \`ai_looper_task_run\`(\`id\`) ON DELETE CASCADE
        );
      `)
      yield* tx.run(`
        CREATE TABLE \`ai_looper_knowledge_asset_candidate\` (
          \`id\` text PRIMARY KEY,
          \`task_run_id\` text NOT NULL,
          \`title\` text NOT NULL,
          \`scope\` text NOT NULL,
          \`content_ref\` text NOT NULL,
          \`evaluation_state\` text NOT NULL,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL,
          CONSTRAINT \`fk_ai_looper_knowledge_asset_candidate_task_run_id_ai_looper_task_run_id_fk\` FOREIGN KEY (\`task_run_id\`) REFERENCES \`ai_looper_task_run\`(\`id\`) ON DELETE CASCADE
        );
      `)
      yield* tx.run(`
        CREATE TABLE \`ai_looper_task_run\` (
          \`id\` text PRIMARY KEY,
          \`source_system\` text NOT NULL,
          \`source_task_id\` text NOT NULL,
          \`work_item_type\` text NOT NULL,
          \`title\` text NOT NULL,
          \`source_task\` text NOT NULL,
          \`task_capsule\` text,
          \`execution_track\` text NOT NULL,
          \`gate_policy\` text NOT NULL,
          \`phase\` text NOT NULL,
          \`lifecycle\` text NOT NULL,
          \`gate_state\` text NOT NULL,
          \`current_disposition\` text NOT NULL,
          \`owner_user_id\` text NOT NULL,
          \`reviewer_user_id\` text,
          \`workspace_ref\` text,
          \`runtime_id\` text,
          \`execution_plan_version\` integer,
          \`attempt_count\` integer DEFAULT 0 NOT NULL,
          \`high_risk\` integer DEFAULT false NOT NULL,
          \`estimated_hours\` integer,
          \`last_blocker\` text,
          \`next_wake_at\` integer,
          \`time_approved\` integer,
          \`time_completed\` integer,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL
        );
      `)
      yield* tx.run(`
        CREATE TABLE \`ai_looper_worktime_draft\` (
          \`task_run_id\` text PRIMARY KEY,
          \`source_task_id\` text NOT NULL,
          \`suggested_minutes\` integer NOT NULL,
          \`confirmed_minutes\` integer,
          \`confirmed_by\` text,
          \`submitted_write_id\` text,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL,
          CONSTRAINT \`fk_ai_looper_worktime_draft_task_run_id_ai_looper_task_run_id_fk\` FOREIGN KEY (\`task_run_id\`) REFERENCES \`ai_looper_task_run\`(\`id\`) ON DELETE CASCADE,
          CONSTRAINT \`fk_ai_looper_worktime_draft_submitted_write_id_ai_looper_external_write_id_fk\` FOREIGN KEY (\`submitted_write_id\`) REFERENCES \`ai_looper_external_write\`(\`id\`) ON DELETE SET NULL
        );
      `)
      yield* tx.run(
        `CREATE UNIQUE INDEX \`ai_looper_artifact_task_type_version_idx\` ON \`ai_looper_artifact\` (\`task_run_id\`,\`type\`,\`version\`);`,
      )
      yield* tx.run(`CREATE INDEX \`ai_looper_artifact_task_idx\` ON \`ai_looper_artifact\` (\`task_run_id\`);`)
      yield* tx.run(
        `CREATE INDEX \`ai_looper_audit_record_task_time_idx\` ON \`ai_looper_audit_record\` (\`task_run_id\`,\`time_created\`);`,
      )
      yield* tx.run(
        `CREATE INDEX \`ai_looper_evidence_task_result_idx\` ON \`ai_looper_evidence\` (\`task_run_id\`,\`result\`);`,
      )
      yield* tx.run(
        `CREATE INDEX \`ai_looper_external_event_task_idx\` ON \`ai_looper_external_event\` (\`source_system\`,\`source_task_id\`);`,
      )
      yield* tx.run(
        `CREATE UNIQUE INDEX \`ai_looper_external_write_idempotency_idx\` ON \`ai_looper_external_write\` (\`source_system\`,\`idempotency_key\`);`,
      )
      yield* tx.run(
        `CREATE INDEX \`ai_looper_external_write_task_idx\` ON \`ai_looper_external_write\` (\`task_run_id\`);`,
      )
      yield* tx.run(
        `CREATE INDEX \`ai_looper_external_write_retry_idx\` ON \`ai_looper_external_write\` (\`status\`,\`next_retry_at\`);`,
      )
      yield* tx.run(
        `CREATE INDEX \`ai_looper_knowledge_asset_candidate_task_idx\` ON \`ai_looper_knowledge_asset_candidate\` (\`task_run_id\`);`,
      )
      yield* tx.run(
        `CREATE UNIQUE INDEX \`ai_looper_task_run_source_idx\` ON \`ai_looper_task_run\` (\`source_system\`,\`source_task_id\`);`,
      )
      yield* tx.run(
        `CREATE INDEX \`ai_looper_task_run_owner_phase_idx\` ON \`ai_looper_task_run\` (\`owner_user_id\`,\`phase\`);`,
      )
      yield* tx.run(
        `CREATE INDEX \`ai_looper_task_run_recovery_idx\` ON \`ai_looper_task_run\` (\`lifecycle\`,\`next_wake_at\`);`,
      )
    })
  },
} satisfies DatabaseMigration.Migration
