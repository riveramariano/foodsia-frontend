import React, { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useHistory, useLocation } from "react-router-dom";
import { Button } from "reactstrap";
import AccountOutlineIcon from "mdi-react/AccountOutlineIcon";
import Swal from "sweetalert2";
import * as yup from "yup";
import Axios from "../../../config/axios";
import EyeIcon from "mdi-react/EyeIcon";
import KeyVariantIcon from "mdi-react/KeyVariantIcon";

// Esquema de validación del formulario de recuperar credenciales
const esquemaContrasenna = yup.object().shape({
  correo: yup.string().email("No es un correo electrónico válido *").required("Correo electrónico obligatorio *"),
  contrasenna: yup.string().min(8, "Mínimo 8 caracteres").required("Contraseña obligatoria *"),
  repetirContrasenna: yup.string().min(8, "Mínimo 8 caracteres").required("Contraseña obligatoria *"),
}).required();

// Esquema de validación del formulario de recuperar credenciales
const esquemaUsuario = yup.object().shape({
  correo: yup.string().email("No es un correo electrónico válido *").required("Correo electrónico obligatorio *"),
  usuario: yup.string().min(8, "Mínimo 8 caracteres").required("Nombre de usuario obligatoria *"),
  repetirUsuario: yup.string().min(8, "Mínimo 8 caracteres").required("Nombre de usuario obligatoria *"),
}).required();

const RecUsuarioForm = () => {

  const [isPasswordShown1, setIsPasswordShown1] = useState(false);
  const [isPasswordShown2, setIsPasswordShown2] = useState(false);
  const history = useHistory();

  const handleShowPassword1 = () => { setIsPasswordShown1(!isPasswordShown1) };
    const handleShowPassword2 = () => { setIsPasswordShown2(!isPasswordShown2) };

  const search = useLocation().search;
  const opcion = new URLSearchParams(search).get("opt");

  const { register, handleSubmit, formState: { errors } } = useForm(
    { resolver: opcion === 'contrasenna' ? yupResolver(esquemaContrasenna) : yupResolver(esquemaUsuario) }
  );

  const recuperarCredenciales = async (data) => {
  
    data.correo = data.correo.toLowerCase();
    const correo = await Axios.post(`/api/recuperarCredenciales/validar/correo`, data);
    const empleados = await Axios.get("/api/recuperarCredenciales/listar-empleados");

    if (correo.data.credenciales.length){
      const { usuario, repetirUsuario, contrasenna, repetirContrasenna } = data;

      if (usuario && usuario.length) { 
        if (usuario.length > 45) { usuarioMuyLargo(); return; }
        if (usuario !== repetirUsuario) { usuariosNoSonIguales(); return; }
        if (!validacionesDuplicados(usuario, empleados.data.rows)) { return; }
      }
      if (contrasenna && contrasenna.length) {
        if (contrasenna.length > 45) { contrasennaMuyLarga(); return; }
        if (contrasenna !== repetirContrasenna) { contrasennasNoSonIguales(); return; }
        if (!validacionContrasenna(contrasenna)) { errorValidacionContrasenna(); return; }
      }
      try {
        await Axios.post(`/api/recuperarCredenciales/${opcion}`, data);
        mensajeVerificacion();
      } catch {
        mensajeError();
      }
    } else {
      validacionCorreo();
    }
  };

  const validacionesDuplicados = (usuario, empleados) => {
    const usuarioDuplicado = empleados.filter((e) => e.usuario === usuario.trimEnd());
    if (usuarioDuplicado.length) { duplicadoUsuario(); return false; }
    return true;
  }

  const validacionContrasenna = (value) => {
    const isWhitespace = /^(?=.*\s)/;
    if (isWhitespace.test(value)) {
      return false;
    }

    const isContainsUppercase = /^(?=.*[A-Z])/;
    if (!isContainsUppercase.test(value)) {
      return false;
    }

    const isContainsLowercase = /^(?=.*[a-z])/;
    if (!isContainsLowercase.test(value)) {
      return false;
    }

    const isContainsNumber = /^(?=.*[0-9])/;
    if (!isContainsNumber.test(value)) {
      return false;
    }

    // eslint-disable-next-line no-useless-escape
    const isContainsSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])/;
    if (!isContainsSymbol.test(value)) {
      return false;
    }

    const isValidLength = /^.{8,}$/;
    if (!isValidLength.test(value)) {
      return false;
    }
    return true;
  };

  const errorValidacionContrasenna = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un error",
      html: `<p>La contraseña:</p>
        <p><strong>No debe tener espacios en blanco</strong></p>
        <p><strong>Debe tener al menos una letra mayúscula</strong></p>
        <p><strong>Debe tener al menos una letra minúscula</strong></p>
        <p><strong>Debe tener al menos un número</strong></p>
        <p><strong>Debe tener al menos un carácter especial</strong></p>
        <p><strong>Debe tener al menos 8 caracteres</strong></p>
      `,
      confirmButtonColor: "#238484",
      confirmButtonText: "Aceptar",
      reverseButtons: true,
    });
  };

  const usuarioMuyLargo = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un error",
      text: `Límite excedido, el máximo de caracteres permitidos para el nombre de usuario es de 45.`,
      confirmButtonColor: "#238484",
      confirmButtonText: "Aceptar",
      reverseButtons: true,
    });
  };

  const contrasennaMuyLarga = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un error",
      text: `Límite excedido, el máximo de caracteres permitidos para la contraseña es de 45.`,
      confirmButtonColor: "#238484",
      confirmButtonText: "Aceptar",
      reverseButtons: true,
    });
  };

  const duplicadoUsuario = () => {
    Swal.fire({
      icon: "info",
      title: "Información Duplicada",
      text: "Ese usuario ya existe.",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  const usuariosNoSonIguales = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un error",
      text: `Los usuarios no son iguales.`,
      confirmButtonColor: "#238484",
      confirmButtonText: "Aceptar",
      reverseButtons: true,
    });
  };

  const contrasennasNoSonIguales = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un error",
      text: `Las contraseñas no son iguales.`,
      confirmButtonColor: "#238484",
      confirmButtonText: "Aceptar",
      reverseButtons: true,
    });
  };

  const validacionCorreo = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un Error",
      text: `No existe el correo digitado.`,
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };
  
  const mensajeVerificacion = () => {
    Swal.fire({
      icon: "success",
      title: "Operación Exitosa",
      text: `Se ha actualizado correctamente`,
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
    history.push("/iniciar-sesion");
  };

  const mensajeError = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un Error",
      text: `Las contraseñas no coinciden`,
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  return (
    <form className="form" onSubmit={handleSubmit(recuperarCredenciales)}>
  
      {/* Correo electrónico */}
      <div className="form__form-group">
        <span className="form__form-group-label">Correo electrónico</span>
        <div className="form__form-group-field">
          <div className="form__form-group-icon">
            <AccountOutlineIcon />
          </div>
          <input
            type="text"
            name="correo"
            className={`${errors.correo ? "danger" : ""}`}
            placeholder="Correo electrónico (xxxx@xxx.xxx)"
            {...register("correo", { required: true })}
          />
        </div>
        {errors.correo && (
          <span className="form__form-group-error">
            {errors.correo?.message}
          </span>
        )}
      </div>

      {opcion === "contrasenna" ? (
        <Fragment>
          {/* Contraseña */}
          <div className="form__form-group">
            <span className="form__form-group-label">Contraseña</span>
            <div className="form__form-group-field">
              <div className="form__form-group-icon">
                <KeyVariantIcon />
              </div>
              <input
                type={isPasswordShown1 ? "text" : "password"}
                name="contrasenna"
                className={`${errors.contrasenna ? "danger" : ""}`}
                placeholder="Contraseña"
                {...register("contrasenna", { required: true })}
              />
              <button
                type="button"
                className={`form__form-group-button${
                  isPasswordShown1 ? " active" : ""
                }`}
                onClick={() => handleShowPassword1()}
              >
                <EyeIcon />
              </button>
            </div>
            {errors.contrasenna && (
              <span className="form__form-group-error">
                {errors.contrasenna?.message}
              </span>
            )}
          </div>

          {/* Repetir contraseña */}
          <div className="form__form-group">
            <span className="form__form-group-label">Repetir contraseña</span>
            <div className="form__form-group-field">
              <div className="form__form-group-icon">
                <KeyVariantIcon />
              </div>
              <input
                type={isPasswordShown2 ? "text" : "password"}
                name="repetirContrasenna"
                className={`${errors.contrasenna ? "danger" : ""}`}
                placeholder="Contraseña"
                {...register("repetirContrasenna", { required: true })}
              />
              <button
                type="button"
                className={`form__form-group-button${
                  isPasswordShown2 ? " active" : ""
                }`}
                onClick={() => handleShowPassword2()}
              >
                <EyeIcon />
              </button>
            </div>
            {errors.repetirContrasenna && (
              <span className="form__form-group-error">
                {errors.repetirContrasenna?.message}
              </span>
            )}
          </div>
          <Button type="submit" className="text-white btn-success account__btn account__btn--small mt-5">
            Actualizar Contraseña
          </Button>
        </Fragment>
      ) : (
        <Fragment>
          {/* Usuario */}
          <div className="form__form-group">
            <span className="form__form-group-label">Usuario</span>
            <div className="form__form-group-field">
              <div className="form__form-group-icon">
                <KeyVariantIcon />
              </div>
              <input
                type="text"
                name="usuario"
                className={`${errors.usuario ? "danger" : ""}`}
                placeholder="Nombre de usuario"
                {...register("usuario", { required: true })}
                style={{ textTransform: "lowercase" }}
              />
            </div>
            {errors.usuario && (
              <span className="form__form-group-error">
                {errors.usuario?.message}
              </span>
            )}
          </div>

          {/* Repetir usuario */}
          <div className="form__form-group">
            <span className="form__form-group-label">Repetir usuario</span>
            <div className="form__form-group-field">
              <div className="form__form-group-icon">
                <KeyVariantIcon />
              </div>
              <input
                type="text"
                name="repetirUsuario"
                className={`${errors.repetirUsuario ? "danger" : ""}`}
                placeholder="Repetir nombre de usuario"
                {...register("repetirUsuario", { required: true })}
                style={{ textTransform: "lowercase" }}
              />
            </div>
            {errors.repetirUsuario && (
              <span className="form__form-group-error">
                {errors.repetirUsuario?.message}
              </span>
            )}
          </div>
          <Button type="submit" className="text-white btn-success account__btn account__btn--small mt-5">
            Actualizar Usuario
          </Button>
        </Fragment>
      )}

    </form>
  );
};

export default RecUsuarioForm;
