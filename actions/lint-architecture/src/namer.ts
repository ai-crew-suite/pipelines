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
export const SCOPE = "@ai-crew-suite";

/**
 * Maps categorical segment arrangements to their specific naming rules.
 * Resolves naming based on structural path hierarchy.
 */
export function resolveExpectedName(segments: string[]): string | null {
  if (segments.length < 2 || segments[0] !== 'plugins') return null;

  const [, category, tierOrDomain, providerOrTier, provider] = segments;

  if (!category) return null;

  const strategies: Record<string, () => string | null> = {
    core: () => {
      if (!tierOrDomain) return null;
      if (tierOrDomain !== 'infra') return `${SCOPE}/core-${tierOrDomain}`;

      // Pattern: plugins/core/infra/[domain]/[provider]
      if (segments.length >= 5 && providerOrTier && provider) {
        return `${SCOPE}/infra-${providerOrTier}-${provider}`;
      }
      return null;
    },
    agents: () => {
      if (tierOrDomain === 'core-frontend') return `${SCOPE}/agent-core-frontend`;
      if (segments.length >= 4 && tierOrDomain && providerOrTier) {
        return `${SCOPE}/agent-${tierOrDomain}-${providerOrTier}`;
      }
      return null;
    },
    tools: () => {
      if (segments.length >= 4 && tierOrDomain && providerOrTier) {
        return `${SCOPE}/tool-${tierOrDomain}-${providerOrTier}`;
      }
      return null;
    }
  };

  const strategy = strategies[category];
  return strategy ? strategy() : null;
}
