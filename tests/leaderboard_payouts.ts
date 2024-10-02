import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SystemProgram, Connection, Keypair, PublicKey, Commitment, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { LeaderboardPayouts } from "../target/types/leaderboard_payouts";
import { assert, expect } from "chai";
import adminWallet from "./admin-wallet.json"

const airdrop = async (amt: number, accountPubKey: anchor.web3.PublicKey) => {
  try {
    const airdropSig = await anchor.getProvider().connection.requestAirdrop(accountPubKey, amt * LAMPORTS_PER_SOL);
    console.log("airdrop tx sig:", airdropSig);
    let latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSig,
    },);
  } catch (error) {
    console.error(error);
  }
}

const callInitialize = async (admin: anchor.web3.Keypair, leaderboardPDA: anchor.web3.PublicKey, periodLength: anchor.BN, topSpots: number) => {
  // Test Initialize function, verify that leaderboard account has correct state after being created
  try {
    const initializeTxSig = await program.methods.initialize(periodLength, topSpots)
      .accountsPartial({
        leaderboard: leaderboardPDA,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId
      })
      .signers([admin])
      .rpc();
    let latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: initializeTxSig,
    },);
    console.log("Transaction signature for calling initialize", initializeTxSig);
    console.log("Leaderboard initialized successfully!");
    return true;
  } catch (error) {
    console.error("Error initializing leaderboard:", error);
    return false;
  }
}

const postInitChecks = async (leaderboardPDA: PublicKey, periodLength: anchor.BN, topSpots: number) => {
  // Test that leaderboard account state has the correct values
  try {
    const leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA);
    assert.equal(leaderboardAcct.admin.toString(), adminKeypair.publicKey.toString(), "leaderboard account's admin pubkey should match passed in value.");
    assert.equal(leaderboardAcct.periodLength.toString(), periodLength.toString(), "leaderboard account's periodLength should match passed in value.");
    assert.equal(leaderboardAcct.topSpots.toString(), topSpots.toString(), "leaderboard account's topSpots should match passed in value.");

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
console.log(`Leaderboard PDA: ${leaderboardPDA.toString()}`);
console.log(`Bump: ${leaderboardBump}`);

describe("leaderboard_payouts", () => {
  beforeEach(async () => {
    await airdrop(10, adminKeypair.publicKey);

    // Check if leaderboard acct exists.  If yes, close.
    try {
      await program.account.leaderboard.fetch(leaderboardPDA);
      const closePdaTxSig = await program.methods.closeLeaderboardAccount()
        .accountsPartial({
          admin: adminKeypair.publicKey,
          leaderboard: leaderboardPDA,
          systemProgram: SystemProgram.programId
        })
        .signers([adminKeypair])
        .rpc();
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: closePdaTxSig,
      },);
    } catch (error) {
      if (error instanceof anchor.AnchorError && error.error.errorCode.code === "AccountNotInitialized") {
        console.log("Leaderboard acount does not exist");
      } else {
        console.error(error);
      }
    }

    // Check if treasury acct exists.  If yes, close.
    try {
      await program.account.treasury.fetch(treasuryKeypair.publicKey);
      const closePdaTxSig = await program.methods.closeTreasuryAccount()
        .accountsPartial({
          admin: adminKeypair.publicKey,
          treasury: treasuryKeypair.publicKey,
          systemProgram: SystemProgram.programId
        })
        .signers([adminKeypair])
        .rpc();
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: closePdaTxSig,
      },);
    } catch (error) {
      if (error instanceof anchor.AnchorError && error.error.errorCode.code === "AccountNotInitialized") {
        console.log("Treasury account does not exist");
      } else {
        console.error(error);
      }
    }
  });

  it("call initialize once", async () => {
    const periodLength = new anchor.BN(86400); // 1 day in seconds
    const topSpots = 5;
    const callInitResult = await callInitialize(adminKeypair, leaderboardPDA, periodLength, topSpots);
    expect(callInitResult).to.be.true;
    const initChecksResult = await postInitChecks(leaderboardPDA, periodLength, topSpots);
    expect(initChecksResult).to.be.true;
  })

  it("call initialize twice", async () => {
    const periodLength = new anchor.BN(86400); // 1 day in seconds
    const topSpots = 5;
    const initResult1 = await callInitialize(adminKeypair, leaderboardPDA, periodLength, topSpots);
    expect(initResult1).to.be.true;
    const initResult2 = await callInitialize(adminKeypair, leaderboardPDA, periodLength, topSpots);
    expect(initResult2).to.be.false;

    const initChecksResult = await postInitChecks(leaderboardPDA, periodLength, topSpots);
    expect(initChecksResult).to.be.true;
  })

  it("close acct if exists", async () => {
    const stringSeed = "leaderboard";
    const adminPubkeySeed = adminKeypair.publicKey;

    // Initialize - ensure leaderboard acct is created
    const periodLength = new anchor.BN(86400); // 1 day in seconds
    const topSpots = 5;
    const callInitResult = await callInitialize(adminKeypair, leaderboardPDA, periodLength, topSpots);
    expect(callInitResult).to.be.true;
    const initChecksResult = await postInitChecks(leaderboardPDA, periodLength, topSpots);
    expect(initChecksResult).to.be.true;

    // Get balance before closing leaderboard account 
    try {
      let balance = await connection.getBalance(leaderboardPDA,);
      console.log(`Account balance: ${balance} lamports`);
      let solBalance = balance / anchor.web3.LAMPORTS_PER_SOL;
      console.log(`SOL balance: ${solBalance} SOL`);
    } catch (error) {
      console.error("Initial getBalance() failed:", error);
    }

    // Close leaderboard account
    try {
      const closePdaTxSig = await program.methods.closeLeaderboardAccount()
        .accountsPartial({
          admin: adminKeypair.publicKey,
          leaderboard: leaderboardPDA,
          systemProgram: SystemProgram.programId
        })
        .signers([adminKeypair])
        .rpc();
      let latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: closePdaTxSig,
      },);
    } catch (error) {
      console.error("Failed to close PDA:", error);
    }

    // Balance after closing account should be 0
    try {
      let balance = await connection.getBalance(leaderboardPDA, 'finalized');
      console.log(`Account balance: ${balance} lamports`);
      let solBalance = balance / anchor.web3.LAMPORTS_PER_SOL;
      console.log(`SOL balance: ${solBalance} SOL`);
      expect(balance).to.equal(0);
    } catch (error) {
      console.error("getBalance() failed after closing PDA:", error);
    }

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
      expect.fail("Expected to fail but did not");
    } catch (error) {
      console.log("Fail error:", error);
      expect(error).to.be.instanceOf(anchor.AnchorError);
      if (error instanceof anchor.AnchorError) {
        expect(error.error.errorCode.number).to.equal(3012);
      }
    }
  })

  it("fund treasury", async () => {
    const periodLength = new anchor.BN(86400); // 1 day in seconds
    const topSpots = 5;

    try {
      let balance = await connection.getBalance(treasuryKeypair.publicKey);
      console.log(`Account balance: ${balance} lamports`);
      let solBalance = balance / anchor.web3.LAMPORTS_PER_SOL;
      console.log(`Account balance: ${solBalance} SOL`);
    } catch (error) {
      console.error("Could not close PDA account:", error);
    }

    // Call initialize, which will initialize treasury account
    const initResult = await callInitialize(adminKeypair, leaderboardPDA, periodLength, topSpots);
    expect(initResult).to.be.true;
    const initChecksResult = await postInitChecks(leaderboardPDA, periodLength, topSpots);
    expect(initChecksResult).to.be.true;

    // Get rent-exempt balance for treasury account -- just 8 bytes (account discriminator)
    const minBalFor8ByteAcct = await connection.getMinimumBalanceForRentExemption(8);

    // Get balance before funding - should equal minBalFor8ByteAcct (lamports)
    let balance = await connection.getBalance(treasuryKeypair.publicKey);
    console.log(`Account balance: ${balance} lamports`);
    expect(balance).to.equal(minBalFor8ByteAcct);

    const amount = new anchor.BN(5);
    try {
      const tx = await program.methods.fundTreasury(amount)
        .accountsPartial({
          admin: adminKeypair.publicKey,
          treasury: treasuryKeypair.publicKey,
          systemProgram: SystemProgram.programId
        })
        .signers([adminKeypair])
        .rpc();
      let latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: tx,
      },);

      console.log("Transaction signature", tx);
      console.log("Treasury funded successfully!");
    } catch (error) {
      console.error("Error funding treasury:", error);
    }

    // Get balance after funding - should be 5000000000 + minBalFor8ByteAcct (lamports)
    balance = await connection.getBalance(treasuryKeypair.publicKey);
    console.log(`Account balance: ${balance} lamports`);
    expect(balance).to.equal(5000000000 + minBalFor8ByteAcct);
  })

  it("update config", async () => {
    // Set initial values and initialize
    const periodLength = new anchor.BN(86400); // 1 day in seconds
    const topSpots = 5;
    const callInitResult = await callInitialize(adminKeypair, leaderboardPDA, periodLength, topSpots);
    expect(callInitResult).to.be.true;

    let leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA);
    console.log("periodLength:", leaderboardAcct.periodLength.toString());
    console.log("topSpots:", leaderboardAcct.topSpots.toString());
    assert.equal(leaderboardAcct.periodLength.toString(), periodLength.toString(), "leaderboard account's periodLength should match passed in value.");
    assert.equal(leaderboardAcct.topSpots.toString(), topSpots.toString(), "leaderboard account's topSpots should match passed in value.");

    // Update values and expect them to be changed.  TODO: There should be default behavior to wait
    // for end of period to update these values.  If someone is running a game, or waiting to dispense
    // payouts for videos with most views, users will not be happy if the period and payout structure
    // changes mid-cycle.
    const newPeriodLength = new anchor.BN(604800); // 1 week in seconds
    const newTopSpots = 10;

    const updateConfigTxSig = await program.methods.updateConfig(newPeriodLength, newTopSpots)
      .accountsPartial({
        leaderboard: leaderboardPDA,
        admin: adminKeypair.publicKey,
      })
      .signers([adminKeypair])
      .rpc();
    let latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: updateConfigTxSig,
    },);

    leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA,);
    console.log("Transaction signature for calling update_config", updateConfigTxSig);
    console.log("periodLength:", leaderboardAcct.periodLength.toString());
    console.log("topSpots:", leaderboardAcct.topSpots.toString());
    assert.equal(leaderboardAcct.periodLength.toString(), newPeriodLength.toString(), "leaderboard account's periodLength should match new value.");
    assert.equal(leaderboardAcct.topSpots.toString(), newTopSpots.toString(), "leaderboard account's topSpots should match new value.");
  })
})
