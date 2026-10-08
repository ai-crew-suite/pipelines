# Centralized Branch and PR Alignment Engine

Centralized policy enforcement engine executing automated branch taxonomy validation and programmatic target-branch verification across the AI Crew Suite platform.

## Overview

This GitHub Action serves as an immutable pre-flight compliance gate across organization repositories. Built as a secure, zero-dependency composite engine, it intercepts early-stage Pull Request lifecycles to programmatically reject non-compliant git taxonomies, mandate structured change tracking, and evaluate target branch destinations to mitigate structural deployment errors.

## Compliance Posture (FINRA, HIPAA, SOC-2)

To satisfy rigorous corporate audits and technical change control frameworks, this engine guarantees un-bypassable verification baselines across three critical governance parameters:

- **Continuous Control Effectiveness (SOC-2 CC8.1)**: By anchoring execution hooks across a broad state matrix (`opened`, `edited`, `synchronized`, `reopened`), this engine prevents the "reopen bypass" loophole, proving to auditors that all active branches are continuously validated without manual override vulnerability.
- **Zero-Trust Data Minimization (HIPAA Access Control)**: Unlike traditional actions, this engine operates under absolute zero filesystem access (`contents: none`). It analyzes isolated network metadata without checking out code or caching text strings, completely eliminating the risk of accidental PHI/NPI exfiltration into runner logs.
- **Injection-Hardened Runtime Safety**: To meet strict application security profiles, the engine integrates native Bash sanitization passes. It strips non-standard character classes, shell tokens, and wildcards from user-controlled branch inputs (`github.head_ref`) prior to regular expression parsing, completely blocking script-injection vectors.

## Core Responsibilities

- **Taxonomy Enforcement & Traceability**: Standardizes upstream developer workflows by validating branch prefixes against authorized tracks (e.g., `feature/`, `bugfix/`, `hotfix/`). This ensures clear lineage mapping back to your enterprise issue tracking system for audit accountability.
- **Automated Ecosystem Whitelisting**: Natively intercepts and safely bypasses strict taxonomy validation filters for machine-generated dependency tracks originating from verified platforms (e.g., `dependabot/`).
- **Merge-Target Guarding (FINRA Audit Trails)**: Evaluates PR destination variables programmatically, issuing operational system warnings if a branch attempts to bypass the main trunk line, ensuring unintended release drift is immediately flag-audited.

## Usage

To apply this compliance validation layer inside an independent repository workspace, structure your orchestration file (e.g., `.github/workflows/pr-metadata-gate.yml`) using this format.

*Note: This action evaluates pure environment strings. You do not need to call `actions/checkout` prior to invoking this step; keeping the workspace clear satisfies strict data isolation controls.*

### Configure the Action Target

Ensure your parent workflow executes on comprehensive pull request state transitions and drops all token permissions explicitly to enforce least-privilege:

```yaml
name: Pull Request Metadata Linting

on:
  pull_request:
    types: [opened, edited, synchronized, reopened]

# Explicitly clear out all default permissions at the workflow level
permissions: {}

jobs:
  validate-metadata:
    name: Enforce Branching Compliance
    runs-on: ubuntu-latest

    # Granular permissions ensuring absolute zero repository file access
    permissions:
      contents: none
      pull-requests: none
      issues: none

    steps:
      - name: Validate Rules
        # Always pin to the specific 40-character commit SHA for change control audit trails
        uses: ai-crew-suite/pipelines/actions/enforce-branch-protection@a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
        with:
          head-ref: ${{ github.head_ref }}
          base-ref: ${{ github.base_ref }}
```

### Parameter Integration Matrix

Ensure your configuration mappings satisfy the required inputs:

- `head-ref` (Required): The source branch name being evaluated. Must adhere to strict human types (`bugfix`, `hotfix`, `feature`, `infrastructure`, `maintenance`, `content`) followed by alphanumeric, lowercase descriptive tags, or follow the `dependabot/` path.
- `base-ref` (Required): The target merge branch name. Warns developers programmatically if the Pull Request points away from the main trunk line (`main`).

## Architectural Dependency Tree

This action anchors quality governance checkpoints across the organization workspace network:

- **Upstream Engine**: Pure Bash runtime requiring no third-party javascript packaging or runner dependencies. Evaluates metadata exposed directly by the GitHub orchestrator.
- **Downstream Consumer**: Executed directly inside the pre-merge validation pipelines (`.github/workflows/pr-validation.yml`) of every code repository in the organization.
- **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath and immutable commit SHA (`ai-crew-suite/pipelines/actions/enforce-branch-protection@<COMMIT_SHA>`). Do not introduce localized variations or un-audited branching macros.

## Local Development Workflow

### Installation & Distribution

This is a composite script tracking active runtime properties. Verify input parameters and regex structures right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/enforce-branch-protection
```

### Testing Configuration Updates

To test additions to the branch prefix regular expressions, run validation arrays manually against mock environment strings inside an isolated staging branch before cutting a global organization release version.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
