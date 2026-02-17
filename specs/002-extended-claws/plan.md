# Implementation Plan: Extended Claws

**Branch**: `002-extended-claws` | **Date**: 2026-02-17 | **Spec**: [spec.md](file:///home/krataib/Desktop/noclaw/specs/002-extended-claws/spec.md)
**Input**: Feature specification from `/specs/002-extended-claws/spec.md`

## Summary

Extend the noclaw CLI from 2 to 6 Claw agents with a unified `detect()` / `remove()` / `verify()` module API. Migrate from `src/modules/` to `src/claws/`. Add post-removal verification (Constitution Principle II), idempotency (Principle III), and documented source paths (Principle I).

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: @clack/prompts, picocolors
**Runtime**: Bun (latest stable)
**Testing**: bun test
**Target Platform**: Linux (requires root privileges)
**Project Type**: single

## Constitution Check

- [x] Principle I (Truth Source): `docs_ref.ts` documents all verified paths
- [x] Principle II (Double Verification): `verify()` after every `remove()`
- [x] Principle III (Idempotency): "Already Clean" when resources absent
- [x] Principle IV (Tech Stack): Bun + TypeScript + Shell

## Project Structure

### Source Code (repository root)

```text
src/
├── index.ts              # Root check → menu → remove → verify → ✔/✖
├── utils/
│   └── system.ts         # runCommand, fileExists, killProcessByName
└── claws/
    ├── docs_ref.ts       # Verified paths from official docs
    ├── openclaw.ts       # systemd: detect + remove + verify
    ├── ironclaw.ts       # binary+config: detect + remove + verify
    ├── nanoclaw.ts       # Docker: detect + remove + verify
    ├── picoclaw.ts       # /opt or ~/: detect + remove + verify
    └── legacy.ts         # Clawdbot + Moltbot: detect + remove + verify
```

**Structure Decision**: Single project with `src/claws/` for modular agent handlers.
