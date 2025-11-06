#!/usr/bin/env node
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
    } else {
      const fileStat = await stat(fullPath);
      files.push({
        path: fullPath,
        size: fileStat.size,
      });
    }
  }

  return files;
}

async function printBundleReport() {
  const projectRoot = process.cwd();
  const nextBuildDir = path.join(projectRoot, '.next');

  const targets = [
    { label: 'Chunks estáticos', dir: path.join(nextBuildDir, 'static/chunks') },
    { label: 'App Router (cliente)', dir: path.join(nextBuildDir, 'static/chunks/app') },
    { label: 'App Router (server)', dir: path.join(nextBuildDir, 'server/app') },
  ];

  console.log('\n📦  Bundle size report');

  for (const target of targets) {
    try {
      const files = await collectFiles(target.dir);
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      const topFiles = files
        .filter((file) => file.size > 0)
        .sort((a, b) => b.size - a.size)
        .slice(0, 5);

      console.log(`\n• ${target.label}`);
      console.log(`  Total: ${(totalSize / 1024).toFixed(2)} kB`);
      topFiles.forEach((file) => {
        const relativePath = path.relative(projectRoot, file.path);
        console.log(`  - ${(file.size / 1024).toFixed(2)} kB — ${relativePath}`);
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`\n• ${target.label}`);
        console.log('  (No generado aún. Ejecuta `next build` primero)');
      } else {
        console.error(`Error analizando ${target.label}:`, error);
      }
    }
  }
}

printBundleReport();
