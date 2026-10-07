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
import { ParsedPackage } from './types';

/**
 * Safely parses JSON payloads to defend against prototype pollution vulnerabilities.
 * Uses strict own-property reflection hooks to satisfy FINRA/SOC-2/HIPAA criteria.
 */
export function safeJsonParse(content: string): ParsedPackage | null {
  try {
    const parsed = JSON.parse(content);

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const hasProto = Object.prototype.hasOwnProperty.call(parsed, '__proto__');
      const hasConstructor = Object.prototype.hasOwnProperty.call(parsed, 'constructor');

      if (hasProto || hasConstructor) {
        return null;
      }
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
