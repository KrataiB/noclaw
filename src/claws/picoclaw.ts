/**
 * PicoClaw Module — lightweight Go binary
 *
 * Paths (from docs_ref.ts):
 *   Install path A:  /opt/picoclaw
 *   Install path B:  ~/picoclaw
 */

import * as p from "@clack/prompts";
import pc from "picocolors";
import { runCommand, fileExists } from "../utils/system.js";
import { homedir } from "os";

export interface ServiceInfo {
    id: string;
    name: string;
    installed: boolean;
    running: boolean;
}

// ── Detect ──────────────────────────────────────────────────────────

export async function detect(): Promise<ServiceInfo> {
    const optPath = "/opt/picoclaw";
    const homePath = `${homedir()}/picoclaw`;

    const optExists = await fileExists(optPath);
    const homeExists = await fileExists(homePath);

    return {
        id: "picoclaw",
        name: "PicoClaw",
        installed: optExists || homeExists,
        running: false, // PicoClaw is a CLI binary, no long-running process
    };
}

// ── Remove ──────────────────────────────────────────────────────────

export async function remove(): Promise<void> {
    const optPath = "/opt/picoclaw";
    const homePath = `${homedir()}/picoclaw`;
    const optExists = await fileExists(optPath);
    const homeExists = await fileExists(homePath);

    // Idempotency: already clean
    if (!optExists && !homeExists) {
        p.log.info(pc.dim("PicoClaw — Already Clean ✔"));
        return;
    }

    const confirmed = await p.confirm({
        message: `Remove PicoClaw from this system?`,
    });

    if (p.isCancel(confirmed) || !confirmed) {
        p.log.info(pc.dim("Skipped PicoClaw removal."));
        return;
    }

    const s = p.spinner();

    if (optExists) {
        s.start("Removing /opt/picoclaw…");
        await runCommand("rm -rf /opt/picoclaw");
        s.stop(pc.green("/opt/picoclaw removed."));
    }

    if (homeExists) {
        s.start("Removing ~/picoclaw…");
        await runCommand(`rm -rf ${homePath}`);
        s.stop(pc.green("~/picoclaw removed."));
    }
}

// ── Verify (Post-Removal Check) ────────────────────────────────────

export async function verify(): Promise<boolean> {
    const optGone = !(await fileExists("/opt/picoclaw"));
    const homeGone = !(await fileExists(`${homedir()}/picoclaw`));

    if (!optGone || !homeGone) {
        throw new Error("Removal failed: PicoClaw directory still exists.");
    }

    return true;
}
