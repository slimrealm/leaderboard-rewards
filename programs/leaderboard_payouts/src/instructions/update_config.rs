use crate::{error::LeaderboardError, state::Leaderboard};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(
        mut,
        seeds = [b"leaderboard", admin.key().as_ref()],
        bump 
    )]
    pub leaderboard: Account<'info, Leaderboard>,
    #[account(mut)]
    pub admin: Signer<'info>,
}

impl<'info> UpdateConfig<'info> {
    pub fn update_config(&mut self, new_period_length: i64, new_top_spots: u8, new_total_payout: i64) -> Result<()> {
        require!(new_period_length > 0, LeaderboardError::InvalidPeriodLength);
        require!(
            new_top_spots > 0 && new_top_spots <= 10,
            LeaderboardError::InvalidTopSpots
        );
        // TODO: Should store these values, wait for period end, then when running end_period(), check for values and if they exist, update these properties so they are used for next period.
    // Then test this flow and make sure that after calling end_period, the new current_period_end reflects the change
        self.leaderboard.period_length = new_period_length;
        self.leaderboard.top_spots = new_top_spots;
        self.leaderboard.total_payout_per_period = new_total_payout;
        Ok(())

        // pub admin: Pubkey,
        // pub period_length: i64,
        // pub top_spots: u8,
        // pub current_period_start: i64,
        // pub current_period_end: i64,
        // #[max_len(100)]
        // pub participants: Vec<Participant>,
        // pub is_initialized: bool,
        // pub total_payout_per_period: i64, // The sum of all payouts for a period
    }
}
