const fs = require('fs');
const path = require('path');

const contractsDir = path.join(__dirname, '..', '..', 'payloop-contracts', 'artifacts', 'contracts');
const outputDir = path.join(__dirname, '..', 'lib');
const outputPath = path.join(outputDir, 'contracts.js');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const extractContractData = (contractName, folderName) => {
  const jsonPath = path.join(contractsDir, `${folderName}.sol`, `${contractName}.json`);
  if (!fs.existsSync(jsonPath)) {
    console.error(`Artifact not found at: ${jsonPath}`);
    return null;
  }
  const rawData = fs.readFileSync(jsonPath);
  const data = JSON.parse(rawData);
  return {
    abi: data.abi,
    bytecode: data.bytecode
  };
};

const circleVaultData = extractContractData('CircleVault', 'CircleVault');
const lendingPoolData = extractContractData('LendingPool', 'LendingPool');
const creditScoreData = extractContractData('CreditScore', 'CreditScore');
const loopTokenData = extractContractData('LoopToken', 'LoopToken');

const content = `// Auto-generated PayLoop Smart Contract ABIs and Bytecodes

export const CircleVaultArtifact = {
  abi: ${JSON.stringify(circleVaultData?.abi, null, 2)},
  bytecode: "${circleVaultData?.bytecode || ''}"
};

export const LendingPoolArtifact = {
  abi: ${JSON.stringify(lendingPoolData?.abi, null, 2)},
  bytecode: "${lendingPoolData?.bytecode || ''}"
};

export const CreditScoreArtifact = {
  abi: ${JSON.stringify(creditScoreData?.abi, null, 2)},
  bytecode: "${creditScoreData?.bytecode || ''}"
};

export const LoopTokenArtifact = {
  abi: ${JSON.stringify(loopTokenData?.abi, null, 2)},
  bytecode: "${loopTokenData?.bytecode || ''}"
};
`;

fs.writeFileSync(outputPath, content);
console.log(`Successfully extracted and wrote contract data to ${outputPath}`);
