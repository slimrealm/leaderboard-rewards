use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;

pub use instructions::*;
pub use state::*;

declare_id!("gq62AM2KnQhcbWrbu1MLvf7PpkeChefZG8UV85nQ5kc");

#[program]
pub mod leaderboard_payouts {

    use super::*;

    // Initialize leaderboard account and its state
    pub fn initialize(
        ctx: Context<Initialize>,
        period_length: i64,
        top_spots: u8,
        total_payout_per_period: i64,
    ) -> Result<()> {
        ctx.accounts
            .initialize(period_length, top_spots, total_payout_per_period)
    }

    // Currently funded from admin account
    pub fn fund_treasury(ctx: Context<FundTreasury>, amount: u64) -> Result<()> {
        ctx.accounts.fund_treasury(amount)
    }

    // Mainly for testing purposes - should only ever need in prodction if shutting down a platform / business
    pub fn close_leaderboard_account(_ctx: Context<CloseLeaderboardAccount>) -> Result<()> {
        Ok(())
    }

    // Change config values of leaderboard state
    pub fn update_config(
        ctx: Context<UpdateConfig>,
        new_period_length: i64,
        new_top_spots: u8,
        new_total_payout: i64,
    ) -> Result<()> {
        ctx.accounts
            .update_config(new_period_length, new_top_spots, new_total_payout)
    }

    // Current implementation takes in a vector of (new and/or updated) participants from client
    pub fn update_scores(
        ctx: Context<UpdateScores>,
        updated_participants: Vec<Participant>,
    ) -> Result<()> {
        ctx.accounts.update_scores(updated_participants)
    }

    // Reset leaderboard state, pay all winners, advance timeframe
    pub fn end_period_and_distribute_payouts(
        ctx: Context<EndPeriodAndDistributePayouts>,
    ) -> Result<()> {
        ctx.accounts.end_period_and_distribute_payouts()
    }
}
