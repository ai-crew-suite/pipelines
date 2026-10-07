# Trivy Infrastructure Security Scanning Action

Centralized infrastructure-as-code (IaC) configuration scanning and vulnerability analysis engine enforcing security compliance across the AI Crew Suite platform.

## Overview

This GitHub Action orchestrates automated infrastructure and DevOps configuration security testing across all organization repositories. Built as a secure, composite workflow, it utilizes **Trivy** to scan your entire workspace for security misconfigurations in Dockerfiles, Terraform (HCL), Helm charts, Helmfiles, and Kubernetes manifests without requiring any heavy language compilation or path configurations.

## Consumer Usage Checklist

To apply this security scanning layer inside an independent repository workspace, structure your orchestration file (e.g., `.github/workflows/security.yml`) using this format.

*Note: Ensure your runner environment has elevated `security-events: write` permissions to report findings directly back to GitHub's Security dashboard.*

```yaml
name: Infrastructure Security Scanning

on:
  push:
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  analyze-trivy:
    name: Trivy Infrastructure Scan
    if: github.event_name != 'schedule'
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    steps:
      - name: 📂 Checkout Application Source
        uses: actions/checkout@v4

      - name: 🛡️ Execute Centralized Security Engine (DevOps Stack)
        uses: ai-crew-suite/pipelines/actions/analyze-trivy@v1
```

## Vulnerability Reports

Discovered vulnerabilities, misconfigurations, and anti-patterns will automatically map directly into your repository's native **Security -> Code scanning** metrics overview interface under the `/type:infrastructure` category.

## Core Responsibilities

* **DevOps Stack Auditing**: Automatically scans the entire repository for misconfigured Dockerfiles, open ports or overly permissive security groups in HCL (Terraform), and bad practices in Helm charts or Kubernetes YAML configurations.
* **Automatic Hotfix Bypassing**: Detects if the runtime environment is executing on a `hotfix/*` branch. If a hotfix is found, the action logs a bypass notification and finishes instantly to keep critical production deployments fast.
* **SARIF Integration**: Automatically translates Trivy JSON findings into standard SARIF format and uploads them natively into the GitHub Security dashboard.

## Architectural Dependency Tree

This action manages security compliance checkpoints across the organization workspace network:

* **Upstream Engine**: Evaluates runtime parameters directly via the official secure suite blocks of `aquasecurity/trivy-action` and `github/codeql-action/upload-sarif`.
* **Downstream Consumer**: Executed directly inside security auditing workflows on pushes and pull requests across the org (skipping weekend cron cycles).
* **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (`ai-crew-suite/pipelines/actions/analyze-trivy@v1`). Do not create loose, un-managed local scanning profiles.

## Local Development Workflow

This is an environmental analysis script wrapping remote engine calls. Verify configuration properties right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-analyze-trivy
```

### Testing Configuration Updates

To evaluate changes to parameters, execute the action run manually inside an isolated validation branch before pushing modifications to the primary organization release track.

### Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
