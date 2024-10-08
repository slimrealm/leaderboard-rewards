import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SystemProgram, Connection, Keypair, PublicKey, Commitment, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { LeaderboardPayouts } from "../target/types/leaderboard_payouts";
import { assert, expect } from "chai";
import adminWallet from "./admin-wallet.json"
import { Participant, ParticipantWithNumberScore } from "./types";
import { updateScoresTests } from "./update_scores";

const constants = {
  SECONDS_IN_DAY: 86400,
  ADMIN_INITIAL_AIRDROP: 100000000, // 0.1 SOL
  FUND_TREASURY_TEST_AMOUNT: 60000000, // 0.06 SOL
  TEST_PAYOUT_AMOUNT: 50000000, // 0.05 SOL
};

const delay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const convertParticipantScores = (participants: Participant[]): ParticipantWithNumberScore[] => {
  return participants.map(participant => ({
    pubkey: participant.pubkey,
    score: participant.score.toNumber()
  }));
}

export const confirmTx = async (txSig: string) => {
  let latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: txSig,
  });
}

const airdrop = async (amt: number, accountPubKey: anchor.web3.PublicKey) => {
  try {
    const txSig = await anchor.getProvider().connection.requestAirdrop(accountPubKey, amt * LAMPORTS_PER_SOL);
    await confirmTx(txSig);
  } catch (error) {
    console.error(error);
  }
}

const callInitialize = async (admin: anchor.web3.Keypair, leaderboardPDA: anchor.web3.PublicKey, periodLength: anchor.BN, topSpots: number, totalPayoutPerPeriod: anchor.BN, expectFail: boolean = false) => {
  // Test Initialize function, verify that leaderboard account has correct state after being created
  try {
    const txSig = await program.methods.initialize(periodLength, topSpots, totalPayoutPerPeriod)
      .accountsPartial({
        leaderboard: leaderboardPDA,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId
      })
      .signers([admin])
      .rpc();
    await confirmTx(txSig);
    console.log("Tx signature - initialize", txSig);
    return true;
  } catch (error) {
    if (!expectFail) {
      console.error("Error initializing leaderboard:", error);
    }
    return false;
  }
}

const postInitChecks = async (leaderboardPDA: PublicKey, periodLength: anchor.BN, topSpots: number, totalPayoutPerPeriod: anchor.BN) => {
  // Test that leaderboard account state has the correct values
  try {
    const leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA);
    assert.equal(leaderboardAcct.admin.toString(), adminKeypair.publicKey.toString(), "leaderboard account's admin pubkey should match passed in value.");
    assert.equal(leaderboardAcct.periodLength.toString(), periodLength.toString(), "leaderboard account's periodLength should match passed in value.");
    assert.equal(leaderboardAcct.topSpots.toString(), topSpots.toString(), "leaderboard account's topSpots should match passed in value.");
    assert.equal(leaderboardAcct.totalPayoutPerPeriod.toString(), totalPayoutPerPeriod.toString(), "leaderboard account's topSpots should match passed in value.");

    // For currentPeriodStart value, sanity check test that Unix timestamp is > a past date and <= now
    const startTimestampString = leaderboardAcct.currentPeriodStart.toString();
    const currentUnixTimestamp = Math.floor(Date.now() / 1000);

    // This .greaterThan may fail if running with solana-test-validator, as Unix timestamp will not be current 
    expect(Number(startTimestampString)).to.be.greaterThan(1727126128);
    expect(Number(startTimestampString)).to.be.lessThanOrEqual(currentUnixTimestamp);
    return true;
  } catch (error) {
    console.error("Post initialize checks failed:", error);
    return false;
  }
}

const commitment: Commitment = 'confirmed';
const connection = new Connection("http://localhost:8899", commitment);
anchor.setProvider(anchor.AnchorProvider.env());
const program = anchor.workspace.LeaderboardPayouts as Program<LeaderboardPayouts>;

// Persistent accounts
const adminKeypair = Keypair.fromSecretKey(new Uint8Array(adminWallet));
const treasuryKeypair = Keypair.generate();
const [leaderboardPDA, leaderboardBump] = PublicKey.findProgramAddressSync(
  [Buffer.from("leaderboard"), adminKeypair.publicKey.toBuffer()],
  program.programId
);

describe("leaderboard_payouts", () => {
  beforeEach(async () => {
    await airdrop(constants.ADMIN_INITIAL_AIRDROP, adminKeypair.publicKey);
    // Check if leaderboard acct exists.  If yes, close.
    let leaderboardAcountInfo = null;
    try {
      leaderboardAcountInfo = await connection.getAccountInfo(leaderboardPDA);
    } catch (error) {
      console.error(error);
    }
    if (leaderboardAcountInfo) {
      try {
        const txSig = await program.methods.closeLeaderboardAccount()
          .accountsPartial({
            admin: adminKeypair.publicKey,
            leaderboard: leaderboardPDA,
            systemProgram: SystemProgram.programId
          })
          .signers([adminKeypair])
          .rpc();
        await confirmTx(txSig);
        console.log("Tx signature - closeLeaderboardAccount", txSig);
      } catch (error) {
        console.log(error);
      }
    }
  });

  it("call initialize once", async () => {
    const periodLength = new anchor.BN(constants.SECONDS_IN_DAY);
    const topSpots = 3;
    const totalPayoutPerPeriod = new anchor.BN(constants.TEST_PAYOUT_AMOUNT);
    const callInitResult = await callInitialize(adminKeypair, leaderboardPDA, periodLength, topSpots, totalPayoutPerPeriod);
    expect(callInitResult).to.be.true;
    const initChecksResult = await postInitChecks(leaderboardPDA, periodLength, topSpots, totalPayoutPerPeriod);
    expect(initChecksResult).to.be.true;
  })

  it("call initialize twice", async () => {
    const periodLength = new anchor.BN(constants.SECONDS_IN_DAY);
    const topSpots = 3;
    const totalPayoutPerPeriod = new anchor.BN(constants.TEST_PAYOUT_AMOUNT);
    const initResult1 = await callInitialize(adminKeypair, leaderboardPDA, periodLength, topSpots, totalPayoutPerPeriod);
    expect(initResult1).to.be.true;
    const initResult2 = await callInitialize(adminKeypair, leaderboardPDA, periodLength, topSpots, totalPayoutPerPeriod, true);
    expect(initResult2).to.be.false;

    const initChecksResult = await postInitChecks(leaderboardPDA, periodLength, topSpots, totalPayoutPerPeriod);
    expect(initChecksResult).to.be.true;
  })

  it("close acct if exists", async () => {
    const stringSeed = "leaderboard";
    const adminPubkeySeed = adminKeypair.publicKey;

    // Initialize - ensure leaderboard acct is created
    const periodLength = new anchor.BN(constants.SECONDS_IN_DAY);
    const topSpots = 3;
    const totalPayoutPerPeriod = new anchor.BN(constants.TEST_PAYOUT_AMOUNT);
    const callInitResult = await callInitialize(adminKeypair, leaderboardPDA, periodLength, topSpots, totalPayoutPerPeriod);
    expect(callInitResult).to.be.true;
    const initChecksResult = await postInitChecks(leaderboardPDA, periodLength, topSpots, totalPayoutPerPeriod);
    expect(initChecksResult).to.be.true;

    // Get balance before closing leaderboard account 
    try {
      let balance = await connection.getBalance(leaderboardPDA);
    } catch (error) {
      console.error("Initial getBalance() failed:", error);
    }

    // Close leaderboard account
    try {
      const txSig = await program.methods.closeLeaderboardAccount()
        .accountsPartial({
          admin: adminKeypair.publicKey,
          leaderboard: leaderboardPDA,
          systemProgram: SystemProgram.programId
        })
        .signers([adminKeypair])
        .rpc();
      await confirmTx(txSig);
      console.log("Tx signature - closeLeaderboardAccount", txSig);
    } catch (error) {
      console.error("Failed to close PDA:", error);
    }

    try {
      let balance = await connection.getBalance(leaderboardPDA, 'finalized');
      expect.fail();
    } catch (error) { }

    // Attempt to close leaderboard account again - should fail, as account should be closed already
    try {
      await program.methods.closeLeaderboardAccount()
        .accountsPartial({
          admin: adminKeypair.publicKey,
          leaderboard: leaderboardPDA,
          systemProgram: SystemProgram.programId
        })
        .signers([adminKeypair])
        .rpc();
      expect.fail();
    } catch (error) {
      expect(error).to.be.instanceOf(anchor.AnchorError);
      if (error instanceof anchor.AnchorError) {
        expect(error.error.errorCode.number).to.equal(3012);
      } else {
        console.error("expected anchor error code 3012.  Got error:", error);
      }
    }
  })

  it("fund treasury", async () => {
    const periodLength = new anchor.BN(constants.SECONDS_IN_DAY);
    const topSpots = 3;
    const totalPayoutPerPeriod = new anchor.BN(constants.TEST_PAYOUT_AMOUNT);

    try {
      let balance = await connection.getBalance(treasuryKeypair.publicKey);
    } catch (error) {
      console.error("Could not close PDA account:", error);
    }

    // Call initialize, which will initialize treasury account
    const initResult = await callInitialize(adminKeypair, leaderboardPDA, periodLength, topSpots, totalPayoutPerPeriod);
    expect(initResult).to.be.true;
    const initChecksResult = await postInitChecks(leaderboardPDA, periodLength, topSpots, totalPayoutPerPeriod);
    expect(initChecksResult).to.be.true;

    // Get balance before funding - should equal minBalFor8ByteAcct (lamports)
    const startingBalance = await connection.getBalance(treasuryKeypair.publicKey);
    const amount = new anchor.BN(constants.FUND_TREASURY_TEST_AMOUNT);
    try {
      const txSig = await program.methods.fundTreasury(amount)
        .accountsPartial({
          admin: adminKeypair.publicKey,
          treasury: treasuryKeypair.publicKey,
          systemProgram: SystemProgram.programId
        })
        .signers([adminKeypair, treasuryKeypair])
        .rpc();
      await confirmTx(txSig);

      console.log("Tx signature - fundTreasury", txSig);
    } catch (error) {
      console.error("Error funding treasury:", error);
    }

    // Get balance after funding
    const postFundBalance = await connection.getBalance(treasuryKeypair.publicKey);
    expect(postFundBalance - startingBalance).to.equal(constants.FUND_TREASURY_TEST_AMOUNT);
  })

  it("update config", async () => {
    // Set initial values and initialize
    const periodLength = new anchor.BN(constants.SECONDS_IN_DAY);
    const topSpots = 3;
    const totalPayoutPerPeriod = new anchor.BN(constants.TEST_PAYOUT_AMOUNT);
    const callInitResult = await callInitialize(adminKeypair, leaderboardPDA, periodLength, topSpots, totalPayoutPerPeriod);
    expect(callInitResult).to.be.true;

    let leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA);
    assert.equal(leaderboardAcct.periodLength.toString(), periodLength.toString(), "leaderboard account's periodLength should match passed in value.");
    assert.equal(leaderboardAcct.topSpots.toString(), topSpots.toString(), "leaderboard account's topSpots should match passed in value.");

    const newPeriodLength = new anchor.BN(2 * constants.SECONDS_IN_DAY); // 2 days (in seconds)
    const newTopSpots = 10;
    const newTotalPayout = new anchor.BN(constants.TEST_PAYOUT_AMOUNT / 2);

    const txSig = await program.methods.updateConfig(newPeriodLength, newTopSpots, newTotalPayout)
      .accountsPartial({
        leaderboard: leaderboardPDA,
        admin: adminKeypair.publicKey,
      })
      .signers([adminKeypair])
      .rpc();
    await confirmTx(txSig);
    console.log("Tx signature - updateConfig", txSig);

    leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA,);
    assert.equal(leaderboardAcct.periodLength.toString(), newPeriodLength.toString(), "leaderboard account's periodLength should match new value.");
    assert.equal(leaderboardAcct.topSpots.toString(), newTopSpots.toString(), "leaderboard account's topSpots should match new value.");
    assert.equal(leaderboardAcct.totalPayoutPerPeriod.toString(), newTotalPayout.toString(), "leaderboard account's newTotalPayout should match new value.");
  })

  it("update scores", async () => {
    // Set initial values and initialize
    const periodLength = new anchor.BN(constants.SECONDS_IN_DAY);
    const topSpots = 3;
    const totalPayoutPerPeriod = new anchor.BN(constants.TEST_PAYOUT_AMOUNT);
    const callInitResult = await callInitialize(adminKeypair, leaderboardPDA, periodLength, topSpots, totalPayoutPerPeriod);
    expect(callInitResult).to.be.true;

    await updateScoresTests(leaderboardPDA, adminKeypair);
  })

  it("end period and disribute rewards", async () => {
    // Initialize - setting period of 7 seconds
    const periodLength = new anchor.BN(7); // short, in order to test efficiently
    const topSpots = 3;
    const totalPayoutPerPeriod = new anchor.BN(constants.TEST_PAYOUT_AMOUNT);
    const callInitResult = await callInitialize(adminKeypair, leaderboardPDA, periodLength, topSpots, totalPayoutPerPeriod);
    expect(callInitResult).to.be.true;

    const fundTreasuryAmount = new anchor.BN(constants.FUND_TREASURY_TEST_AMOUNT);

    // Fund treasury account so there is SOL for it to pay out
    try {
      const txSig = await program.methods.fundTreasury(fundTreasuryAmount) // TODO: warning - this can pay for X reward cycles, other funds must be raised or subsequently paid to treasury
        .accountsPartial({
          admin: adminKeypair.publicKey,
          treasury: treasuryKeypair.publicKey,
          systemProgram: SystemProgram.programId
        })
        .signers([adminKeypair, treasuryKeypair])
        .rpc();
      await confirmTx(txSig);
      console.log("Tx signature - fundTreasury", txSig);
    } catch (error) {
      console.error("Error funding treasury:", error);
    }

    // Call updateScoresTests(), which will result in 15 active participants with scores // TODO: replace all 'player' in app with 'participant', to keep implementation-agnostic 
    await updateScoresTests(leaderboardPDA, adminKeypair);

    // Check balances of players holding spots 1 through (3), as well as treasury balance
    let leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA);
    const firstPlaceParticipant = leaderboardAcct.participants[0];
    const secondPlaceParticipant = leaderboardAcct.participants[1];
    const thirdPlaceParticipant = leaderboardAcct.participants[2];
    expect(secondPlaceParticipant.score.toNumber()).to.be.lessThanOrEqual(firstPlaceParticipant.score.toNumber());
    expect(thirdPlaceParticipant.score.toNumber()).to.be.lessThanOrEqual(secondPlaceParticipant.score.toNumber());

    const firstPlaceBalanceBefore = await connection.getBalance(firstPlaceParticipant.pubkey);
    const secondPlaceBalanceBefore = await connection.getBalance(secondPlaceParticipant.pubkey);
    const thirdPlaceBalanceBefore = await connection.getBalance(thirdPlaceParticipant.pubkey);
    const treasuryBalanceBefore = await connection.getBalance(treasuryKeypair.publicKey);

    // Call end period - should fail because period hasn't ended yet
    try {
      await program.methods.endPeriodAndDistributePayouts()
        .accountsPartial({
          leaderboard: leaderboardPDA,
          treasury: treasuryKeypair.publicKey,
          admin: adminKeypair.publicKey,
          playerAccount1: firstPlaceParticipant.pubkey,
          playerAccount2: secondPlaceParticipant.pubkey,
          playerAccount3: thirdPlaceParticipant.pubkey,
          systemProgram: SystemProgram.programId
        })
        .signers([adminKeypair, treasuryKeypair])
        .rpc();
      expect.fail();
    } catch (error) {
      if (!(error instanceof anchor.AnchorError) || error.error.errorCode.code != "PeriodNotEnded") {
        console.error("Error calling endPeriodAndDistributePayouts():", error);
      }
    }
    // Set delay to allow period to end
    await delay(7500);

    // Call end period - should now succeed
    try {
      const txSig = await program.methods.endPeriodAndDistributePayouts()
        .accountsPartial({
          leaderboard: leaderboardPDA,
          treasury: treasuryKeypair.publicKey,
          admin: adminKeypair.publicKey,
          playerAccount1: firstPlaceParticipant.pubkey,
          playerAccount2: secondPlaceParticipant.pubkey,
          playerAccount3: thirdPlaceParticipant.pubkey,
          systemProgram: SystemProgram.programId
        })
        .signers([adminKeypair, treasuryKeypair])
        .rpc();
      await confirmTx(txSig);

      console.log("Tx signature - endPeriodAndDistributePayouts", txSig);
    } catch (error) {
      console.error("Error calling endPeriodAndDistributePayouts():", error);
    }

    // // Make sure players and scores reset, and period_end is moved to next cycle
    leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA);
    const participants: Participant[] = leaderboardAcct.participants;
    let bnZero = new anchor.BN(0);
    for (let i = 0; i < participants.length; i++) {
      assert.equal(participants[i].pubkey.toString(), PublicKey.default.toString(), 'leaderboard should be reset but isn\'t.');
      assert.equal(participants[i].score.toNumber(), 0, 'leaderboard should be reset but isn\'t.');
    }

    // Make sure treasury and winner balances are correctly updated
    const firstPlaceBalanceAfter = await connection.getBalance(firstPlaceParticipant.pubkey);
    const secondPlaceBalanceAfter = await connection.getBalance(secondPlaceParticipant.pubkey);
    const thirdPlaceBalanceAfter = await connection.getBalance(thirdPlaceParticipant.pubkey);
    const treasuryBalanceAfter = await connection.getBalance(treasuryKeypair.publicKey);

    const totalPayoutNumber = leaderboardAcct.totalPayoutPerPeriod.toNumber();
    const firstPlaceExpectedWinnings = totalPayoutNumber / 2;
    const secondPlaceExpectedWinnings = totalPayoutNumber / 4;
    const thirdPlaceExpectedWinnings = totalPayoutNumber / 8;

    expect(treasuryBalanceAfter).to.equal(treasuryBalanceBefore - (firstPlaceExpectedWinnings + secondPlaceExpectedWinnings + thirdPlaceExpectedWinnings));
    expect(firstPlaceBalanceAfter).to.equal(firstPlaceBalanceBefore + firstPlaceExpectedWinnings);
    expect(secondPlaceBalanceAfter).to.equal(secondPlaceBalanceBefore + secondPlaceExpectedWinnings);
    expect(thirdPlaceBalanceAfter).to.equal(thirdPlaceBalanceBefore + thirdPlaceExpectedWinnings);
  })
})
