# Shared Changeset PR Controller

Centralized automated release engine managing immutable Yarn workspace installations and tracking Changesets pull requests across the AI Crew Suite platform.

## Overview

This GitHub Action orchestrates package version lifecycles and branch automations across organization repositories. Built as a secure, composite workflow, it initializes isolated runtime containers, runs fast immutable package updates via Yarn 4 cached lookups, and delegates branch updates directly into automated versioning Pull Request matrices without manual engineering intervention.

## How It Work With `changeset-sync` Action in Release Pipelines

1. **Phase 1 (Feature Work):** A developer opens a PR to add a feature. Your **`changeset-sync`** action runs. It ensures there is a markdown file describing the change. If not, it safely creates one so your pipeline passes.
2. **Phase 2 (The Merge):** The team reviews the code and merges the PR into `main`.
3. **Phase 3 (The Release):** Once on `main`, your **`changeset-pr-controller`** kicks into gear. It reads all the tiny changeset files that `changeset-sync` verified, deletes them, updates your workspace package version numbers, writes the official changelog notes, and packages everything into an automated "Version Packages" release PR.

| Dimension | `changeset-sync` Action | `changeset-pr-controller` Action |
| --- | --- | --- |
| **Where it runs** | **Feature Branches / Pull Requests** | **The Default Branch (`main`)** |
| **The Trigger** | Triggers on everyday developer push/PR events. | Triggers *after* a pull request is merged into `main`.       |
| **Core Goal** | Enforces that a changeset documentation file exists so a release *can* happen later. | Consolidates all accumulated changesets to bump package numbers. |
| **What it edits** | Adds an empty or patch fallback `.changeset/xxxx.md` file if a developer forgot one. | Updates `package.json` versions and updates your `CHANGELOG.md` files. |
| **The Output** | Pushes a small file commit directly back into the developer's open PR branch. | **Creates a new, official system PR** (e.g., "Version Packages") containing the new versions. |

## Core Responsibilities

* **Deterministic Environments**: Configures identical Node.js build footprints natively linked to Yarn internal cache layers.
* **Immutable Installations**: Enforces strict Yarn 4 parameters (`--immutable --inline-builds`) to guarantee underlying lockfile drift is caught and reported instantly.
* **Automated Version Tracking**: Wraps standard Changeset lifecycles, executing `yarn version` to generate release-branch Pull Requests automatically.

## Architectural Dependency Tree

This action manages versioning and release gating rules across the organization workspace network:

* **Upstream Engine**: Wraps core modern lifecycle blocks including `actions/checkout` (v7), `actions/setup-node` (v7), and `changesets/action` (v2).
* **Downstream Consumer**: Executed directly inside continuous deployment or main trunk merge workflows (`.github/workflows/release-pipeline.yml`) of code repositories in the org.
* **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (`ai-crew-suite/pipelines/actions/changeset-pr-controller@v1`). Do not split environment installation sequences from the release execution pass.

## Usage

To apply this release management layer inside an independent repository workspace, structure your orchestration file (e.g., `.github/workflows/release.yml`) using this format:

### Configure the Action Target

Ensure your execution block provides a token with elevated permissions to create and push branches, update code contents, and track Pull Requests.

*Note: You do not need an explicit checkout step before this action; it handles repository checkout internally.*

```yaml
name: Automated Version Sync

on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  version-sync:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write # Required to allow Changesets to open PRs

    steps:
      - name: 🚀 Execute Centralized PR Controller Pass
        uses: ai-crew-suite/pipelines/actions/changeset-pr-controller@v1
        with:
          node-version: "22"
          github-token: ${{ secrets.GITHUB_TOKEN }}
          pr-title: "Version Packages - Release Automated Updates"
```

## Parameter Integration Matrix

Ensure your configuration mappings satisfy the required inputs:

* `node-version` (Optional): The target Node.js execution runtime footprint (Default: `"22"`). Natively tracks Yarn lockfile hashes across executions.
* `github-token` (Required): The administrative access token needed to write releases and structure versioning Pull Requests.
* `pr-title` (Optional): The visual name string attached to the automatically generated release-sync Pull Request (Default: `"Version Packages - release automated updates"`).

## Local Development Workflow

### Installation & Builds

This is an environment orchestration script tracking active dependency trees. Verify input parameters and integration schemas right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-changeset-pr-controller
```

### Testing Configuration Updates

To test additions to the installation configurations, execute the action run within a dedicated staging repository using a test personal access token (PAT) before updating global platform version tags.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
