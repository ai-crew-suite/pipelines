/**
 * Copyright 2026 The AI Crew Suite Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { error } from '@actions/core';

const IGNORED_DIRECTORIES = new Set(['node_modules', 'dist', '.turbo', '.yarn']);

/**
 * Recursively scans directories to locate target package.json files.
 */
export function globPackageJsons(dir: string): string[] {
  let results: string[] = [];
  if (!existsSync(dir)) return results;

  try {
    const list = readdirSync(dir);
    for (const file of list) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);

      if (stat && stat.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(file)) {
          continue;
        }
        results = results.concat(globPackageJsons(filePath));
      } else if (file === 'package.json') {
        results.push(filePath);
      }
    }
  } catch (err: any) {
    error(`Security or OS read violation opening tree path: ${dir} - ${err.message}`);
  }
  return results;
}
