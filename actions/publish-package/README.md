# Shared Publish & Release Engine

Centralized package publishing and release pipeline engine featuring secure Yarn 4 credential mapping, automated cryptographic build provenance enforcement, and localized Slack incident notifications.

## Overview

This GitHub Action serves as the final distribution gatekeeper for package release cycles across the organization. Built as a secure, single-purpose composite deployment workflow, it handles the isolated compilation and delivery of vetted packages. It injects scope configurations into the Yarn runtime and signs packages with native OpenID Connect (OIDC) provenance records before publishing them to the public registry.

## Compliance Posture (FINRA, HIPAA, SOC-2)

To satisfy strict change management and software supply chain controls, this action operates under a strict **Separation of Duties** model:
* **Decoupled Security**: Vulnerability scanning (SCA) and application code auditing (SAST) must be handled by an upstream security gate (such as `security-analysis.yml`) prior to executing this deployer.
* **Cryptographic Traceability**: Generates public, non-repudiable package provenance bound back to the source execution runner.
* **Immutable Milestones**: Bypasses dynamic floating pointers in production environments to ensure exact code-line verification.

## Core Responsibilities

* **Cryptographic Provenance Signing**: Enforces `yarn config set npmPublishProvenance true` within the isolated runtime to bind verifiable public attestations back to the source execution runner via the Sigstore public ledger.
* **Yarn 4 Scope Configurations**: Targets the organization registry layer (`npmScopes.ai-crew-suite`) to isolate publish boundaries, configure authorization tokens on the fly, and prevent credential exposure in environment variables.
* **Slack Incident Telemetry**: Integrates contextual webhook triggers (`rtCamp/action-slack-notify`) to fire localized rich-media incident warnings or successful deployment alerts based on live execution outcomes.

## Usage

To comply with enterprise security mandates, independent packages must execute deployment workflows sequentially **only after** a mandatory security analysis job passes. Workflows must be bound to immutable git tags rather than raw branch pushes, and the action must be pinned to a cryptographic commit SHA hash.

### Configure the Action Target

Ensure your runner environment grants explicit `id-token: write` and `contents: write` capabilities to satisfy cryptographic provenance auditing and automated release tracking rules:

```yaml
name: Production Release Pipeline

on:
  push:
    tags:
      - "v*" # Regulated release gating via immutable semantic tags

permissions:
  contents: write # Required for Changesets to cut official GitHub releases
  id-token: write # Required for automated cryptographic NPM package provenance signatures

jobs:
  security-gate:
    name: Mandatory Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1

      - name: Run Unified Security Engine
        uses: ai-crew-suite/pipelines/actions/security-analysis@a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0

  publish-packages:
    name: Verify and Publish to NPM
    needs: security-gate
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository Codebase
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Run Central Publish & Release Engine
        # COMPLIANT: Swapped floating tag (@v1) for an immutable, audited commit SHA hash
        uses: ai-crew-suite/pipelines/actions/publish-package@b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0 # v1.2.3
        with:
          node-version: "22"
          npm-auth-token: ${{ secrets.NPM_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Parameter Integration Matrix

Ensure your configuration mappings satisfy the required inputs:

* `npm-auth-token`: The access credential token needed to authenticate write passes against the target registry (Required).
* `github-token`: The administrative workflow context token needed to tag source histories and structure GitHub Releases (Required).
* `node-version`: The designated Node.js compilation footprint (Default: "22").
* `slack-webhook-url`: Optional telemetry endpoint stream. If left blank, the bot will completely suppress slack alert signals.

## Architectural Dependency Tree

This action anchors delivery and public distribution workflows across the organization workspace network:

* **Upstream Engine**: Wraps core modern workspace blocks including `actions/setup-node` (v7), `rharkor/caching-for-turbo` (v2), `changesets/action` (v2), and the `rtCamp/action-slack-notify` pipeline.
* **Downstream Consumer**: Executed directly inside continuous deployment orchestration pipelines (`.github/workflows/publish-pipeline.yml`) on primary repository release branches across the org.
* **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (`ai-crew-suite/pipelines/actions/publish-package@<COMMIT_SHA>`). Do not manage sensitive access keys or scope configurations inside localized package execution files.

## Local Development Workflow

### Installation & Tracking

This is an environmental deployment composition engine mapping secure parameters. Verify credentials configurations, scope variables, and integration schemas right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-publish-package
```

### Testing Configuration Updates

To safely test additions to scope routing configurations or notification templates, toggle mock webhooks inside a single application module before pushing changes to the production organization release tracks.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
