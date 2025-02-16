const { ethers } = require("hardhat");
async function main() {
    const CodeFund = await ethers.deployContract("CodeFund", [100000000, 50]);
    await CodeFund.waitForDeployment();

    console.log(`CodeFund deployed at: ${CodeFund.target}`);
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
});