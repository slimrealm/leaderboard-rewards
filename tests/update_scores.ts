import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { LeaderboardPayouts } from "../target/types/leaderboard_payouts";
import { confirmTx, convertParticipantScores } from "./leaderboard_payouts";
import { Participant } from "./types";
import { expect } from "chai";

const program = anchor.workspace.LeaderboardPayouts as Program<LeaderboardPayouts>;

export const updateScoresTests = async (leaderboardPDA: PublicKey, adminKeypair: Keypair) => {


    let leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA);

    // TODO: assert.equal(leaderboardAcct.participants, expectedParticipantsArray, "participant pubkeys and scores aren't matching expected initialized values");

    const player1 = anchor.web3.Keypair.generate();
    const player2 = anchor.web3.Keypair.generate();
    const player3 = anchor.web3.Keypair.generate();
    const player4 = anchor.web3.Keypair.generate();
    const player5 = anchor.web3.Keypair.generate();
    const player6 = anchor.web3.Keypair.generate();
    const player7 = anchor.web3.Keypair.generate();
    const player8 = anchor.web3.Keypair.generate();
    const player9 = anchor.web3.Keypair.generate();
    const player10 = anchor.web3.Keypair.generate();



    const updatedParticipants: Participant[] = [
        {
            pubkey: player1.publicKey,
            score: new anchor.BN(13)
        },
        {
            pubkey: player2.publicKey,
            score: new anchor.BN(119)
        },
        {
            pubkey: player3.publicKey,
            score: new anchor.BN(27)
        },
        {
            pubkey: player4.publicKey,
            score: new anchor.BN(94)
        },
        {
            pubkey: player5.publicKey,
            score: new anchor.BN(102)
        },
        {
            pubkey: player6.publicKey,
            score: new anchor.BN(3)
        },
        {
            pubkey: player7.publicKey,
            score: new anchor.BN(57)
        },
        {
            pubkey: player8.publicKey,
            score: new anchor.BN(21)
        },
        {
            pubkey: player9.publicKey,
            score: new anchor.BN(20)
        },
        {
            pubkey: player10.publicKey,
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
    await confirmTx(txSig);

    leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA);

    const newLeaderboardParticipantsArray: Participant[] = leaderboardAcct.participants;
    const newLeaderboardParticipantsArrayWithNumber = convertParticipantScores(newLeaderboardParticipantsArray);

    expect(newLeaderboardParticipantsArrayWithNumber[0].pubkey.toString()).to.equal(player2.publicKey.toString());
    expect(newLeaderboardParticipantsArrayWithNumber[0].score).to.equal(119);
    expect(newLeaderboardParticipantsArrayWithNumber[1].pubkey.toString()).to.equal(player5.publicKey.toString());
    expect(newLeaderboardParticipantsArrayWithNumber[1].score).to.equal(102);
    expect(newLeaderboardParticipantsArrayWithNumber[2].pubkey.toString()).to.equal(player4.publicKey.toString());
    expect(newLeaderboardParticipantsArrayWithNumber[2].score).to.equal(94);
    expect(newLeaderboardParticipantsArrayWithNumber[3].pubkey.toString()).to.equal(player10.publicKey.toString());
    expect(newLeaderboardParticipantsArrayWithNumber[3].score).to.equal(80);
    expect(newLeaderboardParticipantsArrayWithNumber[4].pubkey.toString()).to.equal(player7.publicKey.toString());
    expect(newLeaderboardParticipantsArrayWithNumber[4].score).to.equal(57);
    expect(newLeaderboardParticipantsArrayWithNumber[5].pubkey.toString()).to.equal(player3.publicKey.toString());
    expect(newLeaderboardParticipantsArrayWithNumber[5].score).to.equal(27);
    expect(newLeaderboardParticipantsArrayWithNumber[6].pubkey.toString()).to.equal(player8.publicKey.toString());
    expect(newLeaderboardParticipantsArrayWithNumber[6].score).to.equal(21);
    expect(newLeaderboardParticipantsArrayWithNumber[7].pubkey.toString()).to.equal(player9.publicKey.toString());
    expect(newLeaderboardParticipantsArrayWithNumber[7].score).to.equal(20);
    expect(newLeaderboardParticipantsArrayWithNumber[8].pubkey.toString()).to.equal(player1.publicKey.toString());
    expect(newLeaderboardParticipantsArrayWithNumber[8].score).to.equal(13);
    expect(newLeaderboardParticipantsArrayWithNumber[9].pubkey.toString()).to.equal(player6.publicKey.toString());
    expect(newLeaderboardParticipantsArrayWithNumber[9].score).to.equal(3);


    // Setup and call a second time

    const player11 = anchor.web3.Keypair.generate();
    const player12 = anchor.web3.Keypair.generate();
    const player13 = anchor.web3.Keypair.generate();
    const player14 = anchor.web3.Keypair.generate();
    const player15 = anchor.web3.Keypair.generate();

    const secondUpdatedParticipants: Participant[] = [
        {
            pubkey: player1.publicKey,
            score: new anchor.BN(13)
        },
        {
            pubkey: player2.publicKey,
            score: new anchor.BN(119)
        },
        {
            pubkey: player3.publicKey,
            score: new anchor.BN(27)
        },
        {
            pubkey: player4.publicKey,
            score: new anchor.BN(94)
        },
        {
            pubkey: player5.publicKey,
            score: new anchor.BN(55)
        },
        {
            pubkey: player6.publicKey,
            score: new anchor.BN(3)
        },
        {
            pubkey: player7.publicKey,
            score: new anchor.BN(1)
        },
        {
            pubkey: player8.publicKey,
            score: new anchor.BN(21)
        },
        {
            pubkey: player9.publicKey,
            score: new anchor.BN(20)
        },
        {
            pubkey: player10.publicKey,
            score: new anchor.BN(80)
        },
        {
            pubkey: player11.publicKey,
            score: new anchor.BN(186)
        },
        {
            pubkey: player12.publicKey,
            score: new anchor.BN(92)
        },
        {
            pubkey: player13.publicKey,
            score: new anchor.BN(89)
        },
        {
            pubkey: player14.publicKey,
            score: new anchor.BN(5)
        },
        {
            pubkey: player15.publicKey,
            score: new anchor.BN(2)
        },

    ];

    // Call a second time with new array of updated players & scores
    const txSig2 = await program.methods.updateScores(secondUpdatedParticipants)
        .accountsPartial({
            leaderboard: leaderboardPDA,
            admin: adminKeypair.publicKey,
        })
        .signers([adminKeypair])
        .rpc();
    await confirmTx(txSig2);

    leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA);

    const secondNewLeaderboardParticipantsArray: Participant[] = leaderboardAcct.participants;
    const secondNewLeaderboardParticipantsArrayWithNumber = convertParticipantScores(secondNewLeaderboardParticipantsArray);

    expect(secondNewLeaderboardParticipantsArrayWithNumber[0].pubkey.toString()).to.equal(player11.publicKey.toString());
    expect(secondNewLeaderboardParticipantsArrayWithNumber[0].score).to.equal(186);
    expect(secondNewLeaderboardParticipantsArrayWithNumber[1].pubkey.toString()).to.equal(player2.publicKey.toString());
    expect(secondNewLeaderboardParticipantsArrayWithNumber[1].score).to.equal(119);
    expect(secondNewLeaderboardParticipantsArrayWithNumber[2].pubkey.toString()).to.equal(player4.publicKey.toString());
    expect(secondNewLeaderboardParticipantsArrayWithNumber[2].score).to.equal(94);
    expect(secondNewLeaderboardParticipantsArrayWithNumber[3].pubkey.toString()).to.equal(player12.publicKey.toString());
    expect(secondNewLeaderboardParticipantsArrayWithNumber[3].score).to.equal(92);
    expect(secondNewLeaderboardParticipantsArrayWithNumber[4].pubkey.toString()).to.equal(player13.publicKey.toString());
    expect(secondNewLeaderboardParticipantsArrayWithNumber[4].score).to.equal(89);
    expect(secondNewLeaderboardParticipantsArrayWithNumber[5].pubkey.toString()).to.equal(player10.publicKey.toString());
    expect(secondNewLeaderboardParticipantsArrayWithNumber[5].score).to.equal(80);
    expect(secondNewLeaderboardParticipantsArrayWithNumber[6].pubkey.toString()).to.equal(player5.publicKey.toString());
    expect(secondNewLeaderboardParticipantsArrayWithNumber[6].score).to.equal(55);
    expect(secondNewLeaderboardParticipantsArrayWithNumber[7].pubkey.toString()).to.equal(player3.publicKey.toString());
    expect(secondNewLeaderboardParticipantsArrayWithNumber[7].score).to.equal(27);
    expect(secondNewLeaderboardParticipantsArrayWithNumber[8].pubkey.toString()).to.equal(player8.publicKey.toString());
    expect(secondNewLeaderboardParticipantsArrayWithNumber[8].score).to.equal(21);
    expect(secondNewLeaderboardParticipantsArrayWithNumber[9].pubkey.toString()).to.equal(player9.publicKey.toString());
    expect(secondNewLeaderboardParticipantsArrayWithNumber[9].score).to.equal(20);
    expect(secondNewLeaderboardParticipantsArrayWithNumber[10].pubkey.toString()).to.equal(player1.publicKey.toString());
    expect(secondNewLeaderboardParticipantsArrayWithNumber[10].score).to.equal(13);
    expect(secondNewLeaderboardParticipantsArrayWithNumber[11].pubkey.toString()).to.equal(player14.publicKey.toString());
    expect(secondNewLeaderboardParticipantsArrayWithNumber[11].score).to.equal(5);
    expect(secondNewLeaderboardParticipantsArrayWithNumber[12].pubkey.toString()).to.equal(player6.publicKey.toString());
    expect(secondNewLeaderboardParticipantsArrayWithNumber[12].score).to.equal(3);
    expect(secondNewLeaderboardParticipantsArrayWithNumber[13].pubkey.toString()).to.equal(player15.publicKey.toString());
    expect(secondNewLeaderboardParticipantsArrayWithNumber[13].score).to.equal(2);
    expect(secondNewLeaderboardParticipantsArrayWithNumber[14].pubkey.toString()).to.equal(player7.publicKey.toString());
    expect(secondNewLeaderboardParticipantsArrayWithNumber[14].score).to.equal(1);
}