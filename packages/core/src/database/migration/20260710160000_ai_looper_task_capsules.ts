import { Effect } from "effect"
import type { DatabaseMigration } from "../migration"

export default {
  id: "20260710160000_ai_looper_task_capsules",
  up(tx) {
    return Effect.gen(function* () {
      yield* tx.run(`
        CREATE TABLE \`ai_looper_task_capsule\` (
          \`id\` text PRIMARY KEY,
          \`source_system\` text NOT NULL,
          \`source_task_id\` text NOT NULL,
          \`title\` text NOT NULL,
          \`source_status\` text,
          \`work_item_type\` text NOT NULL,
          \`execution_track\` text,
          \`source_task\` text NOT NULL,
          \`owner_user_id\` text NOT NULL,
          \`workspace_ref\` text,
          \`active_task_run_id\` text,
          \`time_created\` integer NOT NULL,
          \`time_updated\` integer NOT NULL
        );
      `)
      yield* tx.run(
        "CREATE UNIQUE INDEX `ai_looper_task_capsule_source_idx` ON `ai_looper_task_capsule` (`source_system`,`source_task_id`);",
      )
      yield* tx.run("CREATE INDEX `ai_looper_task_capsule_owner_idx` ON `ai_looper_task_capsule` (`owner_user_id`);")
    })
  },
} satisfies DatabaseMigration.Migration
