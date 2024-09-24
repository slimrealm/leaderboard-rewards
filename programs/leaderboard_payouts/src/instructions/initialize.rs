use crate::{error::LeaderboardError, state::Leaderboard};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init_if_needed,
        payer = admin,
        space = 8 + Leaderboard::INIT_SPACE
    )]
    pub leaderboard: Account<'info, Leaderboard>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn initialize(&mut self, period_length: i64, top_spots: u8) -> Result<()> {
        require!(period_length > 0, LeaderboardError::InvalidPeriodLength);
        require!(
            top_spots > 0 && top_spots <= 10,
            LeaderboardError::InvalidTopSpots
        );
        self.leaderboard.set_inner(Leaderboard {
            admin: self.admin.key(),
            period_length,
            top_spots,
            current_period_start: Clock::get()?.unix_timestamp,
        });
        Ok(())
    }
}
