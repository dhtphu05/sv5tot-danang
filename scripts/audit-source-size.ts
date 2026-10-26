import fs from 'node:fs';
import path from 'node:path';

// Patterns to exclude: vendor, generated, dist, node_modules, lockfiles, hidden git
const EXCLUDE_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.git',
  '.vite',
  '.aistudio',
  '.data',
]);

const ALLOWED_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx']);

interface FileSizeRecord {
  filePath: string;
  lines: number;
  fsdLayer: string;
}

function resolveFsdLayer(relPath: string): string {
  if (relPath === 'src/App.tsx' || relPath === 'src/main.tsx' || relPath.startsWith('src/app/')) {
    return 'app';
  }
  if (relPath.startsWith('src/pages/')) return 'pages';
  if (relPath.startsWith('src/widgets/')) return 'widgets';
  if (relPath.startsWith('src/features/')) return 'features';
  if (relPath.startsWith('src/entities/')) return 'entities';
  if (relPath.startsWith('src/shared/') || relPath === 'src/tokens.ts') return 'shared';
  if (relPath.startsWith('src/test/') || relPath.includes('.test.')) return 'test';
  if (relPath.includes('/fixtures/') || relPath.startsWith('src/demo/')) return 'entities/fixtures';
  if (
    relPath.startsWith('src/components/buttons/') ||
    relPath.startsWith('src/components/forms/') ||
    relPath.startsWith('src/components/feedback/') ||
    relPath.startsWith('src/components/status/') ||
    relPath.startsWith('src/components/brand/') ||
    relPath.startsWith('src/components/shell/')
  ) {
    return 'shared/ui';
  }
  if (relPath.startsWith('src/components/public/')) return 'pages/public';
  if (relPath.startsWith('src/components/home/')) return 'pages/student-home';
  if (relPath.startsWith('src/components/results/')) return 'pages/student-results';
  if (relPath.startsWith('src/components/notifications/')) return 'widgets/notifications';
  if (relPath.startsWith('src/components/evidence/')) return 'widgets/evidence';
  if (relPath.startsWith('src/components/application/')) return 'widgets/application';
  if (relPath.startsWith('src/components/collective/')) return 'widgets/collective';
  if (relPath.startsWith('src/staff/components/')) return 'widgets/staff';
  if (relPath.startsWith('src/staff/')) return 'entities/staff';
  if (relPath.startsWith('scripts/')) return 'tooling';
  return 'app/server';
}

function scanDir(dir: string, baseDir: string): FileSizeRecord[] {
  const records: FileSizeRecord[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.') {
      continue;
    }
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      records.push(...scanDir(path.join(dir, entry.name), baseDir));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (ALLOWED_EXTS.has(ext)) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n').length;
        records.push({
          filePath: relPath,
          lines,
          fsdLayer: resolveFsdLayer(relPath),
        });
      }
    }
  }

  return records;
}

function runAudit() {
  const baseDir = process.cwd();
  const srcDir = path.join(baseDir, 'src');

  if (!fs.existsSync(srcDir)) {
    console.error('Source directory src/ not found!');
    process.exit(1);
  }

  const allRepoRecords = scanDir(baseDir, baseDir);
  const srcRecords = allRepoRecords.filter((r) => r.filePath.startsWith('src/'));
  allRepoRecords.sort((a, b) => b.lines - a.lines);
  srcRecords.sort((a, b) => b.lines - a.lines);

  const over1000 = allRepoRecords.filter((r) => r.lines > 1000);
  const over800 = allRepoRecords.filter((r) => r.lines > 800);
  const over600 = allRepoRecords.filter((r) => r.lines > 600);

  console.log('========================================================================');
  console.log('5TOT ĐÀ NẴNG — SOURCE CODE SIZE & MODULARITY AUDIT (S4.8.7A-R3)');
  console.log('========================================================================');
  console.log(`Total handwritten repo source files (.ts/.tsx/.js/.jsx): ${allRepoRecords.length}`);
  console.log(`Total handwritten frontend src/ files:                   ${srcRecords.length}`);
  console.log(`Files > 1,000 lines (HARD FAIL GATE):                    ${over1000.length}`);
  console.log(`Files > 800 lines:                                       ${over800.length}`);
  console.log(`Files > 600 lines:                                       ${over600.length}`);
  console.log('------------------------------------------------------------------------');

  if (over1000.length > 0) {
    console.log('\n❌ [VIOLATIONS] Files exceeding 1,000 lines threshold:');
    for (const r of over1000) {
      console.log(
        `  ${r.lines.toString().padStart(5, ' ')} lines | [${r.fsdLayer.padEnd(18, ' ')}] | ${r.filePath}`
      );
    }
  }

  console.log('\nTOP 30 LARGEST HANDWRITTEN SOURCE FILES:');
  console.log('  Rank | Lines | FSD Layer          | File Path');
  console.log('  -----+-------+--------------------+---------------------------------------------------');
  for (let i = 0; i < Math.min(30, allRepoRecords.length); i++) {
    const r = allRepoRecords[i];
    const rank = (i + 1).toString().padStart(4, ' ');
    const lines = r.lines.toString().padStart(5, ' ');
    const layer = r.fsdLayer.padEnd(18, ' ');
    console.log(`  ${rank} | ${lines} | ${layer} | ${r.filePath}`);
  }
  console.log('========================================================================');

  if (over1000.length > 0) {
    console.error(`\nFAILED: Found ${over1000.length} file(s) exceeding 1,000 lines!`);
    process.exit(1);
  } else {
    console.log('\n✅ PASSED: Zero handwritten source files exceed 1,000 lines!');
    process.exit(0);
  }
}

runAudit();
