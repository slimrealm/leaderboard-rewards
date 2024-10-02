use anchor_lang::{
    prelude::*,
    // system_program::{transfer, Transfer},
};

#[derive(Accounts)]
pub struct SendPayoutToWinner<'info> {
    // #[account(
    //     init,
    //     payer = admin,
    //     space = 8 + Leaderboard::INIT_SPACE,
    //     seeds = [b"leaderboard", admin.key().as_ref()],
    //     bump
    // )]
    // pub leaderboard: Account<'info, Leaderboard>,
    #[account(
        mut
        // init_if_needed,
        // payer = admin,
        // space = 8,
    )]
    pub treasury: Signer<'info>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> SendPayoutToWinner<'info> {
    // pub fn send_payout_to_winner(
    //     &mut self,
    //     winner_account: Pubkey,
    //     curr_reward: u64,
    // ) -> Result<()> {
    //     let transfer_accounts = Transfer {
    //         from: self.treasury.to_account_info(),
    //         to: to.unwrap().to_account_info(),
    //     };

    //     let admin_key = self.admin.key();

    //     // let signer_seeds: &[&[&[u8]]] = &[treasury_seeds];
    //     msg!("ADMIN PubKey: {}", self.admin.key().to_string());
    //     msg!("TREASURY PubKey: {}", self.treasury.key().to_string());

    //     // let ctx = CpiContext::new(self.system_program.to_account_info(), transfer_accounts);
    //     let ctx = CpiContext::new/*_with_signer*/(
    //         self.system_program.to_account_info(),
    //         transfer_accounts,
    //         // signer_seeds,
    //     );

    //     transfer(ctx, curr_reward)?;
}
