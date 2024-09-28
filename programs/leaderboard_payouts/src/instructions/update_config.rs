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
    pub fn update_config(&mut self, new_period_length: i64, new_top_spots: u8) -> Result<()> {
        require!(new_period_length > 0, LeaderboardError::InvalidPeriodLength);
        require!(
            new_top_spots > 0 && new_top_spots <= 10,
            LeaderboardError::InvalidTopSpots
        );
        // TODO: This function should take in bool of whether or not to wait for period end to changes these values.  Default behavior should be to store these values, wait for period end, then when running end_period(), check for values and if they exist, update these properties so they are used for next period.
        self.leaderboard.period_length = new_period_length;
        self.leaderboard.top_spots = new_top_spots;
        Ok(())
    }
}
