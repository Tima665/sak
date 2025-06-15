import { useMutation } from '@tanstack/react-query';

import { SolanaService } from '../services/solanaService';

import { usePrivyWallet } from './usePrivyWallet';
import { useLaunchToken } from './useTokenApi';

export interface CreateTokenWithPrivyParams {
  name: string;
  symbol: string;
  description: string;
  file?: string; // base64 encoded file with data URL prefix
}

export interface CreateTokenWithPrivyResult {
  signature: string;
  encodedTransaction: string;
}

export const useCreateTokenWithPrivy = () => {
  const launchTokenMutation = useLaunchToken();
  const { signTransaction, walletAddress, ready, authenticated } =
    usePrivyWallet();

  return useMutation<
    CreateTokenWithPrivyResult,
    Error,
    CreateTokenWithPrivyParams
  >({
    mutationFn: async (params: CreateTokenWithPrivyParams) => {
      try {
        // Check if user is authenticated and has wallet
        if (!ready || !authenticated) {
          throw new Error('User not authenticated');
        }

        if (!walletAddress) {
          throw new Error('No wallet connected');
        }

        // Generate new mint keypair
        const mintKeypair = SolanaService.generateKeypair();
        const mintPublicKey = SolanaService.getPublicKeyString(mintKeypair);

        console.log('Creator Wallet Address (Privy):', walletAddress);
        console.log('Mint Public Key:', mintPublicKey);

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

        // Step 2: Sign and send the transaction using Privy wallet
        // Note: The API should return a transaction that only needs the creator's signature
        // The mint keypair signature should be handled by the API or we need to modify the approach
        const result = await signTransaction({
          encodedTransaction: launchResult.encodedTransaction,
        });

        return {
          signature: result.signature,
          encodedTransaction: result.encodedTransaction,
        };
      } catch (error) {
        console.error('Token creation with Privy failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Token created successfully with Privy:', data);
    },
    onError: (error) => {
      console.error('Token creation with Privy error:', error);
    },
  });
};
