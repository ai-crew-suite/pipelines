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
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { askGithubLLM } from '../copilot';
import { warning } from '@actions/core';

vi.mock('@actions/core', () => ({
  warning: vi.fn()
}));

describe('GitHub Copilot AI Gateway Proxy Matrix (copilot.ts)', () => {
  const globalFetchSpy = vi.spyOn(global, 'fetch');
  const mockSystemToken = 'ghu_secret_enterprise_token_hash_stream';
  const mockPrompt = 'Compare configuration blocks example string';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalFetchSpy.mockReset();
  });

  it('should successfully orchestrate a full API lifecycle pass matching proxy tokens and valid array-nested completions', async () => {
    globalFetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'mock_copilot_session_bearer_token' })
    } as Response);

    globalFetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          { message: { content: '### Found Gaps:\n* Missing rule: `@backstage/no-forbidden-imports`' } }
        ]
      })
    } as Response);

    const result = await askGithubLLM(mockSystemToken, mockPrompt);

    expect(result).toContain('Missing rule: `@backstage/no-forbidden-imports`');
    expect(globalFetchSpy).toHaveBeenCalledTimes(2);

    const secondCall = globalFetchSpy.mock.calls[1];
    const completionsConfig = secondCall?.[1] as RequestInit | undefined;
    const headers = completionsConfig?.headers as Record<string, string> | undefined;

    expect(headers?.['Authorization']).toBe('Bearer mock_copilot_session_bearer_token');
  });

  it('should abort cleanly, report errors, and strictly defend tokens against output log leakage during connection faults', async () => {
    globalFetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    } as Response);

    const result = await askGithubLLM(mockSystemToken, mockPrompt);

    expect(result).toContain('Could not generate AI analysis');
    expect(warning).toHaveBeenCalled();

    const warningMessage = vi.mocked(warning).mock.calls[0]?.[0];
    expect(warningMessage).not.toContain(mockSystemToken);
  });

  it('should gracefully handle empty arrays or missing choices payloads returned by the AI completions engine', async () => {
    globalFetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'valid_mock_token' })
    } as Response);

    globalFetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [] })
    } as Response);

    const result = await askGithubLLM(mockSystemToken, mockPrompt);
    expect(result).toContain('Empty response from AI engine');
  });
});
