# Shared Weekly Version Bump Engine

Centralized framework upgrade engine executing automated upstream Backstage version bumps and compiling structural tracking pull requests across the AI Crew Suite platform.

## Overview

This GitHub Action drives dependency maintenance and upstream platform synchronization across organization workspaces. Built as an encapsulated, composite workspace engine, it checks out the caller repository, intercepts the weekly release track of the Backstage framework ecosystem, performs local module upgrades via `backstage-cli`, resolves lockfile structural changes, and orchestrates traceable Pull Requests to keep repositories securely up to date.

## Compliance Posture (FINRA, HIPAA, SOC-2)

To satisfy rigorous corporate audits and data integrity controls, this guarantees un-bypassable verification trails across three essential compliance controls:

- **Non-Repudiable System Identity**: Eliminates static Personal Access Tokens (PATs) that bypass security controls. By mandating short-lived tokens derived from a dedicated corporate **GitHub App**, every automated dependency transformation is cryptographically bound to a verified machine identity (`CrewSuiteReleaseBot [bot]`).
- **Scan Trigger Continuity (SOC-2 Change Management)**: By avoiding the default `GITHUB_TOKEN` limitation where subsequent workflows are blocked, this engine ensures that your mandatory pull request quality gates (**CodeQL, Grype, Trivy, and the License Firewall**) automatically execute on the generated upgrade PR before it can ever be merged.
- **Traceable Tamper-Evidence**: This action operates on a strict **Separation of Duties** principle. It handles code collection, installation, and modification entirely within its own sandboxed composite lifecycle, producing a transparent Pull Request diff that serves as the unalterable audit trail for peer authorization.

## Core Responsibilities

- **Encapsulated Workspace Checkout**: Automates its own codebase collection natively using the passed system app token, removing the requirement for caller workflows to manually orchestrate pre-flight checkout blocks.
- **Upstream Framework Bumping**: Automates code migration passes via `yarn backstage-cli versions:bump` to programmatically absorb new ecosystem security patches, plugins, and core feature layers.
- **Deterministic Yarn 4 Operations**: Replaces broken and deprecated legacy dependency parameters with standardized Yarn 4 flags (`--immutable --inline-builds`) to ensure structural lockfile validation occurs natively before framework drift calculation begins.
- **Automated Pull Request Scaffolding**: Leverages advanced tracking blocks (`peter-evans/create-pull-request`) to automatically build tracking branches, assign operational labels, and publish descriptive, audit-ready workspace change summaries.

## Usage

To apply this maintenance automation layer inside an independent repository workspace, structure your orchestration file (e.g., `.github/workflows/framework-updates.yml`) using this format.

*Note: You do not need to call `actions/checkout` prior to invoking this step; the action handles self-checkout natively inside its composite container.*

### Configure the Action Target

Ensure your parent workflow schedules this engine on a weekly cron track and explicitly declares elevated permissions to support machine-identity branch operations:

```yaml
name: Check Bump Versions for Backstage Core

on:
  schedule:
    - cron: "0 6 * * 5" # Runs every Friday morning at 6:00 AM
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

jobs:
  create-pull-request:
    name: Execute Framework Upgrade Pass
    runs-on: ubuntu-latest
    steps:
      # Generate an ephemeral, short-lived token using a dedicated corporate App identity
      - name: Generate System Identity Token
        id: generate-token
        uses: actions/create-github-app-token@559b9cdce1d56fa6041d1988539f908196155e8a # v1.11.1
        with:
          app-id: ${{ secrets.COMPLIANCE_BOT_APP_ID }}
          private-key: ${{ secrets.COMPLIANCE_BOT_PRIVATE_KEY }}

      - name: Run Centralized Upstream Upgrade Check
        uses: ai-crew-suite/pipelines/actions/check-backstage-dependency-version@b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0 # v1.2.3
        with:
          workflow-github-token: ${{ steps.generate-token.outputs.token }}
```

### Parameter Integration Matrix

Ensure your environment configurations fulfill the required execution states:

- `workflow-github-token` (Required): A short-lived installation tracking token derived from an authorized GitHub App configuration profile with explicit permissions to create branches and track Pull Requests.
- `node-version` (Optional): The designated Node.js execution runtime footprint (Default: `"22"`).
- **Automated Integration**: Successful runs will automatically publish a structured, un-merged Pull Request targeting `main`, pre-tagged with `dependencies` and `triage` labels for your team to review.

## Architectural Dependency Tree

This action anchors maintenance governance and third-party tracking loops across the organization workspace network:

- **Upstream Engine**: Wraps system foundation layers including `actions/checkout` (v4), `actions/setup-node` (v4), `rharkor/caching-for-turbo` (v2), and the official community release checker block `peter-evans/create-pull-request` (v8).
- **Downstream Consumer**: Executed directly inside scheduled cron automation workflows (`.github/workflows/weekly-maintenance.yml`) of every framework-aligned repository in the organization.
- **Boundary Rule**: Always consume this action utilizing its verified, organization-relative subpath (`ai-crew-suite/pipelines/actions/check-backstage-dependency-version@<COMMIT_SHA>`). Do not introduce loose, non-centralized upgrade macros or automated versioning loops.

## Local Development Workflow

### Installation & Distribution

This is an environmental scripting track wrapping dynamic CLI operations. Verify upgrade parameters, label lists, and integration schemas right within its execution scope:

```bash
yarn install --refresh
yarn turbo run lint --filter=@ai-crew-suite/action-check-backstage-dependency-version
```

### Testing Configuration Updates

To evaluate changes to target branch patterns or upgrade targets, trigger the action pass manually inside an isolated validation branch using a dedicated staging application token before pushing modifications to production organization paths.

## Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
