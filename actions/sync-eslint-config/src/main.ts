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
import { setFailed, info } from '@actions/core';
import * as github from '@actions/github';
import { existsSync, readFileSync } from 'fs';
import { extractBackstageVersion, extractLocalConfigSource } from './extractor';
import { resolveUpstreamSource } from './upstream';
import { askGithubLLM } from './copilot';

export async function run(): Promise<void> {
  try {
    const workspaceRoot = process.cwd();

    const githubToken = process.env['GITHUB_TOKEN'];
    if (!githubToken) {
      setFailed('❌ GITHUB_TOKEN is missing from execution environment.');
      return;
    }

    const eventPath = process.env['GITHUB_EVENT_PATH'];
    if (!eventPath || !existsSync(eventPath)) {
      info('✅ Missing or invalid GITHUB_EVENT_PATH context. Skipping audit.');
      return;
    }

    const eventData = JSON.parse(readFileSync(eventPath, 'utf8'));
    const prNumber = eventData.pull_request?.number;
    const commentsUrl = eventData.pull_request?.comments_url;

    if (!prNumber || !commentsUrl) {
      info('✅ Event is not a pull request context pass. Skipping analysis.');
      return;
    }

    const backstageCliVersion = extractBackstageVersion(workspaceRoot);
    if (!backstageCliVersion) {
      info('✅ Could not locate an active @backstage/cli version block in this workspace.');
      return;
    }

    const cleanVersion = backstageCliVersion.replace(/[^\d.]/g, '');
    info(`🔍 Syncing alignment against upstream @backstage/cli version: ${cleanVersion}`);

    const upstreamSource = await resolveUpstreamSource(cleanVersion);
    if (!upstreamSource) {
      info('⚠️ Failed to locate upstream eslint-factory.js template assets for this pass.');
      return;
    }

    const localSource = extractLocalConfigSource(workspaceRoot);

    const aiPrompt = `
Our repository decouples Spotify Backstage configs into a separate ESM package. 
Compare our local configuration against the upstream core '@backstage/cli' version (${cleanVersion}) content provided below.

Task:
Identify any new core eslint plugins, configurations, or critical custom rules introduced in the Upstream file that our Local file completely lacks. Summarize them in a short markdown bulleted list.

--- UPSTREAM FILE CONTENT ---
${upstreamSource}

--- OUR LOCAL FILE CONTENT ---
${localSource}
`;

    info('🤖 Querying native GitHub Copilot LLM engine for diff analysis...');
    const aiAnalysis = await askGithubLLM(githubToken, aiPrompt);

    const body = `### ⚠️ Upstream ESLint Config Alignment Check
The core upstream **@backstage/cli (${cleanVersion})** base configurations have been mapped against your local configuration to isolate structural changes.

#### 🤖 Copilot Gap Assessment Report:
${aiAnalysis}

_Please review \`packages/config-eslint/src/index.ts\` if critical rules require structural adjustments to maintain upstream parity._`;

    const octokit = github.getOctokit(githubToken);
    await octokit.rest.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: prNumber,
      body: body,
    });

    info('🎉 Alignment status comment posted to the Pull Request successfully.');
  } catch (error) {
    if (error instanceof Error) {
      setFailed(`Audit script failure: ${error.message}`);
    }
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  run();
}
