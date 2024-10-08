use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

#[derive(Accounts)]
pub struct FundTreasury<'info> {
    #[account(mut)]
    pub treasury: Signer<'info>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> FundTreasury<'info> {
    pub fn fund_treasury(&mut self, amount: u64) -> Result<()> {
        let account = Transfer {
            from: self.admin.to_account_info(),
            to: self.treasury.to_account_info(),
        };
        let ctx = CpiContext::new(self.system_program.to_account_info(), account);
        transfer(ctx, amount)
    }
}
