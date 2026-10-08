# Enterprise Open-Source License & Supply-Chain Firewall

Centralized legal compliance and ecosystem health evaluation engine to programmatically scan, audit, and intercept unapproved open-source licenses and high-risk dependencies within Pull Requests across the AI Crew Suite platform.

## Overview

This GitHub Action serves as an automated legal and risk perimeter for external third-party software additions. Because our Spotify Backstage IDP plugins are distributed under the **Apache-2.0** license, preventing corporate intellectual property contamination from restrictive copyleft licenses (like GPL or AGPL) or unmaintained dependencies is paramount.

Unlike full-repository static scanners, this engine calculates the net-change (differential) of an incoming Pull Request. It intercepts newly introduced package definitions, maps them against an approved corporate license matrix, and injects deep security health metrics directly into your development workflow.

## Compliance Posture & Distinct Architectural Value

To satisfy **SOC-2 Type II (Intellectual Property Protection & Third-Party Risk Controls) and FINRA** mandates, this action operates alongside the `security-analysis` engine to fill distinct operational gaps:

- **Decoupled Security Overhead**: Vulnerability scanning (SAST/SCA/IaC CVE detection) is entirely managed by the upstream `security-analysis.yml` suite. This engine focuses exclusively on **Legal IP Alignment** and **Supply-Chain Maintenance Risks** to eliminate processing redundancy.
- **IP Contamination Prevention**: It ensures no viral copyleft or unvetted proprietary dependencies enter the codebase, mitigating the risk of forced source-code exposure or license non-compliance.
- **Zero-Bypass Pipeline Security**: In compliance with rigorous corporate change management criteria, **all programmatic backdoor loops (such as branch-name hotfix bypassing) have been completely eliminated**. Emergency releases must still clear automated checks; exceptions are handled via cryptographically auditable configuration exclusions.

## Core Responsibilities

- **Transitive License Firewalling**: Automatically evaluates deep manifest hierarchies (`package.json`, `yarn.lock`) inside incoming Pull Requests to catch hidden, nested, or transitive copyleft licenses.
- **OpenSSF Scorecard Insights**: Injects deep open-source supply chain risk telemetry directly into the code-review lifecycle. It surfaces critical maintenance flags—such as project abandonment, lack of fuzz testing, or missing branch protection rules—on upstream packages before they enter your stack.
- **Automated PR Peer-Review Documentation**: Generates and posts a live, markdown evaluation summary directly into the conversation tab of the Pull Request, transforming compliance reporting into a frictionless engineering asset.

## Usage

To apply this compliance layer inside your integration workflow, implement this action exclusively on `pull_request` execution hooks. Ensure your configuration references an immutable cryptographic commit SHA hash.

### Configure the Action Target

The underlying engine natively requires an active Pull Request context to compare branch differentials; ensure your runner environment has elevated `pull-requests: write` permissions to report findings:

```yaml
name: Pull Request Quality Gate

on:
  pull_request:
    branches: [main]

permissions:
  contents: read
  pull-requests: write # 🔒 Required to allow the firewall to post legal & health summaries in the PR thread

jobs:
  license-and-health-audit:
    name: Legal IP & OpenSSF Compliance Gate
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Pull Request Codebase
        uses: actions/checkout@v4

      - name: Enforce License Whitelist & Health Gates
        uses: ai-crew-suite/pipelines/actions/run-dependency-review@b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0 # v1.0.0
```

### Approved License Allow-list Baseline

The firewall enforces a strict allow-list approach designed for commercial, Apache-2.0-compatible plugin distribution. The permitted baselines are:

- **Apache-2.0** (Natively aligned with Spotify Backstage)
- **MIT / ISC / Unlicense** (Highly permissive standard libraries)
- **BSD-2-Clause / BSD-3-Clause**
- **CC0-1.0 / Public Domain**

Any introduction of **GPL-2.0, GPL-3.0, LGPL, AGPL-3.0**, un-asserted licenses (`NOASSERTION`), or custom proprietary commercial modules will instantly fail the build.

### Handling Vetted Corporate Exceptions

For internal proprietary packages or commercially purchased UI modules that naturally trip the whitelist, add an auditable package exception string (`allow-dependencies-licenses`) directly inside the local consumption workflow parameters:

```yaml
      - name: ⚖️ Enforce License Whitelist & Health Gates
        uses: ai-crew-suite/pipelines/actions/run-dependency-review@b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
        with:
          # 🔒 Legally approved corporate exception log
          allow-dependencies-licenses: |
            pkg:npm/your-internal-proprietary-package@1.0.0
            pkg:npm/@scoped/commercially-licensed-module
```

Architectural Dependency Tree

This action manages legal risk compliance and ecosystem health gates across the organization workspace network:

- **Upstream Engine**: Evaluates package structures directly via the official secure scanner blocks of `actions/dependency-review-action` (v5).
- **Downstream Consumer**: Executed exclusively inside pull request validation gates (`.github/workflows/pr-gate.yml`) across all organizational code repositories.
- **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (`ai-crew-suite/pipelines/actions/run-dependency-review@<COMMIT_SHA>`). Do not map parameters to loose, non-vetted vulnerability or license scanners.

## Local Development Workflow

### Installation & Distribution

This is an environmental analysis script wrapping remote engine calls. Verify configuration properties and validation schemas right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-run-dependency-review
```

### Testing Configuration Updates

To evaluate changes to the allowed license whitelist matrix or scorecard inclusions, run validation arrays against a dedicated staging repository containing known test licenses before updating the platform distribution tags.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
