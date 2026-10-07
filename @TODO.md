# TODOs

1. The `foundry` eslint config is missing types:

```bash
Could not find a declaration file for module '@ai-crew-suite/crew-cli/config/eslint'. '/home/kevin/Repos/ai-crew-suite/pipelines/node_modules/@ai-crew-suite/crew-cli/dist/bin/commands/lint/config/factory.js' implicitly has an 'any' type. Try `npm i --save-dev @types/ai-crew-suite__crew-cli` if it exists or add a new declaration (.d.ts) file containing `declare module '@ai-crew-suite/crew-cli/config/eslint';`
```

2. `check-api-updates` need implementation

3. Tests missing on various scripts

4. Fix scripts in all actions package.json files

5. Need to add "actions" to the crew cli in addition to its "plugins" and "packages" paths so we can use crew cli commands like lint in this repo

6. Build issues:

***\*Strategy B\**** is the industry standard for open-source and professional GitHub Actions (used by GitHub themselves) because it ensures developers don't have to review massive, minified `dist/index.js` blobs in their Pull Requests.

When you use this strategy, you maintain a **clean development branch** (where `dist/` is gitignored) and an **automated release tag** (where `dist/` is bundled and committed).

### How the Workflow Functions Behind the Scenes

Whenever a developer cuts a release tag or updates a major version branch, an automated workflow takes over:

1. It checks out your source code.
2. It runs `yarn install` and your `ncc build` command to generate the production-ready `dist/` folder.
3. It **temporarily un-gitignores** the `dist/` folder.
4. It forcefully commits and pushes that `dist/` folder *only* to the specific release tag or branch.

This means consumers using `uses: ai-crew-suite/pipelines/actions/lint-architecture@v1` will get a repository state that includes the `dist/index.js` file, while your `main` branch remains clean.

### Step-by-Step Production Workflow Implementation

Create a file in your root directory at `.github/workflows/release-action.yml`. This workflow triggers automatically whenever a new GitHub Release is published.

```yaml
name: Build and Publish Action Release

on:
  release:
    types: [published]

permissions:
  contents: write

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4
        with:
          # Fetch all history so we can move tags safely
          fetch-depth: 0 

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'

      - name: Install Monorepo Dependencies
        run: yarn install --immutable

      # Adjust this command if you want to build all actions or a specific one.
      # Assuming Turbo filters allow targeting your action actions:
      - name: Build Actions Distributables
        run: yarn turbo run build

      - name: Force-Commit Dist and Update Release Tag
        run: |
          # 1. Configure git bot profile
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@://github.com"
          
          # 2. Force remove 'dist' tracking barriers locally 
          # This temporarily overrides your .gitignore rules for this run
          git add -f actions/*/dist/
          
          # 3. Commit the built assets if changes exist
          if git diff --staged --quiet; then
            echo "No build differences detected."
          else
            git commit -m "build: bundle distribution assets for release"
          fi
          
          # 4. Delete the existing lightweight release tag locally and remotely, 
          # then overwrite it with our new commit that includes the 'dist' folder.
          # ${{ github.event.release.tag_name }} resolves to things like 'v1.0.0'
          git tag -d ${{ github.event.release.tag_name }}
          git push --delete origin ${{ github.event.release.tag_name }}
          
          git tag ${{ github.event.release.tag_name }}
          git push origin ${{ github.event.release.tag_name }}
```

### Moving Major Versions (e.g., Keeping `@v1` updated)

Action consumers typically don't want to lock onto a hard semantic version like `@v1.0.4`. They prefer pointing to `@v1` so they get non-breaking updates automatically.

To accommodate this, you can append a final step to the workflow above using **`JasonEtco/build-and-tag-action`**. This step extracts the major version (like `v1`) from the release tag (like `v1.2.3`) and automatically force-points the moving `v1` tag to your latest production-ready commit.

```yaml
      - name: Update Major Version Moving Tag (e.g. v1)
        uses: JasonEtco/build-and-tag-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### The Key Tradeoff to Consider

- **The Benefit:** Zero compiled build noise in your development history. PR diffs remain perfectly readable.
- **The Catch:** If someone attempts to reference your action pointing directly to `main` (e.g., `uses: ai-crew-suite/pipelines/actions/lint-architecture@main`), the step will **fail** because `dist/` does not exist on `main`. Users *must* use a release tag.
