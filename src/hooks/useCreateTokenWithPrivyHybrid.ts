import { Connection, Transaction } from '@solana/web3.js';
import { useMutation } from '@tanstack/react-query';
import bs58 from 'bs58';

import { SolanaService } from '../services/solanaService';

import { usePrivyWallet } from './usePrivyWallet';
import { useLaunchToken } from './useTokenApi';

// Use Helius RPC URL from environment variables
const SOLANA_RPC_URL =
  import.meta.env.VITE_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com';

export interface CreateTokenWithPrivyHybridParams {
  name: string;
  symbol: string;
  description: string;
  file?: string; // base64 encoded file with data URL prefix
}

export interface CreateTokenWithPrivyHybridResult {
  signature: string;
  encodedTransaction: string;
}

export const useCreateTokenWithPrivyHybrid = () => {
  const launchTokenMutation = useLaunchToken();
  const { solanaWallet, walletAddress, ready, authenticated } =
    usePrivyWallet();

  return useMutation<
    CreateTokenWithPrivyHybridResult,
    Error,
    CreateTokenWithPrivyHybridParams
  >({
    mutationFn: async (params: CreateTokenWithPrivyHybridParams) => {
      try {
        // Check if user is authenticated and has wallet
        if (!ready || !authenticated) {
          throw new Error('User not authenticated');
        }

        if (!walletAddress) {
          throw new Error('No wallet connected');
        }

        if (!solanaWallet || !solanaWallet.signTransaction) {
          throw new Error('Wallet does not support transaction signing');
        }

        // Generate new mint keypair locally
        const mintKeypair = SolanaService.generateKeypair();
        const mintPublicKey = SolanaService.getPublicKeyString(mintKeypair);

        console.log('Creator Wallet Address (Privy):', walletAddress);
        console.log('Mint Public Key (local):', mintPublicKey);

        // Step 1: Call the launch API to get the encoded transaction
        const launchResult = await launchTokenMutation.mutateAsync({
          name: params.name,
          symbol: params.symbol,
          description: params.description,
          dev: walletAddress, // Use Privy wallet address
          mint: mintPublicKey, // Use generated mint public key
          file: params.file, // Include base64 photo if available
        });

        console.log('Got encoded transaction from API');

        // Step 2: Decode the transaction
        const transactionBuffer = bs58.decode(launchResult.encodedTransaction);
        const transaction = Transaction.from(transactionBuffer);

        console.log('Transaction decoded, signing with Privy wallet...');

        // Step 3: Sign with Privy wallet (creator signature)
        const signedTransaction =
          await solanaWallet.signTransaction(transaction);

        console.log(
          'Transaction signed by Privy wallet, adding mint signature...',
        );

        // Step 4: Add mint keypair signature
        signedTransaction.partialSign(mintKeypair);

        console.log('Transaction fully signed, sending to network...');

        // Step 5: Send the fully signed transaction
        const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
        );

        console.log('Transaction sent successfully:', signature);

        return {
          signature,
          encodedTransaction: launchResult.encodedTransaction,
        };
      } catch (error) {
        console.error('Token creation with Privy hybrid failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Token created successfully with Privy hybrid:', data);
    },
    onError: (error) => {
      console.error('Token creation with Privy hybrid error:', error);
    },
  });
};
