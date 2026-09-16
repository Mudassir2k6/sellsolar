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
    // 0. Verify Token
    try {
      const verifyRes = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', { headers });
      const verifyData = await verifyRes.json();
      console.log('🔑 [cf-helper] Token verify:', verifyData.success ? 'Valid' : JSON.stringify(verifyData.errors));
      summaryNotes.push(`Token Status: ${verifyData.success ? 'Active & Valid' : JSON.stringify(verifyData.errors)}`);
    } catch (tErr) {
      console.log('🔑 [cf-helper] Token verify error:', tErr.message);
    }

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
          const domains = (domData.result || []).map((d) => `${d.name} (status: ${d.status || 'unknown'}, ssl: ${d.certificate_status || 'unknown'})`);
          console.log(`   👉 Project "${p.name}" has domains:`, domains);
          summaryNotes.push(`Project "${p.name}" custom domains: ${domains.length > 0 ? domains.join(', ') : 'None'}`);

          const rawNames = (domData.result || []).map((d) => d.name);
          if (rawNames.includes('sellsolar.pk') || rawNames.includes('www.sellsolar.pk')) {
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

    // 2. Zone ID, DNS records and Cache Purge Attempt
    try {
      console.log('🧹 [cf-helper] Looking up Zone ID for sellsolar.pk...');
      const zonesRes = await fetch('https://api.cloudflare.com/client/v4/zones?name=sellsolar.pk', { headers });
      const zonesData = await zonesRes.json();
      if (zonesData.success && zonesData.result && zonesData.result.length > 0) {
        const zoneId = zonesData.result[0].id;
        console.log(`✅ [cf-helper] Found Zone ID: ${zoneId}.`);
        summaryNotes.push(`Zone ID for sellsolar.pk: ${zoneId}`);

        // Inspect DNS records
        try {
          const dnsRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, { headers });
          const dnsData = await dnsRes.json();
          if (dnsData.success && dnsData.result) {
            const relevantRecords = dnsData.result
              .filter((r) => r.name.includes('sellsolar.pk'))
              .map((r) => `${r.type} ${r.name} -> ${r.content} (proxied: ${r.proxied})`);
            console.log('📡 [cf-helper] DNS records:', relevantRecords);
            summaryNotes.push(`DNS Records: ${relevantRecords.join(' | ') || 'None found'}`);
          } else {
            console.log('📡 [cf-helper] DNS records error:', JSON.stringify(dnsData.errors));
            summaryNotes.push(`DNS records lookup: ${JSON.stringify(dnsData.errors)}`);
          }
        } catch (dnsErr) {
          console.log('📡 [cf-helper] DNS query exception:', dnsErr.message);
        }

        // Request Purge Everything
        console.log(`🧹 [cf-helper] Requesting Purge Everything...`);
        const purgeRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ purge_everything: true }),
        });
        const purgeData = await purgeRes.json();
        console.log('✅ [cf-helper] Purge Everything response:', purgeData.success ? 'SUCCESS' : JSON.stringify(purgeData.errors));
        summaryNotes.push(`Cache Purge for sellsolar.pk: ${purgeData.success ? 'Successfully Triggered' : JSON.stringify(purgeData.errors)}`);
      } else {
        console.log('ℹ️ [cf-helper] Zone lookup did not return zone ID:', JSON.stringify(zonesData.errors || []));
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

  // Write to public/cf-status.json
  try {
    const debugLog = {
      timestamp: new Date().toISOString(),
      targetProject,
      summaryNotes,
    };
    fs.writeFileSync('public/cf-status.json', JSON.stringify(debugLog, null, 2));
  } catch (logErr) {
    console.log('[cf-helper] Error writing cf-status.json:', logErr.message);
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
