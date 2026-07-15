import { getAddress, isAddress } from "viem";
const rpc=process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL; const project=process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID; const address=process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const issues:string[]=[];
if(!rpc||!rpc.startsWith("https://base-sepolia.g.alchemy.com/")||rpc.includes("YOUR_"))issues.push("Add a Base Sepolia Alchemy RPC URL.");
if(!project||project.includes("YOUR_"))issues.push("Add a WalletConnect project ID.");
if(!address||!isAddress(address)||/^0x0{40}$/i.test(address)||address.includes("YOUR_"))issues.push("Add the deployed non-zero contract address.");
export const liveEnv=issues.length===0?{ok:true as const,value:{alchemyRpcUrl:rpc!,walletConnectProjectId:project!,contractAddress:getAddress(address!)}}:{ok:false as const,issues};
export const env=liveEnv.ok?liveEnv.value:{alchemyRpcUrl:"https://sepolia.base.org",walletConnectProjectId:"unconfigured-demo",contractAddress:"0x1111111111111111111111111111111111111111" as const};
