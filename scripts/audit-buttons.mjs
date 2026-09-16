import fs from 'fs';
import path from 'path';

const srcDir = 'src';
const appDir = 'app';

function getAllFiles(dir, exts = ['.jsx', '.js', '.tsx', '.ts']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, exts));
    } else if (exts.includes(path.extname(file))) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = [...getAllFiles(srcDir), ...getAllFiles(appDir)];
console.log(`Auditing ${files.length} code files for interactive elements...\n`);

let totalButtons = 0;
let totalLinks = 0;
let deadButtons = [];
let deadLinks = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');

  // Match JSX <button ... > or jsx("button", { ... })
  // 1. Regular JSX <button ...>
  const jsxBtnRegex = /<button\b([^>]*?)>/gis;
  let match;
  while ((match = jsxBtnRegex.exec(content)) !== null) {
    totalButtons++;
    const attrs = match[1];
    const hasClick = /onClick\s*=/i.test(attrs);
    const isSubmit = /type\s*=\s*["']submit["']/i.test(attrs);
    const isDisabled = /\bdisabled\b/i.test(attrs);
    if (!hasClick && !isSubmit && !isDisabled) {
      deadButtons.push({ file, snippet: match[0].slice(0, 80) });
    }
  }

  // 2. Transpiled jsx("button", { ... })
  const jsRuntimeBtnRegex = /jsx\(\s*["']button["']\s*,\s*\{([^}]*?)\}/gis;
  while ((match = jsRuntimeBtnRegex.exec(content)) !== null) {
    totalButtons++;
    const props = match[1];
    const hasClick = /onClick\s*:/i.test(props);
    const isSubmit = /type\s*:\s*["']submit["']/i.test(props);
    const isDisabled = /disabled\s*:/i.test(props);
    if (!hasClick && !isSubmit && !isDisabled) {
      deadButtons.push({ file, snippet: match[0].slice(0, 80) });
    }
  }

  // 3. Regular JSX <a ...>
  const jsxLinkRegex = /<a\b([^>]*?)>/gis;
  while ((match = jsxLinkRegex.exec(content)) !== null) {
    totalLinks++;
    const attrs = match[1];
    const hrefMatch = attrs.match(/href\s*=\s*["']([^"']*)["']/i);
    const hasClick = /onClick\s*=/i.test(attrs);
    if (hrefMatch) {
      const href = hrefMatch[1].trim();
      if ((href === '#' || href === '' || href.startsWith('javascript:')) && !hasClick) {
        deadLinks.push({ file, snippet: match[0].slice(0, 80), reason: 'Empty or # href without onClick' });
      }
    } else if (!hasClick) {
      deadLinks.push({ file, snippet: match[0].slice(0, 80), reason: 'No href and no onClick' });
    }
  }

  // 4. Transpiled jsx("a", { ... })
  const jsRuntimeLinkRegex = /jsx\(\s*["']a["']\s*,\s*(\{[\s\S]*?children\s*:)/gis;
  while ((match = jsRuntimeLinkRegex.exec(content)) !== null) {
    totalLinks++;
    const props = match[1];
    const hasHref = /\bhref\b/i.test(props);
    const hasClick = /onClick\s*:/i.test(props);
    const hasEmptyHref = /href\s*:\s*["'](#|javascript:void\(0\);?|)["']/i.test(props);
    if (hasEmptyHref && !hasClick) {
      deadLinks.push({ file, snippet: match[0].slice(0, 80), reason: 'Empty or # href without onClick' });
    } else if (!hasHref && !hasClick) {
      deadLinks.push({ file, snippet: match[0].slice(0, 80), reason: 'No href and no onClick' });
    }
  }
}

console.log(`Results:`);
console.log(`- Total buttons scanned: ${totalButtons}`);
console.log(`- Total links (<a>) scanned: ${totalLinks}`);
console.log(`- Inactive buttons found: ${deadButtons.length}`);
console.log(`- Broken/empty links found: ${deadLinks.length}`);

if (deadButtons.length > 0) {
  console.log('\n⚠️ Potential Inactive Buttons:');
  deadButtons.forEach(b => console.log(`  File: ${b.file}\n    ${b.snippet.replace(/\n/g, ' ')}\n`));
}

if (deadLinks.length > 0) {
  console.log('\n⚠️ Potential Dead Links:');
  deadLinks.forEach(l => console.log(`  File: ${l.file} (${l.reason})\n    ${l.snippet.replace(/\n/g, ' ')}\n`));
}

if (deadButtons.length === 0 && deadLinks.length === 0) {
  console.log('\n🎉 ALL buttons and links have working action handlers and valid targets!');
}
