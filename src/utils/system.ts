import { $ } from "bun";

export interface CommandResult {
    success: boolean;
    stdout: string;
    stderr: string;
}

/**
 * Execute a shell command and return structured result.
 * Never throws — always returns success/failure.
 */
export async function runCommand(cmd: string): Promise<CommandResult> {
    try {
        const result = await $`sh -c ${cmd}`.quiet();
        return {
            success: result.exitCode === 0,
            stdout: result.stdout.toString().trim(),
            stderr: result.stderr.toString().trim(),
        };
    } catch (error: unknown) {
        // Bun.$ throws on non-zero exit codes
        if (error && typeof error === "object" && "stdout" in error && "stderr" in error) {
            const shellError = error as { stdout: Buffer; stderr: Buffer; exitCode: number };
            return {
                success: false,
                stdout: shellError.stdout.toString().trim(),
                stderr: shellError.stderr.toString().trim(),
            };
        }
        return {
            success: false,
            stdout: "",
            stderr: String(error),
        };
    }
}

/**
 * Check if a file or directory exists on disk.
 */
export async function fileExists(path: string): Promise<boolean> {
    const file = Bun.file(path);
    return file.exists();
}

/**
 * Check if a systemd service unit is installed (known to systemd).
 */
export async function isServiceInstalled(serviceName: string): Promise<boolean> {
    const result = await runCommand(
        `systemctl list-unit-files ${serviceName} --no-pager 2>/dev/null | grep -q ${serviceName}`
    );
    return result.success;
}

/**
 * Check if a systemd service is currently active (running).
 */
export async function isServiceActive(serviceName: string): Promise<boolean> {
    const result = await runCommand(`systemctl is-active --quiet ${serviceName}`);
    return result.success;
}

/**
 * Kill all processes matching a name using pgrep + kill -9.
 * Idempotent — returns gracefully if no processes are found.
 */
export async function killProcessByName(name: string): Promise<void> {
    const pgrep = await runCommand(`pgrep -x ${name}`);
    if (!pgrep.success || pgrep.stdout === "") {
        return; // No matching process — nothing to kill
    }
    await runCommand(`kill -9 ${pgrep.stdout.split("\n").join(" ")}`);
}
