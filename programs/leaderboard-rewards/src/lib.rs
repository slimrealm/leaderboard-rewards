use anchor_lang::prelude::*;

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("9DjQebxAWrLb2kPDx7UxeguqcLbvnGw2QD8QwjuU6Qci");

#[program]
pub mod leaderboard_payouts {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, period_length: i64, top_spots: u8) -> Result<()> {
        instructions::initialize:(ctx, period_length, top_spots)
    }

    //  pub fn update_config() -> Result<()> {
    //  }

    // pub fn update_score() -> Result<()> {
    // }

    // pub fn end_period(ctx: Context<EndPeriod>) -> Result<()> {
    // }

    // pub fn fund_treasury() -> Result<()> {
    // }
}
