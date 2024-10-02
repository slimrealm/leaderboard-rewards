// use super::send_payout_to_winner;
use crate::{error::LeaderboardError, state::Leaderboard, Score};
use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

#[derive(Accounts)]
pub struct DistributePayouts<'info> {
    #[account(
        mut,
        seeds = [b"leaderboard", admin.key().as_ref()],
        bump
    )]
    pub leaderboard: Account<'info, Leaderboard>,
    #[account(
        mut,
        // seeds = [b"treasury", admin.key().as_ref()],
        // bump
    )]
    pub treasury: Signer<'info>,
    #[account(mut)]
    pub admin: Signer<'info>,
    // #[account(mut)]
    // pub authority: Signer<'info>,

    // Specify accounts explicitly
    #[account(mut)]
    /// CHECK: This is safe
    pub player_account_1: AccountInfo<'info>, // Example account type
    #[account(mut)]
    /// CHECK: This is safe
    pub player_account_2: Option<AccountInfo<'info>>, // Optional accounts for fewer than max
    #[account(mut)]
    /// CHECK: This is safe
    pub player_account_3: Option<AccountInfo<'info>>,
    // #[account(mut)]
    // /// CHECK: This is safe
    // pub player_account_4: Option<AccountInfo<'info>>,
    // #[account(mut)]
    // /// CHECK: This is safe
    // pub player_account_5: Option<AccountInfo<'info>>,
    pub system_program: Program<'info, System>,
}

//TODO:  Currently passing in top_participants, vector of Scores (pubkeys & score values).  Need to instead
// get the longer self.leaderboard.scores Vec and pull off the top 10 and use that
impl<'info> DistributePayouts<'info> {
    pub fn distribute_payouts(
        &mut self,
        top_participants: Vec<Score>, // leaderboard: &mut Account<Leaderboard>,
                                      // program_id: &Pubkey,
    ) -> Result<()> {
        // Get top <top_spots> pubkeys and scores, sorted 1 through <top_spots>
        // Iterate through, distributing correct remaining amount to each winner account

        // let mut top_participants: Vec<_> = self.leaderboard.scores.iter().collect();
        // top_participants.sort_by(|a, b| b.1.cmp(a.1));
        // top_participants.truncate(self.leaderboard.top_spots as usize);

        let total_reward_per_period = 1000000000; // 1 SOL  //TODO: must use self.leaderboard.total_reward_per_period - set on init or updateConfig;
        let mut remaining_reward = total_reward_per_period;

        let player_accounts = vec![
            self.player_account_1.clone(),
            self.player_account_2.clone().unwrap(),
            self.player_account_3.clone().unwrap(),
            // self.player_account_4.clone().unwrap(),
            // self.player_account_5.clone().unwrap(),
        ];

        for (i, participant) in top_participants.iter().enumerate() {
            msg!("Remaining Reward: {}", remaining_reward);
            let curr_reward = total_reward_per_period / (2u64.pow(i as u32 + 1));
            msg!("Current Reward: {}", curr_reward);

            let to = player_accounts
                .iter()
                .find(|&account| participant.player == account.key());
            msg!("Found account: {}", to.unwrap().key().to_string());
            require!(
                to.is_some(),
                LeaderboardError::TopParticipantAccountNotFound
            );

            let transfer_accounts = Transfer {
                from: self.treasury.to_account_info(),
                to: to.unwrap().to_account_info(),
            };

            // let admin_key = self.admin.key();

            // let signer_seeds: &[&[&[u8]]] = &[treasury_seeds];
            msg!("ADMIN PubKey: {}", self.admin.key().to_string());
            msg!("TREASURY PubKey: {}", self.treasury.key().to_string());

            // let ctx = CpiContext::new(self.system_program.to_account_info(), transfer_accounts);
            let ctx = CpiContext::new/*_with_signer*/(
                self.system_program.to_account_info(),
                transfer_accounts,
                // signer_seeds,
            );

            transfer(ctx, curr_reward)?;

            remaining_reward -= curr_reward;
        }

        // self.treasury.balance = remaining_reward; //TODO:

        // // Store historical data
        // leaderboard.historical_data.push(HistoricalPeriod {
        //     period_end: Clock::get()?.unix_timestamp,
        //     top_participants: top_participants
        //         .into_iter()
        //         .map(|(k, v)| (*k, *v))
        //         .collect(),
        // });

        // // Keep only the last 10 periods
        // if leaderboard.historical_data.len() > 10 {
        //     leaderboard.historical_data.remove(0);
        // }

        Ok(())
    }
}
