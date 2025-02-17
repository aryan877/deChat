declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_PRIVY_DEV_APP_ID: string;
      NEXT_PUBLIC_PRIVY_PROD_APP_ID: string;
      NEXT_PUBLIC_LOCAL_BACKEND_URL: string;
      NEXT_PUBLIC_PROD_BACKEND_URL: string;
      ENABLE_EXPERIMENTAL_COREPACK: string;
    }
  }
}

export {};
