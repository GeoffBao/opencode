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

describe("AI Looper run detail contract", () => {
  test("documents GET /api/ai-looper/runs/{taskRunID}", () => {
    const operation = (OpenApi.fromApi(Api) as OpenApiSpec).paths["/api/ai-looper/runs/{taskRunID}"]?.get
    const response = operation?.responses?.["200"]?.content?.["application/json"]?.schema

    expect(operation?.operationId).toBe("v2.aiLooper.run.get")
    expect(operation?.parameters).toContainEqual(
      expect.objectContaining({ name: "taskRunID", in: "path", required: true }),
    )
    expect(response?.required).toEqual(["task_run", "artifacts", "evidence", "attempts", "audit_records"])
    expect(response?.properties?.artifacts?.type).toBe("array")
    expect(response?.properties?.evidence?.type).toBe("array")
    expect(response?.properties?.attempts?.type).toBe("array")
    expect(response?.properties?.audit_records?.type).toBe("array")
    expect(operation?.responses?.["404"]).toBeDefined()
    expect(operation?.responses?.["503"]).toBeDefined()
  })
})
