<!--
Sync Impact Report
- Version change: template → 1.0.0
- Added principles:
  - I. Durable Task Truth
  - II. Guarded AI Decisions
  - III. Evidence-Driven Completion
  - IV. Idempotent Enterprise Integration
  - V. Human Authority and Least Privilege
  - VI. Runtime and Provider Independence
  - VII. Governed Memory, Knowledge, and Skill Evolution
  - VIII. Operational Completeness for Every Feature
  - IX. Repository Engineering Discipline
- Added sections:
  - Mandatory Feature Quality Gates
  - Development Workflow and Review
- Removed sections: none; template placeholders replaced by governed content
- Templates:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
  - ✅ .specify/templates/commands/ not present; no command templates to update
- Runtime guidance:
  - ✅ AGENTS.md remains authoritative and is referenced by Principle IX
  - ✅ docs/ai-looper-architecture.md is compatible with these principles
- Deferred items: none
-->
# 企业 AI 软件研发平台 Constitution

## Core Principles

### I. Durable Task Truth

`TaskRun` MUST be the durable source of truth for execution state. An Agent Session,
worker process, model response, client connection, or host restart ending MUST NOT by
itself complete, cancel, or lose a task. Every long-running task MUST be restartable
from a committed checkpoint without requiring a user to ask for progress to wake it.

Rationale: enterprise work spans processes, systems, people, and days; conversational
session lifetime is not a valid business transaction boundary.

### II. Guarded AI Decisions

An LLM MAY analyze evidence and propose a state transition, but MUST NOT directly
commit durable workflow state. Every transition MUST pass deterministic validation
of the allowed edge, required evidence, authorization, retry and budget policies.
The proposal, validation result, and rejection reason MUST be retained for audit.

Rationale: probabilistic judgment is useful for interpretation, while authority and
state integrity require deterministic enforcement.

### III. Evidence-Driven Completion

A task MUST NOT be marked complete until its applicable requirement, plan, code,
test, approval, and delivery evidence is present and traceable. Every completion
decision MUST identify the acceptance criteria it satisfies and the evidence used.
Missing, stale, conflicting, or unverifiable evidence MUST result in retry, blocking,
or escalation rather than inferred success.

Rationale: a plausible Agent answer is not proof that enterprise work is complete.

### IV. Idempotent Enterprise Integration

Every write to Teambition, Gerrit, Jenkins, test systems, worktime systems, Bot
channels, repositories, or other external services MUST use a stable business
idempotency identity. Writes MUST be safe to retry, observable, and attributable.
Duplicate, delayed, and out-of-order callbacks MUST NOT create duplicate side
effects or invalid state transitions.

Rationale: durable execution necessarily retries work and receives imperfect
external event delivery.

### V. Human Authority and Least Privilege

High-risk operations, plan approval, code approval, actual worktime submission,
credential use, and policy exceptions MUST preserve an explicit authorized human
decision whenever policy requires it. Agents, roles, Skills, and tools MUST receive
only the minimum data and permissions needed for their assigned scope. An Agent
MUST NOT approve its own privileged output or expand its own authority.

Rationale: automation accelerates work but does not erase responsibility,
segregation of duties, or enterprise access boundaries.

### VI. Runtime and Provider Independence

The product control plane MUST depend on versioned task, execution, event, artifact,
role, and result contracts rather than private behavior of a specific Agent Runtime,
model, or provider. OpenCode, Codex, Claude Code, Hermes, DeepCode, and future
executors MAY be adapters, but no one executor MAY define the durable product model.

Rationale: coding quality, deployment constraints, and provider availability change
faster than the enterprise workflow and its audit obligations.

### VII. Governed Memory, Knowledge, and Skill Evolution

Agents MAY create Memory, Knowledge, Template, and Skill candidates from task
experience. Project or enterprise assets MUST NOT become authoritative until they
have an owner, provenance, evaluation evidence, approval, version, and rollback
path. Assets used by a `TaskRun` MUST be recorded as a versioned snapshot so that a
resumed task does not silently change behavior.

Rationale: learning creates compounding value only when incorrect or malicious
experience cannot silently become organizational policy.

### VIII. Operational Completeness for Every Feature

Every Feature specification and plan MUST explicitly address:

- failure and restart recovery;
- relevant external events and their ordering or duplication behavior;
- identity, permissions, human approval, and sensitive data boundaries;
- observable state, audit evidence, metrics, and diagnostic signals;
- verification at unit, contract, integration, and fault-injection levels as
  applicable.

If a category does not apply, the specification MUST state why. Deferring one of
these categories requires an identified owner, risk, and follow-up Feature.

Rationale: reliability, security, observability, and testing are product behavior,
not optional cleanup work.

### IX. Repository Engineering Discipline

All changes MUST comply with the nearest applicable `AGENTS.md`, including dependency
direction, code style, generated-code ownership, package-scoped testing, and
package-scoped type checking. Changes MUST be the smallest coherent implementation
of an approved specification, touch only required files, and define verification
before implementation. Bug fixes MUST reproduce the failure before changing code
and verify the repaired behavior afterward.

Where this Constitution and repository guidance both apply, both are mandatory. A
real conflict MUST be documented and resolved before implementation; it MUST NOT be
silently bypassed.

## Mandatory Feature Quality Gates

A Feature may advance from specification to planning only when:

- user journeys are independently testable and scope is explicit;
- measurable, technology-independent success criteria exist;
- durable task boundaries and completion evidence are defined;
- human and Agent responsibilities are distinguishable;
- integration ownership, failure behavior, and idempotency expectations are stated;
- operational requirements required by Principle VIII are complete.

A plan may advance to task generation only when:

- all Constitution checks pass or each exception has an owner and written
  justification;
- runtime and provider dependencies are behind explicit contracts;
- data, event, permission, artifact, and state-transition models are documented;
- verification includes recovery, duplicate event, retry, and authorization cases
  where applicable.

Implementation may be declared complete only when the specification's acceptance
scenarios, success criteria, tests, and operational evidence all pass.

## Development Workflow and Review

The default lifecycle is:

```text
constitution
→ specify
→ clarify
→ plan and research
→ checklist
→ tasks
→ cross-artifact analysis
→ implementation
→ verification and review
```

Specifications define user value and required behavior without prescribing a
technology. Plans own technical choices and MUST record alternatives and rationale.
Tasks MUST trace to a user story, requirement, contract, or required operational
control. Reviewers MUST reject work that cannot demonstrate this traceability.

Changes to public Protocol or Server HTTP APIs MUST follow repository generation
rules. Tests and type checks MUST run from the affected package directories, never
from the repository root when prohibited by repository guidance.

## Governance

This Constitution governs product specifications, plans, implementation tasks, and
reviews for the enterprise AI software R&D platform.

Amendments MUST:

1. include the proposed text, rationale, affected artifacts, and migration impact;
2. receive approval from the platform architecture owner and affected engineering
   owners;
3. update dependent templates and include a Sync Impact Report;
4. use semantic versioning:
   - MAJOR for incompatible principle removal or redefinition;
   - MINOR for a new principle or materially expanded obligation;
   - PATCH for clarification without changed obligations;
5. record the amendment date and provide a rollback or adoption plan.

Every Feature review MUST include a Constitution compliance check. Exceptions MUST
name an owner, scope, expiry or removal condition, and accepted risk. Undocumented
exceptions are prohibited.

**Version**: 1.0.0 | **Ratified**: 2026-07-09 | **Last Amended**: 2026-07-09
