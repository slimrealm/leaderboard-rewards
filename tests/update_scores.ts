import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, Connection } from "@solana/web3.js";
import { LeaderboardPayouts } from "../target/types/leaderboard_payouts";
import { confirmTx, convertParticipantScores } from "./helpers";
import { Participant } from "./types";
import { expect } from "chai";
import { verifyParticipantsSetToInitialValues } from "./helpers";

const program = anchor.workspace.LeaderboardPayouts as Program<LeaderboardPayouts>;

export const updateScoresTests = async (leaderboardPDA: PublicKey, adminKeypair: Keypair, connection: Connection) => {


    let leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA);

    // Make sure leaderboard is cleared of real players and scores and set to initial values
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
    console.log("Tx signature - updateScores (again)", txSig);

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