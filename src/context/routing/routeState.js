import React, { useReducer } from 'react';
import RouteContext from './routeContext';
import RouteReducer from './routeReducer';
import { RUTA_ACTUAL } from '../../types';

const RouteState = props => {

  const initialState = {
    ruta: "/inicio",
  }

  const [ state, dispatch ] = useReducer(RouteReducer, initialState);

  const rutaActual = (ruta) => {
    dispatch({
      type: RUTA_ACTUAL,
      payload: ruta,
    });
  }

  return (
    <RouteContext.Provider
      value={{
        ruta: state.ruta,
        rutaActual,
      }}
    >{props.children}
    </RouteContext.Provider>
  )
}

export default RouteState;
