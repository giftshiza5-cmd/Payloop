const hre = require("hardhat");

async function main() {
  console.log("Starting PayLoop smart contracts deployment...");

  const [deployer, admin1, admin2] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  // 1. Deploy CreditScore
  const CreditScore = await hre.ethers.getContractFactory("CreditScore");
  const creditScore = await CreditScore.deploy();
  await creditScore.waitForDeployment();
  console.log(`CreditScore deployed to: ${await creditScore.getAddress()}`);

  // 2. Deploy LoopToken
  const LoopToken = await hre.ethers.getContractFactory("LoopToken");
  const loopToken = await LoopToken.deploy();
  await loopToken.waitForDeployment();
  console.log(`LoopToken deployed to: ${await loopToken.getAddress()}`);

  // 3. Deploy CircleVault
  const admins = [deployer.address, admin1?.address || deployer.address];
  const requiredApprovals = 1;
  const contributionAmount = hre.ethers.parseEther("0.1"); // 0.1 ETH/MATIC per cycle
  const cycleDuration = 3600 * 24 * 7; // 1 week in seconds

  const CircleVault = await hre.ethers.getContractFactory("CircleVault");
  const circleVault = await CircleVault.deploy(
    "Eldoret savers",
    contributionAmount,
    cycleDuration,
    admins,
    requiredApprovals
  );
  await circleVault.waitForDeployment();
  console.log(`CircleVault deployed to: ${await circleVault.getAddress()}`);

  // 4. Deploy LendingPool
  const LendingPool = await hre.ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy(
    await circleVault.getAddress(),
    await creditScore.getAddress()
  );
  await lendingPool.waitForDeployment();
  console.log(`LendingPool deployed to: ${await lendingPool.getAddress()}`);

  // 5. Wire the contracts together (Authorization & Referencing)
  console.log("Configuring permissions and references...");

  // Set CreditScore authorizations
  await creditScore.setAuthorizedCaller(await circleVault.getAddress(), true);
  await creditScore.setAuthorizedCaller(await lendingPool.getAddress(), true);
  console.log("Authorized CircleVault and LendingPool on CreditScore.");

  // Set LoopToken minter authorizations
  await loopToken.setMinter(await circleVault.getAddress(), true);
  console.log("Authorized CircleVault to mint LoopTokens.");

  // Configure CircleVault references
  await circleVault.setLendingPool(await lendingPool.getAddress());
  await circleVault.setCreditScore(await creditScore.getAddress());
  await circleVault.setLoopToken(await loopToken.getAddress());
  console.log("Wired LendingPool, CreditScore, and LoopToken references on CircleVault.");

  console.log("PayLoop deployment and wiring completed successfully!");
  console.log("-----------------------------------------");
  console.log(`CreditScore:  ${await creditScore.getAddress()}`);
  console.log(`LoopToken:    ${await loopToken.getAddress()}`);
  console.log(`CircleVault:  ${await circleVault.getAddress()}`);
  console.log(`LendingPool:  ${await lendingPool.getAddress()}`);
  console.log("-----------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
