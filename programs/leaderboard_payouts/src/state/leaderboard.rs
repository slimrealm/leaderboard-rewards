use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Participant {
    pub pubkey: Pubkey,
    pub score: u64,
}

impl Space for Participant {
    const INIT_SPACE: usize = 32 + 8;
}

impl Default for Participant {
    fn default() -> Self {
        Participant {
            pubkey: Pubkey::default(),
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
    pub current_period_end: i64,
    #[max_len(100)]
    pub participants: Vec<Participant>,
    pub is_initialized: bool,
    pub total_payout_per_period: i64, // The sum of all payouts for a period
}

// Space should be 4061: usize = 8 + 32 + (8*2) + 1 + (4 + (32 + 8)*100)/*scores*/ = 4061 --> rent: 0.02915544 SOL at last check
