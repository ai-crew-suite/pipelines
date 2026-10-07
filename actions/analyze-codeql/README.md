# CodeQL Security Scanning Action

Centralized security scanning and vulnerability analysis engine enforcing advanced CodeQL code-scanning suites across the AI Crew Suite platform.

## Overview

This GitHub Action orchestrates automated static application security testing (SAST) loops across all organization repositories. Built as a secure, composite workflow, it initializes localized analysis databases, injects custom path boundary limits, automatically builds compilation targets, and performs deep quality passes to block supply chain attacks, logic flaws, and credential leaks in JavaScript and TypeScript environments.

## Consumer Usage Checklist

To apply this security scanning layer inside an independent repository workspace, structure your orchestration file (e.g., `.github/workflows/security.yml`) using this format.

*Note: Ensure your runner environment has elevated `security-events: write` permissions to report findings directly back to GitHub's Security dashboard.*

```yaml
name: CodeQL Security Scanning

on:
  push:
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 0 * * 0" # Runs every Sunday at midnight
  workflow_dispatch:

jobs:
  analyze-codeql:
    name: CodeQL Application Scan
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    steps:
      - name: 📂 Checkout Application Source
        uses: actions/checkout@v4

      - name: 🔒 Execute Centralized Security Engine (JS/TS)
        uses: ai-crew-suite/pipelines/actions/analyze-codeql@v1
```

## Vulnerability Reports

Discovered vulnerabilities and anti-patterns will automatically map directly into your repository's native **Security -> Code scanning** metrics overview interface.

## Core Responsibilities

* **Security & Quality Enforcement**: Automatically appends the advanced `+security-and-quality` extended query matrix to standard scanning runs.
* **Automatic Hotfix Bypassing**: Detects if the runtime environment is executing on a `hotfix/*` branch. If a hotfix is found, the action logs a bypass notification and finishes instantly to keep critical production deployments fast.
* **Path Auditing Constraints**: Scans critical architecture targets (`packages`, `plugins`, `scripts`, `test`, `actions`) while optimizing performance by completely ignoring caching overhead boundaries (`node_modules`, `dist`, `dist-types`, `.turbo`, `.yarn`).
* **Automated Target Compiling**: Utilizes smart fallback compilers (`autobuild`) to construct source dependencies inline for JavaScript and TypeScript target files.

## Architectural Dependency Tree

This action manages security compliance checkpoints across the organization workspace network:

* **Upstream Engine**: Evaluates runtime parameters directly via the official secure suite blocks of `github/codeql-action` (v4).
* **Downstream Consumer**: Executed directly inside security auditing matrices on every main branch merge event and weekend cron cycle across the org.
* **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (`ai-crew-suite/pipelines/actions/analyze-codeql@v1`). Do not create loose, un-managed local scanning profiles.

## Local Development Workflow

This is an environmental analysis script wrapping remote engine calls. Verify configuration path scopes and input properties right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-analyze-codeql
```

### Testing Configuration Updates

To evaluate changes to ignored paths or query inclusion presets, execute the action run manually inside an isolated validation branch before pushing modifications to the primary organization release track.

### Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
