import { usePrivy } from '@privy-io/react-auth';
import { Redirect, Route, RouteProps } from 'react-router-dom';

interface ProtectedRouteProps extends Omit<RouteProps, 'component'> {
  component: React.ComponentType<any>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { ready, authenticated } = usePrivy();

  if (!ready) {
    return null; // или компонент загрузки
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        authenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};
