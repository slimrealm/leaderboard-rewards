use crate::{error::LeaderboardError, state::Leaderboard, Score};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + Leaderboard::INIT_SPACE,
        seeds = [b"leaderboard", admin.key().as_ref()],
        bump 
    )]
    pub leaderboard: Account<'info, Leaderboard>,
    #[account(mut)]
    pub treasury: Signer<'info>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn initialize(&mut self, period_length: i64, top_spots: u8) -> Result<()> {
        // If leaderboard is already initialized, we don't want to give leaderboard account the initial data values again
        require!(!self.leaderboard.is_initialized, LeaderboardError::AccountAlreadyInitialized);
        require!(period_length > 0, LeaderboardError::InvalidPeriodLength);
        require!(
            top_spots > 0 && top_spots <= 10,
            LeaderboardError::InvalidTopSpots
        );
        let initialized_scores = vec![Score::default(); 100];
        self.leaderboard.set_inner(Leaderboard {
            admin: self.admin.key(),
            period_length,
            top_spots,
            current_period_start: Clock::get()?.unix_timestamp,
            scores: initialized_scores,
            is_initialized: true
        });
        Ok(())
    }
}
