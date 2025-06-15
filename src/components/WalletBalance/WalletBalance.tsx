import { RefresherEventDetail } from '@ionic/core';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonSkeletonText,
  IonIcon,
  IonText,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import { wallet, refresh } from 'ionicons/icons';

import { useWalletBalance } from '../../hooks/useWalletBalance';

interface WalletBalanceProps {
  publicKey: string;
  title?: string;
}

export const WalletBalance: React.FC<WalletBalanceProps> = ({
  publicKey,
  title = 'Wallet Balance',
}) => {
  const {
    data: balanceData,
    isLoading,
    error,
    refetch,
  } = useWalletBalance(publicKey);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await refetch();
    event.detail.complete();
  };

  const formatBalance = (balance: number): string => {
    return balance.toFixed(4);
  };

  const formatPublicKey = (key: string): string => {
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  return (
    <IonCard>
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>

      <IonCardHeader>
        <IonCardTitle>
          <IonIcon icon={wallet} style={{ marginRight: '8px' }} />
          {title}
        </IonCardTitle>
      </IonCardHeader>

      <IonCardContent>
        <IonItem lines="none">
          <IonLabel>
            <h3>Public Key</h3>
            <p>{formatPublicKey(publicKey)}</p>
          </IonLabel>
        </IonItem>

        {isLoading ? (
          <IonItem lines="none">
            <IonLabel>
              <h3>Balance</h3>
              <IonSkeletonText
                animated
                style={{ width: '60%' }}
              ></IonSkeletonText>
            </IonLabel>
          </IonItem>
        ) : error ? (
          <IonItem lines="none">
            <IonLabel>
              <h3>Balance</h3>
              <IonText color="danger">
                <p>Error loading balance: {error.message}</p>
              </IonText>
            </IonLabel>
            <IonIcon
              icon={refresh}
              slot="end"
              onClick={() => refetch()}
              style={{ cursor: 'pointer' }}
            />
          </IonItem>
        ) : balanceData ? (
          <IonItem lines="none">
            <IonLabel>
              <h3>Balance</h3>
              <p>
                <strong>{formatBalance(balanceData.balance)} SOL</strong>
              </p>
              <p
                style={{ fontSize: '0.8em', color: 'var(--ion-color-medium)' }}
              >
                {balanceData.balanceLamports.toLocaleString()} lamports
              </p>
            </IonLabel>
            <IonIcon
              icon={refresh}
              slot="end"
              onClick={() => refetch()}
              style={{ cursor: 'pointer' }}
            />
          </IonItem>
        ) : null}
      </IonCardContent>
    </IonCard>
  );
};
