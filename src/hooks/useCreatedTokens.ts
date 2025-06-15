import { useQuery } from '@tanstack/react-query';

import {
  pumpFunCreatedTokensService,
  CreatedToken,
} from '../services/pumpFunCreatedTokensService';

export const useCreatedTokens = (
  walletAddress: string | null,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ['createdTokens', walletAddress],
    queryFn: async (): Promise<CreatedToken[]> => {
      if (!walletAddress) {
        return [];
      }

      return await pumpFunCreatedTokensService.getCreatedTokensByWalletHelius(
        walletAddress,
      );
    },
    enabled: enabled && !!walletAddress,
    staleTime: 5 * 60 * 1000, // 5 минут
    refetchInterval: 30 * 1000, // Обновляем каждые 30 секунд
    retry: 2,
  });
};
