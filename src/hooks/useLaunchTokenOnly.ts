import { useMutation } from '@tanstack/react-query';

import { useLaunchToken } from './useTokenApi';

export interface LaunchTokenOnlyParams {
  name: string;
  symbol: string;
  description: string;
  devPublicKey: string;
  mintPublicKey: string;
}

export interface LaunchTokenOnlyResult {
  encodedTransaction: string;
}

export const useLaunchTokenOnly = () => {
  const launchTokenMutation = useLaunchToken();

  return useMutation<LaunchTokenOnlyResult, Error, LaunchTokenOnlyParams>({
    mutationFn: async (params: LaunchTokenOnlyParams) => {
      try {
        // Call the launch API to get the encoded transaction
        const launchResult = await launchTokenMutation.mutateAsync({
          name: params.name,
          symbol: params.symbol,
          description: params.description,
          dev: params.devPublicKey,
          mint: params.mintPublicKey,
        });

        return {
          encodedTransaction: launchResult.encodedTransaction,
        };
      } catch (error) {
        console.error('Token launch failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Token launch successful:', data);
    },
    onError: (error) => {
      console.error('Token launch error:', error);
    },
  });
};
