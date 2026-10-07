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
import { setFailed, info, warning, getInput } from '@actions/core';
import * as github from '@actions/github';

export function findSuccessForSha(runs: any[], expectedSha: string): boolean {
  const matchingRuns = runs.filter(wRun => wRun && wRun.head_sha === expectedSha);
  if (matchingRuns.length === 0) return false;

  // Since GitHub Actions APIs return data sorted chronologically (newest first),
  // the first matching element is the absolute latest status of the commit execution.
  return matchingRuns[0].conclusion === 'success';
}

/**
 * Main execution orchestration block for the Playwright Deployment Gatekeeper
 */
export async function run(): Promise<void> {
  try {
    const token = getInput('github_token', { required: true });
    const expectedSha = getInput('expected_sha', { required: true });
    const workflowFile = getInput('workflow_file') || 'playwright.yml';

    const perPageInput = getInput('per_page') || '50';
    const perPage = parseInt(perPageInput, 10) || 50;

    const preReleaseBypass = getInput('pre_release_bypass') || 'true';

    const { owner, repo } = github.context.repo;
    if (!owner || !repo) {
      throw new Error('Could not resolve repository owner or name from context targets.');
    }

    info(`🔍 Checking completed runs of '${workflowFile}' in ${owner}/${repo} for SHA: ${expectedSha}...`);

    const octokit = github.getOctokit(token);

    const { data } = await octokit.rest.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id: workflowFile,
      status: 'completed',
      per_page: perPage,
    });

    const runs = data.workflow_runs || [];

    if (findSuccessForSha(runs, expectedSha)) {
      info('✅ Playwright succeeded for this SHA');
      return;
    }

    if (preReleaseBypass.toLowerCase() === 'true') {
      warning(`⚠️ WARNING: Playwright has not completed successfully for SHA ${expectedSha}!`);
      warning('⚠️ [EARLY DEVELOPMENT BYPASS] Allowing deployment anyway. Remember to enforce this check later.');
      return;
    }

    setFailed(`❌ Playwright has not completed successfully for SHA ${expectedSha}; aborting deploy.`);
  } catch (error) {
    if (error instanceof Error) {
      setFailed(`Guardrail Execution Failure: ${error.message}`);
    }
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  run();
}
