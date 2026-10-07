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
import { readFileSync } from 'fs';
import { dirname, resolve, relative, sep } from 'path';
import { ValidationResult } from './types';
import { safeJsonParse } from './security';
import { resolveExpectedName, SCOPE } from './namer';

/**
 * Evaluates a workspace package layout against regulatory structure policies.
 */
export function validatePackage(packageJsonPath: string): ValidationResult {
  try {
    const workingDir = process.cwd();
    const absolutePath = resolve(packageJsonPath);

    // 1. Path Traversal Mitigation Guard
    if (!absolutePath.startsWith(workingDir)) {
      return {
        isValid: false,
        result: `Path traversal attempt identified: ${packageJsonPath} falls outside root constraints.`
      };
    }

    const relPath = relative(workingDir, dirname(absolutePath));
    const segments = relPath.split(sep);

    const content = readFileSync(packageJsonPath, 'utf8');
    const pkg = safeJsonParse(content);

    // 2. Data Integrity Exception Guard
    if (pkg === null) {
      // If parsing fails but the path points directly to a managed plugin subfolder, it is a critical format violation or exploit block
      if (segments.length >= 2 && segments[0] === 'plugins') {
        return {
          isValid: false,
          result: 'System lifecycle read fault: Target configuration payload text is corrupted or contains syntax flaws.'
        };
      }
      // Otherwise, assume it's an unrelated file outside tracking boundaries
      return { isValid: true, result: null };
    }

    // 3. Organizational Scope Check
    if (!pkg.name || !pkg.name.startsWith(`${SCOPE}/`)) {
      return { isValid: true, result: null };
    }

    // 4. Structural Schema Topology Validation
    const expectedName = resolveExpectedName(segments);

    if (expectedName && pkg.name !== expectedName) {
      return { isValid: false, result: expectedName };
    }

    return { isValid: true, result: null };
  } catch (err: any) {
    return { isValid: false, result: `System lifecycle read fault: ${err.message}` };
  }
}
