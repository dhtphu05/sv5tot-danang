/**
 * 5TOT Đà Nẵng — Generate Golden Frontend Checkpoint Manifest
 * Generates deterministic SHA-256 checksums and file sizes for all protected frontend files.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT_DIR = process.cwd();
const MANIFEST_PATH = path.join(ROOT_DIR, 'docs', 'baselines', 'GOLDEN_FRONTEND_MANIFEST.json');

const TARGET_DIRECTORIES = [
  'src',
  'public',
  'packages/contracts/src',
  'scripts',
];

const TARGET_FILES = [
  'index.html',
  'vite.config.ts',
  'tsconfig.json',
  'package.json',
  'packages/contracts/package.json',
];

function calculateSha256(filePath: string): { sha256: string; sizeBytes: number } {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  return { sha256: hash, sizeBytes: fileBuffer.length };
}

function collectFiles(dir: string): string[] {
  const fullPath = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(fullPath)) return [];
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const relPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(relPath));
    } else if (entry.isFile()) {
      results.push(relPath);
    }
  }
  return results;
}

function run(): void {
  const allRelativeFiles: string[] = [];

  for (const dir of TARGET_DIRECTORIES) {
    allRelativeFiles.push(...collectFiles(dir));
  }
  for (const file of TARGET_FILES) {
    if (fs.existsSync(path.join(ROOT_DIR, file))) {
      allRelativeFiles.push(file);
    }
  }

  // Deduplicate and sort alphabetically for determinism
  const uniqueFiles = Array.from(new Set(allRelativeFiles)).sort();

  const manifestEntries = uniqueFiles.map((relPath) => {
    const fullPath = path.join(ROOT_DIR, relPath);
    const { sha256, sizeBytes } = calculateSha256(fullPath);
    return {
      path: relPath.replace(/\\/g, '/'),
      sizeBytes,
      sha256,
    };
  });

  const manifestData = {
    baselineName: '5TOT_DANANG_GOLDEN_FRONTEND_S487A_R3',
    version: '2.0.0',
    createdAt: new Date().toISOString(),
    totalProtectedFiles: manifestEntries.length,
    files: manifestEntries,
  };

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifestData, null, 2), 'utf-8');

  console.log(`✅ Successfully generated Golden Frontend Manifest with ${manifestEntries.length} protected files.`);
  console.log(`Saved to: ${MANIFEST_PATH}`);
}

run();
