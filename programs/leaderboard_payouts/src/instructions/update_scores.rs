use crate::{error::LeaderboardError, state::Leaderboard, Participant};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateScores<'info> {
    #[account(
        mut,
        seeds = [b"leaderboard", admin.key().as_ref()],
        bump 
    )]
    pub leaderboard: Account<'info, Leaderboard>,
    #[account(mut)]
    pub admin: Signer<'info>,
}

impl<'info> UpdateScores<'info> {
    pub fn update_scores(&mut self, updated_participants: Vec<Participant>) -> Result<()> {

        // Make sure length of new_scores Vec is <= leaderboard.scores Vec
        require!(updated_participants.len() <= self.leaderboard.participants.len(), LeaderboardError::TooManyParticipantsPassedIn);

        let mut participants = self.leaderboard.participants.clone();

        // Sort scores and replace and bump out the appropriate former scores
        for new_participant in updated_participants {
            match participants.iter_mut().find(|p| p.pubkey == new_participant.pubkey) {
                Some(existing) => {
                    // Update existing participant's score
                    existing.score = new_participant.score;
                }
                None => {
                    // Find the first default participant or the participant with the lowest score
                    let index = participants
                        .iter()
                        .position(|p| p.pubkey == Pubkey::default())
                        .unwrap_or(participants.len() - 1);
    
                    // Only insert the new participant if its score is higher than the lowest score
                    if new_participant.score > participants[index].score {
                        participants[index] = new_participant;
                    }
                }
            }
    
            // Re-sort the vector after each update (can be optimized)
            participants.sort_unstable_by(|a, b| b.score.cmp(&a.score));
        }
        self.leaderboard.participants = participants;
        Ok(())
    }
}
