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

describe("AI Looper plan decision contract", () => {
  test("documents POST /api/ai-looper/runs/{taskRunID}/plan/decision", () => {
    const operation = (OpenApi.fromApi(Api) as OpenApiSpec).paths[
      "/api/ai-looper/runs/{taskRunID}/plan/decision"
    ]?.post
    const payload = operation?.requestBody?.content?.["application/json"]?.schema
    const response = operation?.responses?.["200"]?.content?.["application/json"]?.schema

    expect(operation?.operationId).toBe("v2.aiLooper.plan.decide")
    expect(operation?.parameters).toContainEqual(
      expect.objectContaining({ name: "taskRunID", in: "path", required: true }),
    )
    expect(operation?.requestBody?.required).toBe(true)
    expect(payload?.required).toEqual(["plan_id", "plan_version", "decision"])
    expect(payload?.properties?.decision?.enum).toEqual(["approved", "rejected"])
    expect(response?.required).toContain("approval_decision_id")
    expect(operation?.responses?.["403"]).toBeDefined()
    expect(operation?.responses?.["409"]).toBeDefined()
    expect(operation?.responses?.["503"]).toBeDefined()
  })
})
