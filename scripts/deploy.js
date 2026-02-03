const { ethers } = require("hardhat");

/**
 * Deployment Script for SimpleToken
 * 
 * Run with: npx hardhat run scripts/deploy.js --network localhost
 * 
 * This script demonstrates:
 * - Deploying a contract
 * - Waiting for deployment confirmation
 * - Logging deployment information
 */
async function main() {
    console.log("Deploying SimpleToken...\n");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    // Check deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

    // Deploy the contract
    const initialSupply = ethers.parseEther("1000000"); // 1 million tokens
    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    const token = await SimpleToken.deploy("Workshop Token", "WTK", initialSupply);

    // Wait for deployment
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();

    console.log("SimpleToken deployed to:", tokenAddress);
    console.log("Initial supply:", ethers.formatEther(initialSupply), "WTK");
    console.log("\nDeployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
