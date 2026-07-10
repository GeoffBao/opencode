# AI Looper in OpenCode: Product Experience Design

**Status:** Proposed and design-approved

## Purpose

Define how AI Looper should adopt the useful interaction lessons from the
ChatGPT/Codex product experience without turning enterprise software delivery
into a chat transcript or replacing the existing OpenCode coding surface.

This design addresses an observed long-running-agent failure mode: an Agent
Session can pause, disconnect, or exhaust its local context while the user's
larger delivery goal remains incomplete. The product must make the actual
execution state visible and recoverable rather than requiring a user to ask an
agent to continue manually.

## Scope

This is a product and architecture design for a future AI Looper experience.
It does not implement the described user interface, remote access, or a mobile
client.

Included:

- AI Looper as an OpenCode enterprise workflow subpage;
- dual entry through the task workbench and global project-scoped conversation;
- durable TaskRun execution and recovery behavior;
- association with Teambition, OpenCode Threads, approvals, delivery evidence,
  and worktime;
- desktop design principles.

Excluded:

- mobile remote supervision or control;
- changing the OpenCode default Projects, Threads, or Agents homepage;
- replacing the configured Coding Runtime or introducing multi-runtime
  orchestration in the MVP;
- unattended creation or modification of Teambition items from a chat message.

## Decisions

### 1. OpenCode is the primary shell; AI Looper is a child page

AI Looper is exposed through a persistent `AI Looper` navigation entry inside
OpenCode. OpenCode's existing Projects, Threads, and Agents remain the default
coding experience. AI Looper contains enterprise task lists, task details,
approvals, evidence, delivery summaries, and worktime confirmation.

This avoids displacing the coding workflow with an enterprise dashboard while
making the governed workflow available from the same application.

### 2. Two entry points, one durable execution truth

The product has two coordinated entry points:

1. **Task workbench:** the enterprise default for Teambition-originated work,
   status, approvals, evidence, and worktime.
2. **Global conversation:** a natural OpenCode-style entry point for
   exploration, diagnosis, design discussion, and coding collaboration.

Both converge on a durable **TaskRun**. A chat, OpenCode Thread, and Coding
Runtime session are interaction contexts; they are not proof that work has
started, completed, or been accepted.

### 3. Project-scoped context is explicit

Before global conversation receives engineering context, the user selects a
project or workspace. The allowed project context can then include repository
structure, project instructions, permitted knowledge assets, and relevant
tasks. The system must not silently infer and read a broad local workspace.

### 4. Conversation creates a task draft, never an ungoverned execution

When the conversation identifies engineering work, the AI can propose a task
draft containing the task type, project, requirement understanding, proposed
plan, risks, and expected scope. A user confirms the draft before it becomes a
TaskRun.

The confirmed item can be an internal AI Looper task. It may later be linked to
an existing Teambition item at the user's choice. Creation or modification of
an external Teambition item remains an explicit, audited external write rather
than an automatic result of a chat confirmation.

### 5. TaskRun outlives Agent Sessions

`TaskRun` is the persistent execution truth. It records acceptance criteria,
phase, lifecycle, checkpoints, attempts, waits, blockers, human decisions,
artifacts, evidence, and pending external writes.

Each runtime invocation is an `ExecutionAttempt`, not the task itself. If a
session ends, a process restarts, or an attempt has no progress, deterministic
policy evaluates the latest durable state and chooses one of: continue, retry,
wait, block, escalate, or finish. An LLM can recommend an action but cannot
unilaterally transition TaskRun state.

Every visible wait must say why it is waiting, who owns the next action, what
will resume it, and when escalation occurs. The UI must not present a silent
spinner for an indeterminate execution state.

### 6. Runtime portability remains an architectural boundary

OpenCode is the first Coding Runtime adapter. The TaskRun control plane owns
state, policy, approvals, evidence, and audit. Runtime adapters own only the
execution attempt interface. This preserves the option to add Codex, Claude
Code, Hermes, or another runtime without changing enterprise workflow truth.

### 7. Task and Thread are bidirectionally navigable

An AI Looper task detail links to its related OpenCode Thread, project,
execution attempts, artifacts, diffs, and test evidence. A Thread can create a
task draft and show the linked TaskRun state. This gives the user continuous
context without merging auditable workflow data into a raw chat transcript.

## Desktop experience principles

The visual direction is an **AI-native, calm task workbench**, informed by the
clarity and continuity of ChatGPT and Codex without copying their visual
identity.

- Keep the active task, current phase, blocker, and next action visually
  dominant.
- Use progressive disclosure for diffs, terminal output, artifacts, approvals,
  and audit events.
- Prefer concise natural-language progress summaries backed by inspectable
  evidence.
- Make human authorization requests interruptive only when necessary and clear
  about impact.
- Avoid dense ERP-style dashboards, decorative activity, and KPI panels that
  obscure a developer's current work.
- Preserve a globally available conversation affordance without letting it
  replace task state, approval records, or delivery evidence.

## Interaction model

```text
OpenCode Project / Thread ── create task draft ─┐
                                                ▼
Teambition task ── import / associate ──> TaskRun control plane
                                                │
                       ┌────────────────────────┼──────────────────────┐
                       ▼                        ▼                      ▼
                 plan and approval       runtime attempt         evidence / delivery
                       │                        │                      │
                       └────────────── durable checkpoints ────────────┘
                                                │
                                  AI Looper task detail and audit trail
                                                │
                                       optional Teambition write-back
```

## Failure handling and authorization

- Agent or process failure never completes a TaskRun.
- Resume and retry operate only from committed checkpoints and deterministic
  policies.
- External Teambition writes are idempotent, retryable, and auditable.
- High-risk actions, plan approval, code review, delivery acceptance, and
  worktime submission retain explicit human authorization boundaries.
- Users can cancel an active TaskRun; cancellation is itself a durable,
  authorized, auditable event and resolves or blocks dependent work safely.

## Verification requirements for a later implementation

- A session ending before acceptance conditions pass leaves the TaskRun active
  and produces an intelligible continuation, block, or escalation state.
- Restart recovery resumes from a committed checkpoint without duplicating
  external writes.
- A task created from chat has an explicit project scope and user-confirmed
  draft before runtime execution begins.
- Task detail and Thread links resolve in both directions.
- Teambition association and write-back leave a complete audit trail.
- UI acceptance tests verify phase, reason, owner, and next action for waiting,
  blocked, escalated, cancelled, and completed states.

## Deferred decision

Mobile remote supervision is deferred. If revisited, it must be a lightweight
TaskRun control surface with role-based access rather than a second coding IDE:
the host machine remains the execution environment and mobile actions operate
through the same authorization, audit, and TaskRun state model.
