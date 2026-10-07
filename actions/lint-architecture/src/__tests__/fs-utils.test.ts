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
import { globPackageJsons } from '../fs-utils';
import { existsSync, readdirSync, statSync } from 'fs';

// Mock the native 'fs' module completely to run entirely in-memory
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  statSync: vi.fn()
}));

describe('Filesystem Crawling Isolation Verification (SOC-2 Availability Framework)', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Core Base & Branch Boundary Controls', () => {
    it('should immediately return an empty array if the target root plugins path does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const result = globPackageJsons('/fake/root/plugins');
      expect(result).toEqual([]);
      expect(existsSync).toHaveBeenCalledWith('/fake/root/plugins');
    });

    it('should successfully locate a package.json file at the immediate root level', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdirSync).mockReturnValue(['package.json'] as any);
      vi.mocked(statSync).mockReturnValue({ isDirectory: () => false } as any);

      const result = globPackageJsons('/plugins');
      expect(result).toEqual(['/plugins/package.json']);
    });

    it('should recursively cascade down valid directories and ignore strictly blacklisted dependencies', () => {
      vi.mocked(existsSync).mockReturnValue(true);

      vi.mocked(readdirSync).mockImplementationOnce(() => ['core', 'node_modules', '.yarn'] as any);
      vi.mocked(readdirSync).mockImplementationOnce(() => ['package.json'] as any);

      vi.mocked(statSync).mockImplementation((filePath: any) => {
        if (filePath === '/plugins/core' || filePath === '/plugins/node_modules' || filePath === '/plugins/.yarn') {
          return { isDirectory: () => true } as any;
        }
        return { isDirectory: () => false } as any;
      });

      const result = globPackageJsons('/plugins');

      expect(result).toEqual(['/plugins/core/package.json']);
      expect(readdirSync).not.toHaveBeenCalledWith('/plugins/node_modules');
      expect(readdirSync).not.toHaveBeenCalledWith('/plugins/.yarn');
    });
  });

  describe('Regulated Edge Cases & Asset Filtering', () => {
    it('should handle completely empty subdirectories gracefully without appending empty states', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdirSync).mockImplementationOnce(() => ['empty-dir'] as any);
      vi.mocked(readdirSync).mockImplementationOnce(() => [] as any); // Empty folder returns no content array

      vi.mocked(statSync).mockImplementation((filePath: any) => {
        return { isDirectory: () => filePath === '/plugins/empty-dir' } as any;
      });

      const result = globPackageJsons('/plugins');
      expect(result).toEqual([]);
    });

    it('should parse but filter out unrelated plain text files or internal system logs', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdirSync).mockReturnValue(['README.md', '.DS_Store', 'package.json'] as any);
      vi.mocked(statSync).mockReturnValue({ isDirectory: () => false } as any);

      const result = globPackageJsons('/plugins');
      expect(result).toEqual(['/plugins/package.json']); // Only package.json should remain mapped
    });
  });

  describe('Exception Trapping & Partial Failure Resilience', () => {
    it('should handle standalone operating system filesystem read errors gracefully without throwing pipeline panics', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdirSync).mockImplementation(() => {
        throw new Error('EACCES: permission denied, open /plugins/secure-vault');
      });

      expect(() => globPackageJsons('/plugins')).not.toThrow();
      const result = globPackageJsons('/plugins');
      expect(result).toEqual([]);
    });

    it('should isolate failures inside a corrupt directory but continue identifying valid elements elsewhere', () => {
      vi.mocked(existsSync).mockReturnValue(true);

      // Root level has a healthy core directory and a locked infrastructure vault folder
      vi.mocked(readdirSync).mockImplementationOnce(() => ['core', 'locked-vault'] as any);

      // Executing readdir on core gives a package.json, while the vault blows up
      vi.mocked(readdirSync).mockImplementationOnce(() => ['package.json'] as any);
      vi.mocked(readdirSync).mockImplementationOnce(() => {
        throw new Error('EBUSY: resource busy or locked /plugins/locked-vault');
      });

      vi.mocked(statSync).mockImplementation((filePath: any) => {
        if (filePath === '/plugins/core' || filePath === '/plugins/locked-vault') {
          return { isDirectory: () => true } as any;
        }
        return { isDirectory: () => false } as any;
      });

      // Blast radius control validation check
      const result = globPackageJsons('/plugins');
      expect(result).toEqual(['/plugins/core/package.json']);
    });
  });

});
