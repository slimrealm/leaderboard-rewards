use anchor_lang::prelude::*;

// #[derive(AnchorSerialize, AnchorDeserialize, Clone)]
// pub struct HistoricalPeriod {
//     pub period_end: i64,
//     pub top_participants: Vec<(Pubkey, u64)>,
// }

// impl Space for HistoricalPeriod {
//     const INIT_SPACE: usize = 24 + 8 + 10 * (32 + 8);
// }

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Score {
    pub player: Pubkey,
    pub score: u64,
}

impl Space for Score {
    const INIT_SPACE: usize = 32 + 8;
}

impl Default for Score {
    fn default() -> Self {
        Score {
            player: Pubkey::default(),
            score: 0,
        }
    }
}
#[account]
#[derive(InitSpace)]
pub struct Leaderboard {
    pub admin: Pubkey,
    pub period_length: i64,
    pub top_spots: u8,
    pub current_period_start: i64,
    #[max_len(100)]
    pub scores: Vec<Score>,
    pub is_initialized: bool,
    // #[max_len(10)]
    // pub historical_data: Vec<HistoricalPeriod>,
}

// Space should be 4061: usize = 8 + 32 + (8*2) + 1 + (4 + (32 + 8)*100)/*scores*/ = 4061 --> rent: 0.02915544 SOL at last check
