use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone /* , Default*/)]
pub struct HistoricalPeriod {
    pub period_end: i64,
    pub top_participants: Vec<(Pubkey, u64)>,
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Score {
    pub player: Pubkey,
    pub score: u64,
}
#[account]
pub struct Leaderboard {
    pub admin: Pubkey,
    pub period_length: i64,
    pub top_spots: u8,
    pub current_period_start: i64,
    pub scores: Vec<Score>,
    pub historical_data: Vec<HistoricalPeriod>,
}

impl Space for Leaderboard {
    //TODO: incl. vec size in space
    const INIT_SPACE: usize = 8 + 32 + (8 * 2) + 1 + ((32 + 8) * 1000)/*scores*/ +  ((8 + (32 + 8) * 10) * 10)/*historical_data*/;
}
