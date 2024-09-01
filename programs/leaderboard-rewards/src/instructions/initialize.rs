use crate::{error::LeaderboardError, state::Leaderboard};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = Leaderboard::INIT_SPACE
    )]
    pub leaderboard: Account<'info, Leaderboard>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn initialize(ctx: Context<Initialize>, period_length: i64, top_spots: u8) -> Result<()> {
        require!(period_length > 0, LeaderboardError::InvalidPeriodLength);
        require!(
            top_spots > 0 && top_spots <= 10,
            LeaderboardError::InvalidTopSpots
        );
        //TODO: Need set_inner?
        let leaderboard = &mut ctx.accounts.leaderboard;
        leaderboard.period_length = period_length;
        leaderboard.top_spots = top_spots;
        leaderboard.current_period_start = Clock::get()?.unix_timestamp;
        leaderboard.admin = ctx.accounts.admin.key();

        Ok(())
    }
}
