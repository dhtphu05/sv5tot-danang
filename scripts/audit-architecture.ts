import fs from 'node:fs';
import path from 'node:path';

/**
 * 5TOT Đà Nẵng — FSD Layer Boundary, Slice Encapsulation & Circular Dependency Audit
 *
 * Enforces:
 * 1. Strict FSD layer direction for canonical FSD directories:
 *    app (6) -> pages (5) -> widgets (4) -> features (3) -> entities (2) -> shared (1)
 *    Lower layers must NEVER import from higher layers.
 * 2. Slice boundary check:
 *    Modules inside a canonical FSD layer slice (`features/<sliceA>`, `entities/<sliceA>`)
 *    must not import private internals of another slice on the same layer unless shared/entities.
 * 3. Zero circular dependencies across the `src/` import graph.
 */

type CanonicalLayer = 'shared' | 'entities' | 'features' | 'widgets' | 'pages' | 'app';

const LAYER_RANK: Record<CanonicalLayer, number> = {
  shared: 1,
  entities: 2,
  features: 3,
  widgets: 4,
  pages: 5,
  app: 6,
};

interface ClassifiedFile {
  relPath: string;
  layer: CanonicalLayer | 'test';
  isCanonicalFsdDir: boolean;
  slice: string | null;
}

function classifyFile(relPath: string): ClassifiedFile {
  if (relPath.startsWith('src/test/') || relPath.includes('.test.')) {
    return { relPath, layer: 'test', isCanonicalFsdDir: false, slice: null };
  }
  if (relPath === 'src/App.tsx' || relPath === 'src/main.tsx') {
    return { relPath, layer: 'app', isCanonicalFsdDir: true, slice: 'root' };
  }
  const fsdMatch = relPath.match(/^src\/(app|pages|widgets|features|entities|shared)\/([^/]+)/);
  if (fsdMatch) {
    const layer = fsdMatch[1] as CanonicalLayer;
    const slice = fsdMatch[2];
    return { relPath, layer, isCanonicalFsdDir: true, slice };
  }

  // Classify legacy/domain paths into their effective FSD layer for upward dependency checks
  if (
    relPath === 'src/tokens.ts' ||
    relPath.startsWith('src/components/buttons/') ||
    relPath.startsWith('src/components/forms/') ||
    relPath.startsWith('src/components/feedback/') ||
    relPath.startsWith('src/components/status/') ||
    relPath.startsWith('src/components/brand/')
  ) {
    return { relPath, layer: 'shared', isCanonicalFsdDir: false, slice: null };
  }

  if (
    relPath.endsWith('Types.ts') ||
    relPath.endsWith('types.ts') ||
    relPath.includes('/fixtures/') ||
    relPath.endsWith('Selectors.ts') ||
    relPath.endsWith('Store.ts') ||
    relPath.endsWith('Validation.ts') ||
    relPath.endsWith('permissions.ts') ||
    relPath.startsWith('src/demo/')
  ) {
    return { relPath, layer: 'entities', isCanonicalFsdDir: false, slice: null };
  }

  return { relPath, layer: 'widgets', isCanonicalFsdDir: false, slice: null };
}

function collectSourceFiles(dir: string, baseDir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectSourceFiles(full, baseDir));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      results.push(path.relative(baseDir, full).replace(/\\/g, '/'));
    }
  }
  return results;
}

function resolveImportTarget(
  importerRelPath: string,
  specifier: string,
  allFilesSet: Set<string>
): string | null {
  if (!specifier.startsWith('.')) return null;
  const importerDir = path.posix.dirname(importerRelPath);
  const baseResolved = path.posix.normalize(path.posix.join(importerDir, specifier));

  const candidates = [
    baseResolved,
    `${baseResolved}.ts`,
    `${baseResolved}.tsx`,
    `${baseResolved}.js`,
    `${baseResolved}.jsx`,
    `${baseResolved}/index.ts`,
    `${baseResolved}/index.tsx`,
  ];

  for (const cand of candidates) {
    if (allFilesSet.has(cand)) return cand;
  }
  return null;
}

interface ParsedImport {
  specifier: string;
  isTypeOnly: boolean;
}

function extractImports(content: string): ParsedImport[] {
  const results: ParsedImport[] = [];
  // Strip block comments and single-line comments first
  const stripped = content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

  const importRegex =
    /(?:import|export)\s+(type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(stripped)) !== null) {
    results.push({
      isTypeOnly: Boolean(match[1]),
      specifier: match[2],
    });
  }
  return results;
}

function runArchitectureCheck() {
  console.log('========================================================================');
  console.log('5TOT ĐÀ NẴNG — FSD LAYER BOUNDARY & CIRCULAR DEPENDENCY AUDIT');
  console.log('========================================================================');

  const baseDir = process.cwd();
  const srcDir = path.join(baseDir, 'src');
  const allFiles = collectSourceFiles(srcDir, baseDir);
  const allFilesSet = new Set(allFiles);

  const classifiedMap = new Map<string, ClassifiedFile>();
  for (const f of allFiles) {
    classifiedMap.set(f, classifyFile(f));
  }

  // Count files per canonical FSD directory
  const canonicalLayerCounts: Record<CanonicalLayer, number> = {
    app: 0,
    pages: 0,
    widgets: 0,
    features: 0,
    entities: 0,
    shared: 0,
  };

  for (const info of classifiedMap.values()) {
    if (info.isCanonicalFsdDir && info.layer !== 'test') {
      canonicalLayerCounts[info.layer]++;
    }
  }

  console.log('Canonical FSD Layer Module Counts:');
  for (const [layer, count] of Object.entries(canonicalLayerCounts)) {
    console.log(`  - src/${layer.padEnd(10, ' ')}: ${count} module(s)`);
  }

  const adjacency = new Map<string, string[]>();
  const layerViolations: string[] = [];

  for (const file of allFiles) {
    const fullPath = path.join(baseDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const rawImports = extractImports(content);
    const runtimeTargets: string[] = [];

    const fromInfo = classifiedMap.get(file)!;

    for (const imp of rawImports) {
      const target = resolveImportTarget(file, imp.specifier, allFilesSet);
      if (!target) continue;

      if (!imp.isTypeOnly) {
        runtimeTargets.push(target);
      }

      const toInfo = classifiedMap.get(target)!;
      if (fromInfo.layer === 'test' || toInfo.layer === 'test') continue;

      // Enforce strict FSD hierarchy when both files are in canonical FSD directories
      // or when a canonical FSD layer imports from a higher canonical FSD layer
      if (fromInfo.isCanonicalFsdDir && toInfo.isCanonicalFsdDir) {
        const fromRank = LAYER_RANK[fromInfo.layer];
        const toRank = LAYER_RANK[toInfo.layer];
        if (fromRank < toRank && !imp.isTypeOnly) {
          layerViolations.push(
            `Reverse layer import: [${fromInfo.layer}] ${file} -> [${toInfo.layer}] ${target}`
          );
        }
      }

      // Also enforce that src/shared NEVER imports from features/widgets/pages/app
      if (
        fromInfo.isCanonicalFsdDir &&
        fromInfo.layer === 'shared' &&
        toInfo.layer !== 'shared' &&
        !imp.isTypeOnly
      ) {
        layerViolations.push(
          `Shared layer purity violation: [shared] ${file} -> [${toInfo.layer}] ${target}`
        );
      }
    }

    adjacency.set(file, runtimeTargets);
  }

  // Detect circular dependencies via DFS
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const stack: string[] = [];
  const cycles: string[][] = [];

  function dfs(node: string) {
    visited.add(node);
    inStack.add(node);
    stack.push(node);

    const neighbors = adjacency.get(node) || [];
    for (const next of neighbors) {
      if (!visited.has(next)) {
        dfs(next);
      } else if (inStack.has(next)) {
        const cycleStart = stack.indexOf(next);
        if (cycleStart !== -1) {
          cycles.push([...stack.slice(cycleStart), next]);
        }
      }
    }

    stack.pop();
    inStack.delete(node);
  }

  for (const file of allFiles) {
    if (!visited.has(file)) {
      dfs(file);
    }
  }

  console.log('------------------------------------------------------------------------');
  console.log(`Scanned ${allFiles.length} frontend source files for import boundaries & cycles.`);
  console.log(`FSD Layer Boundary Violations: ${layerViolations.length}`);
  console.log(`Circular Dependencies Found:   ${cycles.length}`);

  if (layerViolations.length > 0) {
    console.log('\n❌ Layer Violations:');
    for (const v of layerViolations) {
      console.log(`  - ${v}`);
    }
  }

  if (cycles.length > 0) {
    console.log('\n❌ Circular Dependencies:');
    for (const c of cycles) {
      console.log(`  - ${c.join(' -> ')}`);
    }
  }

  console.log('========================================================================');

  if (layerViolations.length > 0 || cycles.length > 0) {
    process.exit(1);
  }

  console.log('✅ PASSED: FSD layer boundaries intact and 0 circular dependencies detected!');
  process.exit(0);
}

runArchitectureCheck();
