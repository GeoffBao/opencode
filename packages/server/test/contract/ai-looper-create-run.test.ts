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
  readonly requestBody?: { readonly required?: boolean; readonly content?: Record<string, { readonly schema?: OpenApiSchema }> }
  readonly responses?: Record<string, { readonly content?: Record<string, { readonly schema?: OpenApiSchema }> }>
}
type OpenApiSpec = {
  readonly paths: Record<string, { readonly post?: OpenApiOperation }>
}

describe("AI Looper create run contract", () => {
  test("documents POST /api/ai-looper/tasks/{taskCapsuleID}/runs", () => {
    const operation = (OpenApi.fromApi(Api) as OpenApiSpec).paths["/api/ai-looper/tasks/{taskCapsuleID}/runs"]?.post
    const payload = operation?.requestBody?.content?.["application/json"]?.schema
    const response = operation?.responses?.["200"]?.content?.["application/json"]?.schema

    expect(operation?.operationId).toBe("v2.aiLooper.taskRun.create")
    expect(operation?.parameters).toContainEqual(
      expect.objectContaining({ name: "taskCapsuleID", in: "path", required: true }),
    )
    expect(operation?.requestBody?.required).toBe(true)
    expect(payload?.required).toEqual(["workspace_ref"])
    expect(payload?.properties?.workspace_ref?.type).toBe("string")
    expect(response?.required).toContain("task_run_id")
    expect(operation?.responses?.["404"]).toBeDefined()
    expect(operation?.responses?.["503"]).toBeDefined()
  })
})
