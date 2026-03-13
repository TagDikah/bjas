import hre from "hardhat";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const { ethers } = await hre.network.connect();

  console.log("Deploying CaseAnchor...");

  const contract = await ethers.deployContract("CaseAnchor");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const artifact = await hre.artifacts.readArtifact("CaseAnchor");

  console.log("CaseAnchor deployed to:", address);

  const outDir = path.resolve("../lib/blockchain");
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, "case-anchor-address.json"),
    JSON.stringify({ address }, null, 2),
    "utf8"
  );

  fs.writeFileSync(
    path.join(outDir, "CaseAnchor.abi.json"),
    JSON.stringify(artifact.abi, null, 2),
    "utf8"
  );

  console.log("ABI and address exported");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
