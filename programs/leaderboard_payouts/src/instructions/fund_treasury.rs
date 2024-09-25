// // use crate::state::Treasury;
// use anchor_lang::{
//     prelude::*,
//     system_program::{transfer, Transfer},
// };

// #[derive(Accounts)]
// pub struct FundTreasury<'info> {
//     #[account(mut)]
//     pub treasury: Account<'info, Treasury>,
//     #[account(mut)]
//     pub payer: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }

// impl<'info> FundTreasury<'info> {
//     pub fn fund_treasury(&mut self, amount: u64) -> Result<()> {
//         let account = Transfer {
//             from: self.payer.to_account_info(),
//             to: self.treasury.to_account_info(),
//         };

//         let ctx = CpiContext::new(self.system_program.to_account_info(), account);
//         transfer(ctx, amount)

//         // self.treasury.set_inner(Treasury {
//         //     balance: self.treasury.balance + amount,
//         // });

//         // let treasury = &mut ctx.accounts.treasury;
//         // let funder = &mut ctx.accounts.funder;

//         // // Transfer SOL from funder to treasury
//         // let cpi_context = CpiContext::new(
//         //     ctx.accounts.system_program.to_account_info(),
//         //     anchor_lang::system_program::Transfer {
//         //         from: funder.to_account_info(),
//         //         to: treasury.to_account_info(),
//         //     },
//         // );
//         // anchor_lang::system_program::transfer(cpi_context, amount)?;

//         // treasury.balance += amount;

//         // Ok(())
//     }
// }
