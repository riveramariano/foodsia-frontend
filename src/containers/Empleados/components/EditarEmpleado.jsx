import React, { Fragment, useState, useContext } from "react";
import Axios from "../../../config/axios";
import { useHistory } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Button, ButtonToolbar, Modal, Card, CardBody, Col } from "reactstrap";
import { yupResolver } from "@hookform/resolvers/yup";
import DatePicker from "react-datepicker";
import es from "date-fns/locale/es";
import Select from "react-select";
import Swal from "sweetalert2";
import moment from "moment";
import * as yup from "yup";
import RouteContext from "../../../context/routing/routeContext";
import EyeIcon from "mdi-react/EyeIcon";

const ModalComponent = ({ usuario, empleados, empleado, tiposUsuario, abierto, readonly, setModal }) => {

  const mostrarCamposExclusivos = () => {
    if (!empleado.id) { return true; } // Todos los campos disponibles sino no tiene id
    if (usuario[0].nombreTipoUsuario === "Superadmin") { return true; } // Superadmin puede editar a todos
    if (empleado.id && usuario[0].id === empleado.id) { return true; } // Administrador solo se puede editar a si mismo
    if (empleado.tipoUsuario && empleado.tipoUsuario.label === 'Empleado') { return true; } // Empleado siempre se puede editar
    return false;
  }

  // Esquema de validación del formulario de cliente
  let esquema = '';
  mostrarCamposExclusivos() ?
    esquema = yup.object().shape({
      nombre: yup.string().required("Campo obligatorio *"),
      primerApellido: yup.string().required("Campo obligatorio *"),
      segundoApellido: yup.string().optional(),
      telefono: yup.string().matches("^[2-8]{1}[0-9]{7}$", 'El número de teléfono no es válido')
        .min(8, "Debe tener 8 caracteres obligatoriamente *").max(8, "El número ingresado no es válido *").required(),
      fechaUnion: yup.string().nullable().required("Campo obligatorio *"),
      usuario: yup.string().max(45, "Máximo 45 caracteres permitidos *").required("Campo obligatorio *"),
      correoElectronico: yup.string().max(50, "Máximo 50 caracteres permitidos *").email("No es un correo electrónico válido *").required("Correo electrónico obligatorio *"),
      contrasenna: yup.string().optional(),
      repetirContrasenna: yup.string().optional(),
      tipoUsuario: yup.object().nullable().required("Campo obligatorio *"),
    }).required()
  : 
    esquema = yup.object().shape({
      nombre: yup.string().required("Campo obligatorio *"),
      primerApellido: yup.string().required("Campo obligatorio *"),
      segundoApellido: yup.string().optional(),
      telefono: yup.string().matches("^[2-8]{1}[0-9]{7}$", 'El número de teléfono no es válido')
        .min(8, "Debe tener 8 caracteres obligatoriamente *").max(8, "El número ingresado no es válido *").required(),
      fechaUnion: yup.string().nullable().required("Campo obligatorio *"),
      usuario: yup.string().optional(),
      correoElectronico: yup.string().email("No es un correo electrónico válido *").optional(),
      contrasenna: yup.string().max(45, "Máximo 45 caracteres permitidos *").optional(),
      repetirContrasenna: yup.string().max(45, "Máximo 45 caracteres permitidos *").optional(),
      tipoUsuario: yup.object().nullable().required("Campo obligatorio *"),
    }).required();

  const { register, handleSubmit, formState: { errors }, control } = useForm({ resolver: yupResolver(esquema) });
  const [cached, setCached] = useState(false);
  let [fechaUnion] = useState("");
  const history = useHistory();
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isPasswordShown2, setIsPasswordShown2] = useState(false);

  const routeContext = useContext(RouteContext);
  const { rutaActual } = routeContext;

  const nuevosCambios = () => { setCached(true); };
  const descartar = () => { cambiosNoGuardados(); };
  const toggle = () => { setModal((prevState) => !prevState); history.push("/lista/empleados"); };
  const handleShowPassword = () => { setIsPasswordShown(!isPasswordShown); };
  const handleShowPassword2 = () => { setIsPasswordShown2(!isPasswordShown2); };

  // Función para agregar / actualizar un empleado
  const guardar = async (data) => {
    setCached(false);

    if (!mostrarCamposExclusivos()) { 
      data.usuario = empleado.usuario; 
      data.correoElectronico = empleado.correoElectronico; 

      if (data.usuario.length > 45) { usuarioMuyLargo(); return; }
      if (data.correoElectronico.length > 50) { correoMuyLargo(); return; }
    } else {
      // Validar contraseña y repetir contraseña
      const { contrasenna, repetirContrasenna, usuario, correoElectronico } = data;
      if (!empleado.id) { if (!contrasenna || !repetirContrasenna) { nuevoEmpleadoSinContrasenna(); return; } }
      if (contrasenna && !repetirContrasenna) { sinConfirmacionContrasenna(); return; }
      if (!contrasenna && repetirContrasenna) { sinContrasenna(); return; }
      if (contrasenna && repetirContrasenna) { if (contrasenna !== repetirContrasenna) { contrasennaNoSonIguales(); return; } }

      // Validar fuerza de contraseña
      if (contrasenna && repetirContrasenna) {
        if (!validacionContrasenna(contrasenna)) { errorValidacionContrasenna(); return; }
      }

      // Validar campos duplicados
      if (!validacionesDuplicados(correoElectronico, usuario)) { return; }
    }

    // Actualizar empleado
    if (empleado.id) {

      const empleadoModificado = {
        id: empleado.id,
        nombre: data.nombre,
        primerApellido: data.primerApellido,
        segundoApellido: data.segundoApellido,
        telefono: data.telefono,
        fechaUnion: moment(data.fechaUnion).format("DD-MM-YYYY"),
        usuario: data.usuario,
        correoElectronico: data.correoElectronico,
        contrasenna: data.contrasenna,
        tipoUsuarioId: data.tipoUsuario.value,
      };
      try {
        await Axios.patch("/api/empleados", empleadoModificado);
        actualizarEmpleado();
      } catch (error) { 
        if (error.message === 'Request failed with status code 409') {
          duplicadoGenerico();
        } else {
          errorGenerico(); 
        }
      }

    } else { // Agregar empleado

      const empleadoModificado = {
        nombre: data.nombre,
        primerApellido: data.primerApellido,
        segundoApellido: data.segundoApellido,
        telefono: data.telefono,
        fechaUnion: moment(data.fechaUnion).format("DD-MM-YYYY"),
        usuario: data.usuario,
        correoElectronico: data.correoElectronico,
        contrasenna: data.contrasenna,
        tipoUsuarioId: data.tipoUsuario.value,
      };
      try {
        await Axios.post("/api/empleados", empleadoModificado);
        agregarEmpleado();
      } catch (error) {
        if (error.message === "Request failed with status code 409") {
          duplicadoGenerico();
        } else {
          errorGenerico();
        }
      }
    }
  }

  const validacionesDuplicados = (correoElectronico, usuario) => {
    if (empleado.id) {
      const usuarioDuplicado = empleados.filter((e) => e.id !== empleado.id && e.usuario === usuario.trimEnd());
      const correoDuplicado = empleados.filter((e) => e.id !== empleado.id && e.correoElectronico === correoElectronico.trimEnd());
      if (usuarioDuplicado.length && correoDuplicado.length) { duplicadoGenerico(); return false; }
      if (usuarioDuplicado.length) { duplicadoUsuario(); return false; }
      if (correoDuplicado.length) { duplicadoCorreo(); return false; }
    } else {
      const usuarioDuplicado = empleados.filter((e) => e.usuario === usuario.trimEnd());
      const correoDuplicado = empleados.filter((e) => e.correoElectronico === correoElectronico.trimEnd());
      if (usuarioDuplicado.length && correoElectronico.length) { duplicadoGenerico(); return false; }
      if (usuarioDuplicado.length) { duplicadoUsuario(); return false; }
      if (correoDuplicado.length) { duplicadoCorreo(); return false; }
    }
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

  const agregarEmpleado = () => {
    rutaActual("/lista/empleados");
    let timerInterval;
    Swal.fire({
      icon: "success",
      title: "Empleado agregado con éxito",
      text: "Espere unos segundos",
      showConfirmButton: false,
      showCancelButton: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      timer: 1000,
      timerProgressBar: true,
      didOpen: () => { Swal.showLoading(); timerInterval = setInterval(() => {}, 100); },
      willClose: () => { clearInterval(timerInterval); toggle(); history.push("/iniciar-sesion"); },
    });
  }

  const actualizarEmpleado = () => {
    rutaActual("/lista/empleados");
    let timerInterval;
    Swal.fire({
      icon: "success",
      title: "Empleado actualizado con éxito",
      text: "Espere unos segundos",
      showConfirmButton: false,
      showCancelButton: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      timer: 1000,
      timerProgressBar: true,
      didOpen: () => { Swal.showLoading(); timerInterval = setInterval(() => {}, 100); },
      willClose: () => { clearInterval(timerInterval); toggle(); history.push("/iniciar-sesion"); },
    });
  }

  const cambiosNoGuardados = () => {
    Swal.fire({
      icon: "warning",
      title: "Cambios Pendientes",
      text: `¿Desea cerrar de todas formas?`,
      showCancelButton: true,
      confirmButtonColor: "#238484",
      cancelButtonColor: "#c5384b",
      confirmButtonText: "Cerrar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => { if (result.isConfirmed) { toggle(); } });
  }

  const correoMuyLargo = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un error",
      text: `Límite excedido, el máximo de caracteres permitidos para el correo electrónico es de 50.`,
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

  const contrasennaNoSonIguales = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un error",
      text: `Las contraseñas no son iguales.`,
      confirmButtonColor: "#238484",
      confirmButtonText: "Aceptar",
      reverseButtons: true,
    });
  };

  const sinContrasenna = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un error",
      text: `No hay una contraseña`,
      confirmButtonColor: "#238484",
      confirmButtonText: "Aceptar",
      reverseButtons: true,
    });
  };

  const sinConfirmacionContrasenna = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un error",
      text: `No hay confirmación de contraseña`,
      confirmButtonColor: "#238484",
      confirmButtonText: "Aceptar",
      reverseButtons: true,
    });
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

  const errorGenerico = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un Error",
      text: "Intente nuevamente",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  const duplicadoGenerico = () => {
    Swal.fire({
      icon: "info",
      title: "Información Duplicada",
      text: "Ese nombre de usuario o correo electrónico ya existe.",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  const duplicadoCorreo = () => {
    Swal.fire({
      icon: "info",
      title: "Información Duplicada",
      text: "Ese correo electrónico ya existe.",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
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

  const nuevoEmpleadoSinContrasenna = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un Error",
      text: "Un nuevo usuario debe contar con una contraseña",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  if (empleado.fechaUnion) {
    const fechaFormateada = empleado.fechaUnion.replace(/(\d+[/])(\d+[/])/, "$2$1");
    fechaUnion = new Date(fechaFormateada);
  }

  const blockInvalidChar = e =>
    !['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace', 'Ctrl', 'a', 'z', 'x', 'c', 'A', 'Z', 'X', 'C', 'Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '.', ',']
    .includes(e.key) && e.preventDefault();

  return (
    <div>
      <Modal style={{ maxWidth: "1200px" }} isOpen={abierto} toggle={toggle} centered={true}>

        {/* Header */}
        <div className="modal__header">
          {cached ? (
            <button className="lnr lnr-cross modal__close-btn" onClick={descartar}/>
          ) : (
            <button className="lnr lnr-cross modal__close-btn" onClick={toggle}/>
          )}
          {readonly ? (
            <h3 className="modal__title text-uppercase">Ver Empleado</h3>
          ) : Object.keys(empleado).length !== 0 ? (
            <h3 className="modal__title text-uppercase">Editar Empleado</h3>
          ) : (
            <h3 className="modal__title text-uppercase">Agregar Empleado</h3>
          )}
        </div>

        {/* Body */}
        <div className="modal__body">
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit(guardar)} className="form form--horizontal">

                {/* Columna izquierda */}
                <Col md={6}>
                  <h4 className="text-center">Información Personal</h4>
                  <hr />

                  {/* Nombre */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Nombre</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">{empleado.nombreUsuario}</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="text"
                            name="nombre"
                            defaultValue={empleado.nombreUsuario}
                            className={`${errors.nombre ? "danger" : ""}`}
                            placeholder="Nombre del empleado"
                            {...register("nombre", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                          />
                          {errors.nombre && (
                            <span className="form__form-group-error">
                              {errors.nombre?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
  
                  {/* Primer apellido */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Primer Apellido</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {empleado.primerApellido}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="text"
                            name="primerApellido"
                            defaultValue={empleado.primerApellido}
                            className={`${errors.primerApellido ? "danger" : ""}`}
                            placeholder="Primer apellido"
                            {...register("primerApellido", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                          />
                          {errors.primerApellido && (
                            <span className="form__form-group-error">
                              {errors.primerApellido?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Segundo apellido */}
                  <div className="form__form-group mb-4">
                    <span className="form__form-group-label">Segundo Apellido</span>
                    <div className="form__form-group-field">
                      {readonly === true ? (
                        <span className="text-secondary">
                          {empleado.segundoApellido}
                        </span>
                      ) : (
                        <input
                          type="text"
                          name="segundoApellido"
                          defaultValue={empleado.segundoApellido}
                          placeholder="Segundo apellido"
                          {...register("segundoApellido", {
                            required: false,
                            onChange: nuevosCambios,
                          })}
                        />
                      )}
                    </div>
                  </div>

                  {/* Segunda sección - columna izquierda */}
                  <hr />

                  {/* Fecha unión */}
                  <div className="form__form-group mt-1">
                    <span className="form__form-group-label">Fecha Unión</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {moment(empleado.fechaUnion).format("DD-MM-YYYY")}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <div className="date-picker">
                            <Controller
                              control={control}
                              name="fechaUnion"
                              defaultValue={empleado.fechaUnion ? fechaUnion : ""}
                              render={({ field }) => (
                                <DatePicker
                                  placeholderText="Fecha de unión"
                                  className={`${errors.fechaUnion ? "danger" : ""}`}
                                  onChange={(fecha) => field.onChange(fecha)}
                                  selected={field.value}
                                  onKeyDown={nuevosCambios}
                                  onChangeRaw={nuevosCambios}
                                  dateFormat="dd-MM-yyyy"
                                  locale={es}
                                  isClearable
                                />
                              )}
                            />
                          </div>
                          {errors.fechaUnion && (
                            <span className="form__form-group-error">
                              {errors.fechaUnion?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Teléfono</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {empleado.telefono.split('')[0]}{empleado.telefono.split('')[1]}{empleado.telefono.split('')[2]}
                          {empleado.telefono.split('')[3]}-{empleado.telefono.split('')[4]}{empleado.telefono.split('')[5]}
                          {empleado.telefono.split('')[6]}{empleado.telefono.split('')[7]}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="number"
                            name="telefono"
                            defaultValue={empleado.telefono}
                            className={`${errors.telefono ? "danger" : ""}`}
                            placeholder="Número de teléfono (xxxxxxxx)"
                            {...register("telefono", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                            onKeyDown={blockInvalidChar}
                          />
                          {errors.telefono && (
                            <span className="form__form-group-error">
                              {errors.telefono?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Col>

                {/* Columna derecha */}
                <Col md={6}>
                  <h4 className="text-center">Información Empresarial</h4>
                  {!readonly && !mostrarCamposExclusivos() && 
                    <h6 className="text-center">No posee los permisos suficientes para editar los valores de esta columna</h6>
                  }
                  <hr />

                  {/* Correo electrónico */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Correo Electrónico</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {empleado.correoElectronico}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="text"
                            name="correoElectronico"
                            defaultValue={empleado.correoElectronico}
                            className={`${errors.correoElectronico ? "danger" : ""}`}
                            placeholder="Correo Electrónico (xxx@xxx.xxx)"
                            {...register("correoElectronico", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                            style={{ textTransform: "lowercase" }}
                            disabled={!mostrarCamposExclusivos()}
                          />
                          {errors.correoElectronico && (
                            <span className="form__form-group-error">
                              {errors.correoElectronico?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Usuario */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Usuario</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {empleado.usuario}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="text"
                            name="usuario"
                            defaultValue={empleado.usuario}
                            className={`${errors.usuario ? "danger" : ""}`}
                            placeholder="Nombre de usuario"
                            {...register("usuario", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                            style={{ textTransform: "lowercase" }}
                            disabled={!mostrarCamposExclusivos()}
                          />
                          {errors.usuario && (
                            <span className="form__form-group-error">
                              {errors.usuario?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tipo Usuario */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Tipo Usuario</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {empleado.tipoUsuario.label}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <Controller
                            control={control}
                            name="tipoUsuario"
                            defaultValue={empleado.tipoUsuario}
                            render={({ field }) => (
                              <Select
                                className="react-select"
                                onInputChange={nuevosCambios}
                                onChange={(tipoUsuario) => field.onChange(tipoUsuario)}
                                options={tiposUsuario}
                                value={field.value}
                                placeholder="Tipo de usuario"
                                classNamePrefix="react-select"
                                isClearable={true}
                                isDisabled={usuario[0].id === empleado.id ? true : !mostrarCamposExclusivos()}
                              />
                            )}
                          />
                          {errors.tipoUsuario && (
                            <span className="form__form-group-error">
                              {errors.tipoUsuario?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {readonly ? (null) : (<hr />)}

                  {/* Contraseña */}
                  <div className="form__form-group">
                    {readonly ? (null) : (<span className="form__form-group-label">Nueva Contraseña</span>)}
                    <div className="form__form-group-field">
                      {readonly ? (null) : (
                        <Fragment>
                          <input
                            type={isPasswordShown ? "text" : "password"}
                            name="contrasenna"
                            defaultValue={empleado.contrasenna}
                            className={`${errors.contrasenna ? "danger" : ""}`}
                            placeholder="Nueva contraseña"
                            {...register("contrasenna", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                            onCopy={(e) => {
                              e.preventDefault();
                              return false;
                            }}
                            onPaste={(e) => {
                              e.preventDefault();
                              return false;
                            }}
                            disabled={!mostrarCamposExclusivos()}
                          />
                          <button type="button" className={`form__form-group-button${isPasswordShown ? " active" : ""}`} onClick={() => handleShowPassword()}>
                            <EyeIcon />
                          </button>
                        </Fragment>
                      )}
                    </div>
                  </div>

                  {/* Repetir contraseña */}
                  <div className="form__form-group">
                    {readonly ? (null) : (<span className="form__form-group-label">Repetir Contraseña</span>)}
                    <div className="form__form-group-field">
                      {readonly ? (null) : (
                        <Fragment>
                          <input
                            type={isPasswordShown2 ? "text" : "password"}
                            name="repetirContrasenna"
                            defaultValue={empleado.repetirContrasenna}
                            className={`${errors.repetirContrasenna ? "danger" : ""}`}
                            placeholder="Confirmar nueva contraseña"
                            {...register("repetirContrasenna", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                            onCopy={(e) => {
                              e.preventDefault();
                              return false;
                            }}
                            onPaste={(e) => {
                              e.preventDefault();
                              return false;
                            }}
                            disabled={!mostrarCamposExclusivos()}
                          />
                          <button type="button" className={`form__form-group-button${isPasswordShown2 ? " active" : ""}`} onClick={() => handleShowPassword2()}>
                            <EyeIcon />
                          </button>
                        </Fragment>
                      )}
                    </div>
                  </div>
                </Col>

                {/* Footer */}
                <Col md={12}>
                  <ButtonToolbar className="modal__footer">
                    {cached && (
                      <span className="modal__delete-btn text-secondary mr-4 mt-1">
                        <span className="danger-icon"></span>Sin Guardar
                      </span>
                    )}
                    {cached ? (
                      <Fragment>
                        <Button color="success" onClick={descartar}outline>Cerrar</Button>
                        <Button type="submit" color="success">Guardar</Button>
                      </Fragment>
                    ) : (
                      <Button color="secondary" onClick={toggle}>Cerrar</Button>
                    )}
                  </ButtonToolbar>
                </Col>

              </form>
            </CardBody>
          </Card>
        </div>
        {/* Fin Body */}

      </Modal>
    </div>
  );
};

export default ModalComponent;
