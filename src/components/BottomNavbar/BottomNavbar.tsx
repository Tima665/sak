import { IonIcon, IonLabel, IonTabBar, IonTabButton } from '@ionic/react';
import { logoBitcoin, trophyOutline } from 'ionicons/icons';

import { routes } from '../../constants';

export const BottomNavbar = () => {
  return (
    <IonTabBar slot="bottom">
      <IonTabButton tab="create-token" href={routes.createToken}>
        <IonIcon aria-hidden="true" icon={logoBitcoin} />
        <IonLabel>Create Token</IonLabel>
      </IonTabButton>
      {/* <IonTabButton tab="tab2" href="/tab2">
        <IonIcon aria-hidden="true" icon={ellipse} />
        <IonLabel>Tab 2</IonLabel>
      </IonTabButton> */}
      <IonTabButton tab="tab3" href="/tab3">
        <IonIcon aria-hidden="true" icon={trophyOutline} />
        <IonLabel>My Tokens</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};
