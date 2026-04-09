/**
 * Pricing Engine for Genesis Markets
 * Computes initial price based on data score, AI prediction, and user input.
 */

export interface PricingInput {
  dataScore: number; // 0.0 to 1.0
  aiPrediction: number; // 0.0 to 1.0
  userInput: number; // 0.0 to 1.0
  sourceUrl: string;
  ownershipClaim: boolean;
}

export interface PricingResult {
  aiPrice: number;
  userSuggestedPrice: number;
  finalPrice: number;
  sourceUrl: string;
  ownershipFlag: boolean;
  isValid: boolean;
  error?: string;
}

export function computeInitialPrice(input: PricingInput): PricingResult {
  // Validation
  if (!input.sourceUrl) {
    return {
      aiPrice: 0,
      userSuggestedPrice: input.userInput,
      finalPrice: 0,
      sourceUrl: input.sourceUrl,
      ownershipFlag: input.ownershipClaim,
      isValid: false,
      error: "No data source provided."
    };
  }

  // Compute raw price
  const rawPrice = (input.dataScore * 0.6) + (input.aiPrediction * 0.3) + (input.userInput * 0.1);
  
  // Clamp price between 0.05 and 0.95
  const finalPrice = Math.max(0.05, Math.min(0.95, rawPrice));

  return {
    aiPrice: (input.dataScore * 0.6) + (input.aiPrediction * 0.3),
    userSuggestedPrice: input.userInput,
    finalPrice,
    sourceUrl: input.sourceUrl,
    ownershipFlag: input.ownershipClaim,
    isValid: true
  };
}
