import React, { Fragment, useState, useEffect, useContext } from "react";
import Axios from "../../../config/axios";
import { useHistory } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Button, ButtonToolbar, Modal, Card, CardBody, Col } from "reactstrap";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from "react-select";
import Swal from "sweetalert2";
import * as yup from "yup";
import RouteContext from "../../../context/routing/routeContext";

// Esquema de validación del formulario de cliente
const esquema = yup.object().shape({
  nombreReceta: yup.string().max(40, "El nombre de la receta no debe tener más de 40 caracteres.").required("Campo obligatorio *"),
  imagenReceta: yup.mixed().optional(),
  precio: yup.number().typeError("Campo obligatorio *").required("Campo obligatorio *").positive("El precio debe ser mayor a 0 *")
  .test(
    "decimales",
    "El precio de pago solo puede tener 2 decimales o menos *",
    (precio) => String(precio).match(/^\d+(\.\d{1,2})?$/)
  ).max(100000, "No se pueden agregar monto superiores a ₡100,000 *"),
  ingredientes: yup.string().optional(),
  humedad: yup.number().typeError("Campo obligatorio ").required("Campo obligatorio").min(0, "El porcentaje no puede ser un número negativo ").test("decimales",
    "La humedad solo puede tener 2 decimales o menos",
      (humedad) => String(humedad).match(/^\d+(.\d{1,2})?$/)
      ).max(100, "Porcentaje no válido *"),
  proteina: yup.number().typeError("Campo obligatorio ").required("Campo obligatorio").min(0, "El porcentaje no puede ser un número negativo ").test("decimales",
    "La proteína solo puede tener 2 decimales o menos",
      (proteina) => String(proteina).match(/^\d+(.\d{1,2})?$/)
      ).max(100, "Porcentaje no válido *"),
  grasaCruda: yup.number().typeError("Campo obligatorio ").required("Campo obligatorio").min(0, "El porcentaje no puede ser un número negativo ").test("decimales",
    "La grasa solo puede tener 2 decimales o menos",
      (grasaCruda) => String(grasaCruda).match(/^\d+(.\d{1,2})?$/)
      ).max(100, "Porcentaje no válido *"),
  fibraCruda: yup.number().typeError("Campo obligatorio ").required("Campo obligatorio").min(0, "El porcentaje no puede ser un número negativo ").test("decimales",
    "La fibra solo puede tener 2 decimales o menos",
      (fibraCruda) => String(fibraCruda).match(/^\d+(.\d{1,2})?$/)
      ).max(100, "Porcentaje no válido *"),
  tipoMascota: yup.object().required("Campo obligatorio *"),
  }).required();

const ModalComponent = ({ productos, color, setModal, abierto, receta, tiposMascota, readonly }) => {

  const { register, handleSubmit, formState: { errors }, control } = useForm({ resolver: yupResolver(esquema) });
  const [opcionesTipoMascota] = useState([]);
  const [cached, setCached] = useState(false);
  const [mostrandoImagen, setMostrandoImagen] = useState(false);
  const [mostrandoImagenTexto, setMostrandoImagenTexto] = useState('');
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
  const toggle = () => { setModal((prevState) => !prevState); history.push("/lista/recetas"); };
  const eliminarImagen = () => { receta.imagen = null; nuevosCambios(); }

  // Función para agregar / actualizar una receta
  const guardar = async (data) => {
    setCached(false);

    if (!mostrandoImagen) { data.imagenReceta = null; }
    if (data.ingredientes && data.ingredientes.length > 150) { errorLongitudIngredientes(); return; }

    // Validar campos duplicados
    if (!validacionesDuplicados(data.nombreReceta)) { return; }

    if (receta.id) {
      // Actualizar o Agregar una receta
      const recetaModificada = {
        id: 0,
        nombreReceta: "",
        precio: 0,
        ingredientes: "",
        humedad: 0,
        proteina: 0,
        grasaCruda: 0,
        fibraCruda: 0,
        tipoMascotaId: 0,
      };

      // Almacenar la información del formulario
      recetaModificada.id = receta.id;
      recetaModificada.nombreReceta = data.nombreReceta;
      recetaModificada.precio = data.precio;
      recetaModificada.ingredientes = data.ingredientes;
      recetaModificada.humedad = data.humedad;
      recetaModificada.proteina = data.proteina;
      recetaModificada.grasaCruda = data.grasaCruda;
      recetaModificada.fibraCruda = data.fibraCruda;
      recetaModificada.tipoMascotaId = data.tipoMascota.value;

      const formData = new FormData();
      data.imagenReceta ? formData.append("imagenReceta", data.imagenReceta[0]) : formData.append("imagenReceta", null); 

      // Actualizar su regitro en base de datos
      try {
        await Axios.patch("/api/recetas", recetaModificada);
        if (!receta.imagen) { await Axios.patch(`/api/imagenes/receta/${receta.id}`, formData); }
        actualizarReceta();
      } catch (error) {
        if (error.message === "Request failed with status code 409") {
          duplicado();
        } else {
          errorGenerico();
        }
      }
    } else {
      // Actualizar o Agregar una receta
      const recetaModificada = {
        nombreReceta: "",
        precio: 0,
        ingredientes: "",
        humedad: 0,
        proteina: 0,
        grasaCruda: 0,
        fibraCruda: 0,
        tipoMascotaId: 0,
      };

      // Almacenar la información del formulario
      recetaModificada.nombreReceta = data.nombreReceta;
      recetaModificada.precio = data.precio;
      recetaModificada.ingredientes = data.ingredientes;
      recetaModificada.humedad = data.humedad;
      recetaModificada.proteina = data.proteina;
      recetaModificada.grasaCruda = data.grasaCruda;
      recetaModificada.fibraCruda = data.fibraCruda;
      recetaModificada.tipoMascotaId = data.tipoMascota.value;

      const formData = new FormData();
      data.imagenReceta ? formData.append("imagenReceta", data.imagenReceta[0]) : formData.append("imagenReceta", null); 

      // Agregar su regitro a la base de datos
      try {
        await Axios.post("/api/recetas", recetaModificada);
        data.imagenReceta && await Axios.post("/api/imagenes/receta", formData);
        agregarReceta();
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
    if (receta.id) {
      const nombreDuplicado = productos.filter((r) => r.id !== receta.id && r.nombreProducto === nombre.trimEnd());
      if (nombreDuplicado.length) { duplicado(); return false; }
    } else {
      const nombreDuplicado = productos.filter((r) => r.nombreProducto === nombre.trimEnd());
      if (nombreDuplicado.length) { duplicado(); return false; }
    }
    return true;
  }

  const errorLongitudIngredientes = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un error",
      text: `Límite excedido, el máximo de caracteres permitidos para los ingredientes es de 150.`,
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };


  const agregarReceta = () => {
    rutaActual("/lista/recetas");
    let timerInterval;
    Swal.fire({
      icon: "success",
      title: "Receta agregada con éxito",
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

  const actualizarReceta = () => {
    rutaActual("/lista/recetas");
    let timerInterval;
    Swal.fire({
      icon: "success",
      title: "Receta actualizada con éxito",
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
      text: "Ese nombre ya pertecenece a una receta o juguete.",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  const fileValidation = () => {
    let fileInput = document.getElementById("imgReceta");
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
      return
    }
    let filePath = fileInput.value;
    let allowedExtensions = /(.jpg|.jpeg|.png)$/i;
    if (!allowedExtensions.exec(filePath)) {
      fileInput.value = '';
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
  }
  
  const eliminarImagenEditar = () => {
    setMostrandoImagenTexto('');
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
          {cached ?( 
            <button className="lnr lnr-cross modal__close-btn" onClick={descartar}/>
          ) : (
            <button className="lnr lnr-cross modal__close-btn" onClick={toggle}/>
          )}
          {readonly ? (
            <h3 className="modal__title text-uppercase">Ver Receta</h3>
          ) : Object.keys(receta).length !== 0 ? (
            <h3 className="modal__title text-uppercase">Editar Receta</h3>
          ) : (
            <h3 className="modal__title text-uppercase">Agregar Receta</h3>
          )}
        </div>

        {/* Body */}
        <div className="modal__body">
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit(guardar)} className="form form--horizontal">
  
                {/* Columna izquierda */}

                {/* Ver Receta */}
                <Col md={5}>
                  {readonly ? receta.imagen ? (
                    <div className="form__form-group mb-5">
                      <div className="square mb-4">
                        <div className="content">
                          <img src={`${process.env.REACT_APP_BACKEND_URL}/static/${receta.imagen}`} alt="img-receta" />
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

                  {/* Editar / Agregar Receta */}
                  {!readonly ? receta.imagen ? (
                    <div className="form__form-group mb-5">
                      <div className="square mb-4">
                        <div className="content">
                          <img src={`${process.env.REACT_APP_BACKEND_URL}/static/${receta.imagen}`} alt="img-receta" />
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
                              id="imgReceta"
                              type="file"
                              name="imagenReceta"
                              {...register("imagenReceta", {
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
                        <span className="text-secondary">{receta.nombreProducto}</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="text"
                            name="nombreReceta"
                            defaultValue={receta.nombreProducto}
                            className={`${errors.nombreReceta ? "danger" : ""}`}
                            placeholder="Nombre de la receta"
                            {...register("nombreReceta", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                          />
                          {errors.nombreReceta && (
                            <span className="form__form-group-error">
                              {errors.nombreReceta?.message}
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
                        <span className="text-secondary">₡ {receta.precio}</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="number"
                            min={0}
                            step="any"
                            name="precio"
                            defaultValue={receta.precio}
                            className={`${errors.precio ? "danger" : ""}`}
                            placeholder="Precio de la receta"
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
                          {receta.tipoMascota.label}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <Controller
                            control={control}
                            name="tipoMascota"
                            defaultValue={receta.tipoMascota}
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

                </Col>

                {/* Lado izquierdo, debajo de la imagen */}
                <Col md={5}>

                  {/* Porcentaje de humedad */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Humedad</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">{receta.humedad} %</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="number"
                            name="humedad"
                            defaultValue={receta.humedad}
                            className={`${errors.humedad ? "danger" : ""}`}
                            placeholder="Porcentaje de húmedad"
                            {...register("humedad", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                            onKeyDown={blockInvalidChar}
                          />
                          {errors.humedad && (
                            <span className="form__form-group-error">
                              {errors.humedad?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Porcentaje de proteína */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Proteína</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">{receta.proteina} %</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="number"
                            name="proteina"
                            defaultValue={receta.proteina}
                            className={`${errors.proteina ? "danger" : ""}`}
                            placeholder="Porcentaje de proteína"
                            {...register("proteina", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                            onKeyDown={blockInvalidChar}
                          />
                          {errors.proteina && (
                            <span className="form__form-group-error">
                              {errors.proteina?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Porcentaje de grasa cruda */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Grasa Cruda</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">{receta.grasaCruda} %</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="number"
                            name="grasaCruda"
                            defaultValue={receta.grasaCruda}
                            className={`${errors.grasaCruda ? "danger" : ""}`}
                            placeholder="Porcentaje de grasa cruda"
                            {...register("grasaCruda", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                            onKeyDown={blockInvalidChar}
                          />
                          {errors.grasaCruda && (
                            <span className="form__form-group-error">
                              {errors.grasaCruda?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Porcentaje de fibra cruda */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Fibra Cruda</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">{receta.fibraCruda} %</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="number"
                            name="fibraCruda"
                            defaultValue={receta.fibraCruda}
                            className={`${errors.fibraCruda ? "danger" : ""}`}
                            placeholder="Porcentaje de fibra cruda"
                            {...register("fibraCruda", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                            onKeyDown={blockInvalidChar}
                          />
                          {errors.fibraCruda && (
                            <span className="form__form-group-error">
                              {errors.fibraCruda?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </Col>

                {/* Lado derecho debajo del nombre de la receta */}
                <Col md={7}>
                
                  {/* Lista de Ingredientes */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Ingredientes</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">{receta.material}</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <textarea
                            type="text"
                            name="ingredientes"
                            defaultValue={receta.material}
                            placeholder="Lista de ingredientes de la receta"
                            {...register("ingredientes", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                          />
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
