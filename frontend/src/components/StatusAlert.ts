import { createElement } from "react";

export type StatusTone = "error" | "success" | "info";

export function StatusAlert({ tone, text, explorerUrl }: { tone: StatusTone; text: string; explorerUrl?: string }) {
  const className = `mt-4 rounded-xl border px-4 py-3 text-sm ${
    tone === "error"
      ? "border-rose-400/20 bg-rose-400/[0.06] text-rose-200"
      : tone === "success"
        ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-200"
        : "border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-100"
  }`;

  return createElement(
    "div",
    { role: tone === "error" ? "alert" : "status", "aria-live": "polite", className },
    text,
    explorerUrl
      ? createElement(
          "a",
          { href: explorerUrl, target: "_blank", rel: "noreferrer", className: "font-semibold underline underline-offset-4" },
          " View transaction ↗",
        )
      : null,
  );
}
