import type { MintStage } from "@/types/collection";
export const maxMintQuantity = (remaining: number, limit: number) => Math.max(0, Math.min(remaining, limit));
export const clampQuantity = (value: number, remaining: number, limit: number) => Math.max(remaining > 0 ? 1 : 0, Math.min(value, maxMintQuantity(remaining, limit)));
export const nextMintStage = (stage: MintStage, action: "begin" | "confirm" | "complete" | "reset"): MintStage => {
  if (action === "reset") return "idle";
  if (stage === "idle" && action === "begin") return "confirm";
  if (stage === "confirm" && action === "confirm") return "processing";
  if (stage === "processing" && action === "complete") return "success";
  return stage;
};
