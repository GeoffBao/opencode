# AI Looper 架构设计

> 状态：设计基线，待评审
>
> 目标：以 Teambition 任务为入口，可靠地驱动需求分析、规划、审核、实现、验证、集成、测试、报告、工时确认与知识沉淀。一次 Agent Session 的结束不代表任务结束。

## 1. 定位

AI Looper 是面向企业软件研发的持久化任务控制平面。它不替代 Coding Agent、通用 Agent 或 CI 系统，而是协调它们完成一个可以跨进程、跨设备、跨天运行的研发任务。

核心能力：

1. **Durable Execution**：进程、Worker 或 Agent Session 结束后，任务仍可从已提交检查点恢复。
2. **Guarded LLM Transition**：LLM 基于产物与证据提出状态迁移建议，确定性规则验证并提交迁移。
3. **External Event Wake-up**：Teambition、Gerrit、Jenkins、测试平台和 Bot 回调可以幂等地唤醒任务。
4. **Durable Multi-Agent Orchestration**：专业角色可以并行执行、独立失败和恢复，再由编排层汇总。
5. **Evidence-driven Completion**：只有验收证据满足完成策略时，任务才可完成。

AI Looper 不承担：

- 模型供应商协议适配；
- IDE、终端、Diff 等 Coding UX；
- Teambition 的完整替代品；
- 未经治理的自动 Skill 发布；
- 让单个 LLM 直接修改持久化工作流状态。

## 2. 总体架构

```text
Desktop / Web / Bot / CLI
            │
            ▼
┌─────────────────────────────────────────────┐
│                AI Looper API                │
│ Task · Approval · Query · Signal · Control  │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│             Workflow Control Plane          │
│ Workflow Orchestrator · Policy · Guard      │
│ Retry · Timeout · Cancellation · Recovery   │
└───────┬─────────────────┬───────────────────┘
        │                 │
        ▼                 ▼
┌────────────────┐  ┌─────────────────────────┐
│ Decision Layer │  │    External Event Bus   │
│ Task Router    │  │ Teambition · Gerrit     │
│ LLM Orchestr.  │  │ Jenkins · Test · Bot    │
│ LLM Judge      │  └─────────────────────────┘
└───────┬────────┘
        │
        ▼
┌─────────────────────────────────────────────┐
│               Execution Plane               │
│ Coding Runtime · General Agent · Specialist │
│ Sandbox Worker · Tool/MCP · Model Gateway   │
└─────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────┐
│              State and Evidence             │
│ Workflow History · Artifact Store · Audit   │
│ Asset Snapshot · PostgreSQL Read Model      │
└─────────────────────────────────────────────┘
```

### 2.1 Workflow Orchestrator

确定性程序，负责：

- 当前阶段、允许的迁移边和生命周期；
- 并行、串行和 Child Workflow；
- 重试、超时、取消、恢复与补偿；
- 外部 Signal、人工审批和查询；
- 预算、并发和升级策略；
- 持久化状态迁移。

### 2.2 LLM Orchestrator

不直接写工作流状态，负责：

- 理解任务和仓库上下文；
- 将目标拆成可执行单元；
- 选择流程角色与领域角色；
- 提出并行或串行执行计划；
- 汇总专业意见与冲突；
- 提出继续、回退、阻塞或升级建议。

### 2.3 Transition Judge

基于当前阶段的产物、证据和验收标准返回结构化建议：

```ts
type TransitionProposal = {
  outcome: "pass" | "retry" | "blocked" | "escalate"
  proposedNextPhase?: Phase
  evidence: EvidenceReference[]
  unresolvedIssues: string[]
  confidence: number
  reason: string
}
```

### 2.4 Transition Guard

确定性校验：

- 迁移边是否合法；
- 必需产物和证据是否存在；
- 外部结果是否来自可信系统；
- 人工审批是否来自授权用户；
- 重试和成本是否超出预算；
- 置信度是否达到当前阶段阈值；
- 是否命中强制人工审核策略。

LLM 的 `pass` 只是建议。Guard 拒绝后，工作流保持原阶段并记录拒绝原因。

## 3. 状态模型

状态采用三个正交维度，避免 `blocked` 覆盖任务原本所处阶段。

```ts
type Phase =
  | "received"
  | "analyzing"
  | "planning"
  | "plan_review"
  | "implementing"
  | "verifying"
  | "code_review"
  | "integrating"
  | "testing"
  | "reporting"
  | "time_confirmation"
  | "distilling"

type Disposition = "running" | "waiting" | "blocked" | "escalated"

type Lifecycle = "active" | "completed" | "cancelled" | "archived"

type WaitState = {
  type: "human" | "teambition" | "gerrit" | "jenkins" | "test" | "hardware" | "dependency"
  key: string
  since: string
  timeoutAt?: string
}

type TaskRunState = {
  phase: Phase
  disposition: Disposition
  lifecycle: Lifecycle
  wait?: WaitState
  attempt: number
  version: number
}
```

示例：

```text
phase=testing, disposition=blocked, wait.type=hardware
phase=implementing, disposition=escalated
phase=plan_review, disposition=waiting, wait.type=human
```

### 3.1 主流程

```text
received
→ analyzing
→ planning
→ plan_review
→ implementing
→ verifying
→ code_review
→ integrating
→ testing
→ reporting
→ time_confirmation
→ completed
→ distilling
→ archived
```

`completed` 表示业务任务已完成。`distilling` 是独立的知识沉淀流程，失败不能回滚业务完成状态；沉淀结束或明确跳过后进入 `archived`。

### 3.2 分支

- 阶段证据不足：保持当前阶段并重试。
- 可恢复的实现或测试失败：回到 `implementing`。
- 外部依赖未满足：保持当前阶段并标记 `blocked`。
- 超过重试、时间或成本预算：保持当前阶段并标记 `escalated`。
- 正常人工审核：当前阶段为审核阶段，`disposition=waiting`，不视为异常升级。
- 任务被取消：`lifecycle=cancelled`，执行补偿和资源回收。

## 4. 阶段契约

每个阶段必须声明：

```ts
type PhaseDefinition = {
  phase: Phase
  requiredInputs: ArtifactKind[]
  executors: RoleSelector[]
  requiredOutputs: ArtifactKind[]
  allowedTransitions: Phase[]
  transitionPolicy: TransitionPolicy
  retryPolicy: RetryPolicy
  timeoutPolicy: TimeoutPolicy
  approvalPolicy?: ApprovalPolicy
}
```

| 阶段 | 主要执行者 | 必需产物或证据 |
|---|---|---|
| analyzing | Orchestrator + 领域专家 | 结构化需求、范围、约束、验收条件、未决问题 |
| planning | SE/架构角色 | 技术方案、任务拆分、风险、验证计划 |
| plan_review | 人类 SE/负责人 | 带身份和意见的审批记录 |
| implementing | Developer Agent | 代码变更、Commit、实现说明 |
| verifying | Developer/Test Agent | 编译、静态检查、单元测试证据 |
| code_review | Reviewer Agent + Gerrit | Review 结果、未解决线程 |
| integrating | Jenkins/构建系统 | 构建产物、构建结果 |
| testing | Test Agent/测试平台 | 冒烟和回归报告 |
| reporting | Reporting Agent | 交付摘要、问题清单、Teambition 更新 |
| time_confirmation | 研发人员 | 经本人确认的实际工时 |
| distilling | Curator + 专家审核 | Memory/Knowledge/Skill 候选及处理结果 |

## 5. 角色编排

角色由流程职责和领域能力两个维度组合。

流程角色：

- SPM；
- SE；
- Developer；
- Tester；
- Reviewer；
- Curator。

领域角色：

- 驱动专家；
- 系统专家；
- 应用专家；
- 通信专家；
- 性能专家；
- 安全专家。

角色不是单纯 Prompt：

```ts
type ExpertRole = {
  id: string
  domainScopes: string[]
  knowledgeScopes: string[]
  skills: string[]
  tools: string[]
  permissions: PermissionPolicy
  modelPolicy: ModelPolicy
  reviewAuthority: ReviewAuthority
  escalationRules: EscalationRule[]
}
```

### 5.1 并行审查

以“修改 ISP 驱动初始化流程”为例：

```text
Task Router
→ LLM Orchestrator
  ├→ 驱动专家：HAL 与寄存器
  ├→ 通信专家：I2C/SPI 时序
  └→ 系统专家：内存与生命周期
→ Opinion Aggregator
→ Conflict Resolver
→ Transition Guard
→ 实现 / 回退 / 升级人工
```

统一审查输出：

```ts
type ExpertReview = {
  role: string
  scope: string[]
  verdict: "approve" | "approve_with_risk" | "reject" | "unknown"
  findings: Finding[]
  evidence: EvidenceReference[]
  requiredChanges: string[]
  risks: Risk[]
  confidence: number
}
```

汇总策略不是多数投票：

- 领域 Owner 可否决其责任范围内的错误；
- 安全策略可拥有强制否决权；
- `unknown` 不自动视为通过；
- 意见冲突必须显式输出，必要时升级 SE。

## 6. Temporal 实现映射

Temporal 是首选候选，但必须通过技术验证后冻结。

| AI Looper | Temporal |
|---|---|
| TaskRun | Workflow Execution |
| LLM 调用、工具和外部写入 | Activity |
| 专家审查、实现切片 | Child Workflow |
| Gerrit/Jenkins/Teambition 回调 | Signal 或 Update |
| 当前进度查询 | Query |
| 长工具执行 | Heartbeat Activity |
| 重试 | Activity Retry Policy |
| 长历史控制 | Continue-As-New |
| 取消 | Cancellation |
| 夜间或周期任务 | Schedule |

约束：

- Workflow 代码保持确定性；LLM、网络、文件和数据库访问只能在 Activity 中执行。
- Activity 可能至少执行一次，所有外部副作用必须具有业务幂等键。
- Workflow History 是执行真相，不承担看板和 KPI 的复杂查询。
- PostgreSQL Read Model 由工作流事件投影生成，服务 UI、报表和搜索。
- Workflow Definition 和阶段契约必须版本化，运行中的任务保留其兼容语义。

外部副作用幂等键：

```text
{taskRunId}:{phase}:{action}:{purposeVersion}
```

适用范围：

- 更新 Teambition；
- 创建或更新 Gerrit Review；
- 触发 Jenkins；
- 提交工时；
- 发送 Bot 消息；
- 创建分支或提交代码。

### 6.1 Restate 对照

Restate 作为 Spike 的对照候选。它的 Virtual Object、Workflow、durable promise/awakeable 和 TypeScript SDK 适合快速验证“一任务一串行 Inbox”和 LLM/tool durable step。

选择 Temporal 的条件：

- Spike 能覆盖全部故障与事件顺序场景；
- 团队可以接受 Workflow 确定性和版本演进约束；
- 企业部署可以承担 Temporal Server/Cloud；
- 实时流式事件可以与 Workflow History 解耦；
- 本地桌面可以在无服务端时降级为非自动执行模式。

选择 Restate 的条件：

- Temporal 的运维或开发复杂度显著阻碍 MVP；
- Restate 能满足企业部署、保留、加密和可观测要求；
- 对照 Spike 证明其外部事件、版本演进和长任务恢复足够可靠。

不建议以 PostgreSQL + BullMQ 自研作为首选。仅当两种引擎均无法满足部署或合规约束时重新评估。

## 7. 外部事件

统一事件信封：

```ts
type ExternalEvent = {
  id: string
  source: "teambition" | "gerrit" | "jenkins" | "test" | "bot"
  type: string
  subject: string
  occurredAt: string
  receivedAt: string
  actor?: Actor
  correlation: {
    taskRunId?: string
    externalTaskId?: string
    reviewId?: string
    buildId?: string
  }
  payload: unknown
  signature?: string
}
```

处理要求：

- 验证来源、签名和操作者身份；
- 以 `source + id` 去重；
- 先持久化事件，再投递 Signal；
- 支持事件早于 Workflow 进入等待状态；
- 无法关联的事件进入待处理队列；
- 重复、乱序和延迟事件必须可安全处理；
- Signal handler 只记录事实，阶段迁移仍经过 Guard。

## 8. Memory、资产与进化

TaskRun 启动时固定资产快照：

```ts
type AssetSnapshot = {
  policyVersion: string
  roles: VersionedAsset[]
  skills: VersionedAsset[]
  templates: VersionedAsset[]
  knowledgeIndexes: VersionedAsset[]
  modelPolicyVersion: string
  resolvedAt: string
}
```

恢复时继续使用同一快照，除非人工批准升级，避免跨天任务因 Skill、Prompt 或策略更新而漂移。

任务结束后的进化过程：

```text
任务轨迹与证据
→ 经验提取
→ Memory / Knowledge / Skill Candidate
→ 自动评估
→ 项目专家审核
→ 项目内试用
→ 企业级晋级审核
→ 发布新版本
```

Agent 可以生成候选，不能自行批准企业 Skill、权限或策略。

## 9. 可观测与控制

每个 TaskRun 必须支持：

- 查看当前阶段、Disposition、等待对象和生命周期；
- 查看每次 LLM 判断及其输入证据；
- 查看 Guard 接受或拒绝的原因；
- 暂停、恢复、取消、重试和升级；
- 查看专家并行执行状态；
- 查看模型、Token、时间和外部系统成本；
- 查看全部外部 Signal、重复事件和补偿；
- 从 TaskRun 导航到 Agent Session、Commit、CR、Build、Test 和 Teambition。

Workflow History、模型轨迹和业务审计分开保存：

- Workflow History：恢复和确定性重放；
- Agent Trace：模型、工具与上下文诊断；
- Business Audit：谁在何时批准、修改或提交；
- Read Model：UI 和分析查询。

## 10. Temporal/Restate Spike

使用同一个最小研发流程实现两个 Spike：

```text
received → analyzing → planning → plan_review
→ implementing → verifying → completed
```

必须验证：

1. Coding Worker 执行中崩溃，恢复后不丢失已提交步骤。
2. LLM 已返回但迁移尚未提交时崩溃，恢复后不重复计费或产生歧义。
3. Jenkins/Gerrit 事件先于 Workflow 进入等待状态到达，仍能正确消费。
4. 同一 Webhook 重复和乱序到达，不重复推进状态。
5. 多个专家并行执行时，部分成功、部分超时、部分重试，汇总仍可恢复。
6. Activity 重试不重复创建 CR、提交工时或发送消息。
7. Workflow 跨天等待后由人工或外部事件唤醒。
8. Agent Session 正常结束但验收未通过，Looper 自动创建 continuation。
9. Workflow 代码升级后，旧 TaskRun 仍能恢复或安全迁移。
10. 任务取消后，Worker、Sandbox、临时分支和等待对象被回收。

通过标准：

- 故障注入后状态和副作用正确；
- 无需人工查询进度来唤醒任务；
- 每次迁移可解释、可查询、可审计；
- 单一任务的事件串行一致，不同任务可并行；
- UI 可在不读取完整 Workflow History 的情况下展示进度；
- 能证明重复外部事件和 Activity 重试不会重复产生业务副作用；
- 运维、开发和本地调试复杂度在团队可接受范围内。

## 11. 待决策项

1. Temporal 与 Restate Spike 的实际结果。
2. 本地个人模式是否提供轻量 Looper，或要求连接企业服务端。
3. 哪些任务类型必须经过计划审核和代码审核。
4. 哪些专业角色具有领域否决权。
5. TaskRun、Agent Session 和 Teambition Task 的一对多关系。
6. Artifact Store、Agent Trace 和 Read Model 的保留周期。
7. 工时建议算法与人工确认边界。
8. Skill/Knowledge 候选的项目级和企业级晋级流程。

