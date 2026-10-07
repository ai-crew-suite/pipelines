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
import { run } from '../main';
import { globPackageJsons } from '../fs-utils';
import { validatePackage } from '../validator';
import { setFailed, error, info } from '@actions/core';
import { existsSync, readFileSync } from 'fs';

vi.mock('../fs-utils', () => ({ globPackageJsons: vi.fn() }));
vi.mock('../validator', () => ({ validatePackage: vi.fn() }));
vi.mock('@actions/core', () => ({ info: vi.fn(), error: vi.fn(), setFailed: vi.fn() }));
vi.mock('fs', () => ({ existsSync: vi.fn(), readFileSync: vi.fn() }));

describe('GitHub Action Runtime Integration Matrix (main.ts Audit Track)', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Boundary Conditions', () => {
    it('should immediately fail the pipeline run if executed outside a valid monorepo path template root', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      run();

      expect(setFailed).toHaveBeenCalledWith(
        expect.stringContaining('Infrastructure Constraint Violation')
      );
      expect(globPackageJsons).not.toHaveBeenCalled();
    });

    it('should completely succeed and issue a success message when all scanned workspaces pass configuration mapping', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(globPackageJsons).mockReturnValue([
        '/plugins/core/backend/package.json',
        '/plugins/tools/messaging/slack/package.json'
      ]);
      vi.mocked(validatePackage).mockReturnValue({ isValid: true, result: null });

      run();

      expect(info).toHaveBeenCalledWith(expect.stringContaining('Validating architecture compliance'));
      expect(info).toHaveBeenCalledWith(expect.stringContaining('Verification Complete'));
      expect(error).not.toHaveBeenCalled();
      expect(setFailed).not.toHaveBeenCalled();
    });
  });

  describe('Mixed Payload Aggregation & Failure Isolation', () => {
    it('should aggregate all compliance breaches, print granular diagnostics, and halt the build if drift is found', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(globPackageJsons).mockReturnValue(['/plugins/core/backend/package.json']);
      vi.mocked(validatePackage).mockReturnValue({ isValid: false, result: '@ai-crew-suite/core-backend' });
      vi.mocked(readFileSync).mockReturnValue('{"name": "@ai-crew-suite/drifted-name"}');

      run();

      expect(error).toHaveBeenCalledWith(expect.stringContaining('Compliance Rule Breach Discovered'));
      expect(setFailed).toHaveBeenCalledWith(
        expect.stringContaining('Build Halted: Enterprise structural schema rules mismatched')
      );
    });

    it('should correctly trigger a pipeline failure if a mixed scan contains both valid and invalid internal packages', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(globPackageJsons).mockReturnValue([
        '/plugins/core/clean-package/package.json',
        '/plugins/tools/broken-package/package.json'
      ]);

      vi.mocked(validatePackage)
        .mockReturnValueOnce({ isValid: true, result: null })
        .mockReturnValueOnce({ isValid: false, result: '@ai-crew-suite/tool-broken' });
      vi.mocked(readFileSync).mockReturnValue('{"name": "@ai-crew-suite/drifted-tool"}');

      run();

      expect(error).toHaveBeenCalledWith(expect.stringContaining('Compliance Rule Breach Discovered'));
      expect(setFailed).toHaveBeenCalledWith(
        expect.stringContaining('Build Halted: Enterprise structural schema rules mismatched')
      );
    });

    it('should pass cleanly if a mixed scan contains a clean internal package and an ignored third-party element', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(globPackageJsons).mockReturnValue([
        '/plugins/core/clean-package/package.json',
        '/plugins/tools/third-party-vendor/package.json'
      ]);

      vi.mocked(validatePackage).mockReturnValue({ isValid: true, result: null });

      run();

      expect(info).toHaveBeenCalledWith(expect.stringContaining('Verification Complete'));
      expect(error).not.toHaveBeenCalled();
      expect(setFailed).not.toHaveBeenCalled();
    });
  });

  describe('Robust Logging Diagnostics & Fallbacks', () => {
    it('should fall back to safe error messages if reading the non-parseable configuration file crashes during reporting cascades', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(globPackageJsons).mockReturnValue(['/plugins/core/broken/package.json']);
      vi.mocked(validatePackage).mockReturnValue({ isValid: false, result: '@ai-crew-suite/core-broken' });

      // Simulate file systems locking up or corrupting right as the reporter loops over the files
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('EIO: i/o error, read');
      });

      run();

      // The pipeline must trap the deep internal logging crash, print a safe fallback label, and cleanly fail the run
      expect(error).toHaveBeenCalledWith(expect.stringContaining('Identified Layout Name: "Corrupt / Unknown Configuration"'));
      expect(setFailed).toHaveBeenCalledWith(
        expect.stringContaining('Build Halted: Enterprise structural schema rules mismatched')
      );
    });
  });

});
