/**
 * IronClaw Module — standalone Rust binary + config
 *
 * Paths (from docs_ref.ts):
 *   Binary:  /usr/local/bin/ironclaw
 *   Config:  ~/.config/ironclaw
 *   Data:    /var/lib/ironclaw
 */

import * as p from "@clack/prompts";
import pc from "picocolors";
import { runCommand, fileExists, killProcessByName } from "../utils/system.js";
import { homedir } from "os";

export interface ServiceInfo {
    id: string;
    name: string;
    installed: boolean;
    running: boolean;
}

// ── Detect ──────────────────────────────────────────────────────────

export async function detect(): Promise<ServiceInfo> {
    const binaryExists = await fileExists("/usr/local/bin/ironclaw");
    const whichResult = await runCommand("which ironclaw 2>/dev/null");
    const installed = binaryExists || (whichResult.success && whichResult.stdout !== "");

    let running = false;
    if (installed) {
        const ps = await runCommand("pgrep -x ironclaw");
        running = ps.success && ps.stdout !== "";
    }

    return {
        id: "ironclaw",
        name: "IronClaw",
        installed,
        running,
    };
}

// ── Remove ──────────────────────────────────────────────────────────

export async function remove(): Promise<void> {
    const info = await detect();

    // Idempotency: already clean
    if (!info.installed) {
        p.log.info(pc.dim("IronClaw — Already Clean ✔"));
        return;
    }

    const confirmed = await p.confirm({
        message: `Remove IronClaw from this system?`,
    });

    if (p.isCancel(confirmed) || !confirmed) {
        p.log.info(pc.dim("Skipped IronClaw removal."));
        return;
    }

    const s = p.spinner();
    const configDir = `${homedir()}/.config/ironclaw`;

    // Step 1: Kill process (ignore if not running)
    s.start("Killing ironclaw process…");
    await killProcessByName("ironclaw");
    s.stop(pc.green("Process terminated."));

    // Step 2: Remove binary
    s.start("Removing binary…");
    await runCommand("rm -f /usr/local/bin/ironclaw");
    s.stop(pc.green("Binary removed."));

    // Step 3: Remove config and data
    s.start("Removing config and data…");
    await runCommand(`rm -rf ${configDir} /var/lib/ironclaw`);
    s.stop(pc.green("Config and data removed."));
}

// ── Verify (Post-Removal Check) ────────────────────────────────────

export async function verify(): Promise<boolean> {
    const whichResult = await runCommand("which ironclaw 2>/dev/null");
    const binaryGone = !whichResult.success || whichResult.stdout === "";

    // Check ps aux, exclude grep itself
    const psResult = await runCommand("ps aux | grep '[i]ronclaw'");
    const processGone = !psResult.success || psResult.stdout === "";

    if (!binaryGone || !processGone) {
        throw new Error("Removal failed: Process or files still exist.");
    }

    return true;
}
