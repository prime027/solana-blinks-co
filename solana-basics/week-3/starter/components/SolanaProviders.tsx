import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { useMemo, ReactNode } from 'react';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { endpoint } from '@/utils/constants';

require('@solana/wallet-adapter-react-ui/styles.css');

type SolanaProvidersProps = {
  children: ReactNode;
};

const SolanaProviders = ({ children }: SolanaProvidersProps) => {
  const walletEndpoint = useMemo(() => endpoint, []);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter()
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={walletEndpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaProviders;
