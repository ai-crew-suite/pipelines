# Changeset Automated Synchronization Action

Centralized automation layer for managing package version descriptors, enforcing release-intent auditing, and synchronizing project changelogs across the AI Crew Suite platform.

## Overview

This GitHub Action orchestrates automated version tracking controls across all organization repositories. Built as a secure, composite workflow, it interfaces with the local Changeset engine to audit pull requests for release-intent documentation. If a developer forgets to declare a changeset file, this action injects an automated fallback descriptor and cleanly commits it back to the active tracking branch to avoid blocking continuous integration cycles.

## How It Work With `changeset-pr-controller` Action in Release Pipelines

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

* **Changeset Auditing**: Interrogates the workspace layout to ensure changelog intents are actively documented by contributors before testing matrices execute.
* **Automated Fallback Generation**: Dynamically creates an isolated fallback patch metadata block via the Changeset engine whenever standard developer release tags are missing.
* **Secure Branch Synchronization**: Configures a secure workspace Git actor profile to stage, track, commit, and push generated metadata back to source lines while appending `[skip ci]` to suppress downstream recursion loops.

## Architectural Dependency Tree

This action manages testing compliance and auditing windows across the organization workspace network:

* **Upstream Engine**: Relies directly on native environment variable paths and the core execution loops of the installed `@changesets/cli` suite.
* **Downstream Consumer**: Executed directly inside continuous integration pipelines (`.github/workflows/ci.yml`) as an explicit step before test execution or build compilation.
* **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (`ai-crew-suite/pipelines/actions/changeset@v1`). Do not create loose, un-audited local script profiles.

## Usage

To apply this tracking layer inside your unified continuous integration pipeline, couple the runner step early in your deployment and verification layout:

### Configure the Action Target

Ensure your runner environment schedules this sync block before running deep unit or integration checks, granting explicit `contents: write` privileges so the worker can sync structural updates back to GitHub:

```yaml
name: Continuous Integration

on:
  pull_request:
    branches: [main]

jobs:
  build-and-verify:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: 📂 Checkout Application Source
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Crucial: Fetch depth 0 ensures changesets can compute branch histories accurately
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: 🛠️ Initialize Node Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "yarn"

      - name: 📦 Install Architecture Dependencies
        run: yarn install --immutable

      - name: 🦋 Sync Repository Changesets
        uses: ai-crew-suite/pipelines/actions/changeset@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}

      - name: 🧬 Run Test Suite Validation Matrix
        run: yarn test
```

## Parameter Integration Matrix

Ensure your configuration mappings satisfy the required inputs:

* `github_token` (Required): Elevated PAT or standard repository Installation Token required to push synchronization commits to branch tracking lines.
* `commit_message` (Optional): The commit string used when syncing structural changesets. Defaults to `chore: automated changeset sync [skip ci]`.

## Local Development Workflow

### Installation & Tracking

This is an administrative tracking tool mapping workspace metadata paths. Verify configuration scopes and file patterns within its execution block:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-changeset
```

### Testing Configuration Updates

To evaluate updates to the sync loop or descriptive fallback text, run validation checks against an isolated testing repository before publishing new tags to the global platform release track.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
