import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { clampQuantity, maxMintable, mintErrorMessage } from "../src/lib/mint.ts";
import { StatusAlert } from "../src/components/StatusAlert.ts";

test("maxMintable respects transaction and remaining-supply limits", () => {
  assert.equal(maxMintable(5n, 100n), 5);
  assert.equal(maxMintable(5n, 2n), 2);
  assert.equal(maxMintable(5n, 0n), 0);
});

test("clampQuantity enforces integer selector boundaries", () => {
  assert.equal(clampQuantity(-1, 5), 1);
  assert.equal(clampQuantity(3.8, 5), 3);
  assert.equal(clampQuantity(8, 5), 5);
  assert.equal(clampQuantity(1, 0), 0);
});

test("mint errors become actionable user feedback", () => {
  assert.equal(mintErrorMessage(new Error("UserRejectedRequestError")), "Transaction rejected in your wallet.");
  assert.equal(mintErrorMessage(new Error("MintExceedsMaxSupply")), "That quantity exceeds the remaining supply.");
  assert.equal(mintErrorMessage(new Error("HTTP request failed")), "The Base Sepolia RPC is unavailable. Try again shortly.");
  assert.match(mintErrorMessage(new Error("unknown")), /could not be completed/);
});

test("transaction status component renders semantic error and success states", () => {
  const error = renderToStaticMarkup(StatusAlert({ tone: "error", text: "Transaction rejected." }));
  assert.match(error, /role="alert"/);
  assert.match(error, /Transaction rejected/);

  const success = renderToStaticMarkup(
    StatusAlert({ tone: "success", text: "Mint confirmed.", explorerUrl: "https://sepolia.basescan.org/tx/0xabc" }),
  );
  assert.match(success, /role="status"/);
  assert.match(success, /View transaction/);
  assert.match(success, /rel="noreferrer"/);
});
