<!--
  Sync Impact Report
  ==================
  Version change: 1.0.0 → 2.0.0 (MAJOR — principles redefined)
  Modified principles:
    - "I. Bun Runtime with TypeScript" → absorbed into "IV. Tech Stack"
    - "II. Interactive CLI via @clack/prompts" → removed (now tech stack detail)
    - "III. Safety First" → split into "I. Truth Source" + "II. Double Verification"
    - "IV. Modular Command Architecture" → moved to Development Workflow
    - "V. Root Privilege Enforcement" → moved to Development Workflow
  Added sections:
    - Principle I: Truth Source (NEW)
    - Principle II: Double Verification (NEW)
    - Principle III: Idempotency (NEW)
    - Principle IV: Tech Stack (was separate section, now elevated to principle)
  Removed sections:
    - Old principles II, IV, V (folded into Development Workflow or Tech Stack)
  Templates requiring updates:
    - .specify/templates/plan-template.md: ✅ reviewed — generic, no update needed
    - .specify/templates/spec-template.md: ✅ reviewed — generic, no update needed
    - .specify/templates/tasks-template.md: ✅ reviewed — generic, no update needed
  Follow-up TODOs:
    - Update existing feature plans to reference new principle numbers
-->

# Noclaw Constitution

## Core Principles

### I. Truth Source

Code MUST NOT contain hallucinated file paths, service names, or system
commands. Before writing any removal or system-interaction code, the
developer MUST verify the correct paths and commands by consulting the
official documentation of the target tool (OpenClaw, IronClaw, etc.).
All hardcoded paths and commands MUST be traceable to an authoritative
reference. If official documentation is unavailable or ambiguous, the
assumption MUST be documented as a known risk.

### II. Double Verification (NON-NEGOTIABLE)

Every removal operation MUST implement a **Post-Removal Check**. After
executing a destructive command (e.g., stopping a service, deleting a
file, removing a container), the script MUST programmatically verify
that the resource is truly gone. Verification methods include but are
not limited to:

- `systemctl status <service>` to confirm a service is inactive/not-found
- `ls <path>` or file-existence checks to confirm a binary/config is deleted
- `docker ps --filter name=<name>` to confirm containers are removed

If post-removal verification fails, the script MUST report the failure
clearly and MUST NOT silently proceed to the next step.

### III. Idempotency

The script MUST be safely runnable multiple times without crashing or
producing errors. If a target resource (service, file, container) has
already been removed, the script MUST report "Already Clean" (or an
equivalent status message) for that resource instead of throwing an
error or attempting a redundant removal. Every removal step MUST check
for the resource's existence before attempting to act on it.

### IV. Tech Stack

All source code MUST be written in **TypeScript** and executed via the
**Bun** runtime. Bun MUST be used as the package manager, test runner,
script executor, and binary compiler (`bun build --compile`). Shell
commands MUST be executed through Bun's built-in Shell API (`Bun.$`).
No Node.js-specific APIs or alternative runtimes are permitted unless
Bun explicitly lacks support and a justification is documented.

## Technology Stack

- **Runtime**: Bun (latest stable)
- **Language**: TypeScript (strict mode)
- **Shell Execution**: Bun.$ (tagged template)
- **UI Library**: `@clack/prompts`
- **Styling**: `picocolors`
- **Package Manager**: Bun
- **Test Runner**: `bun test`
- **Target Platform**: Linux (requires root privileges)

## Development Workflow

- All new modules MUST be added as separate files in `src/modules/`.
- Each module MUST export `detect()` and `remove()` functions.
- The main entry point MUST only orchestrate routing — no module-specific
  logic.
- The CLI MUST verify root (sudo) privileges at startup before any
  command logic executes.
- All interactive prompts MUST use `@clack/prompts` components.
- All destructive operations MUST present a confirmation prompt before
  execution.
- All removal operations MUST include post-removal verification.
- Code MUST pass TypeScript strict-mode type checking before merge.

## Governance

This constitution supersedes all other development practices for the
Noclaw project. Amendments require:

1. A documented proposal describing the change and its rationale.
2. Approval from a project maintainer.
3. A migration plan if the amendment affects existing code.
4. An updated version number following semantic versioning:
   - **MAJOR**: Backward-incompatible principle removals or redefinitions.
   - **MINOR**: New principle or section added, or materially expanded
     guidance.
   - **PATCH**: Clarifications, wording, typo fixes, non-semantic
     refinements.
5. Compliance reviews SHOULD occur at the start of each new feature spec.

**Version**: 2.0.0 | **Ratified**: 2026-02-17 | **Last Amended**: 2026-02-17
