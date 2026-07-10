# AI Looper App 内嵌页面设计

## 目标

在 OpenCode Web 主界面中提供一个不干扰现有编程会话的 AI Looper 子页面入口，
让研发人员可以先预览任务列表和 TaskRun 执行详情。首版只接入前端样例数据，
不改变 Teambition、TaskRun 持久化或 RuntimeAdapter 的行为。

## 方案

在 `packages/app` 内新增独立的 AI Looper 页面模块，而不是让 app 依赖
`packages/enterprise`。路由使用 `/ai-looper` 和 `/ai-looper/:taskRunID`，并在
OpenCode 首页的项目区域提供一个明确入口。这样主会话路由、目录上下文和现有
Server SDK 生命周期不受影响，也避免 Enterprise 与 App 之间形成反向依赖。

页面沿用当前 Enterprise 页面已经验证过的信息结构：任务来源、工作项类型、
执行轨道、TaskRun 阶段、进度、产物、证据和外部写入。样例数据集中放在 App 的
AI Looper 页面模块中，后续通过同一组 view-model 类型替换为 API 查询结果。

## 路由与交互

- `/ai-looper`：显示 feature、task、bug 三类样例任务，并展示各自的执行轨道。
- `/ai-looper/:taskRunID`：显示原始需求、结构化理解、执行门禁、TaskRun 状态、
  尝试记录、产物、证据、交付摘要和工时确认。
- 列表项可进入详情页；详情页提供返回任务列表链接。
- 页面使用 App 现有的基础布局和 Tailwind utility class，不增加新的 UI 依赖。

## 非目标

- 不在本次改动中接入真实 AI Looper HTTP API。
- 不在本次改动中实现 Teambition API/MCP 配置。
- 不改变 OpenCode 默认首页、会话路由或桌面端入口。
- 不把移动端远程控制纳入本次实现。

## 验证

- `packages/app` 的 AI Looper 页面单元测试覆盖路由数据和主要区域标签。
- `bun --bun run typecheck` 在 `packages/app` 通过。
- `bun run build` 在 `packages/app` 成功。
- 开发服务器打开 `/ai-looper` 返回可见页面，列表项可进入详情页。
