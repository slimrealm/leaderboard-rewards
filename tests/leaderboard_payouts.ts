import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SystemProgram, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { LeaderboardPayouts } from "../target/types/leaderboard_payouts";
import { assert, expect } from "chai";
import { BN } from "bn.js";


const connection = new Connection("http://localhost:8899");

describe("leaderboard_payouts", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.LeaderboardPayouts as Program<LeaderboardPayouts>;

  // Test Initialize function, verify that leaderboard account has correct state after being created
  it("Initialize", async () => {
    const admin = anchor.web3.Keypair.generate(); // in prod will use actual admin keypair
    const leaderboard = anchor.web3.Keypair.generate();

    // Fund admin account so it can pay to create leaderboard account
    try {
      const adminAirdropSig = await anchor.getProvider().connection.requestAirdrop(admin.publicKey, 2 * LAMPORTS_PER_SOL);
      let latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: adminAirdropSig,
      });
    } catch (error) {
      console.error(error);
    }

    // Set up the parameters
    const periodLength = new anchor.BN(86400); // 1 day in seconds
    const topSpots = 5;

    // Call the initialize function
    try {
      const tx = await program.methods.initialize(periodLength, topSpots)
        .accountsPartial({
          leaderboard: leaderboard.publicKey,
          admin: admin.publicKey,
          systemProgram: SystemProgram.programId
        })
        .signers([admin, leaderboard])
        .rpc();
      console.log("Your transaction signature", tx);
      console.log("Leaderboard initialized successfully!");
    } catch (error) {
      console.error("Error initializing leaderboard:", error);
    }

    // Test that leaderboard account state has the correct values
    const leaderboardAcct = await program.account.leaderboard.fetch(leaderboard.publicKey);
    console.log('from anchor', leaderboardAcct.currentPeriodStart);
    // console.log('from TS', topSpots);
    const failValue = new anchor.BN(86401);
    assert.equal(leaderboardAcct.admin.toString(), admin.publicKey.toString(), "leaderboard account's admin pubkey should match passed in value.");
    assert.equal(leaderboardAcct.periodLength.toString(), periodLength.toString(), "leaderboard account's periodLength should match passed in value.");
    assert.equal(leaderboardAcct.topSpots.toString(), topSpots.toString(), "leaderboard account's topSpots should match passed in value.");

    // For currentPeriodStart value, sanity check test that Unix timestamp is > a past date and <= now
    const startTimestampString = leaderboardAcct.currentPeriodStart.toString();
    const currentUnixTimestamp = Math.floor(Date.now() / 1000);
    console.log('now', currentUnixTimestamp);
    // This .greaterThan may fail if running with solana-test-validator, as Unix timestamp will not be current 
    expect(Number(startTimestampString)).to.be.greaterThan(1727126128);
    expect(Number(startTimestampString)).to.be.lessThanOrEqual(currentUnixTimestamp);
  })
})
