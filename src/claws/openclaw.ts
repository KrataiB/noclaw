/**
 * OpenClaw Module — systemd-based Node/TS service
 *
 * Paths (from docs_ref.ts):
 *   Service:  /etc/systemd/system/openclaw.service
 *   Binary:   /usr/bin/openclaw
 *   Modules:  /usr/lib/node_modules/openclaw
 *   Config:   /etc/openclaw
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
    const result = await runCommand(
        "systemctl list-units --full -all 2>/dev/null | grep -q openclaw.service"
    );
    const serviceFound = result.success;
    const binaryFound = await fileExists("/usr/bin/openclaw");

    let running = false;
    if (serviceFound) {
        const active = await runCommand("systemctl is-active --quiet openclaw");
        running = active.success;
    }

    return {
        id: "openclaw",
        name: "OpenClaw",
        installed: serviceFound || binaryFound,
        running,
    };
}

// ── Remove ──────────────────────────────────────────────────────────

export async function remove(): Promise<void> {
    const info = await detect();

    // Idempotency: already clean
    if (!info.installed) {
        p.log.info(pc.dim("OpenClaw — Already Clean ✔"));
        return;
    }

    const confirmed = await p.confirm({
        message: `Remove OpenClaw from this system?`,
    });

    if (p.isCancel(confirmed) || !confirmed) {
        p.log.info(pc.dim("Skipped OpenClaw removal."));
        return;
    }

    const s = p.spinner();

    // Step 1: Stop service
    s.start("Stopping openclaw service…");
    await runCommand("systemctl stop openclaw");
    s.stop(pc.green("Service stopped."));

    // Step 2: Disable service
    s.start("Disabling openclaw service…");
    await runCommand("systemctl disable openclaw");
    s.stop(pc.green("Service disabled."));

    // Step 3: Remove service file
    s.start("Removing service file…");
    await runCommand("rm -f /etc/systemd/system/openclaw.service");
    s.stop(pc.green("Service file removed."));

    // Step 4: Reload systemd
    s.start("Reloading systemd daemon…");
    await runCommand("systemctl daemon-reload");
    s.stop(pc.green("Daemon reloaded."));

    // Step 5: Remove binary, modules, config
    s.start("Removing binary, modules, and config…");
    await runCommand("rm -rf /usr/bin/openclaw /usr/lib/node_modules/openclaw /etc/openclaw");
    s.stop(pc.green("Files removed."));
}

// ── Verify (Post-Removal Check) ────────────────────────────────────

export async function verify(): Promise<boolean> {
    const activeResult = await runCommand("systemctl is-active openclaw 2>&1");
    const activeOutput = activeResult.stdout.trim();
    const serviceGone = activeOutput === "inactive" || activeOutput === "unknown"
        || activeOutput.includes("not-found") || activeOutput === "";

    const binaryGone = !(await fileExists("/usr/bin/openclaw"));
    const serviceFileGone = !(await fileExists("/etc/systemd/system/openclaw.service"));

    if (!serviceGone || !binaryGone || !serviceFileGone) {
        throw new Error("Removal failed: Files still exist.");
    }

    return true;
}
