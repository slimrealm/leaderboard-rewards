import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { Participant, ParticipantWithNumberScore } from "./types";
import { Program } from "@coral-xyz/anchor";
import { LeaderboardPayouts } from "../target/types/leaderboard_payouts";
import { assert } from "chai";

// const program = anchor.workspace.LeaderboardPayouts as Program<LeaderboardPayouts>;

export const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const convertParticipantScores = (participants: Participant[]): ParticipantWithNumberScore[] => {
    return participants.map(participant => ({
        pubkey: participant.pubkey,
        score: participant.score.toNumber()
    }));
}

export const confirmTx = async (txSig: string, connection: Connection) => {
    let latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txSig,
    });
}

export const verifyParticipantsSetToInitialValues = async (leaderboardPDA: PublicKey, program: Program<LeaderboardPayouts>) => {
    const leaderboardAcct = await program.account.leaderboard.fetch(leaderboardPDA);
    const participants: Participant[] = leaderboardAcct.participants;
    let bnZero = new anchor.BN(0);
    for (let i = 0; i < participants.length; i++) {
        assert.equal(participants[i].pubkey.toString(), PublicKey.default.toString(), 'leaderboard should be reset but isn\'t.');
        assert.equal(participants[i].score.toNumber(), 0, 'leaderboard should be reset but isn\'t.');
    }
}