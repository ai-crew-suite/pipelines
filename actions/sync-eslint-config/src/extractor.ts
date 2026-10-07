/**
 * Copyright 2026 The AI Crew Suite Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://apache.org
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Inspects package.json dependencies and yarn.lock strings to find active framework versions.
 */
export function extractBackstageVersion(workspaceRoot: string): string | null {
  const packageJsonPath = resolve(workspaceRoot, 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['@backstage/cli']) {
        return deps['@backstage/cli'];
      }
    } catch {
      // Gracefully fall through to lockfile evaluation if package.json parsing fails
    }
  }

  const lockfilePath = resolve(workspaceRoot, 'yarn.lock');
  if (existsSync(lockfilePath)) {
    const lockfileContent = readFileSync(lockfilePath, 'utf8');
    const lockMatch = lockfileContent.match(/"?@backstage\/cli@.*[\s\S]*?version "([^"]+)"/);
    if (lockMatch) {
      return lockMatch[1] || null;
    }
  }

  return null;
}

/**
 * Safely reads the local configuration profile asset payload.
 */
export function extractLocalConfigSource(workspaceRoot: string): string {
  const localConfigPath = resolve(workspaceRoot, 'packages/config-eslint/src/index.ts');
  if (existsSync(localConfigPath)) {
    return readFileSync(localConfigPath, 'utf8');
  }
  return '';
}
