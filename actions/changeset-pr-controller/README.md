# Shared Changeset PR Controller

Centralized automated release engine managing immutable Yarn workspace installations and tracking Changesets pull requests across the AI Crew Suite platform.

## Overview

This GitHub Action orchestrates package version lifecycles and branch automations across organization repositories. Built as a secure, composite workflow, it initializes isolated runtime containers, runs fast immutable package updates via Yarn 4 cached lookups, and delegates version updates directly into automated release Pull Request matrices without manual engineering intervention.

## Compliance Posture (FINRA, HIPAA, SOC-2)

To satisfy rigorous corporate audits, this engine guarantees an un-bypassable verification trail across three essential compliance controls:

- **Non-Repudiable System Identity**: By utilizing a dedicated GitHub App or custom installation identity rather than a generic administrator Personal Access Token (PAT), every automated commit and Pull Request is explicitly logged under a tracked machine identity (`CrewSuiteReleaseBot [bot]`).
- **Source-to-Binary Traceability (FINRA)**: Ensures that the automated calculations for package numbers and changelogs (`yarn changeset version`) maintain absolute cryptographic lineage back to the original human-vetted pull request commit ledger.
- **Scan Trigger Continuity (SOC-2)**: By avoiding the default `GITHUB_TOKEN` limitation where subsequent workflows are blocked, this action forces downstream security gates (**CodeQL, Grype, Trivy, and the License Firewall**) to automatically trigger on the generated "Version Packages" PR before it can ever be merged.

## How It Integrates into Release Pipelines

| Dimension         | `changeset-verification` Action                              | `changeset-pr-controller` Action (This Action)               |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **Where it runs** | **Feature Branches / Pull Requests**                         | **The Default Branch (`main`)**                              |
| **The Trigger**   | Triggers on everyday developer pull request validation events. | Triggers *after* an approved pull request is merged into `main`. |
| **Core Goal**     | Enforces that a human-vetted changeset documentation file exists before merge. | Consolidates all accumulated changesets to bump package numbers. |
| **What it edits** | **None (Read-Only)**. Fails the build if documentation is missing. | Updates `package.json` versions and updates your `CHANGELOG.md` files. |
| **The Output**    | Passes the compliance status gate or blocks the PR from merging. | **Creates a new, official system PR** (e.g., "Version Packages") containing the new versions. |

## Core Responsibilities

- **Deterministic Environments**: Configures identical Node.js build footprints natively linked to Yarn internal cache layers.
- **Immutable Installations**: Enforces strict Yarn 4 parameters (`--immutable --inline-builds`) to guarantee underlying lockfile drift is caught and reported instantly.
- **Yarn 4 Workspace Automation**: Wraps standard Changeset lifecycles, executing `yarn changeset version` to accurately calculate multi-package dependency charts and generate release-branch Pull Requests under a modern mono-repository architecture.

## Architectural Dependency Tree

This action manages versioning and release gating rules across the organization workspace network:

- **Upstream Engine**: Wraps core modern lifecycle blocks including `actions/checkout` (v4), `actions/setup-node` (v4), and `changesets/action` (v2).
- **Downstream Consumer**: Executed directly inside continuous deployment or main trunk merge workflows (`.github/workflows/release-pipeline.yml`) of code repositories in the org.
- **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (`ai-crew-suite/pipelines/actions/changeset-pr-controller@<COMMIT_SHA>`). Do not split environment installation sequences from the release execution pass.

## Usage

To apply this release management layer inside an independent repository workspace, structure your orchestration file (e.g., `.github/workflows/release.yml`) using this format.

### Configure the Action Target

Ensure your execution block utilizes a token generated from a dedicated corporate **GitHub App**. This ensures that downstream security scanners can run successfully on the resulting Pull Request.

```yaml
name: Automated Release Lifecycle

on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  version-sync:
    name: Track and Version Main Branch
    runs-on: ubuntu-latest
    steps:
      - name: Generate System Identity Token
        id: generate-token
        uses: actions/create-github-app-token@559b9cdce1d56fa6041d1988539f908196155e8a # v1.11.1
        with:
          app-id: ${{ secrets.COMPLIANCE_BOT_APP_ID }}
          private-key: ${{ secrets.COMPLIANCE_BOT_PRIVATE_KEY }}

      - name: Execute Centralized PR Controller Pass
        uses: ai-crew-suite/pipelines/actions/changeset-pr-controller@b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0 # v1.2.3
        with:
          node-version: "22"
          github-token: ${{ steps.generate-token.outputs.token }}
          pr-title: "Version Packages - Release Automated Updates"
```

### Parameter Integration Matrix

Ensure your configuration mappings satisfy the required inputs:

- `node-version` (Optional): The target Node.js execution runtime footprint (Default: `"22"`). Natively tracks Yarn lockfile hashes across executions.
- `github-token` (Required): The dedicated enterprise GitHub App or machine installation token needed to write releases, track histories, and structure versioning Pull Requests.
- `pr-title` (Optional): The visual name string attached to the automatically generated release-sync Pull Request (Default: `"Version Packages - release automated updates"`).

## Local Development Workflow

### Installation & Builds

This is an environment orchestration script tracking active dependency trees. Verify input parameters and integration schemas right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-changeset-pr-controller
```

### Testing Configuration Updates

To evaluate changes made to the underlying version scripts or environmental definitions, trigger execution checks against an isolated staging repository using a dedicated testing application token before tagging production organization pathways.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.

