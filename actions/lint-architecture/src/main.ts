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
import { setFailed, error, info } from '@actions/core';
import { existsSync, readFileSync } from 'fs';
import { join, relative, dirname } from 'path';
import { globPackageJsons } from './fs-utils';
import { validatePackage } from './validator';
import { safeJsonParse } from './security';
import { SCOPE } from './namer';

/**
 * Runtime execution orchestration entrypoint.
 */
export function run(): void {
  let exitCode = 0;
  const rootPlugins = join(process.cwd(), 'plugins');

  if (!existsSync(rootPlugins)) {
    setFailed("❌ Infrastructure Constraint Violation: Context script must run from monorepo base root.");
    return;
  }

  info(`Validating architecture compliance vectors for organizational scope: ${SCOPE}...\n`);
  const packageJsons = globPackageJsons(rootPlugins);

  for (const pJson of packageJsons) {
    const { isValid, result } = validatePackage(pJson);

    if (!isValid) {
      exitCode = 1;
      const relLocation = relative(process.cwd(), dirname(pJson));
      error("❌ Compliance Rule Breach Discovered!");
      error(`  Location: ${relLocation}`);

      if (result && result.startsWith(SCOPE)) {
        let foundName = "Corrupt / Unknown Configuration";
        try {
          const pkg = safeJsonParse(readFileSync(pJson, 'utf8'));
          foundName = pkg?.name || "Unknown";
        } catch {}
        error(`  Identified Layout Name: "${foundName}"`);
        error(`  Mandated Domain Name  : "${result}"\n`);
      } else {
        error(`  Failure Rationale: ${result}\n`);
      }
    }
  }

  if (exitCode === 0) {
    info("✅ Verification Complete: Internal namespaces conform to policy maps.");
  } else {
    setFailed("❌ Build Halted: Enterprise structural schema rules mismatched.");
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  run();
}
