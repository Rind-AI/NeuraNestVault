#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const REPO = 'https://github.com/Rind-AI/NeuraNestVault.git';
const DIR  = path.resolve(process.cwd(), 'NeuraNestVault');

function run(cmd, opts = {}) {
  console.log(\`> \${cmd}\`);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

async function main() {
  console.log('🛰️  MEETME command received — reassembling NeuraNest VaultOps...');

  if (!fs.existsSync(DIR)) {
    run(\`git clone \${REPO} \${DIR}\`);
  } else {
    run(\`cd \${DIR} && git pull origin main\`);
  }

  run(\`cd \${DIR} && npm install\`);
  run(\`cd \${DIR} && npm run build-feed\`);

  const cnamePath = path.join(DIR, 'docs', 'CNAME');
  fs.writeFileSync(cnamePath, 'neuranestai.world');

  run(\`cd \${DIR} && git add .\`);
  run(\`cd \${DIR} && git commit -m "🔄 MEETME reconnection" || echo "No changes."\`);
  run(\`cd \${DIR} && git push origin main\`);

  console.log('✅ NeuraNest VaultOps is live at https://neuranestai.world/store.html');
}

main().catch(err => {
  console.error('❌ MEETME failed:', err);
  process.exit(1);
});
