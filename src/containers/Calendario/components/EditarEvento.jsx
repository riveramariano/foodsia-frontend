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

// Esquema de validación del formulario de cliente
const esquema = yup.object().shape({
  motivo: yup.string().max(30, "El motivo no debe tener más de 30 caracteres.").required("Campo obligatorio *"),
  fechaEventoInicio: yup.string().nullable().required("Campo obligatorio *"),
  fechaEventoFin: yup.string().nullable().optional(),
  tipoEvento: yup.object().nullable().required("Campo obligatorio *"),
  empleado: yup.object().optional(),
}).required();

const ModalComponent = ({ evento, tiposEvento, empleados, abierto, readonly, setModal }) => {

  const { register, handleSubmit, formState: { errors }, control } = useForm({ resolver: yupResolver(esquema) });
  const [cached, setCached] = useState(false);
  const [mostrarEmpleado, setMostrarEmpleado] = useState(evento.tipoEvento ? evento.tipoEvento.label === "Ausencia Empleado" ? true : false : false);
  let [fechaEventoInicio] = useState("");
  let [fechaEventoFin] = useState("");
  const history = useHistory();

  const routeContext = useContext(RouteContext);
  const { rutaActual } = routeContext;

  const nuevosCambios = () => { setCached(true); };
  const descartar = () => { cambiosNoGuardados(); };
  const toggle = () => { setModal((prevState) => !prevState); }

  // Función para agregar / actualizar un evento
  const guardar = async (data) => {
    setCached(false);

    // Validaciones de datos antes de enviar al endpoint
    let { fechaEventoInicio, fechaEventoFin } = data;
    if (!fechaEventoFin) { data.fechaEventoFin = fechaEventoInicio; }
    if (moment(fechaEventoInicio).isAfter(fechaEventoFin, 'days')) { errorFechas(); return; }
    if (data.tipoEvento.label === "Ausencia Empleado") { if (!data.empleado) { errorEmpleado(); return; } } 
    if (data.tipoEvento.label === "Festividad") { data.empleado = null; } 

    // Actualizar evento
    if (evento.id) {

      const eventoModificado = {
        id: evento.id,
        motivo: data.motivo,
        fechaEventoInicio: moment(data.fechaEventoInicio).format("DD-MM-YY"),
        fechaEventoFin: moment(data.fechaEventoFin).format("DD-MM-YY"),
        tipoEventoId: data.tipoEvento.value,
        usuarioId: data.empleado ? data.empleado.value : null,
      };
      try {
        await Axios.patch("/api/eventos", eventoModificado);
        actualizarEvento();
      } catch { errorGenerico(); }

    } else { // Agregar evento

      const eventoModificado = {
        id: evento.id,
        motivo: data.motivo,
        fechaEventoInicio: moment(data.fechaEventoInicio).format("DD-MM-YY"),
        fechaEventoFin: moment(data.fechaEventoFin).format("DD-MM-YY"),
        tipoEventoId: data.tipoEvento.value,
        usuarioId: data.empleado ? data.empleado.value : null,
      };
      try {
        await Axios.post("/api/eventos", eventoModificado);
        agregarEvento();
      } catch { errorGenerico(); }
  
    }
  }

  // Función que retorna un evento de la base de datos
  const seleccionarEvento = async (data) => {
    const evento = await Axios.get(`/api/eventos/${data.id}/${data.start}/${data.end}`);
    return evento.data;
  };;

  const agregarEvento = () => {
    rutaActual("/calendario");
    let timerInterval;
    Swal.fire({
      icon: "success",
      title: "Evento agregado con éxito",
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

  const actualizarEvento = () => {
    rutaActual("/calendario");
    let timerInterval;
    Swal.fire({
      icon: "success",
      title: "Evento actualizado con éxito",
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

  // Funcionalidad para eliminar un evento de la bd
  const eliminarEvento = async (evento) => {
    rutaActual("/calendario");
    seleccionarEvento(evento).then((response) => {
      const { motivo } = response.evento;
      let timerInterval;
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: `¿Desea eliminar el evento ${motivo}?`,
        showCancelButton: true,
        confirmButtonColor: "#238484",
        cancelButtonColor: "#c5384b",
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            icon: "success",
            title: "Evento eliminado con éxito",
            text: "Espere unos segundos...",
            showCancelButton: false,
            showConfirmButton: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
            timerProgressBar: true,
            timer: 1500,
            didOpen: () => {
              Swal.showLoading();
              timerInterval = setInterval(() => {}, 100);
            },
            willClose: async () => {
              clearInterval(timerInterval);
              await Axios.delete(`/api/eventos/${evento.id}`);
              history.push("/iniciar-sesion");
            },
          });
        }
      });
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

  const errorFechas = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un Error",
      text: "La fecha de inicio no puede suceder luego de finalización",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  const errorEmpleado = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un Error",
      text: "No se seleccionó un empleado",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
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
  }

  if (evento.fechaEventoInicio && !readonly) {
    fechaEventoInicio = moment(evento.fechaEventoInicio).toDate();
  }
  if (evento.fechaEventoInicio && readonly) {
    fechaEventoInicio = moment(evento.fechaEventoInicio).format("DD-MM-YYYY");
  }
  if (evento.fechaEventoFin && !readonly) {
    fechaEventoFin = moment(evento.fechaEventoFin).toDate();
  }
  if (evento.fechaEventoFin&& readonly) {
    fechaEventoFin = moment(evento.fechaEventoFin).format("DD-MM-YYYY");
  }

  // Filtrar con dropdown de Cantones
  const filtroTipoEvento = (tipoEvento) => {
    setMostrarEmpleado(false);
    if (!tipoEvento) { return; }
    setMostrarEmpleado(tipoEvento.label === "Ausencia Empleado" ? true : false);
  }

  return (
    <div>
      <Modal style={{ maxWidth: "800px" }} isOpen={abierto} toggle={toggle} centered={true}>

        {/* Header */}
        <div className="modal__header">
          {cached ? (
            <button className="lnr lnr-cross modal__close-btn" onClick={descartar} />
          ) : (
            <button className="lnr lnr-cross modal__close-btn" onClick={toggle} />
          )}
          {readonly ? (
            <h3 className="modal__title text-uppercase">Ver Evento</h3>
          ) : Object.keys(evento).length !== 0 ? (
            <h3 className="modal__title text-uppercase">Editar Evento</h3>
          ) : (
            <h3 className="modal__title text-uppercase">Agregar Evento</h3>
          )}
        </div>

        <div className="modal__body">
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit(guardar)} className="form form--horizontal">

                {/* Columna izquierda */}
                <Col md={12}>
    
                  {/* Motivo */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Motivo</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">{evento.motivo}</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="text"
                            name="motivo"
                            defaultValue={evento.motivo}
                            className={`${errors.motivo ? "danger" : ""}`}
                            placeholder="Motivo del evento"
                            {...register("motivo", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                          />
                          {errors.motivo && (
                            <span className="form__form-group-error">
                              {errors.motivo?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tipo evento */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Tipo Evento</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {evento.tipoEvento.label}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <Controller
                            control={control}
                            name="tipoEvento"
                            defaultValue={evento.tipoEvento}
                            render={({ field }) => (
                              <Select
                                className="react-select"
                                onInputChange={nuevosCambios}
                                // eslint-disable-next-line no-sequences
                                onChange={(tipoEvento) => (field.onChange(tipoEvento), filtroTipoEvento(tipoEvento))}
                                options={tiposEvento}
                                value={field.value}
                                placeholder="Tipo de evento"
                                classNamePrefix="react-select"
                                isClearable={true}
                              />
                            )}
                          />
                          {errors.tipoEvento && (
                            <span className="form__form-group-error">
                              {errors.tipoEvento?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fecha inicio evento */}
                  <div className="form__form-group mt-1">
                    <span className="form__form-group-label">Fecha Inicio</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {fechaEventoInicio}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <div className="date-picker">
                            <Controller
                              control={control}
                              name="fechaEventoInicio"
                              defaultValue={evento.fechaEventoInicio ? fechaEventoInicio : ""}
                              render={({ field }) => (
                                <DatePicker
                                  placeholderText="Fecha de inicio"
                                  className={`${errors.fechaEventoInicio ? "danger" : ""}`}
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
                          {errors.fechaEventoInicio && (
                            <span className="form__form-group-error">
                              {errors.fechaEventoInicio?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fecha fin evento */}
                  <div className="form__form-group mt-1">
                    <span className="form__form-group-label">Fecha Finalización</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {fechaEventoFin}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <div className="date-picker">
                            <Controller
                              control={control}
                              name="fechaEventoFin"
                              defaultValue={evento.fechaEventoFin ? fechaEventoFin : ""}
                              render={({ field }) => (
                                <DatePicker
                                  placeholderText="Fecha de finalización"
                                  className={`${errors.fechaEventoFin ? "danger" : ""}`}
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
                          {errors.fechaEventoFin && (
                            <span className="form__form-group-error">
                              {errors.fechaEventoFin?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Empleado a nombre de ausencia */}
                  {mostrarEmpleado && !readonly && (
                    <div className="form__form-group">
                      <span className="form__form-group-label">Empleado</span>
                      <div className="form__form-group-field">
                        <div className="form__form-group-input-wrap">
                          <Controller
                            control={control}
                            name="empleado"
                            defaultValue={evento.empleado}
                            render={({ field }) => (
                              <Select
                                onInputChange={nuevosCambios}
                                onChange={(empleado) => field.onChange(empleado)}
                                defaultValue={evento.empleado}
                                options={empleados}
                                value={field.value}
                                className="react-select"
                                placeholder="Seleccione un empleado"
                                classNamePrefix="react-select"
                                isClearable={true}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}
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
                      <Fragment>
                        <Button color="secondary" onClick={toggle}>Cerrar</Button>
                      </Fragment>
                    ) }
                    {!readonly && evento.id && (<Button color="danger" onClick={() => eliminarEvento(evento)}>Eliminar</Button>)}
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
