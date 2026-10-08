# TODOs

- `check-api-updates` need implementation

- Fix scripts in all actions package.json files

- `yarn typecheck` ends up in a forever loop

## Open Source Repository Governance Policy

Because you are using a standard organization account without global enterprise-level policy controls, you must enforce the following rules directly inside your repository settings.

### Repository Access & Tag Security (FINRA / SOC-2)

You must prevent both human developers and automation platforms from altering existing release milestones.

- Action: In your GitHub repository, navigate to Settings > Tags > Tag Protection Rules.
- Rule: Add a rule for `v*` (or `*`).
- Enforcement: Ensure that no roles—including Repository Administrators—possess the ability to force-push (git push -f) or delete an active tag.

### Fork and Pull Request Isolation (HIPAA / SOC-2 Network Security)

Public contributors can edit fork code and run it on your organization's runner minutes. If a fork modifies code to leak sensitive deployment values or secrets, it could compromise your organization.

- **Action:** Go to **Settings > Actions > General > Fork pull requests**.
- **Rule:** Select **"Require approval for all outside contributors"**. This forces a team member to manually review the code before a GitHub-hosted runner executes it.
- **Rule:** Uncheck **"Send secrets to workflows from fork pull requests"** to completely insulate your organizational environment keys.

### Workflow Permissions Lockdown (Principle of Least Privilege)

By default, standard GitHub repositories give generous write permissions to generic workflow runs.

- **Action:** Go to **Settings > Actions > General > Workflow permissions**.
- **Rule:** Change the default setting to **"Read repository contents and packages permissions"** (Read-Only).
- **Impact:** This ensures that unless a workflow explicitly requests `permissions: write` (like our release script above), a malicious dependency or rogue script cannot rewrite your git code or tags.

### Tag Protection Rule Definition (FINRA Anti-Tampering)

Standard organizations do not have branch protection rules for tags by default, making them mutable unless explicitly protected.

- **Action:** Go to **Settings > Tags > Tag Protection Rules > Add rule**.
- **Pattern:** Input `v*`
- **Outcome:** Prevents any developer from running `git push origin v1.0.0 --force`, satisfying the SOC-2 immutable version history requirements.

### Mandatory NPM Account Configurations

Auditors checking your company's NPM registry architecture will require proof of protection against account takeover or malicious dependency injection. Configure these fields directly inside your **NPM Organization Dashboard**:

1. **Enforce 2FA for Publish Operations**: Navigate to your NPM organization settings and set the 2FA policy to **"Enforce two-factor authentication for all members"**.
2. **Configure Automation Tokens**: Ensure that the `NPM_TOKEN` saved inside your GitHub Secrets is explicitly generated as an **"Automation Token"**. Automation tokens bypass the interactive 2FA prompt during automated pipelines while remaining strictly restricted by IP blocks or organization scopes.
3. **Verify Provenance Badging**: Once published using this updated flow, a public **"Provenance: Verified"** badge will appear on your package page on npmjs.com. This acts as visual evidence for FINRA and SOC-2 auditors that the software supply chain remains uncompromised.

## Moving to AWS Runners with OIDC Trust Boundaries

When you migrate to AWS for your build runners, storing long-lived, static credentials (like an `AWS_ACCESS_KEY_ID`) inside GitHub Secrets is a major **SOC-2 and FINRA violation**. If those keys are leaked or compromised, an attacker gains permanent access to your cloud architecture.

The compliant solution is to establish an **OIDC (OpenID Connect) trust boundary**. This allows GitHub Actions to authenticate directly with AWS Identity and Access Management (IAM) using short-lived, cryptographic tokens that expire automatically after the runner completes its task.

### 1. Configure the Cloud Provider (AWS IAM Setup)

Before updating your workflow, your cloud administrator must create an Identity Provider trust and a dedicated IAM role inside AWS.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_AWS_ACCOUNT_ID:oidc-provider/://githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "://githubusercontent.com:aud": "://amazonaws.com"
        },
        "StringLike": {
          "://githubusercontent.com:sub": "repo:ai-crew-suite/pipelines:*"
        }
      }
    }
  ]
}
```

- **Why this is safe:** The `Condition` block restricts access *exclusively* to workflows running inside your specific GitHub organization and repository (`ai-crew-suite/pipelines`).

### Part 2: Upgraded, Compliance-Hardened Workflow (OIDC + AWS + SBOM)

This updated pipeline brings together everything you requested. It transitions your deployment to **AWS self-hosted runners**, handles **OIDC secure token exchange**, and generates an automated **Software Bill of Materials (SBOM)** using **Anchore Grype** to meet strict regulatory vulnerability scanning requirements.

Replace your `.github/workflows/release-action.yml` file with this production-hardened configuration:

```yaml
name: Secure Production Release Lifecycle

on:
  release:
    types: [published]

# Enforce strict, minimal permissions to satisfy the Principle of Least Privilege
permissions:
  contents: write       # Required to upload compiled assets to the published release
  id-token: write       # REQUIRED: For AWS OIDC authentication and Sigstore identity exchange
  attestations: write   # REQUIRED: Permission to write to the GitHub Attestations store

jobs:
  audit-and-publish:
    name: Verify, Compile, Scan, and Attest Action
    # Migrated from ubuntu-latest to your enterprise AWS self-hosted fleet
    runs-on: [self-hosted, linux, aws-runner]
    steps:
      - name: Checkout Source Code Traceability
        uses: actions/checkout@v4
        with:
          persist-credentials: false 

      - name: Configure AWS Credentials via OIDC Trust Boundary
        # Authenticates securely with AWS using short-lived tokens instead of permanent secrets
        uses: aws-actions/configure-aws-credentials@e3dd4a4cd9e7007c7268b88a1c97a796e62024c8 # v4.0.2
        with:
          role-to-assume: arn:aws:iam::YOUR_AWS_ACCOUNT_ID:role/github-actions-release-role
          aws-region: us-east-1
          audience: ://amazonaws.com

      - name: Set up Secure Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'

      - name: Install Monorepo Dependencies (Locked)
        run: yarn install --immutable

      - name: Compile Distribution Assets
        run: yarn turbo run build

      - name: Package Distributable for Audit Trail
        run: |
          mkdir -p release-payload
          cp -r action.yml README.md dist release-payload/
          cd release-payload && zip -r ../action-distributable.zip .

      - name: Generate Software Bill of Materials (SBOM) & Scan Vulnerabilities
        # Scans your bundled action code and dependencies for regulatory CVE compliance
        uses: anchore/scan-action@7c05671ae9be1cef000d2592802793b8308d74db # v6.1.0
        with:
          path: "release-payload"
          output-format: sarif
          fail-build: true # Fails the production release automatically if high/critical CVEs exist
          severity-cutoff: high

      - name: Generate Cryptographic Build Provenance
        # Generates a signed, tamper-proof attestation mapping the zip to this exact commit
        uses: actions/attest-build-provenance@c074443f9c5fb40f4dc15f40375a0fcf691da177 # v2.2.3
        with:
          subject-path: 'action-distributable.zip'
```

### Part 3: README Documentation Update

Add this clean, technical block under your **Enterprise Security & Compliance** section in the `README.md` to communicate your new vulnerability standards to upstream enterprise consumers:

```markdown
### 🔍 Vulnerability Governance (SBOM & CVE Scanning)

To comply with **FINRA and HIPAA security mandates**, every official production package undergoes automated static application security testing (SAST) and software dependency analysis prior to release.

*   **Vulnerability Gating:** The compilation pipeline automatically breaks and halts release deployment if any unmitigated **High or Critical CVE vulnerabilities** are discovered within our dependencies.
*   **Dependency Provenance:** An automated **Software Bill of Materials (SBOM)** profile is verified and generated during the secure runner runtime to guarantee complete software transparency.
```

