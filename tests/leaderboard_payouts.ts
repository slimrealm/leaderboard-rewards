import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SystemProgram, Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { LeaderboardPayouts } from "../target/types/leaderboard_payouts";
import { assert, expect } from "chai";
import { BN } from "bn.js";

const connection = new Connection("http://localhost:8899");
anchor.setProvider(anchor.AnchorProvider.env());
const program = anchor.workspace.LeaderboardPayouts as Program<LeaderboardPayouts>;

const airdropTwo = async (accountPubKey: anchor.web3.PublicKey) => {
  try {
    const adminAirdropSig = await anchor.getProvider().connection.requestAirdrop(accountPubKey, 2 * LAMPORTS_PER_SOL);
    let latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: adminAirdropSig,
    });
  } catch (error) {
    console.error(error);
  }
}

const callInitialize = async (admin: anchor.web3.Keypair, leaderboardPDA: anchor.web3.PublicKey, periodLength: anchor.BN, topSpots: number) => {
  // Test Initialize function, verify that leaderboard account has correct state after being created
  try {
    const tx = await program.methods.initialize(periodLength, topSpots)
      .accountsPartial({
        leaderboard: leaderboardPDA,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId
      })
      .signers([admin])
      .rpc();
    console.log("Your transaction signature", tx);
    console.log("Leaderboard initialized successfully!");
    return true;
  } catch (error) {
    console.error("Error initializing leaderboard:", error);
    return false;
  }
}

describe("leaderboard_payouts", () => {
  it("call Initialize once", async () => {
    const admin = anchor.web3.Keypair.generate(); // in prod will use actual admin keypair
    const [leaderboardPDA, bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("leaderboard"),
        admin.publicKey.toBuffer()
      ],
      program.programId
    );
    // console.log(`Leaderboard PDA: ${leaderboardPDA.toString()}`);
    // console.log(`Bump: ${bump}`);
    // Fund admin account so it can pay to create leaderboard account
    await airdropTwo(admin.publicKey);
    // Set up the parameters
    const periodLength = new anchor.BN(86400); // 1 day in seconds
    const topSpots = 5;
    const initResult = await callInitialize(admin, leaderboardPDA, periodLength, topSpots);
    expect(initResult).to.be.true;

    // Test that leaderboard account state has the correct values
    const leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA);
    assert.equal(leaderboardAcct.admin.toString(), admin.publicKey.toString(), "leaderboard account's admin pubkey should match passed in value.");
    assert.equal(leaderboardAcct.periodLength.toString(), periodLength.toString(), "leaderboard account's periodLength should match passed in value.");
    assert.equal(leaderboardAcct.topSpots.toString(), topSpots.toString(), "leaderboard account's topSpots should match passed in value.");
    // For currentPeriodStart value, sanity check test that Unix timestamp is > a past date and <= now
    const startTimestampString = leaderboardAcct.currentPeriodStart.toString();
    const currentUnixTimestamp = Math.floor(Date.now() / 1000);
    // This .greaterThan may fail if running with solana-test-validator, as Unix timestamp will not be current 
    expect(Number(startTimestampString)).to.be.greaterThan(1727126128);
    expect(Number(startTimestampString)).to.be.lessThanOrEqual(currentUnixTimestamp);
  })

  it("call Initialize twice", async () => {
    const admin = anchor.web3.Keypair.generate(); // in prod will use actual admin keypair
    const [leaderboardPDA, bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("leaderboard"),
        admin.publicKey.toBuffer()
      ],
      program.programId
    );
    // console.log(`Leaderboard PDA: ${leaderboardPDA.toString()}`);
    // console.log(`Bump: ${bump}`);
    // Fund admin account so it can pay to create leaderboard account
    await airdropTwo(admin.publicKey);
    // Set up the parameters
    const periodLength = new anchor.BN(86400); // 1 day in seconds
    const topSpots = 5;
    const initResult1 = await callInitialize(admin, leaderboardPDA, periodLength, topSpots);
    expect(initResult1).to.be.true;
    const initResult2 = await callInitialize(admin, leaderboardPDA, periodLength, topSpots);
    expect(initResult2).to.be.false;

    // Test that leaderboard account state has the correct values
    const leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA);
    assert.equal(leaderboardAcct.admin.toString(), admin.publicKey.toString(), "leaderboard account's admin pubkey should match passed in value.");
    assert.equal(leaderboardAcct.periodLength.toString(), periodLength.toString(), "leaderboard account's periodLength should match passed in value.");
    assert.equal(leaderboardAcct.topSpots.toString(), topSpots.toString(), "leaderboard account's topSpots should match passed in value.");
    // For currentPeriodStart value, sanity check test that Unix timestamp is > a past date and <= now
    const startTimestampString = leaderboardAcct.currentPeriodStart.toString();
    const currentUnixTimestamp = Math.floor(Date.now() / 1000);
    // This .greaterThan may fail if running with solana-test-validator, as Unix timestamp will not be current 
    expect(Number(startTimestampString)).to.be.greaterThan(1727126128);
    expect(Number(startTimestampString)).to.be.lessThanOrEqual(currentUnixTimestamp);
  })
})
