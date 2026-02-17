/**
 * ═══════════════════════════════════════════════════════════════════════
 * Noclaw — Verified Removal Paths & Commands
 * Constitution Principle I: Truth Source
 *
 * All paths and commands documented here are the canonical references
 * used by each module's detect(), remove(), and verify() functions.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ── OpenClaw (Standard Node/TS — systemd) ──────────────────────────
 * Service file:      /etc/systemd/system/openclaw.service
 * Binary:            /usr/bin/openclaw
 * Node modules:      /usr/lib/node_modules/openclaw
 * Config directory:  /etc/openclaw
 * Detect command:    systemctl list-units --full -all | grep openclaw.service
 * Removal steps:
 *   1. sudo systemctl stop openclaw
 *   2. sudo systemctl disable openclaw
 *   3. sudo rm /etc/systemd/system/openclaw.service
 *   4. sudo systemctl daemon-reload
 *   5. sudo rm -rf /usr/bin/openclaw /usr/lib/node_modules/openclaw /etc/openclaw
 * Verify:
 *   - systemctl is-active openclaw → "inactive" or "not-found"
 *   - file /usr/bin/openclaw → must not exist
 *   - file /etc/systemd/system/openclaw.service → must not exist
 *
 * ── IronClaw (Rust/High-Perf — standalone binary) ──────────────────
 * Binary:            /usr/local/bin/ironclaw
 * Config directory:  ~/.config/ironclaw
 * Data directory:    /var/lib/ironclaw
 * Detect command:    which ironclaw OR fileExists('/usr/local/bin/ironclaw')
 * Removal steps:
 *   1. sudo pkill ironclaw (ignore if not running)
 *   2. sudo rm -f /usr/local/bin/ironclaw
 *   3. sudo rm -rf ~/.config/ironclaw /var/lib/ironclaw
 * Verify:
 *   - which ironclaw → empty
 *   - ps aux | grep ironclaw → no matches (excluding grep)
 *
 * ── NanoClaw (Containerized — Docker) ──────────────────────────────
 * Container name:    nanoclaw
 * Image:             nanoclaw/core
 * Volume:            nanoclaw_data
 * Detect command:    docker ps -a --format '{{.Names}}' | grep nanoclaw
 * Removal steps:
 *   1. docker stop nanoclaw
 *   2. docker rm nanoclaw
 *   3. docker rmi nanoclaw/core (optional prompt)
 *   4. docker volume rm nanoclaw_data
 * Verify:
 *   - docker ps -a → "nanoclaw" NOT in list
 *   - docker volume ls → "nanoclaw_data" NOT in list
 *
 * ── PicoClaw (Edge/Go — lightweight binary) ────────────────────────
 * Install path A:    /opt/picoclaw
 * Install path B:    ~/picoclaw
 * Detect command:    fileExists('/opt/picoclaw') OR fileExists(~/picoclaw)
 * Removal steps:
 *   1. sudo rm -rf /opt/picoclaw
 *   2. rm -rf ~/picoclaw
 * Verify:
 *   - /opt/picoclaw → must not exist
 *   - ~/picoclaw → must not exist
 *
 * ── Legacy: Clawdbot (OpenClaw alias — systemd) ────────────────────
 * Service file:      /etc/systemd/system/clawdbot.service
 * Binary:            /usr/bin/clawdbot
 * Detect command:    systemctl list-units --full -all | grep clawdbot.service
 *                    OR fileExists('/usr/bin/clawdbot')
 * Removal:           Same systemd flow as OpenClaw with "clawdbot" name
 *
 * ── Legacy: Moltbot (standalone directory) ─────────────────────────
 * Install path:      /opt/moltbot
 * Detect command:    fileExists('/opt/moltbot')
 * Removal steps:
 *   1. sudo rm -rf /opt/moltbot
 *   2. Remove cron jobs: crontab -l | grep -v moltbot | crontab -
 * Verify:
 *   - /opt/moltbot → must not exist
 *   - crontab -l | grep moltbot → empty
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

// This file is documentation-only. No runtime exports.
// Modules reference these paths directly in their implementations.
export { };
