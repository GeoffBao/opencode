import { Schema } from "effect"

export namespace AILooperOutbox {
  export const WriteType = Schema.Literals(["progress_note", "delivery_summary", "worktime"])
  export type WriteType = typeof WriteType.Type

  export function deliverySummaryKey(taskRunID: string, artifactID: string, version: number) {
    return ["delivery_summary", taskRunID, artifactID, version].join(":")
  }

  export function worktimeKey(taskRunID: string, engineerID: string, confirmedAt: string) {
    return ["worktime", taskRunID, engineerID, confirmedAt].join(":")
  }

  export function progressNoteKey(taskRunID: string, artifactID: string, version: number) {
    return ["progress_note", taskRunID, artifactID, version].join(":")
  }
}
