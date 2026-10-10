# AlienMint

A demo-first NFT experience with separate simulation, creator-studio and testnet routes.

[Explore AlienMint](https://alienmint.vercel.app/)

![alienmint — existing portfolio capture](https://raw.githubusercontent.com/Alexthethunderboy/Portfolio/b4c8f605bdb311f2be00d14855b4914a3d662cf9/public/projects/previews/alienmint.jpg)

Existing portfolio capture, verified 8 October 2026; not evidence of current uptime or completed validation.

- `/`: wallet-free mint simulation; no real sale.
- `/studio`: browser-local creator workflow; publishing is disabled.
- `/live`: separate Base Sepolia application requiring valid provider and deployed-contract configuration.

## Credential-free demo

Use Node `>=20.9 <23`, as declared in `frontend/package.json`.

```bash
git clone https://github.com/Alexthethunderboy/alienmint.git
cd alienmint/frontend
npm ci
npm run dev
```

See [frontend setup](frontend/README.md) for optional public live configuration, ABI checks and existing tests. See [contracts](contracts/README.md) for Foundry source and deployment-script requirements. No contract was deployed and no production/security audit is claimed by this documentation work.

---

Built by [Thunderboy](https://thunderboy.vercel.app).
