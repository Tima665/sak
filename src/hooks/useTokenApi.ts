import { useMutation } from '@tanstack/react-query';

import {
  launchToken,
  LaunchTokenParams,
  LaunchTokenResponse,
} from '../services/tokenApi';

export const useLaunchToken = () => {
  return useMutation<LaunchTokenResponse, Error, LaunchTokenParams>({
    mutationFn: launchToken,
    onSuccess: (data) => {
      console.log('Token launch successful:', data);
    },
    onError: (error) => {
      console.error('Token launch failed:', error);
    },
  });
};
