# Feature Specification: Noclaw Core CLI

**Feature Branch**: `001-core-cli`
**Created**: 2026-02-17
**Status**: Draft
**Input**: User description: "Build a CLI tool named noclaw with main menu, scanner, uninstaller for Openclaw and Ironclaw, and logging"

## User Scenarios & Testing

### User Story 1 - Scan for Installed Services (Priority: P1)

As an administrator, I want to scan my system to discover which monitored services (Openclaw, Ironclaw) are currently installed or running, so I can decide which ones to remove.

**Why this priority**: Scanning is the foundational capability — users must know what is installed before they can uninstall anything. This delivers immediate value even without the uninstall feature.

**Independent Test**: Run `sudo noclaw`, select the scan option, and verify the tool correctly reports installed/running status for each known service.

**Acceptance Scenarios**:

1. **Given** Openclaw is installed as a systemd service and running, **When** the user runs the scanner, **Then** Openclaw is listed as "installed and running".
2. **Given** Ironclaw is deployed via Docker Compose and containers are active, **When** the user runs the scanner, **Then** Ironclaw is listed as "installed and running".
3. **Given** neither Openclaw nor Ironclaw is present on the system, **When** the user runs the scanner, **Then** both are listed as "not found" with a clear message.
4. **Given** Openclaw binary exists but the systemd service is stopped, **When** the user runs the scanner, **Then** Openclaw is listed as "installed but not running".

---

### User Story 2 - Uninstall Openclaw (Priority: P1)

As an administrator, I want to fully remove Openclaw from my system (stop service, remove binary, remove config), so the service is cleanly purged.

**Why this priority**: Openclaw uninstallation is a core feature that delivers the primary value of the tool. Tied at P1 with scanning because together they form the MVP.

**Independent Test**: Install Openclaw on a test system, run `sudo noclaw`, select Openclaw for uninstall, confirm the prompt, and verify the service is stopped, binary removed from `/usr/bin`, and config removed from `/etc`.

**Acceptance Scenarios**:

1. **Given** Openclaw is installed and running, **When** the user selects "Uninstall Openclaw" and confirms, **Then** the systemd service is stopped, the binary is removed from `/usr/bin`, and the configuration is removed from `/etc`.
2. **Given** Openclaw is installed and running, **When** the user selects "Uninstall Openclaw" and declines the confirmation, **Then** no changes are made to the system.
3. **Given** Openclaw is not installed, **When** the user selects "Uninstall Openclaw", **Then** the tool displays a message indicating Openclaw is not installed and takes no action.
4. **Given** Openclaw uninstallation is in progress, **When** each step completes, **Then** a spinner shows progress and a success or error message is displayed for each step.

---

### User Story 3 - Uninstall Ironclaw (Priority: P1)

As an administrator, I want to fully remove Ironclaw from my system (docker compose down, remove volumes), so the Docker-based service is cleanly purged.

**Why this priority**: Ironclaw uninstallation is equally critical as Openclaw — both are core deliverables of the tool.

**Independent Test**: Deploy Ironclaw via Docker Compose on a test system, run `sudo noclaw`, select Ironclaw for uninstall, confirm the prompt, and verify containers are stopped and volumes are removed.

**Acceptance Scenarios**:

1. **Given** Ironclaw is running via Docker Compose, **When** the user selects "Uninstall Ironclaw" and confirms, **Then** `docker compose down` is executed and associated volumes are removed.
2. **Given** Ironclaw is running, **When** the user selects "Uninstall Ironclaw" and declines the confirmation, **Then** no changes are made.
3. **Given** Ironclaw containers are not present, **When** the user selects "Uninstall Ironclaw", **Then** the tool displays a message indicating Ironclaw is not found and takes no action.
4. **Given** Ironclaw uninstallation is in progress, **When** each step completes, **Then** a spinner shows progress and a success or error message is displayed for each step.

---

### User Story 4 - Interactive Main Menu (Priority: P2)

As an administrator, I want to see a well-organized main menu listing all available services with their current status, so I can quickly choose what to uninstall.

**Why this priority**: The menu enhances usability but the individual scan and uninstall functions can work independently. The menu orchestrates existing capabilities into a cohesive flow.

**Independent Test**: Run `sudo noclaw` and verify an interactive menu appears listing all known services with their detected status, allowing selection and navigation.

**Acceptance Scenarios**:

1. **Given** the user runs `sudo noclaw`, **When** the tool starts, **Then** an interactive menu is displayed listing all known services (Openclaw, Ironclaw) with their current installation status.
2. **Given** the main menu is displayed, **When** the user selects a service, **Then** the tool navigates to the uninstall flow for that service.
3. **Given** the main menu is displayed, **When** the user selects "Exit", **Then** the tool exits gracefully.

---

### User Story 5 - Root Privilege Check (Priority: P1)

As an administrator, I want the tool to verify it is running with root privileges at startup, so I don't accidentally run destructive commands without proper permissions.

**Why this priority**: Without root privileges, none of the tool's core operations (stopping services, removing files, managing Docker) will work. This is a prerequisite for all other functionality.

**Independent Test**: Run `noclaw` without sudo and verify it exits with a clear error message. Run `sudo noclaw` and verify it proceeds normally.

**Acceptance Scenarios**:

1. **Given** the user runs `noclaw` without sudo, **When** the tool starts, **Then** it displays an error message indicating root privileges are required and exits with a non-zero exit code.
2. **Given** the user runs `sudo noclaw`, **When** the tool starts, **Then** the privilege check passes silently and the tool proceeds to the main menu.

---

### Edge Cases

- What happens when the systemd service file exists but the binary is missing?
- What happens when Docker is not installed but the user tries to uninstall Ironclaw?
- What happens when the user's system has partial Openclaw files (e.g., config but no binary)?
- What happens when `docker compose down` fails mid-execution (e.g., permission denied on volume)?
- What happens when the network is unavailable during Docker operations?

## Requirements

### Functional Requirements

- **FR-001**: System MUST verify root (sudo) privileges at startup and exit with a clear error if not running as root.
- **FR-002**: System MUST display an interactive main menu listing all known services (Openclaw, Ironclaw) with their current installation/running status.
- **FR-003**: System MUST auto-detect whether Openclaw is installed by checking for the systemd service unit and binary in `/usr/bin`.
- **FR-004**: System MUST auto-detect whether Ironclaw is installed by checking for running Docker containers or Docker Compose configurations.
- **FR-005**: System MUST stop the Openclaw systemd service before removing its binary and configuration files.
- **FR-006**: System MUST remove the Openclaw binary from `/usr/bin` and configuration from `/etc` during uninstallation.
- **FR-007**: System MUST execute `docker compose down` and remove associated volumes when uninstalling Ironclaw.
- **FR-008**: System MUST present a confirmation prompt ("Are you sure?") before executing any destructive uninstall operation.
- **FR-009**: System MUST display progress indicators (spinners) during long-running operations (service stop, file removal, Docker teardown).
- **FR-010**: System MUST display clear success or error messages after each operation completes.
- **FR-011**: System MUST handle the case where a selected service is not installed by displaying an informational message and taking no action.
- **FR-012**: System MUST allow the user to exit from the main menu without performing any action.

### Key Entities

- **Service**: Represents a monitored software (e.g., Openclaw, Ironclaw) with attributes: name, installation status, running status, and uninstall procedure.
- **Scan Result**: The outcome of checking a service's presence on the system — includes whether the service is installed, running, or absent.
- **Uninstall Operation**: A sequence of steps to remove a specific service, each step producing a success or error result.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Administrators can identify all installed monitored services within 5 seconds of launching the tool.
- **SC-002**: A complete uninstall operation (from menu selection to final confirmation message) completes within 30 seconds for each service.
- **SC-003**: 100% of destructive operations present a confirmation prompt before execution — no operation bypasses this safeguard.
- **SC-004**: Every operation step provides visual feedback (spinner or status message) so the user is never left without indication of progress.
- **SC-005**: Users without root privileges receive a clear, actionable error message within 1 second of launching the tool.
- **SC-006**: After successful uninstallation, re-running the scanner confirms the service is no longer detected on the system.
