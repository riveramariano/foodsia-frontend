import React, { Fragment, useState, useContext } from "react";
import { Button, ButtonToolbar, Modal, Card, CardBody, Col } from "reactstrap";
import Axios from "../../../config/axios";
import { useForm, Controller } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from "react-select";
import Swal from "sweetalert2";
import * as yup from "yup";
import RouteContext from "../../../context/routing/routeContext";

// Esquema de validación del formulario de cliente
const esquema = yup.object().shape({
  nombreIngrediente: yup.string().max(50, "El nombre no puede tener más de 50 caracteres *").required("Campo obligatorio *"),
  imagenIngrediente: yup.mixed().optional(),
  precioUnitario: yup.number().typeError("Campo obligatorio *").required("Campo obligatorio *").positive("El precio debe ser mayor a 0 *")
    .test(
      "decimales",
      "El precio unitario solo puede tener 2 decimales o menos *",
      (precioUnitario) => String(precioUnitario).match(/^\d+(\.\d{1,2})?$/)
    ).max(100000, "No se pueden agregar monto superiores a ₡100,000 *"),
  cantidadReserva: yup.number().typeError("Campo obligatorio *").required("Campo obligatorio *")
    .positive("Cantidad no válida *").max(100, "La cantidad de unidades no puede ser mayor a 100 *")
    .test(
      "numeroEntero",
      "La cantidad de unidades debe ser un numero entero *",
      (cantidadReserva) => Number.isInteger(cantidadReserva)
    ),
  unidad: yup.object().nullable().required("Campo obligatorio *"),
  proveedor: yup.object().nullable().required("Campo obligatorio *"),
}).required();

const ModalComponent = ({ ingredientes, ingrediente, unidades, proveedores, abierto, readonly, setModal }) => {

  const { register, handleSubmit, formState: { errors }, control } = useForm({ resolver: yupResolver(esquema) });
  const [cached, setCached] = useState(false);
  const [mostrandoImagen, setMostrandoImagen] = useState(false);
  const [mostrandoImagenTexto, setMostrandoImagenTexto] = useState("");
  const history = useHistory();

  const routeContext = useContext(RouteContext);
  const { rutaActual } = routeContext;

  const nuevosCambios = () => { setCached(true); };
  const descartar = () => { cambiosNoGuardados(); };
  const toggle = () => { setModal((prevState) => !prevState); history.push("/lista/ingredientes"); };
  const eliminarImagen = () => { ingrediente.imagen = null; nuevosCambios(); }

  // Función para agregar / actualizar un ingrediente
  const guardar = async (data) => {
    setCached(false);

    if (!mostrandoImagen) { data.imagenIngrediente = null; }

    // Validar campos duplicados
    if (!validacionesDuplicados(data.nombreIngrediente)) { return; }

    if (ingrediente.id) {
      // Actualizar o Agregar un ingrediente
      const ingredienteModificado = {
        id: 0,
        nombreIngrediente: "",
        precioUnitario: 0,
        cantidadReserva: 0,
        proveedorId: data.proveedor.value,
        unidadId: data.unidad.value,
      };

      // Almacenar la información del formulario
      ingredienteModificado.id = ingrediente.id;
      ingredienteModificado.nombreIngrediente = data.nombreIngrediente;
      ingredienteModificado.precioUnitario = data.precioUnitario;
      ingredienteModificado.cantidadReserva = data.cantidadReserva;
      ingredienteModificado.proveedorId = data.proveedor.value;
      ingredienteModificado.unidadId = data.unidad.value;

      const formData = new FormData();
      data.imagenIngrediente ? formData.append("imagenIngrediente", data.imagenIngrediente[0]) : formData.append("imagenIngrediente", null);

      try {
        await Axios.patch("/api/ingredientes", ingredienteModificado);
        if (!ingrediente.imagen) { await Axios.patch(`/api/imagenes/ingrediente/${ingrediente.id}`, formData); }
        actualizarIngrediente();
      } catch (error) {
        if (error.message === "Request failed with status code 409") {
          duplicado();
        } else {
          errorGenerico();
        }
      }
    } else { // Agregar ingrediente

      const ingredienteModificado = {
        nombreIngrediente: data.nombreIngrediente,
        precioUnitario: data.precioUnitario,
        cantidadReserva: data.cantidadReserva,
        proveedorId: data.proveedor.value,
        unidadId: data.unidad.value,
      };

      const formData = new FormData();
      data.imagenIngrediente ? formData.append("imagenIngrediente", data.imagenIngrediente[0]) : formData.append("imagenIngrediente", null);

      try {
        await Axios.post("/api/ingredientes", ingredienteModificado);
        data.imagenIngrediente && await Axios.post("/api/imagenes/ingrediente", formData);
        agregarIngrediente();
      } catch (error) {
        if (error.message === "Request failed with status code 409") {
          duplicado();
        } else {
          errorGenerico();
        }
      }
    }
  }

  const validacionesDuplicados = (nombre) => {
    if (ingrediente.id) {
      const nombreDuplicado = ingredientes.filter((i) => i.id !== ingrediente.id && i.nombreIngrediente === nombre.trimEnd());
      if (nombreDuplicado.length) { duplicado(); return false; }
    } else {
      const nombreDuplicado = ingredientes.filter((i) => i.nombreIngrediente === nombre.trimEnd());
      if (nombreDuplicado.length) { duplicado(); return false; }
    }
    return true;
  }

  const agregarIngrediente = () => {
    rutaActual("/lista/ingredientes");
    let timerInterval;
    Swal.fire({
      icon: "success",
      title: "Ingrediente agregado con éxito",
      text: "Espere unos segundos",
      showConfirmButton: false,
      showCancelButton: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      timer: 1500,
      timerProgressBar: true,
      didOpen: () => { Swal.showLoading(); timerInterval = setInterval(() => {}, 100); },
      willClose: () => { clearInterval(timerInterval); toggle(); history.push("/iniciar-sesion"); },
    });
  };

  const actualizarIngrediente = () => {
    rutaActual("/lista/ingredientes");
    let timerInterval;
    Swal.fire({
      icon: "success",
      title: "Ingrediente actualizado con éxito",
      text: "Espere unos segundos",
      showConfirmButton: false,
      showCancelButton: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      timer: 1500,
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

  const duplicado = () => {
    Swal.fire({
      icon: "info",
      title: "Información Duplicada",
      text: "El nombre del ingrediente ya existe.",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  const fileValidation = () => {
    let fileInput = document.getElementById("imgIngrediente");
    if (fileInput.value && fileInput.value.length > 100) {
      fileInput.value = "";
      Swal.fire({
        icon: "error",
        title: "Error Imagen",
        text: "El nombre de la imagen es muy largo.",
        showCancelButton: false,
        confirmButtonColor: "#238484",
        confirmButtonText: "Confirmar",
      });
      return;
    }
    let filePath = fileInput.value;
    let allowedExtensions = /(.jpg|.jpeg|.png)$/i;
    if (!allowedExtensions.exec(filePath)) {
      fileInput.value = "";
      Swal.fire({
        icon: "error",
        title: "Error Imagen",
        text: "Únicamente se permiten imágenes con las extensiones jpg, jpeg o png.",
        showCancelButton: false,
        confirmButtonColor: "#238484",
        confirmButtonText: "Confirmar",
      });
    } else {
      if (fileInput.files && fileInput.files[0]) {
        let size = fileInput.files[0].size;
        if (size > 1000000) {
          fileInput.value = "";
          Swal.fire({
            icon: "error",
            title: "Error Imagen",
            text: "Únicamente se permiten imágenes que pesen menos de un 1MB.",
            showCancelButton: false,
            confirmButtonColor: "#238484",
            confirmButtonText: "Confirmar",
          });
          return;
        }
      }
      setCached(true);
      setMostrandoImagenTexto(fileInput.value);
      setMostrandoImagen(true);
    }
  };

  const eliminarImagenEditar = () => {
    setMostrandoImagenTexto("");
    setMostrandoImagen(false);
  };

  const blockInvalidChar = e =>
    !['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace', 'Ctrl', 'a', 'z', 'x', 'c', 'A', 'Z', 'X', 'C', 'Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '.', ',']
    .includes(e.key) && e.preventDefault();

  const blockInvalidChar2 = e =>
    !['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace', 'Ctrl', 'a', 'z', 'x', 'c', 'A', 'Z', 'X', 'C', 'Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']
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
            <h3 className="modal__title text-uppercase">Ver Ingrediente</h3>
          ) : Object.keys(ingrediente).length !== 0 ? (
            <h3 className="modal__title text-uppercase">Editar Ingrediente</h3>
          ) : (
            <h3 className="modal__title text-uppercase">Agregar Ingrediente</h3>
          )}
        </div>

        {/* Body */}
        <div className="modal__body">
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit(guardar)} className="form form--horizontal">
  
                {/* Columna izquierda */}

                {/* Ver Ingrediente */}
                <Col md={5}>
                  {readonly ? ingrediente.imagen ? (
                    <div className="form__form-group mb-5">
                      <div className="square mb-4">
                        <div className="content">
                          <img src={`${process.env.REACT_APP_BACKEND_URL}/static/${ingrediente.imagen}`} alt="img-ingrediente" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="form__form-group mb-5">
                      <div className="square">
                        <div className="content">
                        </div>
                      </div>
                    </div>
                  ) : ""}

                  {/* Editar / Agregar Ingrediente */}
                  {!readonly ? ingrediente.imagen ? (
                    <div className="form__form-group mb-5">
                      <div className="square mb-4">
                        <div className="content">
                          <img src={`${process.env.REACT_APP_BACKEND_URL}/static/${ingrediente.imagen}`} alt="img-receta" />
                          <h5 className="delete-pet text-center mt-2" onClick={() => eliminarImagen()}>
                            <span className="lnr lnr-circle-minus mr-2"></span>Eliminar Imagen
                          </h5>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`form__form-group ${!mostrandoImagen && 'mb-5'}`}>
                      <div className="square">
                        <div className="content">
                          <label className="custom-file-upload btn-bwm">
                            <input
                              id="imgIngrediente"
                              type="file"
                              name="imagenIngrediente"
                              {...register("imagenIngrediente", {
                                required: true,
                                onChange: () => fileValidation(),
                              })}
                            />
                            Subir Imagen
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : ""}
                  {mostrandoImagen && 
                    <Fragment>
                      <p className="text-center">{mostrandoImagenTexto}</p>
                      <h5 className="delete-pet text-center mt-2 mb-4" onClick={() => eliminarImagenEditar()}>
                        <span className="lnr lnr-circle-minus mr-2"></span>Eliminar Imagen
                      </h5>
                    </Fragment>}
                </Col>
  
                {/* Columna derecha */}
                <Col md={7} className="mt-4">

                  {/* Nombre  */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Nombre</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">{ingrediente.nombreIngrediente}</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="text"
                            name="nombreIngrediente"
                            defaultValue={ingrediente.nombreIngrediente}
                            className={`${errors.nombreIngrediente ? "danger" : ""}`}
                            placeholder="Nombre del ingrediente"
                            {...register("nombreIngrediente", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                          />
                          {errors.nombreIngrediente && (
                            <span className="form__form-group-error">
                              {errors.nombreIngrediente?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Precio */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Precio Unitario</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">₡ {ingrediente.precioUnitario}</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="number"
                            min={0}
                            step="any"
                            name="precioUnitario"
                            defaultValue={ingrediente.precioUnitario}
                            className={`${errors.precioUnitario ? "danger" : ""}`}
                            placeholder="Precio del ingrediente"
                            {...register("precioUnitario", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                            onKeyDown={blockInvalidChar}
                          />
                          {errors.precioUnitario && (
                            <span className="form__form-group-error">
                              {errors.precioUnitario?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cantidad en reserva */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Cantidad en Reserva</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">{ingrediente.cantidadReserva} unidades</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="number"
                            name="cantidadReserva"
                            defaultValue={ingrediente.cantidadReserva}
                            className={`${errors.cantidadReserva ? "danger" : ""}`}
                            placeholder="Cantidad en reserva"
                            {...register("cantidadReserva", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                            onKeyDown={blockInvalidChar2}
                          />
                          {errors.cantidadReserva && (
                            <span className="form__form-group-error">
                              {errors.cantidadReserva?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Unidad del ingrediente */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Unidad</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">{ingrediente.unidad.label}</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <Controller
                            control={control}
                            name="unidad"
                            defaultValue={ingrediente.unidad}
                            render={({ field }) => (
                              <Select
                                className="react-select"
                                onInputChange={nuevosCambios}
                                onChange={(unidad) => field.onChange(unidad)}
                                options={unidades}
                                value={field.value}
                                placeholder="Unidad del ingrediente"
                                classNamePrefix="react-select"
                                isClearable={true}
                              />
                            )}
                          />
                          {errors.unidad && (
                            <span className="form__form-group-error">
                              {errors.unidad?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Proveedor */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Proveedor</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {ingrediente.proveedor.label}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <Controller
                            control={control}
                            name="proveedor"
                            defaultValue={ingrediente.proveedor}
                            render={({ field }) => (
                              <Select
                                className="react-select"
                                onInputChange={nuevosCambios}
                                onChange={(proveedor) => field.onChange(proveedor)}
                                options={proveedores}
                                value={field.value}
                                placeholder="Proveedor"
                                classNamePrefix="react-select"
                                isClearable={true}
                              />
                            )}
                          />
                          {errors.proveedor && (
                            <span className="form__form-group-error">
                              {errors.proveedor?.message}
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
