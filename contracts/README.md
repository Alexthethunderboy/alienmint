# AlienMint contracts

The actual contract is `src/NFTCollection.sol`; its deployment script is `script/Deploy.s.sol:Deploy`, not the Foundry Counter example.

## Local verification

With Foundry installed, run from `contracts/`:

```bash
forge build
forge test
```

These commands were not run for this documentation update. The frontend ABI tooling also builds this directory; see [frontend README](../frontend/README.md).

## Deployment boundary

`Deploy.run()` reads `PRIVATE_KEY`, `NFT_NAME`, `NFT_SYMBOL` and `NFT_BASE_URI`, derives the deployer address and broadcasts creation of `NFTCollection`. It rejects empty and built-in placeholder name/symbol/base-URI values. An authorized chain RPC endpoint and funded deployment account are separate prerequisites.

No broadcast command is included in the demo setup: deployment requires a separate reviewed action. Never commit a private key, invent credentials or assume a configured `/live` route proves contract deployment or an audit. No contract was deployed during this documentation work.
