import { describe, expect, test } from "bun:test"
import { OpenApi } from "effect/unstable/httpapi"
import { Api } from "../../src/api"

type OpenApiSchema = {
  readonly type?: string
  readonly enum?: readonly unknown[]
  readonly anyOf?: readonly OpenApiSchema[]
  readonly items?: OpenApiSchema
  readonly properties?: Record<string, OpenApiSchema>
  readonly required?: readonly string[]
}
type OpenApiOperation = {
  readonly operationId?: string
  readonly responses?: Record<string, { readonly content?: Record<string, { readonly schema?: OpenApiSchema }> }>
}
type OpenApiSpec = {
  readonly paths: Record<string, { readonly get?: OpenApiOperation }>
}

describe("AI Looper task list contract", () => {
  test("documents GET /api/ai-looper/tasks", () => {
    const operation = (OpenApi.fromApi(Api) as OpenApiSpec).paths["/api/ai-looper/tasks"]?.get
    const schema = operation?.responses?.["200"]?.content?.["application/json"]?.schema
    const item = schema?.properties?.tasks?.items

    expect(operation?.operationId).toBe("v2.aiLooper.task.list")
    expect(schema?.required).toEqual(["tasks"])
    expect(item?.required).toEqual(["task_capsule_id", "source_task_id", "title", "work_item_type"])
    expect(item?.properties?.work_item_type?.enum).toEqual(["feature", "task", "bug", "unknown"])
    expect(item?.properties?.execution_track?.anyOf?.[0]?.enum).toEqual(["spec_driven", "standard_task", "bugfix"])
    expect(operation?.responses?.["401"]).toBeDefined()
  })
})
