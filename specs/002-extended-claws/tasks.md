# Tasks: NPM Package Deployment with tsup

**Input**: User request — deploy noclaw as an npm package using tsup
**Prerequisites**: 002-extended-claws implementation complete

---

## Phase 1: Setup

**Purpose**: Install tsup, configure bundling

- [x] T001 Install tsup as dev dependency: `bun add -d tsup`
- [x] T002 Create `tsup.config.ts` at project root with ESM output, `src/index.ts` entry, and `@clack/prompts` + `picocolors` as external deps
- [x] T003 [P] Add `"build:npm"` script to `package.json` running `tsup`
- [x] T004 [P] Add `"bin"` field to `package.json` pointing to `dist/index.js`
- [x] T005 Update `package.json`: set `"private": false`, add `"main"`, `"types"`, `"files"`, `"description"`, `"keywords"`, `"license"`, `"repository"` fields for npm publishing
- [x] T006 Add shebang `#!/usr/bin/env node` handling in tsup config (banner option)

**Checkpoint**: `bun run build:npm` produces `dist/index.js` with shebang

---

## Phase 2: Publishing Preparation

**Purpose**: Ensure package is ready for `npm publish`

- [x] T007 Create `.npmignore` to exclude `src/`, `specs/`, `.specify/`, `tsup.config.ts`, `noclaw` binary, and dev files
- [x] T008 [P] Update `.gitignore` to include `dist/` directory
- [x] T009 Add `"prepublishOnly"` script to `package.json` running `bun run build:npm`
- [x] T010 [P] Verify `tsup` build output: `bun run build:npm` produces correct `dist/` output

---

## Phase 3: Validation

**Purpose**: Ensure package installs and runs correctly

- [x] T011 Run `bunx tsc --noEmit` to verify TypeScript still compiles
- [x] T012 Run `bun run build:npm` and verify `dist/index.js` exists with shebang
- [x] T013 Run `npm pack --dry-run` to verify package contents are correct (no src/, no specs/)

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies — start immediately
- **Phase 2**: Depends on Phase 1
- **Phase 3**: Depends on Phase 2

## Summary

- **Total tasks**: 13
- **Parallel opportunities**: T003+T004, T008+T010
- **MVP scope**: Phase 1 (tsup config + build script)
- **Usage after publish**: `npm install -g noclaw && sudo noclaw`
