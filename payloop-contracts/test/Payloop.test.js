const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PayLoop Protocol", function () {
  let CreditScore, creditScore;
  let LoopToken, loopToken;
  let CircleVault, circleVault;
  let LendingPool, lendingPool;
  
  let owner, admin1, admin2, member1, member2, nonMember;
  let contributionAmount, cycleDuration;

  beforeEach(async function () {
    [owner, admin1, admin2, member1, member2, nonMember] = await ethers.getSigners();
    
    // 1. Deploy CreditScore
    CreditScore = await ethers.getContractFactory("CreditScore");
    creditScore = await CreditScore.deploy();
    await creditScore.waitForDeployment();

    // 2. Deploy LoopToken
    LoopToken = await ethers.getContractFactory("LoopToken");
    loopToken = await LoopToken.deploy();
    await loopToken.waitForDeployment();

    // 3. Deploy CircleVault
    contributionAmount = ethers.parseEther("0.1"); // 0.1 MATIC/ETH per cycle
    cycleDuration = 3600 * 24 * 7; // 1 week in seconds
    const adminsList = [owner.address, admin1.address, admin2.address];
    const requiredApprovals = 2;

    CircleVault = await ethers.getContractFactory("CircleVault");
    circleVault = await CircleVault.deploy(
      "Eldoret Chama",
      contributionAmount,
      cycleDuration,
      adminsList,
      requiredApprovals
    );
    await circleVault.waitForDeployment();

    // 4. Deploy LendingPool
    LendingPool = await ethers.getContractFactory("LendingPool");
    lendingPool = await LendingPool.deploy(
      await circleVault.getAddress(),
      await creditScore.getAddress()
    );
    await lendingPool.waitForDeployment();

    // 5. Wire authorization and references
    await creditScore.setAuthorizedCaller(await circleVault.getAddress(), true);
    await creditScore.setAuthorizedCaller(await lendingPool.getAddress(), true);
    await loopToken.setMinter(await circleVault.getAddress(), true);

    await circleVault.setLendingPool(await lendingPool.getAddress());
    await circleVault.setCreditScore(await creditScore.getAddress());
    await circleVault.setLoopToken(await loopToken.getAddress());

    // 6. Setup members
    await circleVault.addMember(member1.address);
    await circleVault.addMember(member2.address);
  });

  describe("CircleVault Savings & LoopToken Rewards", function () {
    it("Should allow members to contribute and reward LoopTokens on-time", async function () {
      const initialScore = await creditScore.getCreditScore(member1.address);
      expect(initialScore).to.equal(500);

      // Contribute exactly 0.1 ETH
      await expect(circleVault.connect(member1).contribute({ value: contributionAmount }))
        .to.emit(circleVault, "Contributed")
        .withArgs(member1.address, contributionAmount, 1);

      // Total contributions should update
      expect(await circleVault.totalContributions(member1.address)).to.equal(contributionAmount);

      // Credit score should increase by 10 (since it was on-time)
      const newScore = await creditScore.getCreditScore(member1.address);
      expect(newScore).to.equal(510);

      // LoopToken balance should increase by 10 LOOP tokens
      const loopBalance = await loopToken.balanceOf(member1.address);
      expect(loopBalance).to.equal(ethers.parseEther("10"));
    });

    it("Should penalize credit score if contribution is late (past deadline)", async function () {
      // Fast forward time to past nextDeadline
      await ethers.provider.send("evm_increaseTime", [cycleDuration + 10]);
      await ethers.provider.send("evm_mine");

      // Contribute late
      await circleVault.connect(member1).contribute({ value: contributionAmount });

      // Credit score should drop by 20 points (500 - 20 = 480)
      const scoreAfterLate = await creditScore.getCreditScore(member1.address);
      expect(scoreAfterLate).to.equal(480);

      // Should not get LoopTokens since it was late
      const loopBalance = await loopToken.balanceOf(member1.address);
      expect(loopBalance).to.equal(0);
    });

    it("Should reject contributions from non-members", async function () {
      await expect(
        circleVault.connect(nonMember).contribute({ value: contributionAmount })
      ).to.be.revertedWith("CircleVault: caller is not a member");
    });
  });

  describe("Multi-Sig Withdrawal Proposals", function () {
    it("Should allow admins to propose, approve and execute withdrawals", async function () {
      // First put some funds in the vault
      await circleVault.connect(member1).contribute({ value: contributionAmount });
      
      const vaultBalanceBefore = await ethers.provider.getBalance(await circleVault.getAddress());
      expect(vaultBalanceBefore).to.equal(contributionAmount);

      // Propose a withdrawal of 0.05 ETH to admin2
      const recipient = admin2.address;
      const withdrawAmount = ethers.parseEther("0.05");
      
      await expect(circleVault.connect(owner).proposeWithdrawal(recipient, withdrawAmount, "Buy stationery"))
        .to.emit(circleVault, "WithdrawalProposed")
        .withArgs(0, recipient, withdrawAmount, "Buy stationery");

      // Proposal approval count starts at 1 (from proposer owner)
      const proposal = await circleVault.proposals(0);
      expect(proposal.approvalCount).to.equal(1);
      expect(proposal.executed).to.be.false;

      // Try executing with only 1 approval (should fail, required = 2)
      await expect(circleVault.executeWithdrawal(0))
        .to.be.revertedWith("CircleVault: insufficient admin approvals");

      // Approve by admin1
      await expect(circleVault.connect(admin1).approveWithdrawal(0))
        .to.emit(circleVault, "WithdrawalApproved")
        .withArgs(0, admin1.address);

      // Execute withdrawal
      const recipientBalanceBefore = await ethers.provider.getBalance(recipient);
      await expect(circleVault.executeWithdrawal(0))
        .to.emit(circleVault, "WithdrawalExecuted")
        .withArgs(0, recipient, withdrawAmount);

      const recipientBalanceAfter = await ethers.provider.getBalance(recipient);
      expect(recipientBalanceAfter - recipientBalanceBefore).to.equal(withdrawAmount);

      const vaultBalanceAfter = await ethers.provider.getBalance(await circleVault.getAddress());
      expect(vaultBalanceAfter).to.equal(contributionAmount - withdrawAmount);
    });
  });

  describe("LendingPool Peer-to-Peer Loans", function () {
    beforeEach(async function () {
      // Put significant funds in CircleVault for loans
      await circleVault.connect(member1).contribute({ value: contributionAmount });
      await circleVault.connect(member2).contribute({ value: contributionAmount });
    });

    it("Should dynamically calculate interest rate based on Credit Score", async function () {
      // Default score is 500. Expected rate is 8.5% (850 basis points)
      await lendingPool.connect(member1).requestLoan(ethers.parseEther("0.05"), 3600 * 24);
      const loan = await lendingPool.loans(0);
      expect(loan.interestRate).to.equal(850); 
    });

    it("Should handle voting, disbursement, and repayment with correct score updates", async function () {
      const loanAmount = ethers.parseEther("0.05");
      const duration = 3600 * 24; // 1 day

      // Member 1 requests loan
      await lendingPool.connect(member1).requestLoan(loanAmount, duration);

      // Total members = 2 (member1, member2)
      // Member 2 votes YES
      await expect(lendingPool.connect(member2).voteOnLoan(0, true))
        .to.emit(lendingPool, "Voted")
        .withArgs(0, member2.address, true, 1);

      // Since Member 2 approves, votesFor = 1 (1/2 = 50% threshold met) -> Auto-approved!
      const approvedLoan = await lendingPool.loans(0);
      expect(approvedLoan.approved).to.be.true;

      // Disburse loan
      const borrowerBalanceBefore = await ethers.provider.getBalance(member1.address);
      await expect(lendingPool.disburseLoan(0))
        .to.emit(lendingPool, "LoanDisbursed")
        .withArgs(0, member1.address, loanAmount);

      // Verify borrower received funds
      const borrowerBalanceAfter = await ethers.provider.getBalance(member1.address);
      // Allow slight gas offset since member1 didn't invoke the transaction itself
      expect(borrowerBalanceAfter).to.be.gt(borrowerBalanceBefore);

      // Calculate total due: loanAmount + (loanAmount * interestRate / 10000)
      // 0.05 + (0.05 * 850 / 10000) = 0.05 + 0.00425 = 0.05425 ETH
      const interest = (loanAmount * 850n) / 10000n;
      const totalDue = loanAmount + interest;

      // Repay loan on time
      const scoreBeforeRepay = await creditScore.getCreditScore(member1.address); // currently 510 from saving
      await expect(lendingPool.connect(member1).repayLoan(0, { value: totalDue }))
        .to.emit(lendingPool, "LoanRepaid")
        .withArgs(0, member1.address, totalDue);

      // Verify credit score increases by 15 points (510 + 15 = 525)
      const scoreAfterRepay = await creditScore.getCreditScore(member1.address);
      expect(scoreAfterRepay).to.equal(scoreBeforeRepay + 15n);
    });

    it("Should penalize credit score if loan repayment is late", async function () {
      const loanAmount = ethers.parseEther("0.05");
      const duration = 3600 * 24; // 1 day

      await lendingPool.connect(member1).requestLoan(loanAmount, duration);
      await lendingPool.connect(member2).voteOnLoan(0, true);
      await lendingPool.disburseLoan(0);

      // Fast forward time to past repayment deadline (1 day + 1 hour)
      await ethers.provider.send("evm_increaseTime", [duration + 3600]);
      await ethers.provider.send("evm_mine");

      const scoreBeforeRepay = await creditScore.getCreditScore(member1.address); // 510
      
      const interest = (loanAmount * 850n) / 10000n;
      const totalDue = loanAmount + interest;

      // Repay late
      await lendingPool.connect(member1).repayLoan(0, { value: totalDue });

      // Late repayment award is +5 points (510 + 5 = 515) instead of +15
      const scoreAfterRepay = await creditScore.getCreditScore(member1.address);
      expect(scoreAfterRepay).to.equal(scoreBeforeRepay + 5n);
    });

    it("Should default loan and penalize credit score heavily if flagged", async function () {
      const loanAmount = ethers.parseEther("0.05");
      const duration = 3600 * 24; // 1 day

      await lendingPool.connect(member1).requestLoan(loanAmount, duration);
      await lendingPool.connect(member2).voteOnLoan(0, true);
      await lendingPool.disburseLoan(0);

      // Fast forward past deadline
      await ethers.provider.send("evm_increaseTime", [duration + 3600]);
      await ethers.provider.send("evm_mine");

      const scoreBeforeDefault = await creditScore.getCreditScore(member1.address); // 510

      // Flag default
      await expect(lendingPool.flagDefault(0))
        .to.emit(lendingPool, "LoanDefaulted")
        .withArgs(0, member1.address);

      // Credit score decreases by 100 points (510 - 100 = 410)
      const scoreAfterDefault = await creditScore.getCreditScore(member1.address);
      expect(scoreAfterDefault).to.equal(scoreBeforeDefault - 100n);
    });
  });
});
