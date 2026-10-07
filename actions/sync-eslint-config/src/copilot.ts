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
import { warning } from '@actions/core';

/**
 * Exchanges the system GITHUB_TOKEN for a short-lived Copilot operational token,
 * then queries the hosted LLM engine.
 */
export async function askGithubLLM(token: string, prompt: string): Promise<string> {
  try {
    const tokenRes = await fetch('https://github.com', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'TS-GHA-Sync-Audit',
      }
    });

    if (!tokenRes.ok) {
      throw new Error(`Token exchange failed with status ${tokenRes.status}`);
    }

    const tokenData = (await tokenRes.json()) as { token?: string };
    const copilotToken = tokenData.token;

    if (!copilotToken) {
      return '❌ Failed to resolve an operational Copilot session proxy token.';
    }

    const completionsRes = await fetch('https://githubcopilot.com', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${copilotToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'TS-GHA-Sync-Audit',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a senior frontend engineer comparing JavaScript/TypeScript configuration changes.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!completionsRes.ok) {
      throw new Error(`LLM Query failed with status ${completionsRes.status}`);
    }

    const resData = (await completionsRes.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const firstChoice = resData.choices?.[0];
    if (firstChoice?.message) {
      return firstChoice.message.content || 'Empty response from AI engine.';
    }

    return 'Empty response from AI engine.';
  } catch (error) {
    warning(`⚠️ Native GitHub Copilot LLM proxy call failed: ${error}`);
    return 'Could not generate AI analysis due to token validation or runtime timeout errors.';
  }
}
