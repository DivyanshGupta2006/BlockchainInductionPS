const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CodeFund contract", function() {
  // global vars
  let Token;
  let codeFund;
  let owner;
  let addr1;
  let addr2;
  let tokenCap = 100000000;
  let tokenBlockReward = 50;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("CodeFund");
    [owner, addr1, addr2] = await ethers.getSigners();

    codeFund = await Token.deploy(tokenCap, tokenBlockReward);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await codeFund.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await codeFund.balanceOf(owner.address);
      expect(await codeFund.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set the max capped supply to the argument provided during deployment", async function () {
      const cap = await codeFund.cap();
      expect(Number(ethers.formatEther(cap))).to.equal(tokenCap);
    });

    it("Should set the blockReward to the argument provided during deployment", async function () {
      const blockReward = await codeFund.blockReward();
      expect(Number(ethers.formatEther(blockReward))).to.equal(tokenBlockReward);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await codeFund.transfer(addr1.address, 50);
      const addr1Balance = await codeFund.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await codeFund.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await codeFund.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await codeFund.balanceOf(owner.address);
      // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        codeFund.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWithCustomError(codeFund,"ERC20InsufficientBalance");

      // Owner balance shouldn't have changed.
      expect(await codeFund.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await codeFund.balanceOf(owner.address);

      const amountToSubtract = ethers.toBigInt(150);

      // Transfer 100 tokens from owner to addr1.
      await codeFund.transfer(addr1.address, 100);

      // Transfer another 50 tokens from owner to addr2.
      await codeFund.transfer(addr2.address, 50);

      // Check balances.
      const finalOwnerBalance = await codeFund.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance-amountToSubtract);

      const addr1Balance = await codeFund.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await codeFund.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });
  
});
