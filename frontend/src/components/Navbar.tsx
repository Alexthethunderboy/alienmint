"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-black/[0.12] backdrop-blur-2xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-10" aria-label="Primary navigation">
        <a href="#" className="group flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400">
          <span className="clear-icon grid h-9 w-9 place-items-center rounded-xl">
            <span className="h-3 w-3 rotate-45 rounded-sm bg-gradient-to-br from-emerald-500 to-cyan-400 shadow-[0_0_16px_#22d3ee]" />
          </span>
          <span className="font-semibold tracking-[0.18em] text-white/90">ALIENMINT</span>
          <span className="hidden text-xs text-white/30 sm:inline">/ MINT</span>
        </a>

        <div className="flex items-center gap-3">
          <div className="clear-pill hidden items-center gap-2 px-3 py-2 text-xs text-white/50 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            Base Sepolia
          </div>
          <div className="connect-shell clear-control max-w-[155px] overflow-hidden rounded-xl">
            <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
          </div>
        </div>
      </nav>
    </header>
  );
}
