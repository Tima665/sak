import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

import AlarmClock from '../components/AlarmClock';

const Tab2: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Будильник</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <AlarmClock />
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
