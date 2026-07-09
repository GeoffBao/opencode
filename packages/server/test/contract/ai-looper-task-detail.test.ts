import { describe, expect, test } from "bun:test"
import { OpenApi } from "effect/unstable/httpapi"
import { Api } from "../../src/api"

type OpenApiSchema = {
  readonly type?: string
  readonly properties?: Record<string, OpenApiSchema>
  readonly required?: readonly string[]
}
type OpenApiOperation = {
  readonly operationId?: string
  readonly parameters?: readonly { readonly name: string; readonly in: string; readonly required?: boolean }[]
  readonly responses?: Record<string, { readonly content?: Record<string, { readonly schema?: OpenApiSchema }> }>
}
type OpenApiSpec = {
  readonly paths: Record<string, { readonly get?: OpenApiOperation }>
}

describe("AI Looper task detail contract", () => {
  test("documents GET /api/ai-looper/tasks/{taskCapsuleID}", () => {
    const operation = (OpenApi.fromApi(Api) as OpenApiSpec).paths["/api/ai-looper/tasks/{taskCapsuleID}"]?.get
    const schema = operation?.responses?.["200"]?.content?.["application/json"]?.schema

    expect(operation?.operationId).toBe("v2.aiLooper.task.get")
    expect(operation?.parameters).toContainEqual(
      expect.objectContaining({ name: "taskCapsuleID", in: "path", required: true }),
    )
    expect(schema?.required).toEqual(["task_capsule", "source_task"])
    expect(schema?.properties?.task_capsule).toBeDefined()
    expect(schema?.properties?.source_task).toBeDefined()
    expect(operation?.responses?.["404"]).toBeDefined()
    expect(operation?.responses?.["401"]).toBeDefined()
  })
})
