"use client";

import { usePrivy } from "@privy-io/react-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_PATHS = ["/"];

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;

    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    if (authenticated && isPublicPath) {
      router.push("/chat");
    } else if (!authenticated && !isPublicPath) {
      router.push("/");
    }
  }, [ready, authenticated, router, pathname]);

  return <>{children}</>;
}
