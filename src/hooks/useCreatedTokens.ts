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

      // Сначала пробуем Helius API
      try {
        return await pumpFunCreatedTokensService.getCreatedTokensByWalletHelius(
          walletAddress,
        );
      } catch (error) {
        console.error('Helius API failed, trying mock data:', error);
        // Если Helius не работает, используем моковые данные для тестирования
        return await pumpFunCreatedTokensService.getMockCreatedTokens(
          walletAddress,
        );
      }
    },
    enabled: enabled && !!walletAddress,
    staleTime: 5 * 60 * 1000, // 5 минут
    refetchInterval: 30 * 1000, // Обновляем каждые 30 секунд
    retry: 2,
  });
};

export const useCreatedTokensBitquery = (
  walletAddress: string | null,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ['createdTokensBitquery', walletAddress],
    queryFn: async (): Promise<CreatedToken[]> => {
      if (!walletAddress) {
        return [];
      }
      return await pumpFunCreatedTokensService.getCreatedTokensByWallet(
        walletAddress,
      );
    },
    enabled: enabled && !!walletAddress,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000, // Реже обновляем для платного API
    retry: 1,
  });
};
