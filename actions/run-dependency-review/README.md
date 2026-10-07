# `@ai-crew-suite/pipelines/actions/run-dependency-review`

Centralized security evaluation engine to programmatically scan, audit, and intercept critical supply-chain vulnerabilities within Pull Requests across the AI Crew Suite platform.

## Overview

This GitHub Action serves as a security perimeter for external third-party software additions. Built as a secure composite workflow, it intercepts Pull Requests that introduce new package specifications, queries the global vulnerability databases, and halts the build pipeline if an engineer accidentally attempts to introduce compromised or high-risk dependencies.

## Core Responsibilities

* **Supply-Chain Interception**: Automatically evaluates manifest files (package.json, yarn.lock) inside incoming Pull Requests to catch known security exploits before they hit the codebase.
* **Fail-Safe Thresholding**: Enforces an administrative safety roof (fail-on-severity) that allows normal non-breaking notices while strictly blocking critical flaws.
* **Automated PR Documentation**: Injects live, tabular vulnerability reports (comment-summary-in-pr) right into the conversation tab of the Pull Request for faster remediation.

## Usage

To apply this security scanning layer inside a secure continuous integration layout, pair this check with your companion emergency bypass script using this format:

### Configure the Action Target

Ensure your runner environment triggers this logging pass as an explicit check on pull_request execution hooks:

```yaml
name: Dependency Review

on:
  pull_request:
    branches: [main]

permissions:
  contents: read
  pull-requests: write

jobs:
  dependency-review:
    name: Review Dependencies
    runs-on: ubuntu-latest
    if: ${{ !startsWith(github.head_ref || github.ref_name, 'hotfix/') }}
    steps:
      - name: 📂 Checkout Application Source
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1

      - name: 🔍 Execute Centralized Dependency Check
        uses: ai-crew-suite/pipelines/actions/run-dependency-review@v1

  hotfix-bypass:
    name: Dependency Review Hotfix Bypass
    runs-on: ubuntu-latest
    if: ${{ startsWith(github.head_ref || github.ref_name, 'hotfix/') }}
    steps:
      - name: 🪵 Execute Centralized Bypass Registration
        uses: ai-crew-suite/pipelines/actions/bypass-dependency-review@v1
```

## Architectural Dependency Tree

This action manages security compliance and dependency health gates across the organization workspace network:

* **Upstream Engine**: Evaluates package vulnerability signatures directly via the official secure scanner blocks of actions/dependency-review-action (v5).
* **Downstream Consumer**: Executed inside pull request validation gates (.github/workflows/dependency-gate.yml) alongside your companion bypass script on every code repository in the org.
* **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (ai-crew-suite/pipelines/actions/dependency-review-check@v1). Do not map parameters to raw, non-vetted vulnerability scanners.

## Local Development Workflow

### Installation & Distribution

This is an environmental analysis script wrapping remote engine calls. Verify configuration properties and validation schemas right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-run-dependency-review
```

### Testing Configuration Updates

To evaluate changes to the fallback severity thresholds, run validation arrays against a dedicated staging repository containing known test vulnerabilities before updating the platform tags.

## Parameter Integration Matrix

Ensure your configuration mappings satisfy the required inputs:

* [ ] **`fail-on-severity`**: The minimum vulnerability severity threshold that will cause the build step to fail (Default: "critical"). Can be adjusted to low, moderate, or high.
* [ ] **PR Comments**: The engine will always leave an interactive, detailed breakdown summarizing vulnerabilities directly inside the Pull Request conversation tab if a package failure occurs.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
