import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

import CreatedTokens from '../components/CreatedTokens/CreatedTokens';
import { usePrivyWallet } from '../hooks/usePrivyWallet';
import './Tab3.css';

const Tab3: React.FC = () => {
  const { walletAddress } = usePrivyWallet();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="p-4">My Tokens</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">My Tokens</IonTitle>
          </IonToolbar>
        </IonHeader>
        <CreatedTokens walletAddress={walletAddress || null} />
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
