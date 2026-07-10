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
  readonly parameters?: readonly { readonly name: string; readonly in: string; readonly required?: boolean }[]
  readonly requestBody?: { readonly required?: boolean; readonly content?: Record<string, { readonly schema?: OpenApiSchema }> }
  readonly responses?: Record<string, { readonly content?: Record<string, { readonly schema?: OpenApiSchema }> }>
}
type OpenApiSpec = {
  readonly paths: Record<string, { readonly post?: OpenApiOperation }>
}

describe("AI Looper human evidence contract", () => {
  test("documents POST /api/ai-looper/runs/{taskRunID}/human-evidence", () => {
    const operation = (OpenApi.fromApi(Api) as OpenApiSpec).paths["/api/ai-looper/runs/{taskRunID}/human-evidence"]?.post
    const payload = operation?.requestBody?.content?.["application/json"]?.schema
    const response = operation?.responses?.["200"]?.content?.["application/json"]?.schema

    expect(operation?.operationId).toBe("v2.aiLooper.run.humanEvidence")
    expect(operation?.parameters).toContainEqual(
      expect.objectContaining({ name: "taskRunID", in: "path", required: true }),
    )
    expect(operation?.requestBody?.required).toBe(true)
    expect(payload?.required).toEqual(["acceptance_criterion_id", "result", "explanation"])
    expect(payload?.properties?.result?.enum).toEqual(["pass", "fail", "inconclusive"])
    expect(response?.required).toContain("evidence_id")
    expect(operation?.responses?.["403"]).toBeDefined()
    expect(operation?.responses?.["404"]).toBeDefined()
    expect(operation?.responses?.["503"]).toBeDefined()
  })
})
