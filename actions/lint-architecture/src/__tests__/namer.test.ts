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
import { describe, it, expect } from 'vitest';
import { resolveExpectedName, SCOPE } from '../namer';

/**
 * Utility helper to simulate raw file path arrays passed into the logic layer.
 */
function toSegments(pathString: string): string[] {
  return pathString.split('/');
}

describe('Architecture Naming Matrix Compliance Proof', () => {

  describe('Section 1: Structural Input Validation & Fallbacks', () => {
    it('should decline paths outside the plugins scope', () => {
      const segments = toSegments('packages/core/src');
      expect(resolveExpectedName(segments)).toBeNull();
    });

    it('should decline partial or completely empty path matrices', () => {
      expect(resolveExpectedName([])).toBeNull();
      expect(resolveExpectedName(['plugins'])).toBeNull();
    });

    it('should drop evaluation gracefully if category segment is unresolvable', () => {
      const segments = toSegments('plugins/unknown-category/something');
      expect(resolveExpectedName(segments)).toBeNull();
    });

    it('should gracefully handle empty or malformed layout indices (e.g., double slashes)', () => {
      // Translates to: ["plugins", "core", "", "something"]
      const segments = toSegments('plugins/core//something');
      expect(resolveExpectedName(segments)).toBeNull();
    });

    it('should reject structures that contain "plugins" but not at the root entry index', () => {
      const segments = toSegments('internal/plugins/core/backend');
      expect(resolveExpectedName(segments)).toBeNull();
    });
  });

  describe('Section 2: Core Components Category Map (plugins/core/*)', () => {
    it('should resolve standard core tiers exactly to core-[tier]', () => {
      const segments = toSegments('plugins/core/backend');
      expect(resolveExpectedName(segments)).toBe(`${SCOPE}/core-backend`);
    });

    it('should resolve deep infrastructural layouts exactly to infra-[domain]-[provider]', () => {
      const segments = toSegments('plugins/core/infra/database/postgres');
      expect(resolveExpectedName(segments)).toBe(`${SCOPE}/infra-database-postgres`);
    });

    it('should decline incomplete deep infrastructure layouts missing provider structures', () => {
      const segments = toSegments('plugins/core/infra/database');
      expect(resolveExpectedName(segments)).toBeNull();
    });

    it('should completely ignore trailing file paths deep within package workspace structures', () => {
      // The naming logic only evaluates structural segments; trailing internals shouldn't trigger faults
      const segments = toSegments('plugins/core/infra/database/postgres/src/repositories/user');
      expect(resolveExpectedName(segments)).toBe(`${SCOPE}/infra-database-postgres`);
    });
  });

  describe('Section 3: Domain Agents Category Map (plugins/agents/*)', () => {
    it('should route specialized runtime frontends to agent-core-frontend directly', () => {
      const segments = toSegments('plugins/agents/core-frontend');
      expect(resolveExpectedName(segments)).toBe(`${SCOPE}/agent-core-frontend`);
    });

    it('should map standard domain tiers precisely to agent-[domain]-[tier]', () => {
      const segments = toSegments('plugins/agents/finance/compliance');
      expect(resolveExpectedName(segments)).toBe(`${SCOPE}/agent-finance-compliance`);
    });

    it('should return null if agent path entries are structurally short', () => {
      const segments = toSegments('plugins/agents/finance');
      expect(resolveExpectedName(segments)).toBeNull();
    });
  });

  describe('Section 4: Infrastructure Tools Category Map (plugins/tools/*)', () => {
    it('should construct rigid mappings matching tool-[domain]-[provider]', () => {
      const segments = toSegments('plugins/tools/messaging/slack');
      expect(resolveExpectedName(segments)).toBe(`${SCOPE}/tool-messaging-slack`);
    });

    it('should drop tracking with null if tool structures are truncated', () => {
      const segments = toSegments('plugins/tools/messaging');
      expect(resolveExpectedName(segments)).toBeNull();
    });
  });

  describe('Section 5: Cross-Platform Path Handling Assurance', () => {
    it('should cleanly resolve structural paths constructed with Windows style backslashes', () => {
      // Explicitly mocks paths processed on Windows hosted runner architectures
      const winSegments = ['plugins', 'tools', 'payment', 'stripe'];
      expect(resolveExpectedName(winSegments)).toBe(`${SCOPE}/tool-payment-stripe`);
    });
  });

});
