import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useHistory } from "react-router-dom";
import { Button } from "reactstrap";
import AccountOutlineIcon from "mdi-react/AccountOutlineIcon";
import Swal from "sweetalert2";
import * as yup from "yup";
import Axios from "../../../config/axios";

// Esquema de validación del formulario de cliente
const esquema = yup.object().shape({
  correo: yup.string().email("No es un correo electrónico válido *").required("Correo electrónico obligatorio *"),
}).required();

const RecUsuarioForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(esquema) });
  const history = useHistory();

  const enviarCorreo = async (data) => {
    try {
      await Axios.post("/api/recuperarCredenciales", data);
      mensajeVerificacion(data.correo);
    } catch {
      mensajeError();
    }
  };

  const mensajeVerificacion = (correo) => {
    Swal.fire({
      icon: "info",
      title: "Correo de verificación enviado",
      text: `Verifique el correo: ${correo}`,
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
      text: `Ocurrió un error, intente más tarde`,
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  return (
    <form className="form" onSubmit={handleSubmit(enviarCorreo)}>
      <div className="form__form-group">
        <span className="form__form-group-label">Correo electrónico</span>
        <div className="form__form-group-field">
          <div className="form__form-group-icon">
            <AccountOutlineIcon />
          </div>
          <input
            type="email"
            name="correo"
            className={`${errors.correo ? "danger" : ""}`}
            placeholder="Ingrese su correo electrónico"
            {...register("correo", { required: true })}
          />
        </div>
        {errors.correo && (
          <span className="form__form-group-error">
            {errors.correo?.message}
          </span>
        )}
        <div className="account__forgot-password">
          <Link className="text-right" to="/iniciar-sesion">
            Regresar a Inicio de Sesión
          </Link>
        </div>
      </div>
      <Button type="submit" className="text-white btn-success account__btn account__btn--small mt-5">
        Enviar Correo de Recuperación
      </Button>
    </form>
  );
};

export default RecUsuarioForm;
