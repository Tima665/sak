import { useQuery } from '@tanstack/react-query';

import { SolanaService } from '../services/solanaService';

export interface WalletBalanceData {
  balance: number;
  balanceLamports: number;
  publicKey: string;
}

export const useWalletBalance = (
  publicKey: string | null,
  enabled: boolean = true,
) => {
  const solanaService = new SolanaService();

  return useQuery<WalletBalanceData, Error>({
    queryKey: ['walletBalance', publicKey],
    queryFn: async () => {
      if (!publicKey) {
        throw new Error('Public key is required');
      }

      const [balance, balanceLamports] = await Promise.all([
        solanaService.getBalance(publicKey),
        solanaService.getBalanceLamports(publicKey),
      ]);

      return {
        balance,
        balanceLamports,
        publicKey,
      };
    },
    enabled: enabled && !!publicKey,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};
