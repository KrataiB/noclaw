# Feature Specification: Extended Claws

**Feature Branch**: `002-extended-claws`
**Created**: 2026-02-17
**Status**: Draft
**Input**: User description: "Extend the noclaw CLI to support a wide range of Claw agents"

## User Scenarios & Testing

### User Story 1 - Uninstall OpenClaw (Priority: P1)

As an administrator, I want to fully remove OpenClaw (a systemd-managed Node/TS service) from my system, including its service file, binaries, and configuration, so the service is cleanly purged.

**Why this priority**: OpenClaw is the most common agent and uses the most complex removal flow (systemd + multiple paths). Getting this right validates the core architecture.

**Independent Test**: Install OpenClaw on a test system, run `sudo noclaw`, select OpenClaw, confirm removal, then verify the service, binary, and config are all gone.

**Acceptance Scenarios**:

1. **Given** OpenClaw is installed and running, **When** the user selects "Remove OpenClaw" and confirms, **Then** the systemd service is stopped, disabled, and its unit file removed; the binary at `/usr/bin/openclaw` is deleted; node modules at `/usr/lib/node_modules/openclaw` are removed; config at `/etc/openclaw` is deleted; and `systemctl daemon-reload` is executed.
2. **Given** OpenClaw was already removed, **When** the user selects "Remove OpenClaw", **Then** the tool reports "Already Clean" without errors.
3. **Given** removal completes, **When** post-removal verification runs, **Then** `systemctl is-active openclaw` returns "inactive" or "not-found" AND the binary/config paths no longer exist on disk.

---

### User Story 2 - Uninstall IronClaw (Priority: P1)

As an administrator, I want to remove IronClaw (a standalone Rust binary) and its configuration from my system.

**Why this priority**: IronClaw represents the binary+config removal pattern, common across many tools.

**Independent Test**: Place the IronClaw binary at `/usr/local/bin/ironclaw` and config at `~/.config/ironclaw`, run removal, verify both are gone and no process is running.

**Acceptance Scenarios**:

1. **Given** IronClaw is installed and its process is running, **When** the user confirms removal, **Then** the process is killed, the binary at `/usr/local/bin/ironclaw` is deleted, and config at `~/.config/ironclaw` and data at `/var/lib/ironclaw` are removed.
2. **Given** IronClaw is not installed, **When** the user selects removal, **Then** "Already Clean" is reported.
3. **Given** removal completes, **When** verification runs, **Then** `which ironclaw` returns empty AND no `ironclaw` process appears in `ps aux`.

---

### User Story 3 - Uninstall NanoClaw (Priority: P1)

As an administrator, I want to remove NanoClaw (a Docker-based service) including its container, image, and data volume.

**Why this priority**: NanoClaw represents the containerized removal pattern.

**Independent Test**: Run the `nanoclaw/core` container, create a `nanoclaw_data` volume, then run removal and verify container, image, and volume are all gone.

**Acceptance Scenarios**:

1. **Given** a NanoClaw container is running, **When** the user confirms removal, **Then** the container is stopped, removed, the `nanoclaw/core` image is removed (with optional prompt), and the `nanoclaw_data` volume is pruned.
2. **Given** no NanoClaw containers exist, **When** the user selects removal, **Then** "Already Clean" is reported.
3. **Given** removal completes, **When** verification runs, **Then** `docker ps -a` does not list "nanoclaw" AND `docker volume ls` does not list "nanoclaw_data".

---

### User Story 4 - Uninstall PicoClaw (Priority: P2)

As an administrator, I want to remove PicoClaw (a lightweight Go binary) which may be installed in the user home directory or `/opt`.

**Why this priority**: PicoClaw is a simpler removal but introduces multi-path detection (home vs. /opt).

**Independent Test**: Place the PicoClaw binary in `/opt/picoclaw`, run removal, verify the directory is gone.

**Acceptance Scenarios**:

1. **Given** PicoClaw is installed at `/opt/picoclaw`, **When** the user confirms removal, **Then** the directory is deleted.
2. **Given** PicoClaw is installed at `~/picoclaw`, **When** the user confirms removal, **Then** the directory is deleted.
3. **Given** PicoClaw exists in both locations, **When** removal runs, **Then** both locations are cleaned.
4. **Given** PicoClaw is not found, **When** selected, **Then** "Already Clean" is reported.

---

### User Story 5 - Remove Legacy/Renamed Variants (Priority: P2)

As an administrator, I want the tool to detect and remove legacy or renamed agents (Clawdbot, Moltbot) that may still be present on older systems.

**Why this priority**: Legacy variants are less common but important for complete system cleanup.

**Independent Test**: Create mock Clawdbot service file and Moltbot directory, run removal, verify both are cleaned.

**Acceptance Scenarios**:

1. **Given** Clawdbot is installed as a systemd service (`clawdbot.service`), **When** removal runs, **Then** the same systemd removal flow as OpenClaw is used but with "clawdbot" as the service name.
2. **Given** Moltbot exists at `/opt/moltbot`, **When** removal runs, **Then** the directory is deleted and associated cron jobs (if any) are removed.
3. **Given** neither legacy variant exists, **When** selected, **Then** "Already Clean" is reported.

---

### User Story 6 - Root Privilege Check & Main Menu (Priority: P1)

As an administrator, I want the tool to verify root privileges at startup and present a menu listing all detected agents with their status.

**Why this priority**: Prerequisite for all removal operations.

**Independent Test**: Run without sudo → error; with sudo → menu listing all agents.

**Acceptance Scenarios**:

1. **Given** the user runs `noclaw` without sudo, **When** the tool starts, **Then** it exits with a clear error message.
2. **Given** the user runs `sudo noclaw`, **When** the tool starts, **Then** all agents are scanned and listed with their status (installed/running/not found).
3. **Given** a removal completes, **When** verification passes, **Then** a green checkmark (✔) is displayed; if verification fails, a red error is shown.

---

### Edge Cases

- What happens when Docker is not installed but NanoClaw removal is selected?
- What happens when a systemd service file exists but the binary is missing?
- What happens when `kill` fails because the process already exited?
- What happens when a legacy cron job uses a non-standard path?
- What happens when the user's home directory has non-standard permissions?

## Requirements

### Functional Requirements

- **FR-001**: System MUST verify root privileges at startup and exit with error if not root.
- **FR-002**: System MUST detect installation status of all 6 agents (OpenClaw, IronClaw, NanoClaw, PicoClaw, Clawdbot, Moltbot).
- **FR-003**: System MUST present an interactive menu listing all agents with their detected status.
- **FR-004**: System MUST execute removal steps in the correct order for each agent type (systemd, binary, Docker).
- **FR-005**: System MUST perform post-removal verification after every removal operation (Double Verification principle).
- **FR-006**: System MUST report "Already Clean" when an agent is not installed, without throwing errors (Idempotency principle).
- **FR-007**: System MUST present a confirmation prompt before any destructive operation.
- **FR-008**: System MUST display spinner feedback during each removal step.
- **FR-009**: System MUST display a green checkmark after successful verification, or a red error if verification fails.
- **FR-010**: System MUST handle legacy variants (Clawdbot as OpenClaw alias, Moltbot as standalone directory).
- **FR-011**: System MUST call `systemctl daemon-reload` after removing systemd service files.
- **FR-012**: System MUST provide a `killProcessByName()` helper for process termination.

### Key Entities

- **ClawModule**: A removable agent with `detect()`, `remove()`, and `verify()` functions.
- **ServiceInfo**: Detection result — name, id, type (systemd/binary/docker/legacy), installed, running.
- **VerificationResult**: Post-removal check — whether each expected cleanup action was confirmed.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Administrators can detect all 6 agent types within 5 seconds of launching the tool.
- **SC-002**: Complete removal + verification of any single agent completes within 30 seconds.
- **SC-003**: 100% of destructive operations present confirmation prompts before execution.
- **SC-004**: After successful removal, post-removal verification confirms the resource is truly gone.
- **SC-005**: Running the tool twice on the same system produces "Already Clean" on the second run with zero errors.
- **SC-006**: Every removal step provides visual feedback (spinner or status message).
