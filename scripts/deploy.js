const hre = require("hardhat");

async function main() {
  console.log("Deploying Remittance contract to Polygon Amoy...");

  const Remittance = await hre.ethers.getContractFactory("Remittance");
  const remittance = await Remittance.deploy();

  await remittance.waitForDeployment();

  const address = await remittance.getAddress();
  console.log("Remittance contract deployed to:", address);
  console.log("Add this to your .env.local:");
  console.log(`CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
