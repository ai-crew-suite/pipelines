# AI Crew Suite for Spotify Backstage IDP - Actions

![AI Crew Suite core plugins splash image](./ai-crew-suite-social-share-actions.jpeg)

AI Crew Suite is a Backstage plugin workspace for building retrieval-augmented, tool-using AI agents inside a developer portal. This repo includes common GitHub Actions to use in all project repos for CI/CD.

> [!WARNING]
> Actions with scripts do not support using `main` as a version pointer at call sites (e.g., `uses: ai-crew-suite/pipelines/actions/lint-architecture@main`). It will **fail** because `dist/` does not exist on `main`, it is added to the release tag during CI / CD.

## 🏗️ Development Workflow

This repository is a Backstage monorepo using Yarn 4 Plug'n'Play, Turbo, TypeScript project references, and package-local plugin builds.

**Prerequisites:**

- Node.js `>=22.22.2`
- Yarn `4.17.1`, as declared by `packageManager`

### 1. Installation & Builds

Run installation routines and build compilation tracks directly from the monorepo root so Yarn PnP and workspace references resolve correctly:

```bash
# optional refresh flag forces full install if wanted
yarn install --refresh
yarn turbo run build
```

### 2. Running Unit & Integration Tests

```bash
yarn turbo run lint
yarn turbo run test
```

### 3. Run Scripts in a Single Package

Add a `--filter`  flag to the command:

```bash
yarn turbo run test --filter=@ai-crew-suite/automate-stale
```

## 📚 Documentation

When adding or changing a core backend module, update the matching package README and the relevant page in the [documentation site repo](https://github.com/ai-crew-suite/documentation).

## 🚀 Release & Publication Management

### Publish a New Version

```bash
yarn turbo run publish
```

- Proxies `yarn changeset publish` to orchestrate multi-package version increments.
- Integrates seamlessly with the npm/Yarn lifecycle hooks (`prepack` / `postpack`) declared inside individual frontend and backend plugins, ensuring distribution tarballs carry fully compiled, production-ready path definitions during registry deployment passes.

## Enterprise Security & Compliance

This repository adheres to strict **FINRA, SOC-2 Type II, and HIPAA** compliance controls for software supply chain security. All actions and pipelines published here are cryptographically signed, immutable, and fully verifiable.

### 🔒 Enterprise Consumption Policy

To satisfy strict change management controls, **downstream enterprise environments must not use floating major tags** (e.g., `@v1`). You must pin all action references to an immutable cryptographic git commit SHA hash, accompanied by a version comment.

```yaml
# ❌ NON-COMPLIANT (Floating Tag - Fails Change Controls)
uses: ai-crew-suite/pipelines/actions/lint-architecture@v1

#  COMPLIANT (Pinned Commit SHA - Audit Trail Intact)
uses: ai-crew-suite/pipelines/actions/lint-architecture@a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0 # v1.2.3
```

### 📦 Release Mechanism & Immutable Assets

We enforce **SLSA Level 3 Build Provenance**.

1. **No Injected Git Tags:** Production assets are never forcefully committed or injected back into Git tags. Git tags in this repository are strictly write-once, immutable milestones.
2. **Release Archives:** Production-ready actions (including compiled `dist/` targets, `action.yml`, and documentation) are packaged into an isolated `action-distributable.zip` archive attached directly to the formal [GitHub Release](https://github.com).

### 🛡️ How to Verify Artifact Attestations

Every official release archive is cryptographically signed using **GitHub Artifact Attestations** and logged to the public, tamper-proof Sigstore ledger. This provides mathematically undeniable proof that the zip artifact was generated inside an untampered, official GitHub-hosted runner directly from our open-source commit history.

Before expanding a release asset inside a secure or regulated perimeter, compliance officers and automated deployment pipelines can verify its authenticity using the [GitHub CLI (`gh`)](https://github.com).

#### Verification Steps

1. **Download the Asset:**
   Download the `action-distributable.zip` package from the target release version.

2. **Run the Verification Command:**
   Execute the following command in your terminal or deployment workflow to validate the cryptographic chain of custody:

   ```bash
   gh attestation verify action-distributable.zip --owner ai-crew-suite
   ```

#### Expected Audit Output

Upon successful verification, the CLI will output a validated cryptographic payload confirming the matching OIDC claims:

```text
 Loaded 1 attestation from GitHub
 Loaded 1 trusted certificate from Sigstore Public Good Instance
 Verification PASSED

Subject SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
Repository:      ai-crew-suite/pipelines
Workflow:        .github/workflows/release-action.yml
Trigger:         release
```

If the file has been tampered with, modified post-build, or compiled outside of our explicit repository workflow, the verification check will fail immediately, halting your pipeline.

### Force a Tag Version

> [!DANGER]
> Never manually force-push tags (`git tag -f`) to GitHub. Bypassing the build pipeline prevents the `dist/` production assets from compiling. This will break actions with scripts for all downstream consumers.

If force-updating an existing version or patch a release without cutting a brand-new semver version is necessary:

1. Navigate to the `Actions` tab in the GitHub UI for this repository.
2. Select the `Build and Publish Action Release` workflow on the left sidebar.
3. Click the `Run workflow` dropdown menu.
4. Select your target development branch and type the exact release tag you want to overwrite (e.g., `v1.2.3`) into the `The target release tag to rebuild` field.
5. Click `Run workflow` to compile dependencies, attach the `dist/` directory, and safely update both the specific patch tag and the major moving tag (`v1`).

## 🔊 Get involved

### Issues and Discussions

Please open a [Discussion](https://github.com/ai-crew-suite/pipelines/actions/discussions) to get help, suggest a new feature, or to report a bug. We only want maintainers to open Issues.

- [GitHub Discussions for AI Crew Suite GitHub Actions](https://github.com/ai-crew-suite/pipelines/actions/discussions)

### Contributing

To contribute to AI Crew Suite, please read the contributing guidelines.

- [Guidelines for Contributing](https://github.com/ai-crew-suite/pipelines/actions/blob/main/.github/CONTRIBUTING.md)

### Contact and Social Media

The AI Crew Suite project is proudly supported and actively maintained by Webstack Builders.

- Contact [Webstack Builders](https://webstackbuilders/contact/) for commercial support questions.

Follow us on:

- BlueSky: [social@ai-crew-suite.dev](https://ai-crew-suite.bsky.social)
- LinkedIn: [linkedin.com/company/ai-crew-suite](https://linkedin.com/company/ai-crew-suite)

## 🛡️ Security / Disclosure

If you find any bug with AI Crew Suite that may be a security problem, please report it through the [GitHub Security Advisories process](https://github.com/ai-crew-suite/pipelines/actions/security/advisories). This way we can evaluate the bug and hopefully fix it before it gets abused. Please give us enough time to investigate the bug before you report it anywhere else.

If you would like to discuss a potential finding before raising the Advisory, then e-mail us at[security@ai-crew-suite.dev](mailto:security@ai-crew-suite.dev).

## ©️ Compliance and Licensing

Copyright © 2026 The AI Crew Suite Authors.
Licensed under the **Apache License, Version 2.0**.
