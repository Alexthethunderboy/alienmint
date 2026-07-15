export type Trait = { attribute: string; value: string };
export type CollectionDraft = {
  name: string; symbol: string; description: string; externalUrl: string;
  royaltyRecipient: string; royaltyPercentage: number; mintPrice: number;
  supply: number; maxPerTransaction: number; files: File[]; traits: Trait[];
};
export type MintStage = "idle" | "confirm" | "processing" | "success";
export interface MintExperience {
  supply: number; maxSupply: number; mintPrice: number; maxPerTransaction: number;
  quantity: number; stage: MintStage; setQuantity(quantity: number): void;
  begin(): void; confirm(): void; reset(): void;
}
