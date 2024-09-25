use anchor_lang::prelude::*;

// pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

// pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("Cap8NdXBQ7GbSVw9MGnGSgWEjKLnDww33REjmViQGgo5");

#[program]
pub mod leaderboard_payouts {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, period_length: i64, top_spots: u8) -> Result<()> {
        ctx.accounts.initialize(period_length, top_spots)
        //Ok(())
    }

    //  pub fn update_config() -> Result<()> {
    //  }

    // pub fn update_score() -> Result<()> {
    // }

    // pub fn end_period(ctx: Context<EndPeriod>) -> Result<()> {
    // }

    // pub fn fund_treasury(ctx: Context<FundTreasury>, amount: u64) -> Result<()> {
    //     ctx.accounts.fund_treasury(amount)
    // Ok(())
    // }
}
