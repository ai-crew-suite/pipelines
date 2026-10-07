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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractBackstageVersion, extractLocalConfigSource } from '../extractor';
import { existsSync, readFileSync } from 'fs';

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn()
}));

describe('Workspace Asset Extractor Matrix (extractor.ts)', () => {
  const mockRoot = '/workspace';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractBackstageVersion', () => {
    it('should successfully parse a valid package.json configuration file containing dependencies', () => {
      vi.mocked(existsSync).mockImplementation((p: any) => p.endsWith('package.json'));
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        dependencies: { '@backstage/cli': '^0.25.1' }
      }));

      const version = extractBackstageVersion(mockRoot);
      expect(version).toBe('^0.25.1');
    });

    it('should locate versions registered under devDependencies cleanly', () => {
      vi.mocked(existsSync).mockImplementation((p: any) => p.endsWith('package.json'));
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        devDependencies: { '@backstage/cli': '0.24.0' }
      }));

      const version = extractBackstageVersion(mockRoot);
      expect(version).toBe('0.24.0');
    });

    it('should fall back to reading yarn.lock if package.json does not track the package and isolate index 1', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockImplementation((p: any) => {
        if (p.endsWith('package.json')) return '{}';
        if (p.endsWith('yarn.lock')) {
          return '"@backstage/cli@npm:^0.22.0":\n  version "0.22.0"';
        }
        return '';
      });

      const version = extractBackstageVersion(mockRoot);
      // Hardened Check: Must return the pure version string, not the regex match collection array layout
      expect(typeof version).toBe('string');
      expect(version).toBe('0.22.0');
    });

    it('should correctly select the top-most chronological entry when multiple versions appear inside yarn.lock tracking', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockImplementation((p: any) => {
        if (p.endsWith('package.json')) return '{}';
        if (p.endsWith('yarn.lock')) {
          return `
"@backstage/cli@^1.1.0":
  version "1.1.0"
"@backstage/cli@^2.4.0":
  version "2.4.0"
`;
        }
        return '';
      });

      const version = extractBackstageVersion(mockRoot);
      expect(version).toBe('1.1.0');
    });

    it('should fall back to yarn.lock if package.json contains corrupted JSON payloads', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockImplementation((p: any) => {
        if (p.endsWith('package.json')) return 'invalid-json-payload-syntax-drift';
        if (p.endsWith('yarn.lock')) {
          return '"@backstage/cli@^0.23.0":\n  version "0.23.0"';
        }
        return '';
      });

      const version = extractBackstageVersion(mockRoot);
      expect(version).toBe('0.23.0');
    });

    it('should return null gracefully if both files are missing or lack matching markers', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const version = extractBackstageVersion(mockRoot);
      expect(version).toBeNull();
    });
  });

  describe('extractLocalConfigSource', () => {
    it('should read and return file text if the target configuration index exists', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('export default { rules: {} };');

      const source = extractLocalConfigSource(mockRoot);
      expect(source).toBe('export default { rules: {} };');
    });
  });
});
