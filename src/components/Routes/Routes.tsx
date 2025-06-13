import { IonRouterOutlet } from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';

import { routes } from '../../constants';
import { CreateToken } from '../../pages/CreateToken';
import { Login } from '../../pages/Login';
import Tab2 from '../../pages/Tab2';
import Tab3 from '../../pages/Tab3';
import { ProtectedRoute } from '../ProtectedRoute';

export const Routes = () => (
  <IonRouterOutlet>
    <Route exact path="/login">
      <Login />
    </Route>
    <ProtectedRoute exact path={routes.createToken} component={CreateToken} />
    <ProtectedRoute exact path="/tab2" component={Tab2} />
    <ProtectedRoute path="/tab3" component={Tab3} />
    <Route exact path="/">
      <Redirect to={routes.createToken} />
    </Route>
  </IonRouterOutlet>
);
