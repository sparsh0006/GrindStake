"use client";

import { createConfig, http } from "wagmi";
import { mainnet, bscTestnet } from "wagmi/chains";
import { metaMask, injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [bscTestnet, mainnet],
  connectors: [metaMask(), injected()],
  transports: {
    [bscTestnet.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL),
    [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL),
  },
});
