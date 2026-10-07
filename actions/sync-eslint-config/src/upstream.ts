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
 * Network fetching tool using global fetch streams.
 */
export async function fetchUrl(url: string, headers?: Record<string, string>): Promise<string | null> {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return await res.text();
  } catch (error) {
    warning(`⚠️ Error fetching URL ${url}: ${error}`);
    return null;
  }
}

/**
 * Resolves the upstream eslint-factory source across specific tags or fallback minor releases.
 */
export async function resolveUpstreamSource(cleanVersion: string): Promise<string | null> {
  const specificTagUrl = `https://raw.githubusercontent.com/spotify/backstage/v${cleanVersion}/packages/cli/config/eslint-factory.js`;
  const minorVersion = cleanVersion.split('.').slice(0, 2).join('.');
  const fallbackBranchUrl = `https://raw.githubusercontent.com/spotify/backstage/v${minorVersion}/packages/cli/config/eslint-factory.js`;

  let upstreamSource = await fetchUrl(specificTagUrl);
  if (!upstreamSource || upstreamSource.includes('404: Not Found')) {
    upstreamSource = await fetchUrl(fallbackBranchUrl);
  }

  if (!upstreamSource || upstreamSource.includes('404: Not Found')) {
    return null;
  }

  return upstreamSource;
}
