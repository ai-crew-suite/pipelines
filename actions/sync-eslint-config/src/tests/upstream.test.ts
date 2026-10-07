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
import { fetchUrl, resolveUpstreamSource } from '../upstream';
import { warning } from '@actions/core';

vi.mock('@actions/core', () => ({
  warning: vi.fn()
}));

describe('Upstream Asset Resolution Network Matrix (upstream.ts)', () => {
  const globalFetchSpy = vi.spyOn(global, 'fetch');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalFetchSpy.mockReset();
  });

  describe('fetchUrl Utility', () => {
    it('should successfully read text stream buffers over smooth HTTP responses', async () => {
      globalFetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => 'console.log("eslint factory mock code");'
      } as Response);

      const result = await fetchUrl('https://githubusercontent.com');
      expect(result).toBe('console.log("eslint factory mock code");');
    });

    it('should capture connection faults and safely return null without throwing exceptions', async () => {
      globalFetchSpy.mockRejectedValueOnce(new Error('DNS resolution lookup failure'));

      const result = await fetchUrl('https://githubusercontent.com');
      expect(result).toBeNull();
      expect(warning).toHaveBeenCalled();
    });

    it('should return null cleanly if the server responds with a non-2xx status code block', async () => {
      globalFetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      const result = await fetchUrl('https://githubusercontent.com');
      expect(result).toBeNull();
    });
  });

  describe('resolveUpstreamSource Cascading Logic', () => {
    it('should cleanly pull from the primary explicit tag URL if it is active and resolved', async () => {
      globalFetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '/* Core Tag Factory Code */'
      } as Response);

      const source = await resolveUpstreamSource('1.24.3');

      expect(source).toBe('/* Core Tag Factory Code */');
      expect(globalFetchSpy).toHaveBeenCalledTimes(1);
    });

    it('should execute a cascading fallback download to the minor branch url if the specific tag hits a 404 text string', async () => {
      globalFetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '404: Not Found'
      } as Response);

      globalFetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '/* Minor Version Fallback Code */'
      } as Response);

      const source = await resolveUpstreamSource('1.24.3');

      expect(source).toBe('/* Minor Version Fallback Code */');
      expect(globalFetchSpy).toHaveBeenCalledTimes(2);
    });

    it('should cascade to the minor version tracking URL if the primary tag URL responds with an explicit server error status', async () => {
      // First call fails with an HTTP status error code rather than text messages
      globalFetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 502
      } as Response);

      globalFetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '/* Safe Gateway Fallback Code */'
      } as Response);

      const source = await resolveUpstreamSource('1.24.3');

      expect(source).toBe('/* Safe Gateway Fallback Code */');
      expect(globalFetchSpy).toHaveBeenCalledTimes(2);
    });

    it('should safely handle short, malformed, or primitive single-digit version inputs without array index panics', async () => {
      globalFetchSpy.mockResolvedValue({
        ok: true,
        text: async () => '/* Root Level Fallback */'
      } as Response);

      // Testing raw strings that lack dots like '1' or '0'
      await expect(resolveUpstreamSource('1')).resolves.not.toThrow();
      const source = await resolveUpstreamSource('1');
      expect(source).toBe('/* Root Level Fallback */');
    });

    it('should return null if both specific tags and minor version fallbacks are completely missing or non-parseable', async () => {
      globalFetchSpy.mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => '404: Not Found'
      } as Response);

      const source = await resolveUpstreamSource('1.24.3');
      expect(source).toBeNull();
    });
  });
});
