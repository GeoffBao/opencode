import { afterEach, expect, test } from "bun:test"
import { HttpApiApp } from "../../src/server/routes/instance/httpapi/server"
import { resetDatabase } from "../fixture/db"
import { disposeAllInstances } from "../fixture/fixture"

const context = new Map() as never

afterEach(async () => {
  await disposeAllInstances()
  await resetDatabase()
})

test("serves the AI Looper task list through the production route tree", async () => {
  const response = await HttpApiApp.webHandler().handler(
    new Request("http://localhost/api/ai-looper/tasks"),
    context,
  )

  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ tasks: [] })
})
