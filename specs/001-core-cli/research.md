# Research: Noclaw Core CLI

**Branch**: `001-core-cli` | **Date**: 2026-02-17

## Decision Log

### D1: CLI Framework — @clack/prompts

**Decision**: Use `@clack/prompts` for all interactive CLI elements.
**Rationale**: Mandated by constitution (Principle II). Provides `select`, `confirm`, `spinner`, and `intro`/`outro` components out of the box. Zero-config, beautiful terminal UX.
**Alternatives considered**:
- `inquirer` — heavier, Node-centric, not mandated.
- `prompts` — lighter but lacks spinner and styling.

### D2: Color Library — picocolors

**Decision**: Use `picocolors` for terminal coloring.
**Rationale**: Smallest color library (~400 bytes), no dependencies, fastest in benchmarks. User explicitly requested it. Works with Bun natively.
**Alternatives considered**:
- `chalk` — larger, unnecessary overhead for this use case.
- `kleur` — good but slightly larger than picocolors.

### D3: Shell Command Execution — Bun.spawn / Bun.$

**Decision**: Use `Bun.$` (shell tagged template) for system commands.
**Rationale**: Native Bun API, no external dependencies. Provides `stdout`/`stderr` capture, exit code checking, and shell interpolation safety. Falls back to `Bun.spawn` for fine-grained control if needed.
**Alternatives considered**:
- `child_process.exec` — Node.js API, works in Bun but less idiomatic.
- `execa` — unnecessary dependency when Bun.$ covers the use case.

### D4: Service Detection Strategy

**Decision**: Use `systemctl is-active` and `systemctl is-enabled` for Openclaw; `docker compose ps` and `docker ps --filter` for Ironclaw.
**Rationale**: These are the standard Linux commands for checking systemd and Docker service status. They return reliable exit codes that can be checked programmatically.
**Alternatives considered**:
- Parsing `/proc` filesystem — lower-level, fragile, unnecessary.
- Using D-Bus API for systemd — overkill for a simple status check.

### D5: Binary Compilation

**Decision**: Use `bun build --compile --target=bun-linux-x64 src/index.ts --outfile noclaw`.
**Rationale**: Produces a single self-contained binary. No runtime dependency on Bun being installed on the target system. User explicitly requested a build script.
**Alternatives considered**:
- `pkg` — Node.js tool, doesn't support Bun.
- Distributing as a script — requires Bun on target, less clean.

### D6: Openclaw File Paths

**Decision**: Assume Openclaw binary at `/usr/bin/openclaw`, config directory at `/etc/openclaw/`, and systemd unit at `openclaw.service`.
**Rationale**: Standard Linux conventions for system binaries and configuration. These are the most common paths for systemd-managed services.
**Alternatives considered**:
- Making paths configurable — adds complexity; can be added later if needed.

### D7: Ironclaw Docker Compose Location

**Decision**: Check for Ironclaw containers by filtering Docker container names/labels. Use `docker compose -p ironclaw down -v` for teardown.
**Rationale**: Docker Compose projects are identified by project name. Using `-v` flag removes associated volumes as specified in requirements (FR-007).
**Alternatives considered**:
- Looking for a specific `docker-compose.yml` file — location varies, container-based detection is more reliable.
