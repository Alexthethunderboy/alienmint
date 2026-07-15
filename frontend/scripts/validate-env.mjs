import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());

const required = {
  NEXT_PUBLIC_ALCHEMY_RPC_URL: process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL,
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
};

for (const [name, value] of Object.entries(required)) {
  if (!value || /YOUR_(KEY|PROJECT_ID|DEPLOYED_ADDRESS)/.test(value)) {
    throw new Error(`Missing or placeholder environment variable: ${name}`);
  }
}

if (!required.NEXT_PUBLIC_ALCHEMY_RPC_URL.startsWith('https://base-sepolia.g.alchemy.com/')) {
  throw new Error('NEXT_PUBLIC_ALCHEMY_RPC_URL must be an HTTPS Base Sepolia Alchemy URL');
}

if (!/^0x[0-9a-fA-F]{40}$/.test(required.NEXT_PUBLIC_CONTRACT_ADDRESS) || /^0x0{40}$/i.test(required.NEXT_PUBLIC_CONTRACT_ADDRESS)) {
  throw new Error('NEXT_PUBLIC_CONTRACT_ADDRESS must be a non-zero EVM address');
}
