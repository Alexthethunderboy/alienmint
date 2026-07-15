import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';
import { http } from 'wagmi';
import { env } from './env';

export const config = getDefaultConfig({
  appName: 'AlienMint',
  projectId: env.walletConnectProjectId,
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(env.alchemyRpcUrl),
  },
  ssr: true,
});
