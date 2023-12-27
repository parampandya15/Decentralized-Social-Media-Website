const { ethers, upgrades } = require("hardhat");

async function main(deployer) {
  const MarketV1 = await ethers.getContractFactory("MarketV1");
  console.log("Deploying Smart Contract");
  const proxy = await upgrades.deployProxy(MarketV1, [], {
    initializer: "initialize",
    kind: "uups",
  });

  console.log("Proxy depoyed at:", proxy.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
