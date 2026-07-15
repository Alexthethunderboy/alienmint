"use client";

import { useEffect, useMemo, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useReadContracts,
  useSimulateContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { formatEther } from "viem";
import { abi } from "@/config/abi";
import { env } from "@/config/env";
const CONTRACT_ADDRESS = env.contractAddress;
import { clampQuantity, maxMintable, mintErrorMessage } from "@/lib/mint";
import { StatusAlert } from "@/components/StatusAlert";

const contract = { address: CONTRACT_ADDRESS, abi } as const;

export function MintCard() {
  const [quantity, setQuantity] = useState(1);
  const [localError, setLocalError] = useState<string>();
  const { isConnected, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { data, isLoading: isReading, error: readError, refetch } = useReadContracts({
    contracts: [
      { ...contract, functionName: "totalSupply" },
      { ...contract, functionName: "MAX_SUPPLY" },
      { ...contract, functionName: "MINT_PRICE" },
      { ...contract, functionName: "MAX_PER_TX" },
    ],
    query: { refetchInterval: 15_000 },
  });

  const [totalSupply, maxSupply, mintPrice, maxPerTx] = data?.map((result) => result.result as bigint | undefined) ?? [];
  const remaining = maxSupply !== undefined && totalSupply !== undefined ? maxSupply - totalSupply : 0n;
  const maximum = maxPerTx !== undefined ? maxMintable(maxPerTx, remaining) : 0;
  const soldOut = maxSupply !== undefined && remaining === 0n;
  const wrongChain = isConnected && chainId !== baseSepolia.id;
  const readsReady = [totalSupply, maxSupply, mintPrice, maxPerTx].every((value) => value !== undefined);
  const effectiveQuantity = readsReady ? clampQuantity(quantity, maximum) : quantity;
  const effectiveTotalPrice = mintPrice !== undefined ? mintPrice * BigInt(effectiveQuantity) : undefined;
  const canSimulate = isConnected && !wrongChain && readsReady && !soldOut && effectiveQuantity >= 1;

  const simulation = useSimulateContract({
    ...contract,
    functionName: "publicMint",
    args: [BigInt(Math.max(effectiveQuantity, 1))],
    value: effectiveTotalPrice,
    query: { enabled: canSimulate },
  });
  const write = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: write.data });

  useEffect(() => {
    if (receipt.isSuccess) void refetch();
  }, [receipt.isSuccess, refetch]);

  const error = localError ?? (write.error ? mintErrorMessage(write.error) : receipt.error ? mintErrorMessage(receipt.error) : undefined);
  const explorerUrl = write.data ? `https://sepolia.basescan.org/tx/${write.data}` : undefined;
  const supplyPercent = maxSupply && totalSupply !== undefined ? Number((totalSupply * 10_000n) / maxSupply) / 100 : 0;

  const status = useMemo(() => {
    if (receipt.isSuccess) return { tone: "success", text: "Mint confirmed on Base Sepolia." };
    if (receipt.isLoading) return { tone: "info", text: "Transaction submitted. Waiting for confirmation…" };
    if (write.isPending) return { tone: "info", text: "Confirm the transaction in your wallet…" };
    if (error) return { tone: "error", text: error };
    return undefined;
  }, [error, receipt.isLoading, receipt.isSuccess, write.isPending]);

  async function mint() {
    setLocalError(undefined);
    write.reset();
    if (!simulation.data?.request) {
      setLocalError(simulation.error ? mintErrorMessage(simulation.error) : "Mint simulation is not ready. Try again shortly.");
      return;
    }
    try {
      await write.writeContractAsync(simulation.data.request);
    } catch (caught) {
      setLocalError(mintErrorMessage(caught));
    }
  }

  function primaryAction() {
    if (!isConnected) return openConnectModal?.();
    if (wrongChain) return switchChain({ chainId: baseSepolia.id });
    void mint();
  }

  const primaryLabel = !isConnected
    ? "Connect wallet"
    : wrongChain
      ? isSwitching ? "Switching network…" : "Switch to Base Sepolia"
      : soldOut
        ? "Collection sold out"
        : write.isPending
          ? "Confirm in wallet…"
          : receipt.isLoading
            ? "Minting…"
            : `Mint ${effectiveQuantity || ""} NFT${effectiveQuantity === 1 ? "" : "s"}`;

  return (
    <article className="glass-panel relative rounded-[2rem] p-4 sm:p-6" aria-labelledby="mint-heading">
      <div className="art-frame relative mb-6 aspect-[16/9] overflow-hidden rounded-[1.4rem] bg-slate-950/60">
        <div className="art-grid absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.25),transparent_38%)]" />
        <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2rem] border border-cyan-300/40 bg-gradient-to-br from-emerald-400/20 to-cyan-400/5 shadow-[0_0_60px_rgba(34,211,238,0.25)] backdrop-blur-md sm:h-40 sm:w-40">
          <div className="absolute inset-5 rounded-2xl border border-white/20" />
        </div>
        <span className="absolute bottom-4 left-4 rounded-full border border-white/[0.08] bg-black/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 backdrop-blur-xl">AlienMint Collection</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">Public mint</p>
          <h2 id="mint-heading" className="mt-2 text-2xl font-semibold text-white/90">Enter the collection</h2>
        </div>
        <a className="rounded-lg text-xs text-white/40 underline-offset-4 hover:text-cyan-300 hover:underline focus-visible:outline-2 focus-visible:outline-cyan-400" href={`https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer">Contract ↗</a>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-white/50">Minted</span>
          <span className="font-medium text-white/90">{isReading ? "Loading…" : readError ? "Unavailable" : `${totalSupply?.toLocaleString() ?? "—"} / ${maxSupply?.toLocaleString() ?? "—"}`}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]" role="progressbar" aria-label="Collection minted" aria-valuemin={0} aria-valuemax={100} aria-valuenow={supplyPercent}>
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_12px_#22d3ee] transition-[width] duration-500" style={{ width: `${supplyPercent}%` }} />
        </div>
      </div>

      <div className="clear-inset mt-6 flex items-center justify-between gap-4 rounded-2xl p-4">
        <div>
          <p className="text-xs text-white/50">Quantity</p>
          <p className="mt-1 text-xs text-white/30">Max {maximum || "—"} per transaction</p>
        </div>
        <div className="flex items-center gap-1" role="group" aria-label="Mint quantity">
          <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1 || !readsReady} onClick={() => setQuantity((value) => clampQuantity(value - 1, maximum))} className="interactive-control grid h-11 w-11 place-items-center rounded-xl text-xl text-white/70 disabled:cursor-not-allowed disabled:opacity-30">−</button>
          <output aria-live="polite" className="w-10 text-center text-lg font-semibold text-white/90">{effectiveQuantity}</output>
          <button type="button" aria-label="Increase quantity" disabled={quantity >= maximum || !readsReady} onClick={() => setQuantity((value) => clampQuantity(value + 1, maximum))} className="interactive-control grid h-11 w-11 place-items-center rounded-xl text-xl text-white/70 disabled:cursor-not-allowed disabled:opacity-30">+</button>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between">
        <span className="text-sm text-white/50">Total</span>
        <span className="text-xl font-semibold text-white/90">{effectiveTotalPrice === undefined ? "—" : formatEther(effectiveTotalPrice)} <span className="text-sm text-white/40">ETH</span></span>
      </div>

      <button type="button" onClick={primaryAction} disabled={isSwitching || write.isPending || receipt.isLoading || soldOut || (isConnected && !wrongChain && (!readsReady || Boolean(readError)))} className="mt-6 min-h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3.5 font-semibold text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:brightness-110 transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
        {primaryLabel}
      </button>

      {status && (
        <StatusAlert tone={status.tone as "error" | "success" | "info"} text={status.text} explorerUrl={explorerUrl} />
      )}
      {readError && <p role="alert" className="mt-4 text-sm text-rose-200">The collection data could not be loaded from Base Sepolia.</p>}
    </article>
  );
}
