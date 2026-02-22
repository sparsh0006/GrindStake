import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const FitnessBet = await hre.ethers.getContractFactory("FitnessBet");
  const fitnessBet = await FitnessBet.deploy();
  await fitnessBet.waitForDeployment();

  const address = await fitnessBet.getAddress();
  console.log(`FitnessBet deployed to: ${address}`);
  console.log(`\nAdd to .env.local:\nNEXT_PUBLIC_CONTRACT_ADDRESS="${address}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
