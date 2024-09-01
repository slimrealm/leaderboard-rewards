use anchor_lang::error_code;

#[error_code]
pub enum LeaderboardError {
    #[msg("Invalid period length")]
    InvalidPeriodLength,
    #[msg("Invalid number of top spots")]
    InvalidTopSpots,
    #[msg("Period has ended")]
    PeriodEnded,
    #[msg("Period has not ended yet")]
    PeriodNotEnded,
}
