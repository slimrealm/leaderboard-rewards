import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SystemProgram, Connection, clusterApiUrl, Keypair, PublicKey, Commitment } from "@solana/web3.js";
import { LeaderboardPayouts } from "../target/types/leaderboard_payouts";
import { assert, expect } from "chai";
import adminWallet from "./admin-wallet.json"
// import { updateScoresTests } from "./update_scores";
import { confirmTx, convertParticipantScores, delay, verifyParticipantsSetToInitialValues } from "./helpers";
import { Participant } from "./types";

const constants = {
  SECONDS_IN_DAY: 86400,
  ADMIN_INITIAL_AIRDROP: 100000000, // 0.1 SOL
  FUND_TREASURY_TEST_AMOUNT: 60000000, // 0.06 SOL
  TEST_PAYOUT_AMOUNT: 50000000, // 0.05 SOL
};

const airdrop = async (amt: number, accountPubKey: anchor.web3.PublicKey) => {
  // try {
  //   const txSig = await anchor.getProvider().connection.requestAirdrop(accountPubKey, amt * LAMPORTS_PER_SOL);
  //   await confirmTx(txSig, connection);
  // } catch (error) {
  //   console.error(error);
  // }
}

// Test Initialize function, verify that leaderboard account has correct state after being created
const callInitialize = async (admin: anchor.web3.Keypair, leaderboardPDA: anchor.web3.PublicKey, periodLength: anchor.BN, topSpots: number, totalPayoutPerPeriod: anchor.BN, expectFail: boolean = false) => {
  try {
    const txSig = await program.methods.initialize(periodLength, topSpots, totalPayoutPerPeriod)
      .accountsPartial({
        leaderboard: leaderboardPDA,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId
      })
      .signers([admin])
      .rpc();
    await confirmTx(txSig, connection);
    console.log("Tx signature - initialize", txSig);
    return true;
  } catch (error) {
    if (!expectFail) {
      console.error("Error initializing leaderboard:", error);
    }
    return false;
  }
}

// Test that leaderboard account state has the correct values after calling initialize
const postInitChecks = async (leaderboardPDA: PublicKey, periodLength: anchor.BN, topSpots: number, totalPayoutPerPeriod: anchor.BN) => {
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

const updateScoresTests = async (leaderboardPDA: PublicKey, adminKeypair: Keypair) => {
  let leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA);

  // // Make sure leaderboard is cleared of real players and scores and set to initial values
  await verifyParticipantsSetToInitialValues(leaderboardPDA, program);

  const participant1 = anchor.web3.Keypair.generate();
  const participant2 = anchor.web3.Keypair.generate();
  const participant3 = anchor.web3.Keypair.generate();
  const participant4 = anchor.web3.Keypair.generate();
  const participant5 = anchor.web3.Keypair.generate();
  const participant6 = anchor.web3.Keypair.generate();
  const participant7 = anchor.web3.Keypair.generate();
  const participant8 = anchor.web3.Keypair.generate();
  const participant9 = anchor.web3.Keypair.generate();
  const participant10 = anchor.web3.Keypair.generate();



  const updatedParticipants: Participant[] = [
    {
      pubkey: participant1.publicKey,
      score: new anchor.BN(13)
    },
    {
      pubkey: participant2.publicKey,
      score: new anchor.BN(119)
    },
    {
      pubkey: participant3.publicKey,
      score: new anchor.BN(27)
    },
    {
      pubkey: participant4.publicKey,
      score: new anchor.BN(94)
    },
    {
      pubkey: participant5.publicKey,
      score: new anchor.BN(102)
    },
    {
      pubkey: participant6.publicKey,
      score: new anchor.BN(3)
    },
    {
      pubkey: participant7.publicKey,
      score: new anchor.BN(57)
    },
    {
      pubkey: participant8.publicKey,
      score: new anchor.BN(21)
    },
    {
      pubkey: participant9.publicKey,
      score: new anchor.BN(20)
    },
    {
      pubkey: participant10.publicKey,
      score: new anchor.BN(80)
    },
  ];

  const txSig = await program.methods.updateScores(updatedParticipants)
    .accountsPartial({
      leaderboard: leaderboardPDA,
      admin: adminKeypair.publicKey,
    })
    .signers([adminKeypair])
    .rpc();
  await confirmTx(txSig, connection);
  console.log("Tx signature - updateScores", txSig);
  leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA);

  const newLeaderboardParticipantsArray: Participant[] = leaderboardAcct.participants;
  const newLeaderboardParticipantsArrayWithNumber = convertParticipantScores(newLeaderboardParticipantsArray);

  expect(newLeaderboardParticipantsArrayWithNumber[0].pubkey.toString()).to.equal(participant2.publicKey.toString());
  expect(newLeaderboardParticipantsArrayWithNumber[0].score).to.equal(119);
  expect(newLeaderboardParticipantsArrayWithNumber[1].pubkey.toString()).to.equal(participant5.publicKey.toString());
  expect(newLeaderboardParticipantsArrayWithNumber[1].score).to.equal(102);
  expect(newLeaderboardParticipantsArrayWithNumber[2].pubkey.toString()).to.equal(participant4.publicKey.toString());
  expect(newLeaderboardParticipantsArrayWithNumber[2].score).to.equal(94);
  expect(newLeaderboardParticipantsArrayWithNumber[3].pubkey.toString()).to.equal(participant10.publicKey.toString());
  expect(newLeaderboardParticipantsArrayWithNumber[3].score).to.equal(80);
  expect(newLeaderboardParticipantsArrayWithNumber[4].pubkey.toString()).to.equal(participant7.publicKey.toString());
  expect(newLeaderboardParticipantsArrayWithNumber[4].score).to.equal(57);
  expect(newLeaderboardParticipantsArrayWithNumber[5].pubkey.toString()).to.equal(participant3.publicKey.toString());
  expect(newLeaderboardParticipantsArrayWithNumber[5].score).to.equal(27);
  expect(newLeaderboardParticipantsArrayWithNumber[6].pubkey.toString()).to.equal(participant8.publicKey.toString());
  expect(newLeaderboardParticipantsArrayWithNumber[6].score).to.equal(21);
  expect(newLeaderboardParticipantsArrayWithNumber[7].pubkey.toString()).to.equal(participant9.publicKey.toString());
  expect(newLeaderboardParticipantsArrayWithNumber[7].score).to.equal(20);
  expect(newLeaderboardParticipantsArrayWithNumber[8].pubkey.toString()).to.equal(participant1.publicKey.toString());
  expect(newLeaderboardParticipantsArrayWithNumber[8].score).to.equal(13);
  expect(newLeaderboardParticipantsArrayWithNumber[9].pubkey.toString()).to.equal(participant6.publicKey.toString());
  expect(newLeaderboardParticipantsArrayWithNumber[9].score).to.equal(3);


  // Setup and call a second time

  const participant11 = anchor.web3.Keypair.generate();
  const participant12 = anchor.web3.Keypair.generate();
  const participant13 = anchor.web3.Keypair.generate();
  const participant14 = anchor.web3.Keypair.generate();
  const participant15 = anchor.web3.Keypair.generate();

  const secondUpdatedParticipants: Participant[] = [
    {
      pubkey: participant1.publicKey,
      score: new anchor.BN(13)
    },
    {
      pubkey: participant2.publicKey,
      score: new anchor.BN(119)
    },
    {
      pubkey: participant3.publicKey,
      score: new anchor.BN(27)
    },
    {
      pubkey: participant4.publicKey,
      score: new anchor.BN(94)
    },
    {
      pubkey: participant5.publicKey,
      score: new anchor.BN(55)
    },
    {
      pubkey: participant6.publicKey,
      score: new anchor.BN(3)
    },
    {
      pubkey: participant7.publicKey,
      score: new anchor.BN(1)
    },
    {
      pubkey: participant8.publicKey,
      score: new anchor.BN(21)
    },
    {
      pubkey: participant9.publicKey,
      score: new anchor.BN(20)
    },
    {
      pubkey: participant10.publicKey,
      score: new anchor.BN(80)
    },
    {
      pubkey: participant11.publicKey,
      score: new anchor.BN(186)
    },
    {
      pubkey: participant12.publicKey,
      score: new anchor.BN(92)
    },
    {
      pubkey: participant13.publicKey,
      score: new anchor.BN(89)
    },
    {
      pubkey: participant14.publicKey,
      score: new anchor.BN(5)
    },
    {
      pubkey: participant15.publicKey,
      score: new anchor.BN(2)
    },

  ];

  // Call a second time with new array of updated participants & scores
  const txSig2 = await program.methods.updateScores(secondUpdatedParticipants)
    .accountsPartial({
      leaderboard: leaderboardPDA,
      admin: adminKeypair.publicKey,
    })
    .signers([adminKeypair])
    .rpc();
  await confirmTx(txSig2, connection);
  console.log("Tx signature - updateScores (again)", txSig2);

  leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA);

  const secondNewLeaderboardParticipantsArray: Participant[] = leaderboardAcct.participants;
  const secondNewLeaderboardParticipantsArrayWithNumber = convertParticipantScores(secondNewLeaderboardParticipantsArray);

  expect(secondNewLeaderboardParticipantsArrayWithNumber[0].pubkey.toString()).to.equal(participant11.publicKey.toString());
  expect(secondNewLeaderboardParticipantsArrayWithNumber[0].score).to.equal(186);
  expect(secondNewLeaderboardParticipantsArrayWithNumber[1].pubkey.toString()).to.equal(participant2.publicKey.toString());
  expect(secondNewLeaderboardParticipantsArrayWithNumber[1].score).to.equal(119);
  expect(secondNewLeaderboardParticipantsArrayWithNumber[2].pubkey.toString()).to.equal(participant4.publicKey.toString());
  expect(secondNewLeaderboardParticipantsArrayWithNumber[2].score).to.equal(94);
  expect(secondNewLeaderboardParticipantsArrayWithNumber[3].pubkey.toString()).to.equal(participant12.publicKey.toString());
  expect(secondNewLeaderboardParticipantsArrayWithNumber[3].score).to.equal(92);
  expect(secondNewLeaderboardParticipantsArrayWithNumber[4].pubkey.toString()).to.equal(participant13.publicKey.toString());
  expect(secondNewLeaderboardParticipantsArrayWithNumber[4].score).to.equal(89);
  expect(secondNewLeaderboardParticipantsArrayWithNumber[5].pubkey.toString()).to.equal(participant10.publicKey.toString());
  expect(secondNewLeaderboardParticipantsArrayWithNumber[5].score).to.equal(80);
  expect(secondNewLeaderboardParticipantsArrayWithNumber[6].pubkey.toString()).to.equal(participant5.publicKey.toString());
  expect(secondNewLeaderboardParticipantsArrayWithNumber[6].score).to.equal(55);
  expect(secondNewLeaderboardParticipantsArrayWithNumber[7].pubkey.toString()).to.equal(participant3.publicKey.toString());
  expect(secondNewLeaderboardParticipantsArrayWithNumber[7].score).to.equal(27);
  expect(secondNewLeaderboardParticipantsArrayWithNumber[8].pubkey.toString()).to.equal(participant8.publicKey.toString());
  expect(secondNewLeaderboardParticipantsArrayWithNumber[8].score).to.equal(21);
  expect(secondNewLeaderboardParticipantsArrayWithNumber[9].pubkey.toString()).to.equal(participant9.publicKey.toString());
  expect(secondNewLeaderboardParticipantsArrayWithNumber[9].score).to.equal(20);
  expect(secondNewLeaderboardParticipantsArrayWithNumber[10].pubkey.toString()).to.equal(participant1.publicKey.toString());
  expect(secondNewLeaderboardParticipantsArrayWithNumber[10].score).to.equal(13);
  expect(secondNewLeaderboardParticipantsArrayWithNumber[11].pubkey.toString()).to.equal(participant14.publicKey.toString());
  expect(secondNewLeaderboardParticipantsArrayWithNumber[11].score).to.equal(5);
  expect(secondNewLeaderboardParticipantsArrayWithNumber[12].pubkey.toString()).to.equal(participant6.publicKey.toString());
  expect(secondNewLeaderboardParticipantsArrayWithNumber[12].score).to.equal(3);
  expect(secondNewLeaderboardParticipantsArrayWithNumber[13].pubkey.toString()).to.equal(participant15.publicKey.toString());
  expect(secondNewLeaderboardParticipantsArrayWithNumber[13].score).to.equal(2);
  expect(secondNewLeaderboardParticipantsArrayWithNumber[14].pubkey.toString()).to.equal(participant7.publicKey.toString());
  expect(secondNewLeaderboardParticipantsArrayWithNumber[14].score).to.equal(1);
}

const commitment: Commitment = 'confirmed';
const connection = new Connection(clusterApiUrl('devnet'), { commitment, confirmTransactionInitialTimeout: 60000 }); //60 seconds
// const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
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

  // Make sure admin has SOL/lamports to fund treasury 
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
        await confirmTx(txSig, connection);
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
      await confirmTx(txSig, connection);
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

    // Get balance before funding
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
      await confirmTx(txSig, connection);

      console.log("Tx signature - fundTreasury", txSig);
    } catch (error) {
      console.error("Error funding treasury:", error);
    }

    // Get balance after funding
    const postFundBalance = await connection.getBalance(treasuryKeypair.publicKey);
    expect(postFundBalance - startingBalance).to.equal(constants.FUND_TREASURY_TEST_AMOUNT);
  })

  it("update config", async () => {
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
    await confirmTx(txSig, connection);
    console.log("Tx signature - updateConfig", txSig);

    leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA,);
    assert.equal(leaderboardAcct.periodLength.toString(), newPeriodLength.toString(), "leaderboard account's periodLength should match new value.");
    assert.equal(leaderboardAcct.topSpots.toString(), newTopSpots.toString(), "leaderboard account's topSpots should match new value.");
    assert.equal(leaderboardAcct.totalPayoutPerPeriod.toString(), newTotalPayout.toString(), "leaderboard account's newTotalPayout should match new value.");
  })

  it("update scores", async () => {
    const periodLength = new anchor.BN(constants.SECONDS_IN_DAY);
    const topSpots = 3;
    const totalPayoutPerPeriod = new anchor.BN(constants.TEST_PAYOUT_AMOUNT);
    const callInitResult = await callInitialize(adminKeypair, leaderboardPDA, periodLength, topSpots, totalPayoutPerPeriod);
    expect(callInitResult).to.be.true;

    await updateScoresTests(leaderboardPDA, adminKeypair);
  })

  it("end period and disribute payouts", async () => {
    // Initialize - setting period of 15 seconds
    const periodLength = new anchor.BN(20); // short, in order to test efficiently - realistic values are a day, week, month
    const topSpots = 3;
    const totalPayoutPerPeriod = new anchor.BN(constants.TEST_PAYOUT_AMOUNT);
    const callInitResult = await callInitialize(adminKeypair, leaderboardPDA, periodLength, topSpots, totalPayoutPerPeriod);
    expect(callInitResult).to.be.true;

    const fundTreasuryAmount = new anchor.BN(constants.FUND_TREASURY_TEST_AMOUNT);

    // Fund treasury account so there is SOL for it to pay out
    try {
      const txSig = await program.methods.fundTreasury(fundTreasuryAmount)
        .accountsPartial({
          admin: adminKeypair.publicKey,
          treasury: treasuryKeypair.publicKey,
          systemProgram: SystemProgram.programId
        })
        .signers([adminKeypair, treasuryKeypair])
        .rpc();
      await confirmTx(txSig, connection);
      console.log("Tx signature - fundTreasury", txSig);
    } catch (error) {
      console.error("Error funding treasury:", error);
    }

    // Call updateScoresTests(), which will result in 15 active participants with scores
    await updateScoresTests(leaderboardPDA, adminKeypair);

    // Check balances of participants holding spots 1 through (3), as well as treasury balance
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
          participantAccount1: firstPlaceParticipant.pubkey,
          participantAccount2: secondPlaceParticipant.pubkey,
          participantAccount3: thirdPlaceParticipant.pubkey,
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
    await delay(20500);

    // Call end period - should now succeed
    try {
      const txSig = await program.methods.endPeriodAndDistributePayouts()
        .accountsPartial({
          leaderboard: leaderboardPDA,
          treasury: treasuryKeypair.publicKey,
          admin: adminKeypair.publicKey,
          participantAccount1: firstPlaceParticipant.pubkey,
          participantAccount2: secondPlaceParticipant.pubkey,
          participantAccount3: thirdPlaceParticipant.pubkey,
          systemProgram: SystemProgram.programId
        })
        .signers([adminKeypair, treasuryKeypair])
        .rpc();
      await confirmTx(txSig, connection);

      console.log("Tx signature - endPeriodAndDistributePayouts", txSig);
    } catch (error) {
      console.error("Error calling endPeriodAndDistributePayouts():", error);
    }

    // Make sure leaderboard is cleared of real players and scores and set to initial values
    await verifyParticipantsSetToInitialValues(leaderboardPDA, program);

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
