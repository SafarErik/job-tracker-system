/**
 * Company priority levels matching backend `CompanyPriority` enum.
 * Determines how prominently a company appears and sorting order.
 */
export enum CompanyPriority {
    /** Top target, "Dream" companies */
    TopTier = 'TopTier',
    /** Solid options, good for regular applications */
    MidTier = 'MidTier',
    /** Safety or backup options */
    LowTier = 'LowTier',
    /** No longer active or interested */
    Archived = 'Archived',
}
