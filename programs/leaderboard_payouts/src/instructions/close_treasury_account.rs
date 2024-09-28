use crate::Treasury;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CloseTreasuryAccount<'info> {
    #[account(
        mut,
        seeds = [b"treasury", admin.key().as_ref()],
        bump,
        close = admin
    )]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}
