use anchor_lang::prelude::*;

// pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

// pub use constants::*;
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

    pub fn close_treasury_account(_ctx: Context<CloseTreasuryAccount>) -> Result<()> {
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

        // let payout_ctx = Context::new(
        //     ctx.program_id,
        //     &mut ctx.accounts.treasury,
        //     ctx.accounts.admin,
        //     ctx.accounts.system_program,
        // );
        // leaderboard_payouts::send_payout_to_winner(ctx, winner_account)?;
    }

    // pub fn send_payout_to_winner(
    //     ctx: Context<SendPayoutToWinner>,
    //     winner_account: Pubkey,
    //     curr_reward: u64,
    // ) -> Result<()> {
    //     ctx.accounts
    //         .send_payout_to_winner(winner_account, curr_reward)
    // }

    // pub fn update_score() -> Result<()> {
    // }

    // pub fn end_period(ctx: Context<EndPeriod>) -> Result<()> {
    // }
}
