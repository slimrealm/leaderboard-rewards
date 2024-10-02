use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;

pub use instructions::*;
pub use state::*;

declare_id!("4mQJ6rb4TcDoBp948cdnCtGqyMpw9NWYxmJdvizcYWzt");

#[program]
pub mod leaderboard_payouts {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>, period_length: i64, top_spots: u8) -> Result<()> {
        ctx.accounts.initialize(period_length, top_spots)
    }

    pub fn fund_treasury(ctx: Context<FundTreasury>, sol_amount: u64) -> Result<()> {
        ctx.accounts.fund_treasury(sol_amount)
    }

    pub fn close_leaderboard_account(_ctx: Context<CloseLeaderboardAccount>) -> Result<()> {
        Ok(())
    }

    pub fn update_config(
        ctx: Context<UpdateConfig>,
        new_period_length: i64,
        new_top_spots: u8,
    ) -> Result<()> {
        ctx.accounts.update_config(new_period_length, new_top_spots)
    }

    pub fn distribute_payouts(
        ctx: Context<DistributePayouts>,
        top_participants: Vec<Score>,
    ) -> Result<()> {
        ctx.accounts.distribute_payouts(top_participants)
    }
}
