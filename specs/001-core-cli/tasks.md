# Tasks: Noclaw Core CLI

**Input**: Design documents from `/specs/001-core-cli/`
**Prerequisites**: plan.md (required), spec.md (required), constitution v2.0.0

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US5)
- Include exact file paths in descriptions

---

## Phase 1: Research & Validation (CRITICAL)

**Purpose**: Verify all removal paths and commands against official documentation
before writing any code. Satisfies Constitution Principle I (Truth Source).

- [ ] T001 Research official uninstall steps for OpenClaw (systemd service, binary at `/usr/bin/openclaw`, config at `/etc/openclaw`, service file at `/etc/systemd/system/openclaw.service`)
- [ ] T002 [P] Research official uninstall steps for IronClaw (binary location, config at `~/.config/ironclaw`, process detection)
- [ ] T003 [P] Research official uninstall steps for NanoClaw (Docker container, image, volume `nanoclaw_data`)
- [ ] T004 Create `src/claws/docs_ref.ts` with comment block summarizing verified paths and commands for all three tools

**Checkpoint**: All removal paths verified against documentation. `docs_ref.ts` contains authoritative references.

---

## Phase 2: Setup & Migration

**Purpose**: Project restructuring — rename `src/modules/` to `src/claws/`, install deps, update imports

- [ ] T005 Migrate `src/modules/openclaw.ts` → `src/claws/openclaw.ts`
- [ ] T006 [P] Migrate `src/modules/ironclaw.ts` → `src/claws/ironclaw.ts`
- [ ] T007 [P] Update imports in `src/index.ts` to reference `./claws/` instead of `./modules/`
- [ ] T008 [P] Delete old `src/modules/` directory
- [ ] T009 Verify TypeScript compilation after migration (`bunx tsc --noEmit`)

**Checkpoint**: Project compiles with new `src/claws/` structure.

---

## Phase 3: Implement OpenClaw Module (Priority: P1)

**Goal**: Full removal + post-removal verification for OpenClaw (systemd)

- [ ] T010 [US2] Update `remove()` in `src/claws/openclaw.ts` to use researched paths from `docs_ref.ts` (`/usr/bin/openclaw`, `/etc/systemd/system/openclaw.service`, `/etc/openclaw/`)
- [ ] T011 [US2] Implement `verify()` in `src/claws/openclaw.ts`:
  - Check: `systemctl is-active openclaw` → must return "inactive" or "not-found"
  - Check: `fileExists('/usr/bin/openclaw')` → must return `false`
  - Check: `fileExists('/etc/systemd/system/openclaw.service')` → must return `false`
- [ ] T012 [US2] Add idempotency to `remove()` — if service already removed, report "Already Clean" instead of error (Constitution Principle III)
- [ ] T013 [US2] If `verify()` fails after removal, throw specific error: "Removal failed: Files still exist."

**Checkpoint**: OpenClaw `remove()` + `verify()` works end-to-end. Re-running on clean system reports "Already Clean".

---

## Phase 4: Implement IronClaw Module (Priority: P1)

**Goal**: Full removal + post-removal verification for IronClaw (binary + config)

- [ ] T014 [US3] Update `remove()` in `src/claws/ironclaw.ts` to remove binary and config at `~/.config/ironclaw`
- [ ] T015 [US3] Implement `verify()` in `src/claws/ironclaw.ts`:
  - Check: `which ironclaw` → must return empty string
  - Check: `ps aux | grep ironclaw` → must return empty (no running process)
- [ ] T016 [US3] Add idempotency to `remove()` — report "Already Clean" if already gone (Constitution Principle III)
- [ ] T017 [US3] If `verify()` fails after removal, throw specific error: "Removal failed: Process or files still exist."

**Checkpoint**: IronClaw `remove()` + `verify()` works end-to-end. Re-running on clean system reports "Already Clean".

---

## Phase 5: Implement NanoClaw Module (Priority: P1)

**Goal**: Full removal + post-removal verification for NanoClaw (Docker)

- [ ] T018 [P] [US3] Create `src/claws/nanoclaw.ts` with `detect()` function (check Docker containers/volumes)
- [ ] T019 [US3] Implement `remove()` in `src/claws/nanoclaw.ts`: Docker stop → rm → rmi
- [ ] T020 [US3] Implement `verify()` in `src/claws/nanoclaw.ts`:
  - Check: `docker ps -a` → ensure "nanoclaw" is NOT in the list
  - Check: `docker volume ls` → ensure "nanoclaw_data" is gone
- [ ] T021 [US3] Add idempotency to `remove()` — report "Already Clean" if containers/volumes already gone
- [ ] T022 [US3] If `verify()` fails after removal, throw specific error: "Removal failed: Container or volume still exists."

**Checkpoint**: NanoClaw `remove()` + `verify()` works end-to-end.

---

## Phase 6: Main Loop Integration (Priority: P2)

**Goal**: Wire `verify()` into the main flow; show green checkmark on success

- [ ] T023 [US4] Register NanoClaw module in module registry in `src/index.ts`
- [ ] T024 [US4] Update main loop in `src/index.ts`: call `await module.verify()` immediately after `await module.remove()`
- [ ] T025 [US4] If `verify()` passes, display green checkmark (✔) via `@clack/prompts`
- [ ] T026 [US4] If `verify()` fails, display red error with the thrown message

**Checkpoint**: Full interactive loop: detect → select → confirm → remove → verify → ✔/✖ → loop

---

## Phase 7: Build & Polish

**Purpose**: Final validation

- [ ] T027 Verify TypeScript compilation with `bunx tsc --noEmit`
- [ ] T028 Build standalone binary with `bun run build`
- [ ] T029 Verify binary exists and is executable
- [ ] T030 [P] Run idempotency check: execute twice on a clean system → no errors

---

## Dependencies & Execution Order

- **Phase 1 (Research)**: No dependencies — MUST complete first (Constitution Principle I)
- **Phase 2 (Setup)**: Depends on Phase 1
- **Phase 3 (OpenClaw)**: Depends on Phase 2 — T010-T013 sequential
- **Phase 4 (IronClaw)**: Depends on Phase 2 — can run in parallel with Phase 3
- **Phase 5 (NanoClaw)**: Depends on Phase 2 — can run in parallel with Phases 3-4
- **Phase 6 (Main Loop)**: Depends on Phases 3-5
- **Phase 7 (Build)**: Depends on all phases

## Summary

- **Total tasks**: 30
- **Task count per phase**: Research (4), Setup (5), OpenClaw (4), IronClaw (4), NanoClaw (5), Main Loop (4), Build (4)
- **Parallel opportunities**: T002+T003, T006+T007+T008, Phases 3-5 (separate files)
- **MVP scope**: Phases 1-3 (Research + Setup + OpenClaw with verify)
