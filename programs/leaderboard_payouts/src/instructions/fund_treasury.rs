use anchor_lang::{
    prelude::*,
    solana_program::native_token::LAMPORTS_PER_SOL,
    system_program::{transfer, Transfer},
};

// use crate::Treasury;

#[derive(Accounts)]
pub struct FundTreasury<'info> {
    #[account(
        mut,
        // seeds = [b"treasury", admin.key().as_ref()],
        // bump 
    )]
    pub treasury: Signer<'info>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> FundTreasury<'info> {
    pub fn fund_treasury(&mut self, sol_amount: u64) -> Result<()> {
        let account = Transfer {
            from: self.admin.to_account_info(),
            to: self.treasury.to_account_info(),
        };
        let lamports_amount = sol_amount * LAMPORTS_PER_SOL;
        let ctx = CpiContext::new(self.system_program.to_account_info(), account);
        transfer(ctx, lamports_amount)
    }
}
