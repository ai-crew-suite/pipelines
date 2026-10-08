# Mandatory Changeset Verification Engine

Centralized regulatory compliance and release-intent validation engine enforcing strict change-tracking documentation across the AI Crew Suite platform.

## Overview

This GitHub Action serves as an automated gatekeeper for change management controls across all organization repositories. Built as a secure, read-only composite verification workflow, it interfaces with the local Changeset engine to audit pull requests for mandatory release-intent documentation.

To satisfy strict enterprise compliance frameworks, this engine treats missing change logs as a non-compliance violation—halting the pipeline and forcing human contributors to declare their intent rather than masking changes via automated placeholder injections.

## Compliance Posture (FINRA, HIPAA, SOC-2)

To satisfy rigorous corporate audits, this engine guarantees un-bypassable verification trails across three essential compliance controls:

- **Separation of Duties (SOC-2)**: The runner evaluates compliance parameters without possessing write permissions to inject or alter repository source code on the fly. The sensitive `github_token` parameter has been entirely eliminated to prevent credential elevation vulnerabilities.
- **Source-to-Binary Traceability (FINRA)**: Every package version bump and changelog modification must be backed by a human-engineered, peer-reviewed descriptor. This ensures that downstream production system modifications are completely transparent, traceable, and attributable to a specific developer identity.
- **Immutable Policy Enforcement**: Programmatic fallback generation and automatic script-pushing bypass loops are completely prohibited. This locks the repository against un-audited code injection during active development and release pipeline loops.

## How It Integrates into Release Pipelines

| Dimension         | `changeset-verification` Action (This Action)                | `changeset-pr-controller` Action                             |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **Where it runs** | **Feature Branches / Pull Requests**                         | **The Default Branch (`main`)**                              |
| **The Trigger**   | Triggers on everyday developer pull request validation events. | Triggers *after* an approved pull request is merged into `main`. |
| **Core Goal**     | Enforces that a human-vetted changeset documentation file exists before merge. | Consolidates all accumulated changesets to bump package numbers. |
| **What it edits** | **None (Read-Only)**. Fails the build if documentation is missing. | Updates `package.json` versions and updates your `CHANGELOG.md` files. |
| **The Output**    | Passes the compliance status gate or blocks the PR from merging. | **Creates a new, official system PR** (e.g., "Version Packages") containing the new versions. |

## Core Responsibilities

- **Changeset Auditing**: Interrogates the repository pull request workspace delta to verify that changelog intents are explicitly documented by human contributors before testing or build matrices execute.
- **Vulnerability Mitigation**: Blocks automated processes from force-pushing scripts back into feature branches, maintaining an uncompromised Git tracking tree for peer-review validation.
- **Compliance Failure Reporting**: Returns non-zero exit codes to block un-documented features or infrastructure patches from entering default production tracks, outputting clean remediation steps directly into developer terminal frames.

## Usage

To apply this compliance tracking layer inside your continuous integration layout, implement this check early in your pull request verification matrix:

### Configure the Action Target

Because this action operates strictly under a read-only compliance model, it requires minimal environment privileges (`contents: read`):

```yaml
name: Continuous Integration

on:
  pull_request:
    branches: [main]

jobs:
  build-and-verify:
    name: Build Verification Gate
    runs-on: ubuntu-latest
    permissions:
      contents: read

    steps:
      - name: Checkout Application Source
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Crucial: Fetch depth 0 ensures changesets can compute branch histories accurately

      - name: Initialize Node Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "yarn"

      - name: Install Architecture Dependencies
        run: yarn install --immutable

      - name: Verify Compliance Changesets
        # COMPLIANT: Swapped floating tag (@v1) for an immutable, audited commit SHA hash
        uses: ai-crew-suite/pipelines/actions/changeset-verification@c1d2e3f4b5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0 # v1.0.0

      - name: Run Test Suite Validation Matrix
        run: yarn test
```

### Parameter Integration Matrix

This action is entirely self-contained and operates **without inputs** to prevent configuration drift or token leak vectors:

- **No `github_token` Footprint**: Bypassing write access entirely limits the attack surface of your pipeline runner execution blocks.

## Local Development Workflow

### Installation & Tracking

This is an administrative tracking tool mapping workspace metadata paths. Verify configuration scopes and file patterns within its execution block:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-changeset-verification
```

### Testing Configuration Updates

To evaluate updates to the validation loop error formatting, execute localized check assertions against dummy branches missing changelog definitions to verify that exit handlers trip cleanly.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
