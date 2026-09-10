use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hashv;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWxTWqkYhsF8kX5wM6fBz5ku9D9f");

const MAX_ENTRIES: usize = 20;
const BPS_DENOMINATOR: u64 = 10_000;

#[program]
pub mod carrier_races {
    use super::*;

    pub fn create_race(
        ctx: Context<CreateRace>,
        race_id: u64,
        opens_at: i64,
        closes_at: i64,
        max_entries: u8,
        entry_fee_lamports: u64,
        seed_commitment: [u8; 32],
        prize_bps: [u16; 3],
    ) -> Result<()> {
        require!(max_entries >= 2 && max_entries as usize <= MAX_ENTRIES, RaceError::InvalidFieldSize);
        require!(closes_at > opens_at, RaceError::InvalidRaceWindow);
        require!(
            prize_bps.iter().map(|v| *v as u64).sum::<u64>() == BPS_DENOMINATOR,
            RaceError::InvalidPrizeSplit
        );

        let race = &mut ctx.accounts.race;
        race.authority = ctx.accounts.authority.key();
        race.verifier = ctx.accounts.verifier.key();
        race.race_id = race_id;
        race.opens_at = opens_at;
        race.closes_at = closes_at;
        race.max_entries = max_entries;
        race.entry_fee_lamports = entry_fee_lamports;
        race.seed_commitment = seed_commitment;
        race.seed = [0; 32];
        race.result_hash = [0; 32];
        race.prize_bps = prize_bps;
        race.podium_owners = [Pubkey::default(); 3];
        race.claimed = [false; 3];
        race.cancelled = false;
        race.settled = false;
        race.entrants = Vec::new();
        race.bump = ctx.bumps.race;
        Ok(())
    }

    pub fn enter_race(
        ctx: Context<EnterRace>,
        asset: Pubkey,
        stats_hash: [u8; 32],
    ) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let race = &mut ctx.accounts.race;
        require!(!race.cancelled && !race.settled, RaceError::RaceClosed);
        require!(now >= race.opens_at && now < race.closes_at, RaceError::RaceClosed);
        require!(race.entrants.len() < race.max_entries as usize, RaceError::RaceFull);
        require!(
            !race.entrants.iter().any(|entry| entry.asset == asset),
            RaceError::DuplicateAsset
        );
        require_keys_eq!(ctx.accounts.verifier.key(), race.verifier, RaceError::InvalidVerifier);

        if race.entry_fee_lamports > 0 {
            let cpi = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.owner.to_account_info(),
                    to: race.to_account_info(),
                },
            );
            transfer(cpi, race.entry_fee_lamports)?;
        }

        race.entrants.push(RaceEntrant {
            owner: ctx.accounts.owner.key(),
            asset,
            stats_hash,
            refunded: false,
        });
        Ok(())
    }

    pub fn reveal_seed(ctx: Context<ManageRace>, seed: [u8; 32]) -> Result<()> {
        let race = &mut ctx.accounts.race;
        let now = Clock::get()?.unix_timestamp;
        require!(now >= race.closes_at, RaceError::RaceStillOpen);
        require!(!race.cancelled && !race.settled, RaceError::RaceClosed);
        let digest = hashv(&[&seed]).to_bytes();
        require!(digest == race.seed_commitment, RaceError::SeedMismatch);
        race.seed = seed;
        Ok(())
    }

    pub fn settle_race(
        ctx: Context<ManageRace>,
        result_hash: [u8; 32],
        podium_owners: [Pubkey; 3],
    ) -> Result<()> {
        let race = &mut ctx.accounts.race;
        require!(!race.cancelled && !race.settled, RaceError::RaceClosed);
        require!(race.seed != [0; 32], RaceError::SeedNotRevealed);
        require!(race.entrants.len() >= 2, RaceError::NotEnoughEntrants);
        for owner in podium_owners.iter() {
            require!(
                race.entrants.iter().any(|entry| entry.owner == *owner),
                RaceError::InvalidPodium
            );
        }
        race.result_hash = result_hash;
        race.podium_owners = podium_owners;
        race.settled = true;
        Ok(())
    }

    pub fn claim_prize(ctx: Context<ClaimPrize>) -> Result<()> {
        let race = &mut ctx.accounts.race;
        require!(race.settled && !race.cancelled, RaceError::RaceNotSettled);

        let claimant = ctx.accounts.claimant.key();
        let pool = race
            .entry_fee_lamports
            .checked_mul(race.entrants.len() as u64)
            .ok_or(RaceError::MathOverflow)?;
        let mut payout = 0u64;

        for index in 0..3 {
            if race.podium_owners[index] == claimant && !race.claimed[index] {
                let share = pool
                    .checked_mul(race.prize_bps[index] as u64)
                    .ok_or(RaceError::MathOverflow)?
                    / BPS_DENOMINATOR;
                payout = payout.checked_add(share).ok_or(RaceError::MathOverflow)?;
                race.claimed[index] = true;
            }
        }
        require!(payout > 0, RaceError::NothingToClaim);

        **race.to_account_info().try_borrow_mut_lamports()? = race
            .to_account_info()
            .lamports()
            .checked_sub(payout)
            .ok_or(RaceError::InsufficientEscrow)?;
        **ctx.accounts.claimant.to_account_info().try_borrow_mut_lamports()? = ctx
            .accounts
            .claimant
            .to_account_info()
            .lamports()
            .checked_add(payout)
            .ok_or(RaceError::MathOverflow)?;
        Ok(())
    }

    pub fn cancel_race(ctx: Context<ManageRace>) -> Result<()> {
        let race = &mut ctx.accounts.race;
        require!(!race.settled, RaceError::RaceClosed);
        race.cancelled = true;
        Ok(())
    }

    pub fn refund_cancelled(ctx: Context<RefundCancelled>, entrant_index: u8) -> Result<()> {
        let race = &mut ctx.accounts.race;
        require!(race.cancelled, RaceError::RaceNotCancelled);
        let index = entrant_index as usize;
        require!(index < race.entrants.len(), RaceError::InvalidEntrant);
        require_keys_eq!(race.entrants[index].owner, ctx.accounts.owner.key(), RaceError::InvalidEntrant);
        require!(!race.entrants[index].refunded, RaceError::AlreadyRefunded);
        race.entrants[index].refunded = true;

        let amount = race.entry_fee_lamports;
        if amount > 0 {
            **race.to_account_info().try_borrow_mut_lamports()? = race
                .to_account_info()
                .lamports()
                .checked_sub(amount)
                .ok_or(RaceError::InsufficientEscrow)?;
            **ctx.accounts.owner.to_account_info().try_borrow_mut_lamports()? = ctx
                .accounts
                .owner
                .to_account_info()
                .lamports()
                .checked_add(amount)
                .ok_or(RaceError::MathOverflow)?;
        }
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(race_id: u64)]
pub struct CreateRace<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: verifier is stored as a public key and must co-sign race entries later.
    pub verifier: UncheckedAccount<'info>,
    #[account(
        init,
        payer = authority,
        space = Race::SPACE,
        seeds = [b"race", authority.key().as_ref(), &race_id.to_le_bytes()],
        bump
    )]
    pub race: Account<'info, Race>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EnterRace<'info> {
    #[account(mut)]
    pub race: Account<'info, Race>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub verifier: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ManageRace<'info> {
    #[account(mut, has_one = authority)]
    pub race: Account<'info, Race>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimPrize<'info> {
    #[account(mut)]
    pub race: Account<'info, Race>,
    #[account(mut)]
    pub claimant: Signer<'info>,
}

#[derive(Accounts)]
pub struct RefundCancelled<'info> {
    #[account(mut)]
    pub race: Account<'info, Race>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[account]
pub struct Race {
    pub authority: Pubkey,
    pub verifier: Pubkey,
    pub race_id: u64,
    pub opens_at: i64,
    pub closes_at: i64,
    pub max_entries: u8,
    pub entry_fee_lamports: u64,
    pub seed_commitment: [u8; 32],
    pub seed: [u8; 32],
    pub result_hash: [u8; 32],
    pub prize_bps: [u16; 3],
    pub podium_owners: [Pubkey; 3],
    pub claimed: [bool; 3],
    pub cancelled: bool,
    pub settled: bool,
    pub entrants: Vec<RaceEntrant>,
    pub bump: u8,
}

impl Race {
    // discriminator + fixed fields + Vec prefix + 20 entrants with conservative padding.
    pub const SPACE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 1 + 8 + 32 + 32 + 32 + 6 + 96 + 3 + 1 + 1 + 4 + (MAX_ENTRIES * RaceEntrant::SPACE) + 1 + 64;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RaceEntrant {
    pub owner: Pubkey,
    pub asset: Pubkey,
    pub stats_hash: [u8; 32],
    pub refunded: bool,
}

impl RaceEntrant {
    pub const SPACE: usize = 32 + 32 + 32 + 1;
}

#[error_code]
pub enum RaceError {
    #[msg("Invalid race field size")]
    InvalidFieldSize,
    #[msg("Invalid race window")]
    InvalidRaceWindow,
    #[msg("Prize basis points must total 10000")]
    InvalidPrizeSplit,
    #[msg("Race is closed")]
    RaceClosed,
    #[msg("Race is full")]
    RaceFull,
    #[msg("This asset is already entered")]
    DuplicateAsset,
    #[msg("Invalid verifier")]
    InvalidVerifier,
    #[msg("Race is still open")]
    RaceStillOpen,
    #[msg("Seed does not match the pre-race commitment")]
    SeedMismatch,
    #[msg("Seed has not been revealed")]
    SeedNotRevealed,
    #[msg("Not enough entrants")]
    NotEnoughEntrants,
    #[msg("Podium contains an owner that did not enter")]
    InvalidPodium,
    #[msg("Race has not been settled")]
    RaceNotSettled,
    #[msg("Nothing to claim")]
    NothingToClaim,
    #[msg("Race is not cancelled")]
    RaceNotCancelled,
    #[msg("Invalid entrant")]
    InvalidEntrant,
    #[msg("Entry has already been refunded")]
    AlreadyRefunded,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Race escrow is insufficient")]
    InsufficientEscrow,
}
