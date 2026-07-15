export function maxMintable(maxPerTx: bigint, remainingSupply: bigint): number {
  return Number(remainingSupply < maxPerTx ? remainingSupply : maxPerTx);
}

export function clampQuantity(quantity: number, maximum: number): number {
  if (maximum < 1) return 0;
  return Math.min(Math.max(Math.trunc(quantity), 1), maximum);
}

export function mintErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (/user rejected|rejected the request|UserRejectedRequestError/i.test(message)) return "Transaction rejected in your wallet.";
  if (/MintExceedsMaxSupply/i.test(message)) return "That quantity exceeds the remaining supply.";
  if (/MintExceedsMaxPerTx/i.test(message)) return "Choose a quantity within the transaction limit.";
  if (/InsufficientPayment/i.test(message)) return "The transaction value does not match the mint price.";
  if (/TransferToNonERC721ReceiverImplementer/i.test(message)) return "This wallet cannot safely receive the NFT.";
  if (/network|fetch|HTTP request failed/i.test(message)) return "The Base Sepolia RPC is unavailable. Try again shortly.";
  return "The transaction could not be completed. Review your wallet and try again.";
}
