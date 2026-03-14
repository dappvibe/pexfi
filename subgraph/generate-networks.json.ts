/**
 * This script dynamically generates the subgraph/networks.json file
 * based on the current deployments found in evm/deployments/.
 * It reads deployed_addresses.json and journal.jsonl to determine
 * the addresses and start blocks for Market and Profile contracts.
 */
import fs from 'fs';
import path from 'path';
import readline from 'readline';

async function main() {
  const deploymentsDir = path.join(process.cwd(), 'evm/deployments');
  const networks: Record<string, any> = {};

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deployments = fs.readdirSync(deploymentsDir);

  for (const deploymentDir of deployments) {
    if (!deploymentDir.startsWith('chain-')) {
      continue;
    }
    const chainIdStr = deploymentDir.replace('chain-', '');
    const dirPath = path.join(deploymentsDir, deploymentDir);

    const addressesPath = path.join(dirPath, 'deployed_addresses.json');
    if (!fs.existsSync(addressesPath)) {
      continue;
    }

    const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
    const marketAddress = addresses['Market#Market'];
    const profileAddress = addresses['Market#Profile'];

    const journalPath = path.join(dirPath, 'journal.jsonl');
    let marketStartBlock = 0;
    let profileStartBlock = 0;

    let marketSuccess = false;
    let profileSuccess = false;

    if (fs.existsSync(journalPath)) {
      const rl = readline.createInterface({
        input: fs.createReadStream(journalPath),
        crlfDelay: Infinity,
      });

      for await (const line of rl) {
        if (!line.trim()) continue;
        const entry = JSON.parse(line);

        if (entry.type === 'TRANSACTION_CONFIRM' && entry.receipt && entry.receipt.blockNumber) {
          // Look for Market deployment transaction
          if (entry.futureId === 'Market#MarketV0' && marketStartBlock === 0) {
            marketStartBlock = entry.receipt.blockNumber;
          }
          // Look for Profile deployment transaction
          if (entry.futureId === 'Market#ProfileV0' && profileStartBlock === 0) {
            profileStartBlock = entry.receipt.blockNumber;
          }
        }
        if (entry.type === 'DEPLOYMENT_EXECUTION_STATE_COMPLETE' || entry.type === 'CONTRACT_AT_EXECUTION_STATE_INITIALIZE') {
           if (entry.futureId === 'Market#Market' && (entry.result?.type === 'SUCCESS' || entry.type === 'CONTRACT_AT_EXECUTION_STATE_INITIALIZE')) {
               marketSuccess = true;
           }
           if (entry.futureId === 'Market#Profile' && (entry.result?.type === 'SUCCESS' || entry.type === 'CONTRACT_AT_EXECUTION_STATE_INITIALIZE')) {
               profileSuccess = true;
           }
        }
      }
    }

    networks[chainIdStr] = {};

    if (marketAddress && marketSuccess) {
      networks[chainIdStr]['Market'] = {
        address: marketAddress,
        startBlock: marketStartBlock,
      };
    }

    if (profileAddress && profileSuccess) {
      networks[chainIdStr]['Profile'] = {
        address: profileAddress,
        startBlock: profileStartBlock,
      };
    }
  }

  const currentNetworksPath = path.join(process.cwd(), 'subgraph/networks.json');
  fs.writeFileSync(currentNetworksPath, JSON.stringify(networks, null, 2) + '\n');
  console.log('Generated subgraph/networks.json successfully.');
}

main().catch(console.error);