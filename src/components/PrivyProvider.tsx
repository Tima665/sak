import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth';
import { PropsWithChildren } from 'react';

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;

if (!PRIVY_APP_ID) {
  throw new Error('VITE_PRIVY_APP_ID is not defined in environment variables');
}

export const PrivyProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <BasePrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#4F46E5',
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          solana: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      {children}
    </BasePrivyProvider>
  );
};
