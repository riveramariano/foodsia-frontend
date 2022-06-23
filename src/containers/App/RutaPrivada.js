import React, { useContext, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import AuthContext from '../../context/authContext';

const RutaPrivada = ({ component: Component, ...props }) => {
  const authContext = useContext(AuthContext);
  const { autenticado, usuarioAutenticado } = authContext;

  useEffect(() => {
    usuarioAutenticado();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Route {...props} render={props => !autenticado ? (
      <Redirect to="/iniciar-sesion" />
    ) : (
      <Component {...props} />
    )} />
  );
}

export default RutaPrivada;
