# Lint Centralized Architecture Audit

Centralized architecture gatekeeper enforcing formal monorepo path topologies, package directory structural mappings, and organization-scoped naming conventions across the AI Crew Suite platform.

## Overview

This GitHub Action acts as a strict structural alignment layer for all monorepo layouts within the organization. Built as an advanced compilation runner (**node20**), it recursively scans internal workspace locations (`/plugins/`) and programmatically enforces rigorous directory-to-name routing templates to prevent chaotic directory setups, structural erosion, or namespace conflicts.

## Core Responsibilities

- **Directory-to-Name Mapping**: Evaluates deep directory path arrays to guarantee package scopes exactly reflect their physical boundaries (e.g., matching tools to `tool-<domain>-<provider>`).
- **Workspace Boundary Guarding**: Verifies file absolute locations natively to isolate workspace checks from escaping active runtime environments and blocks path traversal attempts.
- **Unified Name Validation**: Isolates incorrect naming configurations and alerts developers with descriptive errors contrasting the actual workspace entry against structural layout expectations.
- **Prototype Pollution Protection**: Safely parses internal configuration payloads to defend runtime memory execution states against malicious object field injections.

## Usage

To apply this architecture tracking gate inside an independent framework repository layout, integrate the action block using this format:

### Configure the Action Target

Ensure your execution block initializes this check from the root of a turborepo workspace structure:

```yaml
name: Workspace Guardrails

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

# Minimize default token capabilities to enforce the principle of least privilege
permissions:
  contents: read

jobs:
  lint-monorepo-namespaces:
    runs-on: ubuntu-latest
    steps:
      - name: 📂 Checkout Application Source
        uses: actions/checkout@eef6142deb1b204a112c310b936a224d358e6fa9 # v4.2.1

      - name: 🔍 Execute Centralized Architecture Audit
        uses: ai-crew-suite/pipelines/actions/lint-architecture@v1

```

### Layout Structure Alignment Matrix

The engine maps packages inside the `/plugins/` structure according to these immutable organizational tiers:

- **Core Components (`plugins/core/\*`)**: Maps out root extensions and foundational infrastructure blocks. Non-infra tiers map to `@ai-crew-suite/core-<tier>`, while infrastructural deep paths (`plugins/core/infra/[domain]/[provider]`) resolve exactly to `@ai-crew-suite/infra-[domain]-[provider]`.
- **Domain Agents (`plugins/agents/\*`)**: Validates domain-specific runtime interfaces and user-interface frontends. Standard layout segments map to `@ai-crew-suite/agent-<domain>-<tier>`, whereas specialized frontends resolve strictly to `@ai-crew-suite/agent-core-frontend`.
- **Infrastructure Tools (`plugins/tools/\*`)**: Maps third-party or custom functional service integrations across a structured path (`plugins/tools/[domain]/[provider]`) to rigid `@ai-crew-suite/tool-<domain>-<provider>` naming matrices.

## Architectural Dependency Tree

This action anchors quality governance checkpoints across the organization workspace network:

- **Upstream Engine**: Relies directly on native, compiled node file systems, clean type structures, and declarative category routing state-machines.
- **Downstream Consumer**: Executed directly inside continuous integration pipelines (`.github/workflows/ci.yml`) on every open Pull Request context and primary push event across the org.
- **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (`ai-crew-suite/pipelines/actions/lint-architecture@v1`). Do not create or track decentralized directory checking utilities.

## Local Development Workflow

### Installation & Distribution

This is a JavaScript-backed runtime action compiled into an isolated bundle using `@vercel/ncc`. Verify underlying TypeScript source code layers, path segments, and security schemas before compiling code to `dist/index.js`:

```bash
# Install and synchronize monorepo package constraints
yarn install --immutable

# Build the bundled action using Turborepo
yarn turbo run build --filter=@ai-crew-suite/action-lint-architecture
```

### Running Verification Tracks

```bash
# Execute code-quality diagnostics and static validation pipelines
yarn turbo run lint --filter=@ai-crew-suite/action-lint-architecture

# Unit tests
yarn turbo run test:unit --filter=@ai-crew-suite/action-lint-architecture
```

## Compliance and Licensing

Designed for enterprise deployment environments subject to **FINRA**, **SOC-2**, and **HIPAA** system audit criteria.

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
