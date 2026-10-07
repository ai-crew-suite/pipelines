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
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import * as core from '@actions/core';
import { findSuccessForSha, run } from '../main';

vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  setFailed: vi.fn(),
}));

const mockListWorkflowRuns = vi.fn();
vi.mock('@actions/github', () => ({
  context: {
    repo: {
      owner: 'ai-crew-suite',
      repo: 'actions',
    },
  },
  getOctokit: vi.fn().mockImplementation(() => ({
    rest: {
      actions: {
        listWorkflowRuns: mockListWorkflowRuns,
      },
    },
  })),
}));

describe('Playwright Deployment Gatekeeper Tests (Compliance & Security Matrix)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Section 1: Logic Engine Mapping Rules', () => {
    test('🎯 findSuccessForSha matches target SHAs and verifies the latest run conclusion state', () => {
      const mockRuns = [
        { head_sha: 'target-sha', conclusion: 'success' },
        { head_sha: 'target-sha', conclusion: 'failure' },
        { head_sha: 'other-sha', conclusion: 'success' },
      ];

      expect(findSuccessForSha(mockRuns, 'target-sha')).toBe(true);
      expect(findSuccessForSha(mockRuns, 'other-sha')).toBe(true);
      expect(findSuccessForSha(mockRuns, 'missing-sha')).toBe(false);
    });

    test('🛡️ findSuccessForSha filters out null, undefined, or empty objects from API feeds safely', () => {
      // ✅ Fix verification: Array contains poisoned payloads to replicate unexpected API responses
      const corruptedRuns = [
        null,
        undefined,
        {},
        { head_sha: 'target-sha', conclusion: 'success' }
      ];

      expect(() => findSuccessForSha(corruptedRuns, 'target-sha')).not.toThrow();
      expect(findSuccessForSha(corruptedRuns, 'target-sha')).toBe(true);
    });
  });

  describe('Section 2: Active Runtime Environment Integration Tracks', () => {
    test('✅ Successful workflow run match executes without throwing pipeline failures', async () => {
      vi.mocked(core.getInput).mockImplementation((name: string) => {
        if (name === 'github_token') return 'mock-token';
        if (name === 'expected_sha') return 'target-sha-123';
        if (name === 'pre_release_bypass') return 'false';
        return '';
      });

      mockListWorkflowRuns.mockResolvedValue({
        data: {
          workflow_runs: [{ head_sha: 'target-sha-123', conclusion: 'success' }],
        },
      });

      await run();

      expect(core.info).toHaveBeenCalledWith(expect.stringContaining('Playwright succeeded for this SHA'));
      expect(core.setFailed).not.toHaveBeenCalled();
    });

    test('⚠️ Should permit deployments and log warnings if pre_release_bypass is explicitly toggled true', async () => {
      vi.mocked(core.getInput).mockImplementation((name: string) => {
        if (name === 'github_token') return 'mock-token';
        if (name === 'expected_sha') return 'target-sha-123';
        if (name === 'pre_release_bypass') return 'true';
        return '';
      });

      mockListWorkflowRuns.mockResolvedValue({
        data: {
          workflow_runs: [{ head_sha: 'target-sha-123', conclusion: 'failure' }],
        },
      });

      await run();

      expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('[EARLY DEVELOPMENT BYPASS]'));
      expect(core.setFailed).not.toHaveBeenCalled();
    });

    test('🔠 Should handle mixed-case strings for bypass inputs gracefully without tripping failures', async () => {
      vi.mocked(core.getInput).mockImplementation((name: string) => {
        if (name === 'github_token') return 'mock-token';
        if (name === 'expected_sha') return 'target-sha-123';
        if (name === 'pre_release_bypass') return 'TrUe'; // Mixed case serialization
        return '';
      });

      mockListWorkflowRuns.mockResolvedValue({
        data: {
          workflow_runs: [{ head_sha: 'target-sha-123', conclusion: 'failure' }],
        },
      });

      await run();

      expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('[EARLY DEVELOPMENT BYPASS]'));
      expect(core.setFailed).not.toHaveBeenCalled();
    });

    test('❌ Should enforce a hard gate abort error if Playwright fails and pre_release_bypass is turned off', async () => {
      vi.mocked(core.getInput).mockImplementation((name: string) => {
        if (name === 'github_token') return 'mock-token';
        if (name === 'expected_sha') return 'target-sha-123';
        if (name === 'pre_release_bypass') return 'false';
        return '';
      });

      mockListWorkflowRuns.mockResolvedValue({
        data: {
          workflow_runs: [{ head_sha: 'target-sha-123', conclusion: 'failure' }],
        },
      });

      await run();

      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining('Playwright has not completed successfully for SHA target-sha-123; aborting deploy')
      );
    });

    test('❌ Should trigger a failure track if the workflow execution array returns completely empty records', async () => {
      vi.mocked(core.getInput).mockImplementation((name: string) => {
        if (name === 'github_token') return 'mock-token';
        if (name === 'expected_sha') return 'target-sha-123';
        if (name === 'pre_release_bypass') return 'false';
        return '';
      });

      mockListWorkflowRuns.mockResolvedValue({
        data: {
          workflow_runs: [],
        },
      });

      await run();

      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining('Playwright has not completed successfully')
      );
    });
  });

  describe('Section 3: System Resilience & Robust Network Catching', () => {
    test('❌ Upstream API network crashes throw standard failure catch blocks', async () => {
      vi.mocked(core.getInput).mockImplementation((name: string) => {
        if (name === 'github_token') return 'mock-token';
        if (name === 'expected_sha') return 'target-sha-123';
        return '';
      });

      mockListWorkflowRuns.mockRejectedValue(new Error('GitHub API rate limit exceeded (403)'));

      await run();

      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining('Guardrail Execution Failure: GitHub API rate limit exceeded')
      );
    });
  });
});
