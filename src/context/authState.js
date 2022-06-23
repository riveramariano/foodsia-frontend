import React, { useReducer } from 'react';
import AuthContext from './authContext';
import AuthReducer from './authReducer';
import {
  OBTENER_USUARIO,
  LOGIN_EXITOSO,
  LOGIN_ERROR,
  CERRAR_SESION
} from '../types';
import Axios from '../config/axios';
import authToken from '../config/token';
import Swal from "sweetalert2";

const AuthState = props => {

  const error = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un error!",
      text: "Usuario o contraseña incorrectos",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Aceptar",
    });
  };

  const initialState = {
    token: localStorage.getItem('token'),
    autenticado: null,
    usuario: null,
  }

  const [ state, dispatch ] = useReducer(AuthReducer, initialState);

  // Retorna el usuario autenticado
  const usuarioAutenticado = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      authToken(token);
    }

    try {
      const respuesta = await Axios.get('/api/login');
      dispatch({
        type: OBTENER_USUARIO,
        payload: respuesta.data.usuario,
      });
    } catch (error) {
      dispatch({
        type: LOGIN_ERROR,
      });
    }
  }

  const iniciarSesion = async (data) => {
    const respuesta = await Axios.post('/api/login', data);
    if (Object.keys(respuesta.data).length > 0) {
      dispatch({
        type: LOGIN_EXITOSO,
        payload: respuesta.data,
      });
      usuarioAutenticado();
    } else {
      error();
      dispatch({
        type: LOGIN_ERROR,
      });
    }
  }

  const cerrarSesion = () => {
    delete Axios.defaults.headers.common['x-auth-token'];
    dispatch({
      type: CERRAR_SESION,
    });
  }

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        autenticado: state.autenticado,
        usuario: state.usuario,
        mensaje: state.mensaje,
        usuarioAutenticado,
        iniciarSesion,
        cerrarSesion,
      }}
    >{props.children}
    </AuthContext.Provider>
  )
}

export default AuthState;
