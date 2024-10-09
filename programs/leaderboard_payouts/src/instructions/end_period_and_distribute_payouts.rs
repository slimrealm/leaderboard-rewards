use std::cmp::Reverse;

use crate::{error::LeaderboardError, state::Leaderboard, state::Participant};
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
    /// CHECK: This is safe - account validated in require statement
    pub participant_account_1: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: This is safe - account validated in require statement
    pub participant_account_2: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: This is safe - account validated in require statement
    pub participant_account_3: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> EndPeriodAndDistributePayouts<'info> {
    pub fn end_period_and_distribute_payouts(&mut self) -> Result<()> {
        // Ensure the period has actually ended
        require!(
            Clock::get()?.unix_timestamp - self.leaderboard.current_period_start
                >= self.leaderboard.period_length,
            LeaderboardError::PeriodNotEnded
        );

        // Payouts are based on the total payout value stores in state
        let total_payout_per_period = self.leaderboard.total_payout_per_period;

        // Sort scores in descending order
        let sorted_participants = &mut self.leaderboard.participants;
        sorted_participants.sort_by_key(|s| Reverse(s.score));

        // Take the top N scores (currently 3)
        let top_participants = sorted_participants.into_iter().take(3).collect::<Vec<_>>();

        require!(
            self.participant_account_1.key() == top_participants[0].pubkey,
            LeaderboardError::WinningPubKeyMismatch
        );
        require!(
            self.participant_account_2.key() == top_participants[1].pubkey,
            LeaderboardError::WinningPubKeyMismatch
        );
        require!(
            self.participant_account_3.key() == top_participants[2].pubkey,
            LeaderboardError::WinningPubKeyMismatch
        );

        // Pull the top (currently 3) scores - participants' PubKeys and score amounts, sorted 1 through <top_spots>
        let participant_accounts = vec![
            self.participant_account_1.clone(),
            self.participant_account_2.clone(),
            self.participant_account_3.clone(),
        ];

        // Iterate through, distributing correct remaining amount to each winner account
        for (i, participant) in top_participants.iter().enumerate() {
            let curr_payout = total_payout_per_period / (2i64.pow(i as u32 + 1));
            let to = participant_accounts
                .iter()
                .find(|&account| participant.pubkey == account.key());
            require!(
                to.is_some(),
                LeaderboardError::TopParticipantAccountNotFound
            );

            let transfer_accounts = Transfer {
                from: self.treasury.to_account_info(),
                to: to.unwrap().to_account_info(),
            };

            let ctx = CpiContext::new(self.system_program.to_account_info(), transfer_accounts);
            let unsigned_int_payout: u64 =
                curr_payout.try_into().expect("value must be non-negative");
            transfer(ctx, unsigned_int_payout)?;
        }

        // ENHANCEMENT - (will go here) - store historical data for this leaderboard of winners with payout amounts

        // Reset leaderboard for next period - advance timeframe and reset participants vector
        self.leaderboard.current_period_start = self.leaderboard.current_period_end;
        self.leaderboard.current_period_end =
            self.leaderboard.current_period_start + self.leaderboard.period_length;
        self.leaderboard.participants = vec![Participant::default(); 100];

        Ok(())
    }
}
