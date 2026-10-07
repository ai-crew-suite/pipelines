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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validatePackage } from '../validator';
import { readFileSync } from 'fs';
import { resolve, sep } from 'path';

/**
 * Cross-platform path generation array stitching utility
 */
function joinPaths(...parts: string[]): string {
  return parts.join(sep);
}

// Mock the core fs module completely to prevent local file reads
vi.mock('fs', () => ({
  readFileSync: vi.fn()
}));

describe('Integrated Workspace Package Policy Validation (SOC-2 Compliance Tracks)', () => {

  const workingDir = process.cwd();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process, 'cwd').mockReturnValue(workingDir);
  });

  describe('Path Traversal & Boundary Safety Controls', () => {
    it('should catch and gracefully fail path traversal attempts leaking outside the monorepo root', () => {
      const dangerousPath = resolve(workingDir, `..${sep}..${sep}etc${sep}passwd`);
      vi.mocked(readFileSync).mockReturnValue('{"name": "@ai-crew-suite/core-backend"}');

      const result = validatePackage(dangerousPath);

      expect(result.isValid).toBe(false);
      expect(result.result).toContain('Path traversal attempt identified');
    });
  });

  describe('Unscoped and External Third-Party Boundary Logic', () => {
    it('should completely ignore unscoped packages or external libraries', () => {
      const mockPath = joinPaths(workingDir, 'plugins', 'core', 'backend', 'package.json');
      vi.mocked(readFileSync).mockReturnValue('{"name": "lodash", "version": "4.17.21"}');

      const result = validatePackage(mockPath);
      expect(result.isValid).toBe(true);
      expect(result.result).toBeNull();
    });

    it('should completely ignore packages scoped to alternative enterprise boundaries', () => {
      const mockPath = joinPaths(workingDir, 'plugins', 'core', 'backend', 'package.json');
      vi.mocked(readFileSync).mockReturnValue('{"name": "@external-scope/core-utility"}');

      const result = validatePackage(mockPath);
      expect(result.isValid).toBe(true);
      expect(result.result).toBeNull();
    });
  });

  describe('Core, Agent, and Tool Structural Configuration Layout Verification', () => {
    it('should pass matching core structural layouts', () => {
      const mockPath = joinPaths(workingDir, 'plugins', 'core', 'backend', 'package.json');
      vi.mocked(readFileSync).mockReturnValue('{"name": "@ai-crew-suite/core-backend"}');

      const result = validatePackage(mockPath);
      expect(result.isValid).toBe(true);
      expect(result.result).toBeNull();
    });

    it('should reject mismatched core architectural layouts and supply the mandated naming fix', () => {
      const mockPath = joinPaths(workingDir, 'plugins', 'core', 'backend', 'package.json');
      vi.mocked(readFileSync).mockReturnValue('{"name": "@ai-crew-suite/incorrect-name-drift"}');

      const result = validatePackage(mockPath);
      expect(result.isValid).toBe(false);
      expect(result.result).toBe('@ai-crew-suite/core-backend');
    });

    it('should securely process and pass deep infrastructural core segments', () => {
      const mockPath = joinPaths(workingDir, 'plugins', 'core', 'infra', 'database', 'postgres', 'package.json');
      vi.mocked(readFileSync).mockReturnValue('{"name": "@ai-crew-suite/infra-database-postgres"}');

      const result = validatePackage(mockPath);
      expect(result.isValid).toBe(true);
      expect(result.result).toBeNull();
    });

    it('should process and validate structured domain agents accurately', () => {
      const mockPath = joinPaths(workingDir, 'plugins', 'agents', 'finance', 'compliance', 'package.json');
      vi.mocked(readFileSync).mockReturnValue('{"name": "@ai-crew-suite/agent-finance-compliance"}');

      const result = validatePackage(mockPath);
      expect(result.isValid).toBe(true);
      expect(result.result).toBeNull();
    });

    it('should process and validate formal tool-to-provider mappings seamlessly', () => {
      const mockPath = joinPaths(workingDir, 'plugins', 'tools', 'messaging', 'slack', 'package.json');
      vi.mocked(readFileSync).mockReturnValue('{"name": "@ai-crew-suite/tool-messaging-slack"}');

      const result = validatePackage(mockPath);
      expect(result.isValid).toBe(true);
      expect(result.result).toBeNull();
    });

    it('should handle deep path nestings smoothly and verify correctly based on top segments', () => {
      const mockPath = joinPaths(workingDir, 'plugins', 'tools', 'messaging', 'slack', 'src', 'fixtures', 'package.json');
      vi.mocked(readFileSync).mockReturnValue('{"name": "@ai-crew-suite/tool-messaging-slack"}');

      const result = validatePackage(mockPath);
      expect(result.isValid).toBe(true);
      expect(result.result).toBeNull();
    });
  });

  describe('Data Integrity Fault, Structure Omissions and Injection Handling', () => {
    it('should report a systematic fault mapping result if file content data is corrupted', () => {
      const mockPath = joinPaths(workingDir, 'plugins', 'core', 'backend', 'package.json');
      vi.mocked(readFileSync).mockReturnValue('invalid-corrupted-raw-string-data');

      const result = validatePackage(mockPath);
      expect(result.isValid).toBe(false);
      expect(result.result).toContain('System lifecycle read fault');
    });

    it('should handle packages that completely omit the name key property gracefully', () => {
      const mockPath = joinPaths(workingDir, 'plugins', 'core', 'backend', 'package.json');
      vi.mocked(readFileSync).mockReturnValue('{"version": "1.0.0", "private": true}');

      const result = validatePackage(mockPath);
      expect(result.isValid).toBe(true);
      expect(result.result).toBeNull();
    });

    it('should reject primitive JSON streams that do not construct a standard dictionary object structure', () => {
      const mockPath = joinPaths(workingDir, 'plugins', 'core', 'backend', 'package.json');
      vi.mocked(readFileSync).mockReturnValue('"valid-json-but-is-a-string-primitive"');

      const result = validatePackage(mockPath);
      expect(result.isValid).toBe(false);
      expect(result.result).toContain('System lifecycle read fault');
    });

    it('should drop execution tracking seamlessly and flag a configuration failure if a prototype pollution package payload is detected', () => {
      const mockPath = joinPaths(workingDir, 'plugins', 'core', 'backend', 'package.json');
      vi.mocked(readFileSync).mockReturnValue('{"name": "@ai-crew-suite/core-backend", "__proto__": {"polluted": true}}');

      const result = validatePackage(mockPath);

      expect(result.isValid).toBe(false);
      expect(result.result).toContain('System lifecycle read fault');
    });
  });

});
