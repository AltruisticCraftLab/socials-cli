#!/usr/bin/env bun

import { $ } from "bun";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { unzipSync } from "fflate";

// === Utilities ===
const ensureDir = (dir: string) => {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
};

const downloadZip = async (url: string, dest: string) => {
  try {
    await $`curl -sSL ${url} -o ${dest}`;
  } catch (err) {
    console.error(`❌ Failed to download from ${url}`);
    process.exit(1);
  }
};

const extractAndWrite = (zipPath: string, targetDir: string) => {
  const zipBuffer = readFileSync(zipPath);
  const files = unzipSync(new Uint8Array(zipBuffer));

  for (const [filename, content] of Object.entries(files)) {
    const outputPath = join(targetDir, filename);
    writeFileSync(outputPath, content);
    console.log(`📄 Written: ${outputPath}`);
  }
};

// === Main ===
const [moduleName1, moduleName2] = process.argv.slice(2);

if (!moduleName1 || !moduleName2) {
  console.log("❗ Usage: mycli <module1> <module2>");
  process.exit(1);
}

const repoBaseURL =
  "https://raw.githubusercontent.com/AltruisticCraftLab/my-reusable-snippets/main/zips";
const zipUrl1 = `${repoBaseURL}/${moduleName1}.zip`;
const zipUrl2 = `${repoBaseURL}/${moduleName2}.zip`;

const tempDir = join(process.cwd(), ".mycli-temp");
const zipPath1 = join(tempDir, `${moduleName1}.zip`);
const zipPath2 = join(tempDir, `${moduleName2}.zip`);
const targetDir1 = join(process.cwd(), "public");
const targetDir2 = join(process.cwd(), "src/features/auth/components/socials");

ensureDir(tempDir);
ensureDir(targetDir1);
ensureDir(targetDir2);

console.log(`📥 Downloading ${moduleName1}.zip...`);
await downloadZip(zipUrl1, zipPath1);

console.log(`📥 Downloading ${moduleName2}.zip...`);
await downloadZip(zipUrl2, zipPath2);

console.log(`📂 Extracting ${moduleName1}.zip to ${targetDir1}...`);
extractAndWrite(zipPath1, targetDir1);

console.log(`📂 Extracting ${moduleName2}.zip to ${targetDir2}...`);
extractAndWrite(zipPath2, targetDir2);

console.log("🧹 Cleaning up...");
await $`rm -rf ${tempDir}`;

console.log("✅ Done!");
