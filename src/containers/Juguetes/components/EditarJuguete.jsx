import React, { Fragment, useState, useEffect, useContext } from "react";
import Axios from "../../../config/axios";
import { useForm, Controller } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from "react-select";
import Swal from "sweetalert2";
import * as yup from "yup";
import RouteContext from "../../../context/routing/routeContext";
import { Button, ButtonToolbar, Modal, Card, CardBody, Col } from "reactstrap";

// Esquema de validación del formulario de cliente
const esquema = yup.object().shape({
  nombreJuguete: yup.string().max(40, "El nombre no debe tener más de 40 caracteres.").required("Campo obligatorio *"),
  imagenJuguete: yup.mixed().optional(),
  precio: yup.number().typeError("Campo obligatorio *").required("Campo obligatorio *").positive("El precio debe ser mayor a 0 *")
  .test(
    "decimales",
    "El precio de pago solo puede tener 2 decimales o menos *",
    (precio) => String(precio).match(/^\d+(\.\d{1,2})?$/)
  ).max(100000, "No se pueden agregar monto superiores a ₡100,000 *"),
  material: yup.string().max(150, "Máximo 150 caracteres permitidos *").required("Campo obligatorio *"),
  tipoMascota: yup.object().nullable().required("Campo obligatorio *"),
}).required();

const ModalComponent = ({ juguetes, color, readonly, abierto, setModal, juguete, tiposMascota }) => {

  const { register, handleSubmit, formState: { errors }, control } = useForm({ resolver: yupResolver(esquema) });
  const [opcionesTipoMascota] = useState([]);
  const [cached, setCached] = useState(false);
  const [mostrandoImagen, setMostrandoImagen] = useState(false);
  const [mostrandoImagenTexto, setMostrandoImagenTexto] = useState("");
  const history = useHistory();

  const routeContext = useContext(RouteContext);
  const { rutaActual } = routeContext;

  // Convierte el arreglo de tipo mascota en un arreglo entendible para la librería react-select
  useEffect(() => {
    const realizarPeticiones = () => {
      for (const tipoMascota of tiposMascota) {
        opcionesTipoMascota.push({ value: tipoMascota.id, label: tipoMascota.nombreTipoMascota }); 
      }
    }
    realizarPeticiones();
  }, [opcionesTipoMascota, tiposMascota]);
  
  const nuevosCambios = () => { setCached(true); };
  const descartar = () => { cambiosNoGuardados(); };
  const toggle = () => { setModal((prevState) => !prevState); history.push("/lista/juguetes"); };  
  const eliminarImagen = () => { juguete.imagen = null; nuevosCambios(); }

  // Función para agregar / actualizar un juguete
  const guardar = async (data) => {
    setCached(false);

    if (!mostrandoImagen) { data.imagenReceta = null; }

    // Validar campos duplicados
    if (!validacionesDuplicados(data.nombreJuguete)) { return; }

    if (juguete.id) {
      // Actualizar o Agregar una juguete
      const jugueteModificado = {
        id: 0,
        nombreJuguete: "",
        precio: 0,
        material: "",
        tipoMascotaId: 0,
      };

      // Almacenar la información del formulario
      jugueteModificado.id = juguete.id;
      jugueteModificado.nombreJuguete = data.nombreJuguete;
      jugueteModificado.precio = data.precio;
      jugueteModificado.material = data.material;
      jugueteModificado.tipoMascotaId = data.tipoMascota.value;

      const formData = new FormData();
      data.imagenJuguete ? formData.append("imagenJuguete", data.imagenJuguete[0]) : formData.append("imagenJuguete", null);

      // Actualizar su regitro en base de datos
      try {
        await Axios.patch("/api/juguetes", jugueteModificado);
        if (!juguete.imagen) { await Axios.patch(`/api/imagenes/juguete/${juguete.id}`, formData); }
        actualizarJuguete();
      } catch (error) {
        if(data.nombreJuguete.length > 75 || data.material.length > 150){
          errorLongitudExcedida();
        } else if (error.message === "Request failed with status code 409") {
          duplicado();
        } else {
          errorGenerico();
        }
      }
    } else {
      // Actualizar o Agregar una juguete
      const jugueteModificado = {
        nombreJuguete: "",
        precio: 0,
        material: "",
        tipoMascotaId: 0,
      };

      // Almacenar la información del formulario
      jugueteModificado.nombreJuguete = data.nombreJuguete;
      jugueteModificado.precio = data.precio;
      jugueteModificado.material = data.material;
      jugueteModificado.tipoMascotaId = data.tipoMascota.value;

      const formData = new FormData();
      data.imagenJuguete ? formData.append("imagenJuguete", data.imagenJuguete[0]) : formData.append("imagenJuguete", null);

      // Agregar su regitro a la base de datos
      try {
        await Axios.post("/api/juguetes", jugueteModificado);
        data.imagenJuguete && await Axios.post("/api/imagenes/juguete", formData);
        agregarJuguete();
      } catch (error) {
        if (error.message === "Request failed with status code 409") {
          duplicado();
        } else {
          errorGenerico();
        }
      }
    }
  };

  const validacionesDuplicados = (nombre) => {
    if (juguete.id) {
      const nombreDuplicado = juguetes.filter((j) => j.id !== juguete.id && j.nombreProducto === nombre.trimEnd());
      if (nombreDuplicado.length) { duplicado(); return false; }
    } else {
      const nombreDuplicado = juguetes.filter((j) => j.nombreProducto === nombre.trimEnd());
      if (nombreDuplicado.length) { duplicado(); return false; }
    }
    return true;
  }

  const agregarJuguete = () => {
    rutaActual("/lista/juguetes");
    let timerInterval;
    Swal.fire({
      icon: "success",
      title: "Juguete agregado con éxito",
      text: "Espere unos segundos",
      showConfirmButton: false,
      showCancelButton: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      timer: 1500,
      timerProgressBar: true,
      didOpen: () => { Swal.showLoading(); timerInterval = setInterval(() => {}, 100); },
      willClose: () => { clearInterval(timerInterval); toggle();  history.push("/iniciar-sesion"); },
    });
  };

  const actualizarJuguete = () => {
    rutaActual("/lista/juguetes");
    let timerInterval;
    Swal.fire({
      icon: "success",
      title: "Juguete actualizado con éxito",
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

  const duplicado = () => {
    Swal.fire({
      icon: "info",
      title: "Información Duplicada",
      text: "El nombre del juguete ya existe.",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  const errorLongitudExcedida = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un Error",
      text: "El motivo no puede tener más de 100 caracteres",
      showCancelButton: true,
      confirmButtonColor: "#238484",
      cancelButtonColor: "#c5384b",
      confirmButtonText: "Confirmar",      
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => { if (result.isConfirmed) { toggle(); } 
  });
  };

  const fileValidation = () => {
    let fileInput = document.getElementById("imgJuguete");
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
            <h3 className="modal__title text-uppercase">Ver Juguete</h3>
          ) : Object.keys(juguete).length !== 0 ? (
            <h3 className="modal__title text-uppercase">Editar Juguete</h3>
          ) : (
            <h3 className="modal__title text-uppercase">Agregar Juguete</h3>
          )}
        </div>

        {/* Body */}
        <div className="modal__body">
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit(guardar)} className="form form--horizontal">
  
                {/* Columna izquierda */}

                {/* Ver Juguete */}
                <Col md={5}>                
                {readonly ? juguete.imagen ? (
                    <div className="form__form-group mb-5">
                      <div className="square mb-4">
                        <div className="content">
                          <img src={`${process.env.REACT_APP_BACKEND_URL}/static/${juguete.imagen}`} alt="img-juguete" />
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

                  {/* Editar / Agregar Juguete */}
                  {!readonly ? juguete.imagen ? (
                    <div className="form__form-group mb-5">
                      <div className="square mb-4">
                        <div className="content">
                          <img src={`${process.env.REACT_APP_BACKEND_URL}/static/${juguete.imagen}`} alt="img-juguete" />
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
                              id="imgJuguete"
                              type="file"
                              name="imagenJuguete"
                              {...register("imagenJuguete", {
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
                        <span className="text-secondary">{juguete.nombreProducto}</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="text"
                            name="nombreJuguete"
                            defaultValue={juguete.nombreProducto}
                            className={`${errors.nombreJuguete ? "danger" : ""}`}
                            placeholder="Nombre del juguete"
                            {...register("nombreJuguete", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                          />
                          {errors.nombreJuguete && (
                            <span className="form__form-group-error">
                              {errors.nombreJuguete?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Precio */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Precio</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">₡ {juguete.precio}</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="number"
                            min={0}
                            step="any"
                            name="precio"
                            defaultValue={juguete.precio}
                            className={`${errors.precio ? "danger" : ""}`}
                            placeholder="Precio del juguete"
                            {...register("precio", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                            onKeyDown={blockInvalidChar}
                          />
                          {errors.precio && (
                            <span className="form__form-group-error">
                              {errors.precio?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tipo de mascota consumidora */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Tipo Mascota</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {juguete.tipoMascota.label}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <Controller
                            control={control}
                            name="tipoMascota"
                            defaultValue={juguete.tipoMascota}
                            render={({ field }) => (
                              <Select
                                className="react-select"
                                onInputChange={nuevosCambios}
                                onChange={(tipoMascota) => field.onChange(tipoMascota)}
                                options={opcionesTipoMascota}
                                value={field.value}
                                placeholder="Tipo de mascota"
                                classNamePrefix="react-select"
                                isClearable
                              />
                            )}
                          />
                          {errors.tipoMascota && (
                            <span className="form__form-group-error">
                              {errors.tipoMascota?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Material del Juguete */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Materiales</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">{juguete.material}</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <textarea
                            type="text"
                            name="material"
                            defaultValue={juguete.material}
                            className={`${errors.material ? "danger" : ""}`}
                            placeholder="Lista de materiales del juguete"
                            {...register("material", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                          />
                          {errors.material && (
                            <span className="form__form-group-error">
                              {errors.material?.message}
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
