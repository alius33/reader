/**
 * fix-native-deps.mjs
 *
 * npm >=11 (Node 24) has a bug where platform-specific optional dependencies
 * (like lightningcss-win32-x64-msvc) are resolved in the lockfile but never
 * actually extracted to node_modules.
 *
 * This postinstall script detects which native binaries are needed for the
 * current platform and ensures they're present. It's a no-op when npm installs
 * them correctly (e.g. on Node 20-22).
 */

import { existsSync, mkdirSync, readFileSync, unlinkSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const nodeModules = join(root, "node_modules");

/** Convert Windows backslash paths to forward slashes for tar/shell commands. */
const posix = (p) => p.replace(/\\/g, "/");

// Map: platform-arch → packages that should contain native .node files
const nativeDeps = {
  "win32-x64": [
    { pkg: "lightningcss-win32-x64-msvc", file: "lightningcss.win32-x64-msvc.node" },
    { pkg: "@tailwindcss/oxide-win32-x64-msvc", file: "tailwindcss-oxide.win32-x64-msvc.node" },
  ],
  "darwin-arm64": [
    { pkg: "lightningcss-darwin-arm64", file: "lightningcss.darwin-arm64.node" },
    { pkg: "@tailwindcss/oxide-darwin-arm64", file: "tailwindcss-oxide.darwin-arm64.node" },
  ],
  "darwin-x64": [
    { pkg: "lightningcss-darwin-x64", file: "lightningcss.darwin-x64.node" },
    { pkg: "@tailwindcss/oxide-darwin-x64", file: "tailwindcss-oxide.darwin-x64.node" },
  ],
  "linux-x64": [
    { pkg: "lightningcss-linux-x64-gnu", file: "lightningcss.linux-x64-gnu.node" },
    { pkg: "@tailwindcss/oxide-linux-x64-gnu", file: "tailwindcss-oxide.linux-x64-gnu.node" },
  ],
};

const key = `${process.platform}-${process.arch}`;
const deps = nativeDeps[key];

if (!deps) {
  console.log(`fix-native-deps: no native deps mapped for ${key}, skipping.`);
  process.exit(0);
}

let fixed = 0;

for (const { pkg, file } of deps) {
  const pkgDir = join(nodeModules, ...pkg.split("/"));
  const binaryPath = join(pkgDir, file);

  if (existsSync(binaryPath)) {
    continue; // already installed correctly
  }

  console.log(`fix-native-deps: ${pkg} missing, extracting...`);

  try {
    // Get the exact version that lightningcss/oxide expects
    const parentPkg = pkg.startsWith("lightningcss") ? "lightningcss" : "@tailwindcss/oxide";
    const parentPkgJson = join(nodeModules, ...parentPkg.split("/"), "package.json");
    let version;
    if (existsSync(parentPkgJson)) {
      const parent = JSON.parse(readFileSync(parentPkgJson, "utf8"));
      version = parent.optionalDependencies?.[pkg] || parent.version;
    }

    // npm pack downloads the tarball into the project root
    const tgzName = execSync(`npm pack ${pkg}@${version || "latest"} --pack-destination=.`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim().split("\n").pop();

    const tgzPath = join(root, tgzName);

    // Build a relative path from root to the target dir for tar compatibility
    const relPkgDir = posix(pkgDir.replace(root, ".").replace(/^\.[\\/]/, "./"));

    // Extract into node_modules (use relative paths — tar on Windows chokes on C:/)
    mkdirSync(pkgDir, { recursive: true });
    execSync(`tar xzf "./${tgzName}" --strip-components=1 -C "${relPkgDir}"`, {
      cwd: root,
      stdio: ["pipe", "pipe", "pipe"],
    });

    // Clean up tarball
    try { unlinkSync(tgzPath); } catch { /* ignore */ }

    if (existsSync(binaryPath)) {
      console.log(`fix-native-deps: ✓ ${pkg} extracted successfully.`);
      fixed++;
    } else {
      console.warn(`fix-native-deps: ✗ ${pkg} extracted but ${file} not found.`);
    }
  } catch (err) {
    console.warn(`fix-native-deps: ✗ Failed to extract ${pkg}: ${err.message}`);
  }
}

if (fixed > 0) {
  console.log(`fix-native-deps: fixed ${fixed} native dep(s).`);
} else {
  console.log("fix-native-deps: all native deps present.");
}
