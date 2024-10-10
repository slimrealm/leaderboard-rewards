<h2>leaderboard_payouts</h2>

**Devnet Program ID: gq62AM2KnQhcbWrbu1MLvf7PpkeChefZG8UV85nQ5kc**

A leaderboard_payout system on the Solana blockchain.  It is an implementation-agnostic system which stores top participants and their scores in some competition (game, contest, most art / video views), and dispenses payouts to those in the top slots at the end of every period/cycle.  At initialization, the admin account defines the period length, number of top spots, and total payout per period.  This can be altered by the admin account via the update_config instruction.  For this MVP version, I'm using a single algorithm for payouts, with plans to expand to include multiple options.

This is a Rust & Anchor Solana smart contract, deployed to devnet, tested using TypeScript with Mocha and Chai.

![Architecture diagram](arch-diagram.png)

![Devnet test run](tests-passing-devnet.png)