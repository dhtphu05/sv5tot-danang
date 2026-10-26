/**
 * 5TOT Đà Nẵng — Verify Golden Frontend Checkpoint Manifest
 * Compares current workspace frontend files against GOLDEN_FRONTEND_MANIFEST.json.
 * Fails if any file is missing, modified, or if checksum/size differs.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT_DIR = process.cwd();
const MANIFEST_PATH = path.join(ROOT_DIR, 'docs', 'baselines', 'GOLDEN_FRONTEND_MANIFEST.json');

interface ManifestEntry {
  path: string;
  sizeBytes: number;
  sha256: string;
}

interface ManifestData {
  baselineName: string;
  version: string;
  createdAt: string;
  totalProtectedFiles: number;
  files: ManifestEntry[];
}

function calculateSha256(filePath: string): { sha256: string; sizeBytes: number } {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  return { sha256: hash, sizeBytes: fileBuffer.length };
}

function run(): void {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`❌ Manifest not found at: ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  const manifest: ManifestData = JSON.parse(raw);

  let passed = 0;
  const failures: { path: string; reason: string }[] = [];

  for (const entry of manifest.files) {
    const fullPath = path.join(ROOT_DIR, entry.path);
    if (!fs.existsSync(fullPath)) {
      failures.push({ path: entry.path, reason: 'FILE_MISSING (Tệp bị xóa hoặc đổi tên)' });
      continue;
    }

    const current = calculateSha256(fullPath);
    if (current.sizeBytes !== entry.sizeBytes) {
      failures.push({
        path: entry.path,
        reason: `SIZE_MISMATCH: expected ${entry.sizeBytes} bytes, got ${current.sizeBytes} bytes`,
      });
      continue;
    }

    if (current.sha256 !== entry.sha256) {
      failures.push({
        path: entry.path,
        reason: `CHECKSUM_MISMATCH: expected ${entry.sha256.slice(0, 12)}..., got ${current.sha256.slice(0, 12)}...`,
      });
      continue;
    }

    passed++;
  }

  console.log(`========================================================================`);
  console.log(`5TOT ĐÀ NẴNG — GOLDEN FRONTEND MANIFEST VERIFICATION`);
  console.log(`========================================================================`);
  console.log(`Baseline Name:         ${manifest.baselineName}`);
  console.log(`Total Protected Files: ${manifest.totalProtectedFiles}`);
  console.log(`Verified Matching:     ${passed}`);
  console.log(`Failed / Modified:     ${failures.length}`);

  if (failures.length > 0) {
    console.error(`------------------------------------------------------------------------`);
    console.error(`❌ INTEGRITY VIOLATION DETECTED (${failures.length} files modified/missing):`);
    for (const f of failures.slice(0, 20)) {
      console.error(`  - ${f.path}: ${f.reason}`);
    }
    if (failures.length > 20) {
      console.error(`  ... and ${failures.length - 20} more failures.`);
    }
    console.log(`========================================================================`);
    process.exit(1);
  }

  console.log(`========================================================================`);
  console.log(`✅ PASSED: 100% of protected frontend files match the Golden Baseline!`);
  console.log(`========================================================================`);
}

run();
