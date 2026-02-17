/**
 * Legacy Module — Clawdbot (systemd alias) + Moltbot (standalone dir)
 *
 * Paths (from docs_ref.ts):
 *   Clawdbot service:  /etc/systemd/system/clawdbot.service
 *   Clawdbot binary:   /usr/bin/clawdbot
 *   Moltbot directory:  /opt/moltbot
 */

import * as p from "@clack/prompts";
import pc from "picocolors";
import { runCommand, fileExists } from "../utils/system.js";

export interface ServiceInfo {
    id: string;
    name: string;
    installed: boolean;
    running: boolean;
}

// ── Detect ──────────────────────────────────────────────────────────

export async function detect(): Promise<ServiceInfo> {
    const clawdbotBinary = await fileExists("/usr/bin/clawdbot");
    const clawdbotService = await runCommand(
        "systemctl list-units --full -all 2>/dev/null | grep -q clawdbot.service"
    );
    const moltbotDir = await fileExists("/opt/moltbot");

    const installed = clawdbotBinary || clawdbotService.success || moltbotDir;

    let running = false;
    if (clawdbotService.success) {
        const active = await runCommand("systemctl is-active --quiet clawdbot");
        running = active.success;
    }

    return {
        id: "legacy",
        name: "Legacy (Clawdbot/Moltbot)",
        installed,
        running,
    };
}

// ── Remove ──────────────────────────────────────────────────────────

export async function remove(): Promise<void> {
    const clawdbotBinary = await fileExists("/usr/bin/clawdbot");
    const clawdbotService = await runCommand(
        "systemctl list-units --full -all 2>/dev/null | grep -q clawdbot.service"
    );
    const moltbotDir = await fileExists("/opt/moltbot");

    // Idempotency: already clean
    if (!clawdbotBinary && !clawdbotService.success && !moltbotDir) {
        p.log.info(pc.dim("Legacy (Clawdbot/Moltbot) — Already Clean ✔"));
        return;
    }

    const confirmed = await p.confirm({
        message: `Remove legacy agents (Clawdbot/Moltbot) from this system?`,
    });

    if (p.isCancel(confirmed) || !confirmed) {
        p.log.info(pc.dim("Skipped legacy removal."));
        return;
    }

    const s = p.spinner();

    // ── Clawdbot (systemd, same flow as OpenClaw) ──
    if (clawdbotService.success || clawdbotBinary) {
        s.start("Stopping clawdbot service…");
        await runCommand("systemctl stop clawdbot");
        s.stop(pc.green("Clawdbot service stopped."));

        s.start("Disabling clawdbot service…");
        await runCommand("systemctl disable clawdbot");
        s.stop(pc.green("Clawdbot service disabled."));

        s.start("Removing clawdbot service file…");
        await runCommand("rm -f /etc/systemd/system/clawdbot.service");
        s.stop(pc.green("Service file removed."));

        s.start("Reloading systemd daemon…");
        await runCommand("systemctl daemon-reload");
        s.stop(pc.green("Daemon reloaded."));

        s.start("Removing clawdbot binary…");
        await runCommand("rm -f /usr/bin/clawdbot");
        s.stop(pc.green("Clawdbot binary removed."));
    }

    // ── Moltbot (directory + cron jobs) ──
    if (moltbotDir) {
        s.start("Removing /opt/moltbot…");
        await runCommand("rm -rf /opt/moltbot");
        s.stop(pc.green("/opt/moltbot removed."));

        s.start("Removing moltbot cron jobs…");
        await runCommand("crontab -l 2>/dev/null | grep -v moltbot | crontab -");
        s.stop(pc.green("Cron jobs cleaned."));
    }
}

// ── Verify (Post-Removal Check) ────────────────────────────────────

export async function verify(): Promise<boolean> {
    // Clawdbot checks
    const activeResult = await runCommand("systemctl is-active clawdbot 2>&1");
    const activeOutput = activeResult.stdout.trim();
    const clawdbotServiceGone = activeOutput === "inactive" || activeOutput === "unknown"
        || activeOutput.includes("not-found") || activeOutput === "";
    const clawdbotBinaryGone = !(await fileExists("/usr/bin/clawdbot"));

    // Moltbot checks
    const moltbotGone = !(await fileExists("/opt/moltbot"));

    const cronCheck = await runCommand("crontab -l 2>/dev/null | grep moltbot");
    const cronClean = !cronCheck.success || cronCheck.stdout === "";

    if (!clawdbotServiceGone || !clawdbotBinaryGone || !moltbotGone || !cronClean) {
        throw new Error("Removal failed: Legacy files still exist.");
    }

    return true;
}
