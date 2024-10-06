use std::cmp::Reverse;

use crate::{error::LeaderboardError, state::Leaderboard, Participant};
use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

#[derive(Accounts)]
pub struct EndPeriodAndDistributePayouts<'info> {
    #[account(
        mut,
        seeds = [b"leaderboard", admin.key().as_ref()],
        bump
    )]
    pub leaderboard: Account<'info, Leaderboard>,
    #[account(mut)]
    pub treasury: Signer<'info>,
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(mut)]
    /// CHECK: This is safe
    pub player_account_1: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: This is safe
    pub player_account_2: Option<AccountInfo<'info>>,
    #[account(mut)]
    /// CHECK: This is safe
    pub player_account_3: Option<AccountInfo<'info>>,
    pub system_program: Program<'info, System>,
}

impl<'info> EndPeriodAndDistributePayouts<'info> {
    pub fn end_period_and_distribute_payouts(
        &mut self, /*,ctx: Context<EndPeriod>*//* // top_participants: Vec<Score>, // leaderboard: &mut Account<Leaderboard>,
                   // program_id: &Pubkey, */
    ) -> Result<()> {
        // let leaderboard = self.leaderboard;
        // let treasury = self.treasury;

        // // Ensure the period has actually ended
        // require!(
        //     Clock::get()?.unix_timestamp - leaderboard.current_period_start
        //         >= leaderboard.period_length,
        //     LeaderboardError::PeriodNotEnded
        // );

        // // let ctx = Context<DistributePayouts>
        // // Now that we've confirmed that the full period/cycle has passed, distribute rewards to the top participants

        // // Pull the top (currently 3) scores - players' PubKeys and score amounts, , sorted 1 through <top_spots>
        // let player_accounts = vec![
        //     self.player_account_1.clone(),
        //     self.player_account_2.clone().unwrap(),
        //     self.player_account_3.clone().unwrap(),
        // ];

        // //TODO: must use self.leaderboard.total_reward_per_period - set on init or updateConfig;
        // let total_reward_per_period = 1000000000; // 1 SOL
        // let mut remaining_reward = total_reward_per_period;

        // // Sort scores in descending order
        // let mut sorted_participants = leaderboard.participants;
        // sorted_participants.sort_by_key(|s| Reverse(s.score));

        // // Take the top N scores
        // let top_participants = sorted_participants
        //     .into_iter()
        //     .take(3) // needs to come from top_spots
        //     .collect::<Vec<_>>();

        // // Iterate through, distributing correct remaining amount to each winner account
        // for (i, participant) in top_participants.iter().enumerate() {
        //     msg!("Remaining Reward: {}", remaining_reward);
        //     let curr_reward = total_reward_per_period / (2u64.pow(i as u32 + 1));
        //     msg!("Current Reward: {}", curr_reward);

        //     let to = player_accounts
        //         .iter()
        //         .find(|&account| participant.pubkey == account.key());
        //     msg!("Found account: {}", to.unwrap().key().to_string());
        //     require!(
        //         to.is_some(),
        //         LeaderboardError::TopParticipantAccountNotFound
        //     );

        //     let transfer_accounts = Transfer {
        //         from: self.treasury.to_account_info(),
        //         to: to.unwrap().to_account_info(),
        //     };

        //     msg!("ADMIN PubKey: {}", self.admin.key().to_string());
        //     msg!("TREASURY PubKey: {}", self.treasury.key().to_string());

        //     let ctx = CpiContext::new(self.system_program.to_account_info(), transfer_accounts);

        //     transfer(ctx, curr_reward)?;

        //     remaining_reward -= curr_reward;
        // }

        // // ENHANCEMENT: Store historical data for this leaderboard of winners with payout amounts

        // // Reset for next period
        // leaderboard.current_period_start = Clock::get()?.unix_timestamp;
        // leaderboard.participants.clear();

        Ok(())
    }
}
