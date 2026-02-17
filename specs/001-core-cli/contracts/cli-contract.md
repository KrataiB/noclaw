# CLI Contract: Noclaw

**Branch**: `001-core-cli` | **Date**: 2026-02-17

## Binary

| Property | Value |
|----------|-------|
| Name | `noclaw` |
| Invocation | `sudo ./noclaw` |
| Arguments | None (fully interactive) |
| Exit Codes | `0` = normal exit, `1` = error / not root |

## Interactive Flow

```text
┌──────────────────────────────────────┐
│  sudo ./noclaw                       │
│                                      │
│  ┌─ Root Check ──────────────────┐   │
│  │ FAIL → stderr: "Must run as   │   │
│  │         root" → exit(1)       │   │
│  │ PASS → continue               │   │
│  └───────────────────────────────┘   │
│                                      │
│  ┌─ intro() ─────────────────────┐   │
│  │ "🐾 Noclaw — Service Remover" │   │
│  └───────────────────────────────┘   │
│                                      │
│  ┌─ Scan Services ───────────────┐   │
│  │ Detect Openclaw (systemd)     │   │
│  │ Detect Ironclaw (docker)      │   │
│  └───────────────────────────────┘   │
│                                      │
│  ┌─ select() ────────────────────┐   │
│  │ > Openclaw [installed/absent] │   │
│  │   Ironclaw [installed/absent] │   │
│  │   Exit                        │   │
│  └───────────────────────────────┘   │
│                                      │
│  ┌─ On Service Select ───────────┐   │
│  │ if not installed → note()     │   │
│  │ if installed:                  │   │
│  │   confirm("Are you sure?")    │   │
│  │   if yes → spinner(steps...)  │   │
│  │   if no  → "Cancelled"       │   │
│  └───────────────────────────────┘   │
│                                      │
│  ← Loop back to select()            │
│                                      │
│  ┌─ On "Exit" ───────────────────┐   │
│  │ outro("Goodbye!")             │   │
│  │ exit(0)                       │   │
│  └───────────────────────────────┘   │
└──────────────────────────────────────┘
```

## Module Contract

Each module in `src/modules/` MUST export:

```typescript
interface ClawModule {
  name: string;                        // Display name
  id: string;                          // Internal ID
  detect(): Promise<ServiceInfo>;      // Detect service status
  remove(): Promise<void>;             // Full removal with confirm + spinner
}
```

## System Commands Used

### Openclaw Module

| Operation | Command |
|-----------|---------|
| Check service exists | `systemctl list-unit-files openclaw.service` |
| Check service running | `systemctl is-active openclaw.service` |
| Stop service | `systemctl stop openclaw.service` |
| Disable service | `systemctl disable openclaw.service` |
| Remove binary | `rm -f /usr/bin/openclaw` |
| Remove config | `rm -rf /etc/openclaw` |

### Ironclaw Module

| Operation | Command |
|-----------|---------|
| Check containers exist | `docker ps -a --filter "name=ironclaw" --format "{{.Names}}"` |
| Check containers running | `docker ps --filter "name=ironclaw" --format "{{.Names}}"` |
| Compose down + volumes | `docker compose -p ironclaw down -v` |
