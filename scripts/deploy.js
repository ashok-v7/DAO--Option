const hre = require("hardhat");

async function main(){
  const DAO = await hre.ethers.getContractFactory("DAO");
  const dao = await DAO.deploy();
  await dao.deployed();

  console.log(`DAO smart contract deployed to address:${dao.address}`);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
