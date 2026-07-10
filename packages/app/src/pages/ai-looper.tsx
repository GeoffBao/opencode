import { A, useParams } from "@solidjs/router"
import { For, Show } from "solid-js"
import { aiLooperTaskDetail, aiLooperTasks, type AILooperTask, type ExecutionTrack } from "./ai-looper-model"

export function AILooperPage() {
  return (
    <main class="mx-auto flex h-full w-full max-w-[1120px] flex-col gap-8 overflow-auto p-6 lg:p-10" data-component="ai-looper-page">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="mb-2 text-12-medium uppercase tracking-[0.16em] text-text-weak">Enterprise workflow</p>
          <h1 class="text-24-medium text-text-strong">AI Looper</h1>
          <p class="mt-2 max-w-[620px] text-14-regular text-text-weak">把 Teambition 任务带进 OpenCode，按研发阶段持续推进，并留下可审计证据。</p>
        </div>
        <A class="rounded-md border border-border-weak-base px-3 py-2 text-13-medium text-text-strong hover:bg-surface-raised-base" href="/">
          返回 OpenCode 首页
        </A>
      </header>
      <section aria-label="AI Looper assigned tasks" class="grid gap-3 lg:grid-cols-3">
        <For each={aiLooperTasks}>{(task) => <TaskCard task={task} />}</For>
      </section>
      <section class="rounded-lg border border-border-weak-base bg-surface-base p-5" aria-label="AI Looper workflow overview">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-16-medium text-text-strong">端到端研发流程</h2>
            <p class="mt-1 text-13-regular text-text-weak">需求分析 → 规划 → 计划审核 → 实现 → 测试与迭代</p>
          </div>
          <span class="rounded-full bg-surface-raised-base px-3 py-1 text-12-medium text-text-weak">TaskRun 持久化真相</span>
        </div>
      </section>
    </main>
  )
}

function TaskCard(props: { readonly task: AILooperTask }) {
  return (
    <A
      class="group rounded-lg border border-border-weak-base bg-surface-base p-5 transition-colors hover:border-border-strong-base hover:bg-surface-raised-base"
      href={`/ai-looper/${props.task.taskCapsuleID}`}
      data-task-capsule-id={props.task.taskCapsuleID}
    >
      <div class="flex items-center justify-between gap-3">
        <span class="text-12-medium text-text-weak">{props.task.sourceTaskID}</span>
        <span class="rounded-full bg-surface-raised-base px-2 py-1 text-11-medium text-text-weak">{props.task.workItemType}</span>
      </div>
      <h2 class="mt-5 min-h-12 text-16-medium text-text-strong group-hover:underline">{props.task.title}</h2>
      <dl class="mt-5 space-y-2 text-13-regular">
        <div class="flex justify-between gap-3"><dt class="text-text-weak">执行轨道</dt><dd class="text-text-strong">{trackLabel(props.task.executionTrack)}</dd></div>
        <div class="flex justify-between gap-3"><dt class="text-text-weak">当前阶段</dt><dd class="text-text-strong">{props.task.phase}</dd></div>
        <div class="flex justify-between gap-3"><dt class="text-text-weak">状态</dt><dd class="text-text-strong">{props.task.sourceStatus}</dd></div>
      </dl>
    </A>
  )
}

export function AILooperTaskRunPage() {
  const params = useParams<{ taskRunID: string }>()
  const detail = aiLooperTaskDetail

  return (
    <main class="mx-auto flex h-full w-full max-w-[1120px] flex-col gap-6 overflow-auto p-6 lg:p-10" data-component="ai-looper-task-run-page">
      <A class="text-13-medium text-text-weak hover:text-text-strong" href="/ai-looper">← 返回 AI Looper 任务</A>
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-12-medium uppercase tracking-[0.16em] text-text-weak">TaskRun {params.taskRunID}</p>
          <h1 class="mt-2 text-24-medium text-text-strong">{detail.source.title}</h1>
          <p class="mt-2 text-14-regular text-text-weak">{detail.source.description}</p>
        </div>
        <div class="rounded-lg border border-border-weak-base bg-surface-base px-4 py-3 text-right">
          <p class="text-12-regular text-text-weak">当前阶段</p>
          <p class="mt-1 text-16-medium text-text-strong">{detail.taskRun.phase}</p>
          <p class="mt-1 text-12-regular text-text-weak">{detail.taskRun.disposition}</p>
        </div>
      </header>
      <div class="grid gap-4 lg:grid-cols-2">
        <DetailSection title="原始需求" items={[detail.source.description, ...detail.source.acceptanceCriteria]} />
        <DetailSection title="执行门禁" items={[detail.taskRun.nextExpectedAction, `生命周期：${detail.taskRun.lifecycle}`]} />
        <DetailSection title="产物" items={detail.artifacts} />
        <DetailSection title="验证证据" items={detail.evidence} />
      </div>
      <Show when={detail.sections.includes("completion")}>
        <section class="rounded-lg border border-border-weak-base bg-surface-base p-5" aria-label="Delivery and worktime confirmation">
          <h2 class="text-16-medium text-text-strong">交付与工时确认</h2>
          <p class="mt-2 text-13-regular text-text-weak">完成证据齐备后生成交付摘要，实际工时由研发人员确认提交。</p>
        </section>
      </Show>
    </main>
  )
}

function DetailSection(props: { readonly title: string; readonly items: ReadonlyArray<string> }) {
  return (
    <section class="rounded-lg border border-border-weak-base bg-surface-base p-5">
      <h2 class="text-16-medium text-text-strong">{props.title}</h2>
      <ul class="mt-3 space-y-2 text-13-regular text-text-weak">
        <For each={props.items}>{(item) => <li class="rounded-md bg-surface-raised-base px-3 py-2">{item}</li>}</For>
      </ul>
    </section>
  )
}

function trackLabel(track: ExecutionTrack) {
  if (track === "spec_driven") return "Spec-driven 正式计划"
  if (track === "standard_task") return "Standard task 轻量计划"
  return "Bugfix 复现优先"
}
