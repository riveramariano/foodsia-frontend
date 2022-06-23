import React, { Fragment, useState, useContext } from "react";
import Axios from "../../../config/axios";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button, ButtonToolbar, Modal, Card, CardBody, Col } from "reactstrap";
import { yupResolver } from "@hookform/resolvers/yup";
import Swal from "sweetalert2";
import * as yup from "yup";
import RouteContext from "../../../context/routing/routeContext";

// Esquema de validación del formulario de proveedor
const esquema = yup.object().shape({
  nombreProveedor: yup.string().max(50, "Máximo 50 caracteres permitidos *").required("Campo obligatorio *"),
  cedulaJuridica: yup.string().max(10, "Cédula Jurídica no válida *").min(10, "Cédula Jurídica no válida *").required("Campo obligatorio *"),
  correoElectronico: yup.string().max(50, "Máximo 50 caracteres permitidos *").email("No es un correo electrónico válido *").required("Correo electrónico obligatorio *"),
  telefono: yup.string().matches("^[2-8]{1}[1-9]{7}$", "Teléfono no válido *").max(8, "Teléfono no válido *").min(8, "Teléfono no válido *").required("Campo obligatorio *"),
  direccion: yup.string().max(150, "Máximo 150 caracteres permitidos *").required("Dirección obligatoria *"),
}).required();

const ModalComponent = ({ proveedores, color, setModal, abierto, proveedor, readonly }) => {

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(esquema) });
  const [cached, setCached] = useState(false);
  const history = useHistory();

  const routeContext = useContext(RouteContext);
  const { rutaActual } = routeContext;

  const nuevosCambios = () => { setCached(true); };
  const descartar = () => { cambiosNoGuardados(); };
  const toggle = () => { setModal((prevState) => !prevState); history.push("/lista/proveedores"); };

  // Función para agregar / actualizar un proveedor
  const guardar = async (data) => {
    setCached(false);  

    // Validar campos duplicados
    if (!validacionesDuplicados(data.nombreProveedor, data.cedulaJuridica, data.correoElectronico, data.telefono)) { return; }

    // Actualizar un proveedor
    if (proveedor.id) {
      const proveedorModificado = {
        id: 0,
        nombreProveedor: "",
        cedulaJuridica: 0,
        direccion: "",
        correoElectronico: "",
        telefono: 0,
      };
      
      // Almacenar la información del formulario
      proveedorModificado.id = proveedor.id;
      proveedorModificado.nombreProveedor = data.nombreProveedor;
      proveedorModificado.cedulaJuridica = data.cedulaJuridica;
      proveedorModificado.direccion = data.direccion;
      proveedorModificado.correoElectronico = data.correoElectronico;
      proveedorModificado.telefono = data.telefono;

      // Actualizar su regitro en la base de datos
      try {
        await Axios.patch("/api/proveedores", proveedorModificado);
        actualizarProveedor();
      } catch (error) {
        if (error.message === "Request failed with status code 409") {
          duplicadoGenerico();
        } else {
          errorGenerico();
        }
      }
    } else {
      // Agregar un proveedor
      const proveedorModificado = {
        id: 0,
        nombreProveedor: "",
        cedulaJuridica: 0,
        direccion: "",
        correoElectronico: "",
        telefono: 0,
      };

      // Almacenar la información del formulario
      proveedorModificado.id = proveedor.id;
      proveedorModificado.nombreProveedor = data.nombreProveedor;
      proveedorModificado.cedulaJuridica = data.cedulaJuridica;
      proveedorModificado.direccion = data.direccion;
      proveedorModificado.correoElectronico = data.correoElectronico;
      proveedorModificado.telefono = data.telefono;

      try {
        await Axios.post("/api/proveedores", proveedorModificado);
        agregarProveedor();
      } catch (error) {
        if (error.message === "Request failed with status code 409") {
          duplicadoGenerico();
        } else {
          errorGenerico();
        }
      }
    }
  };

  const validacionesDuplicados = (nombre, cedula, correo, telefono) => {
    if (proveedor.id) {
      const nombreDuplicado = proveedores.filter((p) => p.id !== proveedor.id && p.nombreProveedor === nombre.trimEnd());
      const cedulaDuplicada = proveedores.filter((p) => p.id !== proveedor.id && p.cedulaJuridica === cedula.trimEnd());
      const correoDuplicado = proveedores.filter((p) => p.id !== proveedor.id && p.correoElectronico === correo.trimEnd());
      const telefonoDuplicado = proveedores.filter((p) => p.id !== proveedor.id && p.telefono === telefono.trimEnd());
      if (nombreDuplicado.length && cedulaDuplicada.length && correoDuplicado.length && telefonoDuplicado.length) { duplicadoTotal(); return false; }

      // Duplicados triples
      if (nombreDuplicado.length && cedulaDuplicada.length && correoDuplicado.length) { duplicadoTriple('Nombre', 'cédula', 'correo electrónico'); return false; }
      if (nombreDuplicado.length && cedulaDuplicada.length && telefonoDuplicado.length) { duplicadoTriple('Nombre', 'cédula', 'teléfono'); return false; }
      if (cedulaDuplicada.length && correoDuplicado.length && telefonoDuplicado.length) { duplicadoTriple('Cédula', 'correo electrónico', 'teléfono'); return false; }
  
      // Duplicados doble
      if (nombreDuplicado.length && cedulaDuplicada.length) { duplicadoDoble('Nombre', 'cédula'); return false; }
      if (nombreDuplicado.length && correoDuplicado.length) { duplicadoDoble("Nombre", "correo electrónico"); return false; }
      if (nombreDuplicado.length && telefonoDuplicado.length) { duplicadoDoble("Nombre", "teléfono"); return false; }
      if (cedulaDuplicada.length && correoDuplicado.length) { duplicadoDoble("Cédula", "correo electrónico"); return false; }
      if (cedulaDuplicada.length && telefonoDuplicado.length) { duplicadoDoble("Cédula", "teléfono"); return false; }
      if (correoDuplicado.length && telefonoDuplicado.length) { duplicadoDoble("Correo electrónico", "teléfono"); return false; }

      // Duplicados simple
      if (nombreDuplicado.length) { duplicadoNombre(); return false; }
      if (cedulaDuplicada.length) { duplicadoCedula(); return false; }
      if (correoDuplicado.length) { duplicadoCorreo(); return false; }
      if (telefonoDuplicado.length) { duplicadoTelefono(); return false; }
    } else {
      const nombreDuplicado = proveedores.filter((p) => p.nombreProveedor === nombre.trimEnd());
      const cedulaDuplicada = proveedores.filter((p) => p.cedulaJuridica === cedula.trimEnd());
      const correoDuplicado = proveedores.filter((p) => p.correoElectronico === correo.trimEnd());
      const telefonoDuplicado = proveedores.filter((p) => p.telefono === telefono.trimEnd());

      if (nombreDuplicado.length && cedulaDuplicada.length && correoDuplicado.length && telefonoDuplicado.length) { duplicadoTotal(); return false; }

      // Duplicados triples
      if (nombreDuplicado.length && cedulaDuplicada.length && correoDuplicado.length) { duplicadoTriple('Nombre', 'cédula', 'correo electrónico'); return false; }
      if (nombreDuplicado.length && cedulaDuplicada.length && telefonoDuplicado.length) { duplicadoTriple('Nombre', 'cédula', 'teléfono'); return false; }
      if (cedulaDuplicada.length && correoDuplicado.length && telefonoDuplicado.length) { duplicadoTriple('Cédula', 'correo electrónico', 'teléfono'); return false; }
  
      // Duplicados doble
      if (nombreDuplicado.length && cedulaDuplicada.length) { duplicadoDoble('Nombre', 'cédula'); return false; }
      if (nombreDuplicado.length && correoDuplicado.length) { duplicadoDoble("Nombre", "correo electrónico"); return false; }
      if (nombreDuplicado.length && telefonoDuplicado.length) { duplicadoDoble("Nombre", "teléfono"); return false; }
      if (cedulaDuplicada.length && correoDuplicado.length) { duplicadoDoble("Cédula", "correo electrónico"); return false; }
      if (cedulaDuplicada.length && telefonoDuplicado.length) { duplicadoDoble("Cédula", "teléfono"); return false; }
      if (correoDuplicado.length && telefonoDuplicado.length) { duplicadoDoble("Correo electrónico", "teléfono"); return false; }

      // Duplicados simple
      if (nombreDuplicado.length) { duplicadoNombre(); return false; }
      if (cedulaDuplicada.length) { duplicadoCedula(); return false; }
      if (correoDuplicado.length) { duplicadoCorreo(); return false; }
      if (telefonoDuplicado.length) { duplicadoTelefono(); return false; }
    }
    return true;
  }

  const agregarProveedor = () => {
    rutaActual("/lista/proveedores");
    let timerInterval;
    Swal.fire({
      icon: "success",
      title: "Proveedor agregado con éxito",
      text: "Espere unos segundos",
      showConfirmButton: false,
      showCancelButton: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      timer: 1500,
      timerProgressBar: true,
      didOpen: () => { Swal.showLoading(); timerInterval = setInterval(() => {}, 100);
      },
      willClose: () => { clearInterval(timerInterval); toggle();  history.push("/iniciar-sesion");
      },
    });
  };

  const actualizarProveedor = () => {
    rutaActual("/lista/proveedores");
    let timerInterval;
    Swal.fire({
      icon: "success",
      title: "Preveedor actualizado con éxito",
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
  };

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

  const duplicadoTotal = () => {
    Swal.fire({
      icon: "info",
      title: "Información Duplicada",
      text: "El nombre, cédula jurídica, correo electrónico y teléfono del proveedor están duplicados.",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  const duplicadoGenerico = () => {
    Swal.fire({
      icon: "info",
      title: "Información Duplicada",
      text: "La información del proveedor no es única.",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  const duplicadoTriple = (primero, segundo, tercero) => {
    Swal.fire({
      icon: "info",
      title: "Información Duplicada",
      text: `${primero}, ${segundo} y ${tercero} del proveedor ya existe.`,
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  const duplicadoDoble = (primero, segundo) => {
    Swal.fire({
      icon: "info",
      title: "Información Duplicada",
      text: `${primero} y ${segundo} del proveedor ya existe.`,
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  const duplicadoNombre = () => {
    Swal.fire({
      icon: "info",
      title: "Información Duplicada",
      text: "El nombre del proveedor ya existe.",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  const duplicadoCedula = () => {
    Swal.fire({
      icon: "info",
      title: "Información Duplicada",
      text: "La cédula jurídica del proveedor ya existe.",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  const duplicadoCorreo = () => {
    Swal.fire({
      icon: "info",
      title: "Información Duplicada",
      text: "El correo electrónico del proveedor ya existe.",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  const duplicadoTelefono = () => {
    Swal.fire({
      icon: "info",
      title: "Información Duplicada",
      text: "El teléfono del proveedor ya existe.",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  const blockInvalidChar = e =>
    !['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace', 'Ctrl', 'a', 'z', 'x', 'c', 'A', 'Z', 'X', 'C', 'Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '.', ',']
    .includes(e.key) && e.preventDefault();

  return (
    <div>
      <Modal style={{ maxWidth: "1100px" }} isOpen={abierto} toggle={toggle} centered={true}>
  
        {/* Header */}
        <div className="modal__header">
          {cached ? (
            <button className="lnr lnr-cross modal__close-btn" onClick={descartar}/>
          ) : (
            <button className="lnr lnr-cross modal__close-btn" onClick={toggle}/>
          )}
          {readonly ? (
            <h3 className="modal__title text-uppercase">Ver Proveedor</h3>
          ) : Object.keys(proveedor).length !== 0 ? (
            <h3 className="modal__title text-uppercase">Editar Proveedor</h3>
          ) : (
            <h3 className="modal__title text-uppercase">Agregar Proveedor</h3>
          )}
        </div>

        {/* Body */}
        <div className="modal__body">
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit(guardar)} className="form form--horizontal">
  
                {/* Columna izquierda */}
                <Col md={6} className="mt-4">

                  {/* Nombre */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Nombre</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">{proveedor.nombreProveedor}</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="text"
                            name="nombreproveedor"
                            defaultValue={proveedor.nombreProveedor}
                            className={`${errors.nombreProveedor ? "danger" : ""}`}
                            placeholder="Nombre del proveedor"
                            {...register("nombreProveedor", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                          />
                          {errors.nombreProveedor && (
                            <span className="form__form-group-error">
                              {errors.nombreProveedor?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                
                  {/* Dirección */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Dirección</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">{proveedor.direccion}</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <textarea
                            type="text"
                            name="direccion"
                            defaultValue={proveedor.direccion}
                            className={`${errors.direccion ? "danger" : ""}`}
                            placeholder="Dirección del proveedor"
                            {...register("direccion", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                          />
                          {errors.direccion && (
                            <span className="form__form-group-error">
                              {errors.direccion?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Col>

                {/* Columna derecha*/}
                <Col md={6} className="mt-4">

                  {/* Cédula Jurídica */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Cédula Jurídica</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {proveedor.cedulaJuridica.split('')[0]}-{proveedor.cedulaJuridica.split('')[1]}
                          {proveedor.cedulaJuridica.split('')[2]}{proveedor.cedulaJuridica.split('')[3]}-
                          {proveedor.cedulaJuridica.split('')[4]}{proveedor.cedulaJuridica.split('')[5]}
                          {proveedor.cedulaJuridica.split('')[6]}{proveedor.cedulaJuridica.split('')[7]}
                          {proveedor.cedulaJuridica.split('')[8]}{proveedor.cedulaJuridica.split('')[9]}
                          </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="number"
                            name="cedulaJuridica"
                            defaultValue={proveedor.cedulaJuridica}
                            className={`${errors.cedulaJuridica ? "danger" : ""}`}
                            placeholder="Cédula Jurídica (xxxxxxxxxx)"
                            {...register("cedulaJuridica", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                            onKeyDown={blockInvalidChar}
                          />
                          {errors.cedulaJuridica && (
                            <span className="form__form-group-error">
                              {errors.cedulaJuridica?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                
                  {/* Correo Electrónico */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Correo Electrónico</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">{proveedor.correoElectronico}</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="text"
                            name="correoElectronico"
                            defaultValue={proveedor.correoElectronico}
                            className={`${errors.correoElectronico ? "danger" : ""}`}
                            placeholder="Correo Electrónico (xxx@xxx.xxx)"
                            {...register("correoElectronico", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
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

                  {/* Teléfono */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Teléfono</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {proveedor.telefono.split('')[0]}{proveedor.telefono.split('')[1]}{proveedor.telefono.split('')[2]}
                          {proveedor.telefono.split('')[3]}-{proveedor.telefono.split('')[4]}{proveedor.telefono.split('')[5]}
                          {proveedor.telefono.split('')[6]}{proveedor.telefono.split('')[7]}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="number"
                            name="telefono"
                            defaultValue={proveedor.telefono}
                            className={`${errors.telefono ? "danger" : ""}`}
                            placeholder="Teléfono (xxxxxxxx)"
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
                        <Button color={color} onClick={descartar}outline>Cerrar</Button>
                        <Button type="submit" color={color}>Guardar</Button>
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
