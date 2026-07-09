export * as ConfigAILooper from "./ai-looper"

import { Schema } from "effect"

export class Info extends Schema.Class<Info>("ConfigV2.AILooper.Info")({
  enabled: Schema.Boolean.pipe(Schema.optional),
}) {}
