import React, { useState, useContext, useEffect } from 'react';
import { Link, useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from 'reactstrap';
import EyeIcon from 'mdi-react/EyeIcon';
import KeyVariantIcon from 'mdi-react/KeyVariantIcon';
import AccountOutlineIcon from 'mdi-react/AccountOutlineIcon';
import * as yup from "yup";
import AuthContext from '../../../context/authContext';
import RouteContext from '../../../context/routing/routeContext';

// Esquema de validación del formulario de login
const modelo = yup.object().shape({
  usuario: yup.string().required("Nombre de usuario obligatorio *"),
  contrasenna: yup.string().required("Contraseña obligatoria *"),
}).required();

const LogInForm = () => {

  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(modelo) });
  const history = useHistory();

  const authContext = useContext(AuthContext);
  const { usuario, autenticado, iniciarSesion } = authContext;

  const routeContext = useContext(RouteContext);
  const { ruta } = routeContext;

  useEffect(() => {
    if (autenticado && usuario && (usuario[0].nombreTipoUsuario === 'Administrador' || usuario[0].nombreTipoUsuario === 'Superadmin')) {
      history.push(ruta);
    }
    if (autenticado && (usuario && usuario[0].nombreTipoUsuario === 'Empleado')) {
      history.push("/lista/clientes");
    }
  }, [autenticado, history, ruta, usuario]);

  const handleShowPassword = () => {
    setIsPasswordShown(!isPasswordShown);
  };

  const guardar = async (data) => {
    data.usuario = data.usuario.toLowerCase();
    const { usuario, contrasenna } = data;
    iniciarSesion({ usuario, contrasenna });
  };

  return (
    <form className="form" onSubmit={handleSubmit(guardar)}>
      <div className="form__form-group">
        <span className="form__form-group-label">Usuario</span>
        <div className="form__form-group-field">
          <div className="form__form-group-icon">
            <AccountOutlineIcon />
          </div>
          <input
            type="text"
            name="usuario"
            className={`${errors.usuario ? "danger" : ""}`}
            placeholder="Usuario"
            {...register("usuario", { required: true })}
          />
        </div>
        {errors.usuario && (
          <span className="form__form-group-error">
            {errors.usuario?.message}
          </span>
        )}
      </div>
      <div className="form__form-group">
        <span className="form__form-group-label">Contraseña</span>
        <div className="form__form-group-field">
          <div className="form__form-group-icon">
            <KeyVariantIcon />
          </div>
          <input
            type={isPasswordShown ? "text" : "password"}
            name="contrasenna"
            className={`${errors.contrasenna ? "danger" : ""}`}
            placeholder="Contraseña"
            {...register("contrasenna", { required: true })}
          />
          <button
            type="button"
            className={`form__form-group-button${isPasswordShown ? " active" : ""}`}
            onClick={() => handleShowPassword()}
          >
            <EyeIcon />
          </button>
        </div>
        {errors.contrasenna && (
          <span className="form__form-group-error">
            {errors.contrasenna?.message}
          </span>
        )}
        <div className="account__forgot-password">
          <Link className="text-right" to="/enviar-correo">
            Olvidó sus credenciales?
          </Link>
        </div>
      </div>
      <Button type="submit" className="text-white btn-success account__btn account__btn--small mt-5">
        Ingresar
      </Button>
    </form>
  );
};

export default LogInForm;
