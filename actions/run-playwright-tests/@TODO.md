# Notes from Workflow

Why does the action have `public-sentry-dsn` as an input?

```yaml
name: 🏗️ Infrastructure & Ephemeral Staging Deployment
on:
  pull_request:
    # Explicitly triggers whenever infrastructure code, server configurations, or chart files are modified
    paths:
      - "packages/app-config/app-config.ci.yaml"
      - "packages/deploy-terraform/**"
      - "packages/deploy-kubernetes/**"
      - "packages/containers/**"

# Automatically cancel outdated in-flight builds if a developer pushes a fast follow-up commit to the same PR
concurrency:
  group: github.workflow -{{ github.event.number }}
  cancel-in-progress: true

jobs:
  # --- JOB 1: IA-C SANITY VERIFICATION ---
  validate-infrastructure:
    name: 🏛️ Validate IaC Blueprints
    runs-on: ubuntu-latest
    steps:
      - name: 🔑 Checkout Source Code
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1

      - name: 🛠️ Set up Node and Yarn Workspace
        uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 22
          cache: "yarn"

      - name: 📦 Install Workspace Dependencies
        run: yarn install --immutable

      - name: 🔍 Lint & Validate Terraform Schemas
        run: |
          yarn tf:init
          yarn tf:validate

      - name: 📡 Run Infrastructure Plan Matrix
        run: yarn tf:plan
        env:
          TF_VAR_database_secure_password: \${{ secrets.AWS_PROD_DB_PASSWORD }}
          AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: "us-east-1"

  # --- JOB 2: COMPILATION & STAGING DEPLOYMENT (RUNS DIRECTLY ON YOUR AWS SELF-HOSTED RUNNER) ---
  deploy-ephemeral-preview:
    name: 🚀 Deploy Ephemeral Test Bench
    needs: validate-infrastructure
    runs-on: self-hosted-eks-runner
    steps:
      - name: 🔑 Checkout Source Code
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1

      - name: 🛠️ Set up Node and Yarn Workspace
        uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 22
          cache: "yarn"

      - name: 📦 Install Workspace Dependencies
        run: yarn install --immutable

      - name: ⚓ Validate Kubernetes Helm Charts
        run: yarn helm:lint

      - name: 🔑 Authenticate directly with AWS ECR
        run: |
          aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin \${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com

      - name: 🐳 Compile Hardened Production Docker Image
        run: |
          # Build using the root package manager flag we locked down earlier
          yarn image:build

          # Tag the release specifically matching this ephemeral Pull Request tracking number
          docker tag ai-crew-suite/backstage:latest \({{ secrets.AWS_ACCOUNT_ID }}://\){{ github.event.number }}
          docker push \({{ secrets.AWS_ACCOUNT_ID }}://\){{ github.event.number }}

      - name: 📡 Deploy Isolated Testing Pod to EKS via Helm
        run: |
          # 1. Compute your dynamic AWS Application Load Balancer / ExternalDNS sub-domain path
          DYNAMIC_PREVIEW_URL="https://preview-pr-\${{ github.event.number }}.ai-crew-suite.dev"

          # 2. Upgrade or install a completely isolated namespace block dedicated strictly to this PR
          helm upgrade --install backstage-preview-pr-\${{ github.event.number }} ./packages/deploy-kubernetes/helm/backstage \
            --namespace platform-preview-pr-\${{ github.event.number }} \
            --create-namespace \
            --values ./packages/deploy-kubernetes/helm/values-prod.yaml \
            --set backstage.image.repository=\${{ secrets.AWS_ACCOUNT_ID }}:// \
            --set backstage.image.tag=pr-\${{ github.event.number }} \
            --set backstage.config.baseUrl=\$DYNAMIC_PREVIEW_URL \
            --set backstage.config.dbHost=\${{ secrets.AWS_PROD_DB_HOST }} \
            --set backstage.config.dbPort=5432 \
            --set backstage.config.mockProxyUrl="http://wiremock-service.platform-preview-pr-\${{ github.event.number }}.svc.cluster.local:8080" \
            --set backstage.config.mockDataPath="./mock-fixtures" \
            --set backstage.config.extraMockLocation="./mock-fixtures/catalog-fixtures.yaml"

          # 3. Mirror the deployment for your private agent workflow processing worker nodes
          helm upgrade --install platform-worker-pr-\${{ github.event.number }} ./packages/deploy-kubernetes/helm/platform \
            --namespace platform-preview-pr-\${{ github.event.number }} \
            --values ./packages/deploy-kubernetes/helm/values-prod.yaml

      - name: 📝 Post Preview Link as a Pull Request Comment
        uses: actions/github-script@3a2844b7e9c422d3c10d287c895573f7108da1b3 # v9.0.0
        with:
          script: |
            const url = `https://preview-pr-${context.issue.number}.ai-crew-suite.dev`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `### 🚀 Ephemeral Test Bench Deployed Successfully!\n\nYour isolated staging environment is active and passing governance safety parameters.\n\n* **Preview URL:** [${url}](${url})\n* **Deployment Profile:** Modern DI System + Standalone Temporal Worker Pods\n\n*Headless verification loops can now safely execute within the secure VPC perimeter.*`
            })
```
