# Quickstart: Noclaw Core CLI

**Branch**: `001-core-cli` | **Date**: 2026-02-17

## Prerequisites

- Bun runtime (latest stable) — [https://bun.sh](https://bun.sh)
- Linux system with `systemctl` and optionally `docker`
- Root/sudo privileges

## Install Dependencies

```bash
bun install
```

## Run in Development

```bash
sudo bun run src/index.ts
```

## Build Standalone Binary

```bash
bun run build
```

This produces a `noclaw` binary in the project root.

## Run the Binary

```bash
sudo ./noclaw
```

## Expected Behavior

1. Root check — exits with error if not running as sudo
2. Scans for Openclaw (systemd) and Ironclaw (Docker) presence
3. Displays interactive menu with service status
4. On select → confirmation prompt → uninstall with spinner feedback
5. Returns to menu until user selects "Exit"
