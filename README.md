<p align="center">
  <img src="docs/banner.png" alt="Noclaw — Service Remover CLI" width="700" />
</p>

<p align="center">
  <strong>Interactive CLI tool for detecting and removing Claw agents from your Linux system.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#supported-agents">Supported Agents</a> •
  <a href="#development">Development</a>
</p>

---

## Features

- 🔍 **Auto-Detection** — Scans your system for installed Claw agents
- 🗑️ **Safe Removal** — Confirmation prompts before every destructive operation
- ✅ **Post-Removal Verification** — Programmatically confirms resources are truly gone
- 🔄 **Idempotent** — Run multiple times without errors; reports "Already Clean" when done
- 🎨 **Interactive UI** — Beautiful prompts, spinners, and color-coded status via `@clack/prompts`
- 🔒 **Root Enforcement** — Verifies sudo privileges at startup

## Supported Agents

| Agent | Type | Detection Method |
|-------|------|-----------------|
| **OpenClaw** | Systemd service (Node/TS) | `systemctl` + binary check |
| **IronClaw** | Standalone binary (Rust) | `which` + file check |
| **NanoClaw** | Docker container | `docker ps` |
| **PicoClaw** | Lightweight binary (Go) | File check in `/opt` and `~/` |
| **Clawdbot** | Legacy (OpenClaw alias) | `systemctl` + binary check |
| **Moltbot** | Legacy (standalone) | Directory + cron check |

## Installation

### Option 1: npm (requires Bun runtime)

```bash
npm install -g noclaw
```

### Option 2: Standalone Binary

Download the prebuilt Linux binary from [Releases](https://github.com/your-username/noclaw/releases), or build from source:

```bash
git clone https://github.com/your-username/noclaw.git
cd noclaw
bun install
bun run build
```

## Usage

```bash
sudo noclaw
```

> **Root privileges required.** Noclaw manages system services, binaries, and Docker containers.

The interactive menu will:

1. **Scan** — Detect all installed agents and their status
2. **Select** — Choose which agent to remove
3. **Confirm** — Safety prompt before any destructive action
4. **Remove** — Execute removal steps with spinner feedback
5. **Verify** — Confirm the resource is truly gone (✔ or ✖)

## Architecture

```
src/
├── index.ts              # Root check → menu → remove → verify
├── utils/
│   └── system.ts         # Shell helpers (runCommand, fileExists, killProcessByName)
└── claws/
    ├── docs_ref.ts       # Verified paths & commands reference
    ├── openclaw.ts       # Systemd: stop → disable → rm → daemon-reload
    ├── ironclaw.ts       # Binary: pkill → rm binary → rm config
    ├── nanoclaw.ts       # Docker: stop → rm → rmi → volume rm
    ├── picoclaw.ts       # Paths: rm /opt + ~/
    └── legacy.ts         # Clawdbot (systemd) + Moltbot (dir + cron)
```

Every module exports three functions:

```typescript
detect(): Promise<ServiceInfo>    // Is it installed? Running?
remove(): Promise<void>           // Confirm → remove (idempotent)
verify(): Promise<boolean>        // Post-removal check (throws on failure)
```

## Development

### Prerequisites

- [Bun](https://bun.sh) (v1.3+)

### Scripts

```bash
bun install              # Install dependencies
bun run dev              # Run in development mode
bun run build            # Compile to standalone Linux binary
bun run build:npm        # Bundle for npm with tsup
bunx tsc --noEmit        # Type check
```

### Adding a New Agent

1. Create `src/claws/youragent.ts` with `detect()`, `remove()`, `verify()`
2. Add verified paths to `src/claws/docs_ref.ts`
3. Register in the `modules` array in `src/index.ts`

### Publishing

```bash
npm version patch    # Bump version
npm publish          # Build + publish (via prepublishOnly)
```

## Constitution

This project follows a strict [constitution](.specify/memory/constitution.md) (v2.0.0):

| Principle | Rule |
|-----------|------|
| **I. Truth Source** | No hallucinated paths — verify against official docs |
| **II. Double Verification** | Post-removal check after every destructive operation |
| **III. Idempotency** | "Already Clean" instead of crashes on re-run |
| **IV. Tech Stack** | Bun + TypeScript + Shell executables |

## License

MIT
