# AlienMint

Premium, demo-first NFT product experience. `/` is a wallet-free simulated mint, `/studio` is a local creator workflow, and `/live` preserves the real Base Sepolia application.

## Configuration

The default demo builds and runs without configuration. To enable `/live`, copy `.env.example` to `.env.local` and replace all three placeholders:

- `NEXT_PUBLIC_ALCHEMY_RPC_URL`: HTTPS Base Sepolia Alchemy endpoint.
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: WalletConnect Cloud project ID.
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: deployed, non-zero `NFTCollection` address.

These values are bundled into browser code and must not be treated as secrets. Apply provider-side origin and rate restrictions where supported.

## Contract ABI

`npm run abi:generate` builds the Foundry project and deterministically writes `src/config/abi.ts` from the compiler artifact. Run `npm run abi:check` in CI to detect drift.

## Validation

```shell
npm run abi:check
npm run lint
npm run typecheck
npm run build
```

`npm run build` verifies the credential-free demo. `npm run build:live` additionally rejects missing placeholders, invalid URLs, and zero contract addresses. Artwork selected in `/studio` never leaves the browser; publishing is deliberately disabled until storage, authentication, contract deployment, and verification are approved.

## Vercel

Set the Vercel project Root Directory to `frontend`, Production Branch to `main`, and leave the Output Directory at the Next.js default. The checked-in `vercel.json` uses `npm ci` and `npm run build` for deterministic deployments. The public production domain must be assigned to a production deployment; generated preview URLs may be protected separately.
