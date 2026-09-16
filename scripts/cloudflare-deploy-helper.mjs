import fs from 'node:fs';

const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const defaultProject = process.env.PROJECT_NAME || 'sellsolar';

if (!apiToken || !accountId) {
  console.log('[cf-helper] Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID.');
  if (process.env.GITHUB_ENV) {
    fs.appendFileSync(process.env.GITHUB_ENV, `TARGET_PROJECT_NAME=${defaultProject}\n`);
  }
  process.exit(0);
}

const headers = {
  Authorization: `Bearer ${apiToken}`,
  'Content-Type': 'application/json',
};

async function run() {
  console.log('🔍 [cf-helper] Connecting to Cloudflare API with Account ID:', accountId);
  let targetProject = defaultProject;
  let summaryNotes = [];

  try {
    // 1. List all Pages projects
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`, { headers });
    const data = await res.json();

    if (!data.success) {
      console.log('⚠️ [cf-helper] Projects API returned error:', JSON.stringify(data.errors));
      summaryNotes.push(`Cloudflare Projects API error: ${JSON.stringify(data.errors)}`);
    } else {
      const projects = data.result || [];
      const projectNames = projects.map((p) => p.name);
      console.log(`📦 [cf-helper] Found ${projects.length} project(s):`, projectNames);
      summaryNotes.push(`Found ${projects.length} Cloudflare Pages project(s): ${projectNames.join(', ')}`);

      let matchedProject = null;

      for (const p of projects) {
        try {
          const domRes = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${p.name}/domains`,
            { headers }
          );
          const domData = await domRes.json();
          const domains = (domData.result || []).map((d) => d.name);
          console.log(`   👉 Project "${p.name}" has domains:`, domains);
          summaryNotes.push(`Project "${p.name}" custom domains: ${domains.length > 0 ? domains.join(', ') : 'None'}`);

          if (domains.includes('sellsolar.pk') || domains.includes('www.sellsolar.pk')) {
            matchedProject = p.name;
          }
        } catch (domErr) {
          console.log(`   Failed to fetch domains for ${p.name}:`, domErr.message);
        }
      }

      if (matchedProject) {
        console.log(`🎯 [cf-helper] Found domain sellsolar.pk attached to project: "${matchedProject}"`);
        targetProject = matchedProject;
      } else {
        console.log(`🌐 [cf-helper] sellsolar.pk not found on existing projects. Using default: "${defaultProject}"`);
        // Attempt to attach sellsolar.pk to default project
        for (const domain of ['sellsolar.pk', 'www.sellsolar.pk']) {
          try {
            const attachRes = await fetch(
              `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${defaultProject}/domains`,
              {
                method: 'POST',
                headers,
                body: JSON.stringify({ name: domain }),
              }
            );
            const attachData = await attachRes.json();
            console.log(`   Attach ${domain} to ${defaultProject}:`, attachData.success ? 'SUCCESS' : JSON.stringify(attachData.errors));
            summaryNotes.push(`Attach ${domain} result: ${attachData.success ? 'Success' : JSON.stringify(attachData.errors)}`);
          } catch (e) {
            console.log(`   Error attaching ${domain}:`, e.message);
          }
        }
      }
    }

    // 2. Zone ID and Cache Purge Attempt
    try {
      console.log('🧹 [cf-helper] Looking up Zone ID for sellsolar.pk...');
      const zonesRes = await fetch('https://api.cloudflare.com/client/v4/zones?name=sellsolar.pk', { headers });
      const zonesData = await zonesRes.json();
      if (zonesData.success && zonesData.result && zonesData.result.length > 0) {
        const zoneId = zonesData.result[0].id;
        console.log(`✅ [cf-helper] Found Zone ID: ${zoneId}. Requesting Purge Everything...`);
        const purgeRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ purge_everything: true }),
        });
        const purgeData = await purgeRes.json();
        console.log('✅ [cf-helper] Purge Everything response:', purgeData.success ? 'SUCCESS' : JSON.stringify(purgeData.errors));
        summaryNotes.push(`Cache Purge for sellsolar.pk: ${purgeData.success ? 'Successfully Triggered' : JSON.stringify(purgeData.errors)}`);
      } else {
        console.log('ℹ️ [cf-helper] Zone lookup did not return zone ID (token may lack Zone:Read permission).');
        summaryNotes.push('Zone ID lookup skipped: API token lacks Zone:Read permission or zone not found.');
      }
    } catch (zoneErr) {
      console.log('ℹ️ [cf-helper] Zone lookup exception:', zoneErr.message);
    }
  } catch (err) {
    console.error('❌ [cf-helper] Unexpected error:', err.message);
    summaryNotes.push(`Error: ${err.message}`);
  }

  // Export target project to GITHUB_ENV
  console.log(`🚀 [cf-helper] Exporting TARGET_PROJECT_NAME="${targetProject}"`);
  if (process.env.GITHUB_ENV) {
    fs.appendFileSync(process.env.GITHUB_ENV, `TARGET_PROJECT_NAME=${targetProject}\n`);
  }

  // Append summary to GITHUB_STEP_SUMMARY if available
  if (process.env.GITHUB_STEP_SUMMARY) {
    const summaryMd = `### 🛰️ Cloudflare Deployment Diagnosis
- **Target Project:** \`${targetProject}\`
${summaryNotes.map((n) => `- ${n}`).join('\n')}
`;
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryMd);
  }
}

run();
