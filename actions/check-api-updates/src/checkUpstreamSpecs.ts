import * as fs from 'fs';
import * as path from 'path';

const versionsFilePath = path.join(__dirname, 'versions.json');
const issueBodyPath = path.join(process.cwd(), 'issue_body.md');

interface StoredVersions {
  github: string;
  pagerduty: string;
}

async function run() {
  const updatesFound: string[] = [];
  let fileChanged = false;

  if (!fs.existsSync(versionsFilePath)) {
    console.error(`Missing baseline file at ${versionsFilePath}`);
    process.exit(1);
  }
  const currentVersions: StoredVersions = JSON.parse(fs.readFileSync(versionsFilePath, 'utf8'));

  // 1. Check GitHub Description Repo
  try {
    const ghToken = process.env['GITHUB_TOKEN'];
    const response = await fetch("https://github.com", {
      headers: ghToken ? { 'Authorization': `Bearer ${ghToken}`, 'User-Agent': 'Backstage-Driver-Checker' } : { 'User-Agent': 'Backstage-Driver-Checker' }
    });

    if (response.ok) {
      const data: any = await response.json();
      const latestGhVersion = data.tag_name;

      if (latestGhVersion && latestGhVersion !== currentVersions.github) {
        updatesFound.push(`- **GitHub:** New spec release found (\`\${latestGhVersion}\`). Previous was \`\${currentVersions.github}\`.`);
        currentVersions.github = latestGhVersion; // Update in-memory reference
        fileChanged = true;
      }
    }
  } catch (error) {
    console.error("Error checking GitHub upstream:", error);
  }

  // 2. Check PagerDuty
  try {
    const response = await fetch("https://pagerduty.com", { method: "HEAD" });

    if (response.ok) {
      const latestPdEtag = response.headers.get("etag");

      if (latestPdEtag && latestPdEtag !== currentVersions.pagerduty) {
        updatesFound.push(`- **PagerDuty:** Upstream OpenAPI specification file content has changed (ETag mismatch).`);
        currentVersions.pagerduty = latestPdEtag; // Update in-memory reference
        fileChanged = true;
      }
    }
  } catch (error) {
    console.error("Error checking PagerDuty upstream:", error);
  }

  // Handle reporting and disk write-back
  if (fileChanged) {
    // Write the updated version object back to versions.json
    fs.writeFileSync(versionsFilePath, JSON.stringify(currentVersions, null, 2) + "\n");
    console.log("Updated versions.json with new upstream baselines.");

    const bodyContent = [
      "The daily cron check detected newer OpenAPI definition updates from upstream platform providers.",
      "",
      "This PR automatically bumps the version references in `versions.json`. Please review the diff, run schema generation scripts, and confirm contract validation passes.",
      "",
      ...updatesFound
    ].join("\n");

    fs.writeFileSync(issueBodyPath, bodyContent);

    const githubEnvPath = process.env['GITHUB_ENV'];
    if (githubEnvPath) {
      fs.appendFileSync(githubEnvPath, "HAS_UPDATES=true\n");
    }
  } else {
    console.log("All specifications match current baseline records.");
  }
}

run();
