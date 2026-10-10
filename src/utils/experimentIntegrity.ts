import type { Experiment } from '../types';

/**
 * Records the creator's *manual preference* between two creative variations.
 * This is NOT a statistical result or a platform-verified winning variant.
 * The legacy persisted field is called "winner" for backwards compatibility.
 */
export function selectPreferredVariant(
  experiment: Experiment,
  variant: 'A' | 'B',
): Experiment {
  return {
    ...experiment,
    winner: variant,
    status: 'concluded',
    // The previous implementation fabricated an AI interpretation asserting
    // that this selected variant had a higher metric. Clear that claim.
    aiInterpretation: undefined,
  };
}
