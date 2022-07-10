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

const esquema = yup.object().shape({
  empleado: yup.object().nullable().required("Campo obligatorio *"),
  fechaPago: yup.string().nullable().required("Campo obligatorio *"),
  monto: yup.number().typeError("Campo obligatorio *").required("Campo obligatorio *").positive("El monto debe ser mayor a 0 *")
  .test(
    "decimales",
    "El monto de pago solo puede tener 2 decimales o menos *",
    (monto) => String(monto).match(/^\d+(\.\d{1,2})?$/)
  ).max(10000001, "No se pueden agragar pagos superiores a ₡10 millones *"),
}).required();

const ModalComponent = ({ pagoEmpleado, empleados, abierto, readonly, setModal}) => {

  const { register, handleSubmit, formState: { errors }, control } = useForm({ resolver: yupResolver(esquema) });
  const [cached, setCached] = useState(false);
  const history = useHistory();

  let [fechaPago] = useState("");

  const routeContext = useContext(RouteContext);
  const { rutaActual } = routeContext;

  const nuevosCambios = () => { setCached(true); };
  const descartar = () => { cambiosNoGuardados(); };
  const toggle = () => { setModal((prevState) => !prevState); history.push("/lista/pagos-empleados"); };

  const guardar = async (data) => {
    setCached(false);

    // Actualizar el pago empleado
    if (pagoEmpleado.id) {
      const modificarPagoEmpleado = {       
        id: pagoEmpleado.id,
        usuarioId: data.empleado.value,
        monto: data.monto,
        fechaPago: moment(data.fechaPago).format("DD-MM-YYYY"),
      };
      try {
        await Axios.patch("/api/pagoEmpleados/", modificarPagoEmpleado);
        actualizarPagoEmpleado();
      } catch {
        errorGenerico();
      }
    } else {

      // Agregar un nuevo pago empleado
      const nuevoPagoEmpleado = {
        usuarioId: data.empleado.value,
        monto: data.monto,
        fechaPago: moment(data.fechaPago).format("DD-MM-YYYY"),
      };
      try {
        await Axios.post("/api/pagoEmpleados/", nuevoPagoEmpleado);
        agregarPagoEmpleado();
      } catch {
        errorGenerico();
      }
    }
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
    }).then((result) => {
      if (result.isConfirmed) {
        toggle();
      }
    });
  };

  const agregarPagoEmpleado = () => {
    rutaActual("/lista/pagos-empleados");
    let timerInterval;
    Swal.fire({
      icon: "success",
      title: "Pago agregado con éxito",
      text: "Espere unos segundos",
      showConfirmButton: false,
      showCancelButton: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      timer: 1000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        timerInterval = setInterval(() => {}, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
        toggle();
        history.push("/iniciar-sesion");
      },
    });
  };

  const actualizarPagoEmpleado = () => {
    rutaActual("/lista/pagos-empleados");
    let timerInterval;
    Swal.fire({
      icon: "success",
      title: "Pago actualizado con éxito",
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

  if (pagoEmpleado.fechaPago) {
    const fechaFormateada = pagoEmpleado.fechaPago.replace(/(\d+[/])(\d+[/])/, "$2$1");
    fechaPago = new Date(fechaFormateada);
  }

  const blockInvalidChar = e =>
    !['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace', 'Ctrl', 'a', 'z', 'x', 'c', 'A', 'Z', 'X', 'C', 'Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '.', ',']
    .includes(e.key) && e.preventDefault();

  return (
    <div>
      <Modal style={{ maxWidth: "650px" }} isOpen={abierto} toggle={toggle} centered={true}>

        {/* Header */}
        <div className="modal__header">
          {cached ? (
            <button className="lnr lnr-cross modal__close-btn" onClick={descartar}/>
          ) : (
            <button className="lnr lnr-cross modal__close-btn" onClick={toggle}/>
          )}
          {readonly ? (
            <h3 className="modal__title text-uppercase">Ver Pago Empleado</h3>
          ) : Object.keys(pagoEmpleado).length !== 0 ? (
            <h3 className="modal__title text-uppercase">Editar Pago Empleado</h3>
          ) : (
            <h3 className="modal__title text-uppercase">Agregar Pago Empleado</h3>
          )}
        </div>

        {/* Body */}
        <div className="modal__body">
          <Card>
            <CardBody>
              <form
                onSubmit={handleSubmit(guardar)} className="form form--horizontal" >
                <Col md={12}>
                  
                    {/* Empleado */}
                    <div className="form__form-group">
                      <span className="form__form-group-label">Empleado</span>
                      <div className="form__form-group-field">
                        {readonly ? (
                          <span className="text-secondary"> {pagoEmpleado.empleado.label} </span>
                        ) : (
                          <div className="form__form-group-input-wrap">
                            <Controller
                              control={control}
                              name="empleado"
                              defaultValue={pagoEmpleado.empleado}
                              render={({ field }) => (
                                <Select
                                  onInputChange={nuevosCambios}
                                  onChange={(empleado) => field.onChange(empleado)}
                                  options={empleados}
                                  value={field.value}
                                  className="react-select"
                                  placeholder="Seleccione un empleado"
                                  classNamePrefix="react-select"
                                  isClearable={true}
                                />
                              )}
                            />
                            {errors.empleado && (
                              <span className="form__form-group-error">
                                {errors.empleado?.message}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Monto */}
                    <div className="form__form-group">
                      <span className="form__form-group-label">Monto</span>
                      <div className="form__form-group-field">
                        {readonly ? (
                          <span className="text-secondary">₡ {pagoEmpleado.monto}</span>
                        ) : (
                          <div className="form__form-group-input-wrap">
                            <input
                            type="number"
                            min={0}
                            step="any"
                            name="monto"
                            defaultValue={pagoEmpleado.monto}
                            className={`${errors.monto ? "danger" : ""}`}
                            placeholder="Monto del Pago"
                            {...register("monto", {
                              required: true,
                              onChange: nuevosCambios,
                            })}
                            onKeyDown={blockInvalidChar}
                          />
                            {errors.monto && (
                              <span className="form__form-group-error">
                                {errors.monto?.message}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/*Fecha de pago*/}
                    <div className="form__form-group">
                      <span className="form__form-group-label"> Fecha de Pago </span>
                      <div className="form__form-group-field">
                        {readonly ? (
                          <span className="text-secondary">
                            {moment(pagoEmpleado.fechaPago).format("DD-MM-YYYY")}
                          </span>
                        ) : (
                          <div className="form__form-group-input-wrap">
                            <div className="date-picker">
                              <Controller
                                control={control}
                                name="fechaPago"
                                defaultValue={pagoEmpleado.fechaPago ? fechaPago : ""}
                                render={({ field }) => (
                                  <DatePicker
                                  placeholderText="Fecha del Pago"
                                  className={`${errors.fechaPago ? "danger" : ""}`}
                                  onKeyDown={nuevosCambios}
                                  onChangeRaw={nuevosCambios}
                                  onChange={(fecha) => field.onChange(fecha)}
                                  selected={field.value}
                                  dateFormat="dd-MM-yyyy"
                                  locale={es}
                                  maxDate={new Date()}
                                  isClearable
                                />
                                )}
                              />
                              {errors.fechaPago && (
                                <span className="form__form-group-error">
                                  {errors.fechaPago?.message}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <br />

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
                            <Button color="success" onClick={descartar} outline> Cerrar </Button>
                            <Button type="submit" color="success"> Guardar </Button>
                          </Fragment>
                        ) : (
                          <Button color="secondary" onClick={toggle}> Cerrar </Button>
                        )}
                      </ButtonToolbar>
                    </Col>
                
                </Col>

              </form>
            </CardBody>
          </Card>
        </div>
      </Modal>
  </div>
  );
};

export default ModalComponent;
