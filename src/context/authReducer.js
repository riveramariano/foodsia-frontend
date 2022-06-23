import { 
  OBTENER_USUARIO, 
  LOGIN_EXITOSO, 
  LOGIN_ERROR, 
  CERRAR_SESION 
} from '../types';

// eslint-disable-next-line import/no-anonymous-default-export
export default (state, action) => {
  switch (action.type) {
    case LOGIN_EXITOSO:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        autenticado: true,
      }
    case CERRAR_SESION:
    case LOGIN_ERROR:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        usuario: null,
        autenticado: null,
      }
    case OBTENER_USUARIO:
      return {
        ...state,
        autenticado: true,
        usuario: action.payload,
      }
    default:
      return state;
  }
}
