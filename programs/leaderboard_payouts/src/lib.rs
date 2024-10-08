use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;

pub use instructions::*;
pub use state::*;

declare_id!("DU1t2fhnpLfsoCdMZZxBdGZW3wp5h2wNMFrmi7JgReXW");

#[program]
pub mod leaderboard_payouts {

    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        period_length: i64,
        top_spots: u8,
        total_payout_per_period: i64,
    ) -> Result<()> {
        ctx.accounts
            .initialize(period_length, top_spots, total_payout_per_period)
    }

    pub fn fund_treasury(ctx: Context<FundTreasury>, amount: u64) -> Result<()> {
        ctx.accounts.fund_treasury(amount)
    }

    pub fn close_leaderboard_account(_ctx: Context<CloseLeaderboardAccount>) -> Result<()> {
        Ok(())
    }

    pub fn update_config(
        ctx: Context<UpdateConfig>,
        new_period_length: i64,
        new_top_spots: u8,
        new_total_payout: i64,
    ) -> Result<()> {
        ctx.accounts
            .update_config(new_period_length, new_top_spots, new_total_payout)
    }

    pub fn update_scores(
        ctx: Context<UpdateScores>,
        updated_participants: Vec<Participant>,
    ) -> Result<()> {
        ctx.accounts.update_scores(updated_participants)
    }

    pub fn end_period_and_distribute_payouts(
        ctx: Context<EndPeriodAndDistributePayouts>,
    ) -> Result<()> {
        ctx.accounts.end_period_and_distribute_payouts()
    }
}
