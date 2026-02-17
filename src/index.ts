import * as p from "@clack/prompts";
import pc from "picocolors";
import * as openclaw from "./claws/openclaw.js";
import * as ironclaw from "./claws/ironclaw.js";
import * as nanoclaw from "./claws/nanoclaw.js";
import * as picoclaw from "./claws/picoclaw.js";
import * as legacy from "./claws/legacy.js";

// ── Root Privilege Check ─────────────────────────────────────────────
if (process.getuid?.() !== 0) {
    console.error(
        pc.red(pc.bold("✖ Error: noclaw must be run as root."))
    );
    console.error(
        pc.dim("  Run with: sudo noclaw")
    );
    process.exit(1);
}

// ── Module Registry ──────────────────────────────────────────────────
const modules = [openclaw, ironclaw, nanoclaw, picoclaw, legacy];

// ── Main ─────────────────────────────────────────────────────────────
async function main(): Promise<void> {
    p.intro(pc.bgCyan(pc.black(" 🐾 Noclaw — Service Remover ")));

    // Main menu loop
    while (true) {
        // Detect all services
        const scanResults = await Promise.all(modules.map((m) => m.detect()));

        // Build menu options
        const options = scanResults.map((info) => {
            let status: string;
            if (!info.installed) {
                status = pc.dim("not found");
            } else if (info.running) {
                status = pc.green("installed & running");
            } else {
                status = pc.yellow("installed, not running");
            }

            return {
                value: info.id,
                label: `${info.name}  ${pc.dim("—")}  ${status}`,
            };
        });

        options.push({
            value: "exit",
            label: pc.dim("Exit"),
        });

        const selection = await p.select({
            message: "Select a service to uninstall:",
            options,
        });

        if (p.isCancel(selection) || selection === "exit") {
            p.outro(pc.dim("Goodbye! 👋"));
            process.exit(0);
        }

        // Find and run the selected module's remove + verify
        const selectedId = selection as string;
        const selectedIdx = scanResults.findIndex((r) => r.id === selectedId);

        if (selectedIdx >= 0) {
            const selectedModule = modules[selectedIdx]!;

            try {
                await selectedModule.remove();

                // Post-removal verification (Constitution Principle II)
                try {
                    await selectedModule.verify();
                    p.log.success(pc.green(pc.bold("✔ Verification passed — resource fully removed.")));
                } catch (verifyErr) {
                    const msg = verifyErr instanceof Error ? verifyErr.message : String(verifyErr);
                    p.log.error(pc.red(pc.bold(`✖ ${msg}`)));
                }
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                p.log.error(pc.red(`Error during removal: ${msg}`));
            }
        }
    }
}

main().catch((err) => {
    console.error(pc.red("Fatal error:"), err);
    process.exit(1);
});
