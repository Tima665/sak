import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { Connection, Transaction } from '@solana/web3.js';
import { useMutation } from '@tanstack/react-query';

// Use Helius RPC URL from environment variables
const SOLANA_RPC_URL =
  import.meta.env.VITE_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com';

export interface PrivySignTransactionParams {
  encodedTransaction: string;
}

export interface PrivySignTransactionResult {
  signature: string;
  encodedTransaction: string;
}

export const usePrivyWallet = () => {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useSolanaWallets();

  // Get the first Solana wallet (embedded or connected)
  const solanaWallet = wallets.length > 0 ? wallets[0] : null;

  const signTransactionMutation = useMutation<
    PrivySignTransactionResult,
    Error,
    PrivySignTransactionParams
  >({
    mutationFn: async (params: PrivySignTransactionParams) => {
      if (!ready || !authenticated) {
        throw new Error('User not authenticated');
      }

      if (!solanaWallet) {
        throw new Error('No Solana wallet found');
      }

      if (!solanaWallet.sendTransaction) {
        throw new Error('Wallet does not support transaction signing');
      }

      try {
        console.log('Decoding transaction for Privy signing...');

        // Decode the base58 transaction (API returns base58, not base64)
        const bs58 = await import('bs58');
        const transactionBuffer = bs58.default.decode(
          params.encodedTransaction,
        );
        const transaction = Transaction.from(transactionBuffer);

        console.log('Transaction decoded, sending with Privy wallet...');

        // Create connection
        const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

        // Send transaction using Privy wallet
        const signature = await solanaWallet.sendTransaction(
          transaction,
          connection,
        );

        console.log('Transaction sent successfully:', signature);

        return {
          signature,
          encodedTransaction: params.encodedTransaction,
        };
      } catch (error) {
        console.error('Error signing transaction with Privy:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Transaction signed successfully with Privy:', data);
    },
    onError: (error) => {
      console.error('Privy transaction signing error:', error);
    },
  });

  return {
    // Wallet info
    ready,
    authenticated,
    user,
    solanaWallet,
    walletAddress: solanaWallet?.address,

    // Transaction signing
    signTransaction: signTransactionMutation.mutateAsync,
    isSigningTransaction: signTransactionMutation.isPending,
    signTransactionError: signTransactionMutation.error,
  };
};
