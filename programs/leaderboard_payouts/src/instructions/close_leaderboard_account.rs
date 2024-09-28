use crate::Leaderboard;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CloseLeaderboardAccount<'info> {
    #[account(
        mut,
        seeds = [b"leaderboard", admin.key().as_ref()],
        bump,
        close = admin
    )]
    pub leaderboard: Account<'info, Leaderboard>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}
