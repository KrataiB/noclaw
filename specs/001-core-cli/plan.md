# Implementation Plan: Noclaw Core CLI

**Branch**: `001-core-cli` | **Date**: 2026-02-17 | **Spec**: [spec.md](file:///home/krataib/Desktop/noclaw/specs/001-core-cli/spec.md)
**Input**: Feature specification from `/specs/001-core-cli/spec.md`

## Summary

Build the noclaw CLI tool — an interactive, root-only uninstaller for Openclaw (systemd-based) and Ironclaw (Docker-based) services. The tool scans for installed services, presents an interactive menu via `@clack/prompts`, confirms destructive operations, and provides real-time spinner feedback. Compiled to a standalone binary via `bun build --compile`.

## Technical Context

**Language/Version**: TypeScript 5.x on Bun (latest stable)
**Primary Dependencies**: `@clack/prompts` (interactive CLI), `picocolors` (terminal colors)
**Storage**: N/A (no persistent storage; operates directly on system files and services)
**Testing**: `bun test`
**Target Platform**: Linux (x86_64), requires root privileges
**Project Type**: Single project (CLI binary)
**Performance Goals**: Scan completes < 5s; full uninstall < 30s per service
**Constraints**: Must run as root; must confirm before destructive ops
**Scale/Scope**: 2 services (Openclaw, Ironclaw), single-binary distribution

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Bun Runtime with TypeScript | ✅ PASS | All code in TypeScript, Bun as runtime/bundler |
| II. Interactive CLI via @clack/prompts | ✅ PASS | `@clack/prompts` used for select, confirm, spinner |
| III. Safety First | ✅ PASS | `confirm()` prompt before every destructive op |
| IV. Modular Command Architecture | ✅ PASS | Each claw in `src/modules/`, entry point only routes |
| V. Root Privilege Enforcement | ✅ PASS | `process.getuid() !== 0` check in entry point |

## Project Structure

### Documentation (this feature)

```text
specs/001-core-cli/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (CLI contract)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── index.ts             # Entry point: root check → main menu loop
├── utils/
│   └── system.ts        # Shell exec helpers via Bun.$ (runCommand, fileExists, etc.)
└── modules/
    ├── openclaw.ts       # detect() + remove() for Openclaw (systemd)
    └── ironclaw.ts       # detect() + remove() for Ironclaw (Docker)
```

**Structure Decision**: Single-project flat layout. `src/modules/` maps to the constitution's `commands/` concept — each "claw" exports `detect()` and `remove()`. `src/utils/` holds shared system helpers.

## Module API Contract

Each module in `src/modules/` MUST export:

```typescript
// Detect if the service is installed/running
function detect(): Promise<ServiceInfo>

// Full uninstall: confirm prompt → spinner steps → cleanup
function remove(): Promise<void>
```

## Complexity Tracking

> No constitution violations — this section is intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| N/A       | N/A        | N/A                                  |
