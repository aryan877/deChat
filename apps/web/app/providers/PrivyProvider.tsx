"use client";

import { PrivyProvider as Privy } from "@privy-io/react-auth";
import { ReactNode } from "react";
import { sonic, sonicTestnet } from "viem/chains";

const PRIVY_APP_ID =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_PRIVY_PROD_APP_ID
    : process.env.NEXT_PUBLIC_PRIVY_DEV_APP_ID;

if (!PRIVY_APP_ID) {
  throw new Error("Missing Privy App ID for current environment");
}

export function PrivyProvider({ children }: { children: ReactNode }) {
  return (
    <Privy
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#F972A5",
        },
        loginMethods: ["google", "email"],
        embeddedWallets: {
          showWalletUIs: true,
        },
        defaultChain: sonic,
        supportedChains: [sonicTestnet, sonic],
      }}
    >
      {children}
    </Privy>
  );
}
