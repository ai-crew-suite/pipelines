# Unified Repository Security Engine

Centralized security scanning, dependency verification, and cloud configuration analysis engine enforcing **CodeQL (SAST)**, **Anchore Grype (SCA)**, and **Aqua Trivy (IaC)** scanning suites across the AI Crew Suite platform.

## Overview

This GitHub Action serves as the primary automated DevSecOps gatekeeper across all organization repositories. Built as a secure, composite compliance workflow, it analyzes your full application footprint across three distinct layers to intercept logical flaws, hardcoded credentials, malicious third-party dependencies, and misconfigured infrastructure templates before code merges to production.

## Compliance Posture (FINRA, HIPAA, SOC-2)

To satisfy strict regulatory audits, this engine guarantees an un-bypassable verification trail across three essential compliance controls:

- **Secure Software Development (SAST)**: Utilizes deep semantic parsing to verify that your first-party custom application code does not introduce security vulnerabilities or memory management defects.
- **Third-Party Risk Management (SCA)**: Actively scans the deep nested dependency tree within `node_modules` to block open-source software supply chain vulnerabilities.
- **Secure Infrastructure Configuration (IaC)**: Audits configuration manifests (Dockerfiles, GitHub Actions workflow templates, Terraform) to enforce structural least-privilege policies.
- **Zero-Bypass Policy**: To maintain absolute change management integrity, **all programmatic backdoor loops (such as branch-name hotfix bypassing) have been completely eliminated**. All code passing through this gate must be audited equally. Emergency exceptions must be validated via auditable manual approvals at the environment level.

## Usage

To apply this multi-layered compliance gate inside an independent repository workspace, structure your orchestration file (e.g., `.github/workflows/security.yml`) using this format.

*Note: Ensure your runner environment has elevated `security-events: write` permissions to report structural findings directly back to GitHub's Security dashboard.*

```yaml
name: Unified Security Analysis

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 0 * * 0" # Evaluates entire repository footprint every Sunday at midnight
  workflow_dispatch:

jobs:
  analyze-security:
    name: DevSecOps Compliance Scan
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write # 🔒 REQUIRED: To upload verified SARIF compliance logs to GitHub

    steps:
      - name: 📂 Checkout Application Source
        uses: actions/checkout@v4

      - name: 🔒 Execute Unified Security Engine
        # COMPLIANT: Swapped floating tag (@v1) for an immutable, audited commit SHA hash
        uses: ai-crew-suite/pipelines/actions/security-analysis@a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0 # v1.2.3
        with:
          language: 'javascript'
          scan-infrastructure: 'true'
```

## Vulnerability Reports

Discovered alerts are tracked independently by category and automatically mapped into your repository's native interface at **Security -> Code scanning**. High or critical defects identified by either the dependency or infrastructure scanning steps will immediately trigger a non-zero exit code to fail the build and protect the release pipeline.

## Core Responsibilities

- **Multi-Dimensional Threat Detection**: Executes Aqua Trivy, Anchore Grype, and GitHub CodeQL sequentially to validate configurations, open-source packages, and custom logic in a single unified run.
- **Fail-Fast Hierarchy Execution**: Scales operations from fastest execution footprints (IaC configuration checks) to heaviest (SAST compilation passes). Structural architecture or pipeline syntax issues break the build in seconds, saving runner resources.
- **Deep Path Constraints**: Constrains deep static scanning rules to core logical perimeters (`packages`, `plugins`, `scripts`, `test`, `actions`) while optimizing engine runtimes by explicitly ignoring build artifacts and caching layers (`node_modules`, `dist`, `dist-types`, `.turbo`, `.yarn`).
- **Cryptographic SARIF Logging**: Automatically bundles infrastructure configuration results into formal static analysis interchange format logs and transmits them directly to GitHub Advanced Security dashboards to maintain unalterable compliance evidence trails.

## Architectural Dependency Tree

This action manages security compliance checkpoints across the organization workspace network:

- **Upstream Engine**: Evaluates runtime parameters directly via the official secure suite blocks of `aquasecurity/trivy-action` (v0), `anchore/scan-action` (v6), and `github/codeql-action` (v4).
- **Downstream Consumer**: Executed directly inside security auditing matrices on every main branch merge event, pull request review cycle, and scheduled weekend cron pass across the organization.
- **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (`ai-crew-suite/pipelines/actions/security-analysis@<COMMIT_SHA>`). Do not construct loose, un-managed local scanning or bypass profiles.

## Local Development Workflow

### Installation & Tracking

This is an environmental analysis script wrapping remote engine calls. Verify configuration path scopes and input properties right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-security-analysis
```

### Testing Configuration Updates

To evaluate changes to infrastructure severity thresholds or query inclusion presets, execute the action run manually inside an isolated validation branch before pushing modifications to the primary organization release track.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
