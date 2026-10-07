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
import { extractBackstageVersion, extractLocalConfigSource } from '../extractor';
import { resolveUpstreamSource } from '../upstream';
import { askGithubLLM } from '../copilot';
import { existsSync, readFileSync } from 'fs';

vi.mock('../extractor', () => ({
  extractBackstageVersion: vi.fn(),
  extractLocalConfigSource: vi.fn()
}));

vi.mock('../upstream', () => ({
  resolveUpstreamSource: vi.fn()
}));

vi.mock('../copilot', () => ({
  askGithubLLM: vi.fn()
}));

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn()
}));

const createCommentSpy = vi.fn();
vi.mock('@actions/github', () => ({
  context: {
    repo: { owner: 'ai-crew-suite', repo: 'actions' }
  },
  getOctokit: vi.fn().mockImplementation(() => ({
    rest: {
      issues: {
        createComment: createCommentSpy
      }
    }
  }))
}));

describe('ESLint Config Sync Action Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env['GITHUB_TOKEN'] = 'secret-token';
    process.env['GITHUB_EVENT_PATH'] = '/tmp/event.json';
  });

  it('✅ Should execute the sync run pipeline successfully', async () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
      pull_request: { number: 42, comments_url: 'https://github.com' }
    }));

    vi.mocked(extractBackstageVersion).mockReturnValue('1.24.0');
    vi.mocked(resolveUpstreamSource).mockResolvedValue('upstream-js-source-code-payload');
    vi.mocked(extractLocalConfigSource).mockReturnValue('local-js-source-code-payload');
    vi.mocked(askGithubLLM).mockResolvedValue('Everything aligns perfectly.');

    await run();

    expect(createCommentSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        issue_number: 42,
        body: expect.stringContaining('Everything aligns perfectly.')
      })
    );
  });
});
