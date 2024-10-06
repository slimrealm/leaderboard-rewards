import * as anchor from "@coral-xyz/anchor";

export interface Participant {
    pubkey: anchor.web3.PublicKey;
    score: anchor.BN;
}

export interface ParticipantWithNumberScore {
    pubkey: anchor.web3.PublicKey;
    score: number;
}