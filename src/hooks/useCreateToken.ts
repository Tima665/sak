import { Keypair } from '@solana/web3.js';
import { useMutation } from '@tanstack/react-query';

import { SolanaService } from '../services/solanaService';

import { useLaunchToken } from './useTokenApi';

export interface CreateTokenParams {
  name: string;
  symbol: string;
  description: string;
  creatorKeypair: Keypair | string; // Can be Keypair object or public key string
  mintKeypair: Keypair | string; // Can be Keypair object or public key string
  file?: string; // base64 encoded file with data URL prefix
}

export interface CreateTokenResult {
  signature: string;
  encodedTransaction: string;
}

export const useCreateToken = () => {
  const launchTokenMutation = useLaunchToken();
  const solanaService = new SolanaService();

  return useMutation<CreateTokenResult, Error, CreateTokenParams>({
    mutationFn: async (params: CreateTokenParams) => {
      try {
        // Helper function to get public key string
        const getPublicKeyString = (keypair: Keypair | string): string => {
          return typeof keypair === 'string'
            ? keypair
            : keypair.publicKey.toBase58();
        };

        // Step 1: Call the launch API to get the encoded transaction
        const launchResult = await launchTokenMutation.mutateAsync({
          name: params.name,
          symbol: params.symbol,
          description: params.description,
          dev: getPublicKeyString(params.creatorKeypair),
          mint: getPublicKeyString(params.mintKeypair),
          file: params.file, // Pass the base64 file if provided
        });

        // Step 2: Sign and send the transaction (only if we have Keypair objects)
        if (
          typeof params.creatorKeypair === 'string' ||
          typeof params.mintKeypair === 'string'
        ) {
          throw new Error(
            'Cannot sign transaction with public key strings. Keypair objects are required for signing.',
          );
        }

        const signature = await solanaService.signAndSendTransaction(
          launchResult.encodedTransaction,
          params.creatorKeypair,
          params.mintKeypair,
        );

        return {
          signature,
          encodedTransaction: launchResult.encodedTransaction,
        };
      } catch (error) {
        console.error('Token creation failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Token created successfully:', data);
    },
    onError: (error) => {
      console.error('Token creation error:', error);
    },
  });
};
