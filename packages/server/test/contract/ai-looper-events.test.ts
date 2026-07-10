import { describe, expect, test } from "bun:test"
import { OpenApi } from "effect/unstable/httpapi"
import { Api } from "../../src/api"

type OpenApiSchema = {
  readonly type?: string
  readonly enum?: readonly unknown[]
  readonly properties?: Record<string, OpenApiSchema>
  readonly required?: readonly string[]
}
type OpenApiOperation = {
  readonly operationId?: string
  readonly requestBody?: { readonly required?: boolean; readonly content?: Record<string, { readonly schema?: OpenApiSchema }> }
  readonly responses?: Record<string, { readonly content?: Record<string, { readonly schema?: OpenApiSchema }> }>
}
type OpenApiSpec = {
  readonly paths: Record<string, { readonly post?: OpenApiOperation }>
}

describe("AI Looper external events contract", () => {
  test("documents POST /api/ai-looper/events", () => {
    const operation = (OpenApi.fromApi(Api) as OpenApiSpec).paths["/api/ai-looper/events"]?.post
    const payload = operation?.requestBody?.content?.["application/json"]?.schema
    const response = operation?.responses?.["200"]?.content?.["application/json"]?.schema

    expect(operation?.operationId).toBe("v2.aiLooper.event.ingest")
    expect(operation?.requestBody?.required).toBe(true)
    expect(payload?.required).toEqual(["source_system", "event_type", "payload"])
    expect(payload?.properties?.source_system?.enum).toEqual(["teambition", "ai_looper_ui", "coding_runtime"])
    expect(response?.required).toEqual(["external_event_id", "processed_state"])
    expect(response?.properties?.processed_state?.enum).toEqual(["pending", "processed", "ignored_duplicate"])
    expect(operation?.responses?.["503"]).toBeDefined()
  })
})
