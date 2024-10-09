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

        // Store new config values in leaderboard state
        self.leaderboard.period_length = new_period_length;
        self.leaderboard.top_spots = new_top_spots;
        self.leaderboard.total_payout_per_period = new_total_payout;
        Ok(())
    }
}
