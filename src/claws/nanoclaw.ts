/**
 * NanoClaw Module — Docker container, image, and volume
 *
 * Identifiers (from docs_ref.ts):
 *   Container: nanoclaw
 *   Image:     nanoclaw/core
 *   Volume:    nanoclaw_data
 */

import * as p from "@clack/prompts";
import pc from "picocolors";
import { runCommand } from "../utils/system.js";

export interface ServiceInfo {
    id: string;
    name: string;
    installed: boolean;
    running: boolean;
}

// ── Detect ──────────────────────────────────────────────────────────

export async function detect(): Promise<ServiceInfo> {
    const ps = await runCommand(
        "docker ps -a --format '{{.Names}}' 2>/dev/null | grep -q nanoclaw"
    );
    const containerExists = ps.success;

    let running = false;
    if (containerExists) {
        const runningCheck = await runCommand(
            "docker ps --format '{{.Names}}' 2>/dev/null | grep -q nanoclaw"
        );
        running = runningCheck.success;
    }

    return {
        id: "nanoclaw",
        name: "NanoClaw",
        installed: containerExists,
        running,
    };
}

// ── Remove ──────────────────────────────────────────────────────────

export async function remove(): Promise<void> {
    const info = await detect();

    // Idempotency: already clean
    if (!info.installed) {
        // Also check for orphaned volume
        const volumeCheck = await runCommand(
            "docker volume ls --format '{{.Name}}' 2>/dev/null | grep -q nanoclaw_data"
        );
        if (!volumeCheck.success) {
            p.log.info(pc.dim("NanoClaw — Already Clean ✔"));
            return;
        }
    }

    const confirmed = await p.confirm({
        message: `Remove NanoClaw from this system?`,
    });

    if (p.isCancel(confirmed) || !confirmed) {
        p.log.info(pc.dim("Skipped NanoClaw removal."));
        return;
    }

    const s = p.spinner();

    // Step 1: Stop container
    s.start("Stopping nanoclaw container…");
    await runCommand("docker stop nanoclaw");
    s.stop(pc.green("Container stopped."));

    // Step 2: Remove container
    s.start("Removing nanoclaw container…");
    await runCommand("docker rm nanoclaw");
    s.stop(pc.green("Container removed."));

    // Step 3: Remove image (optional prompt)
    const removeImage = await p.confirm({
        message: "Also remove the nanoclaw/core Docker image?",
    });

    if (!p.isCancel(removeImage) && removeImage) {
        s.start("Removing nanoclaw/core image…");
        await runCommand("docker rmi nanoclaw/core");
        s.stop(pc.green("Image removed."));
    }

    // Step 4: Remove volume
    s.start("Removing nanoclaw_data volume…");
    await runCommand("docker volume rm nanoclaw_data");
    s.stop(pc.green("Volume removed."));
}

// ── Verify (Post-Removal Check) ────────────────────────────────────

export async function verify(): Promise<boolean> {
    const containerCheck = await runCommand(
        "docker ps -a --format '{{.Names}}' 2>/dev/null | grep -q nanoclaw"
    );
    const containerGone = !containerCheck.success;

    const volumeCheck = await runCommand(
        "docker volume ls --format '{{.Name}}' 2>/dev/null | grep -q nanoclaw_data"
    );
    const volumeGone = !volumeCheck.success;

    if (!containerGone || !volumeGone) {
        throw new Error("Removal failed: Container or volume still exists.");
    }

    return true;
}
