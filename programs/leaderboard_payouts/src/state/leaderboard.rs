use anchor_lang::prelude::*;

// #[derive(AnchorSerialize, AnchorDeserialize, Clone)]
// pub struct HistoricalPeriod {
//     pub period_end: i64,
//     pub top_participants: Vec<(Pubkey, u64)>,
// }

// impl Space for HistoricalPeriod {
//     const INIT_SPACE: usize = 24 + 8 + 10 * (32 + 8);
// }

// #[derive(AnchorSerialize, AnchorDeserialize, Clone)]
// pub struct Score {
//     pub player: Pubkey,
//     pub score: u64,
// }

// impl Space for Score {
//     const INIT_SPACE: usize = 32 + 8;
// }
#[account]
#[derive(InitSpace)]
pub struct Leaderboard {
    pub admin: Pubkey,
    pub period_length: i64,
    pub top_spots: u8,
    pub current_period_start: i64,
    // #[max_len(1000)]
    // pub scores: Vec<Score>,
    // #[max_len(10)]
    // pub historical_data: Vec<HistoricalPeriod>,
}

// impl Space for Leaderboard {
//     //TODO: incl. vec size in space
//     const INIT_SPACE: usize = 8 + 32 + (8 * 2) + 1; //+ ((32 + 8) * 1000)/*scores*/ +  ((8 + (32 + 8) * 10) * 10)/*historical_data*/;
// }
