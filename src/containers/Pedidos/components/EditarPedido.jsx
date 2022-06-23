import React, { useState, useEffect, useContext, Fragment } from "react";
import { Col, Button, ButtonToolbar, Modal, Card, CardBody } from "reactstrap";
import Axios from "../../../config/axios";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import es from "date-fns/locale/es";
import Select from "react-select";
import EditarDetallePedido from './EditarDetallePedido';
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";
import * as yup from "yup";
import RouteContext from "../../../context/routing/routeContext";

// Esquema de validación del formulario de pedido
const esquema = yup.object().shape({
  fechaPedido: yup.string().nullable().required("Campo obligatorio *"),
  fechaEntrega: yup.string().nullable().required("Campo obligatorio *"),
  direccion: yup.string().max(150, "Máximo 150 caracteres permitidos *").required("Campo obligatorio *"),
  cliente: yup.object().nullable().required("Campo obligatorio *"),
  tipoEntrega: yup.object().nullable().required("Campo obligatorio *"),
  detallesPedido: yup.array().of(
    yup.object().shape({
      producto: yup.object().nullable().required("Campo obligatorio *"),
      cantidad: yup.number().integer("Debe ser un número entero *").typeError("Campo obligatorio *").max(20, "Máximo 20 unidades permitidas *")
        .required("Campo obligatorio *").positive("Cantidad no válida *"),
    })
  ),
}).required();

const ModalComponent = ({ setModal, abierto, pedido, detallesPedido, clientes, productos, tiposEntrega, readonly }) => {

  const { register, handleSubmit, formState: { errors }, control } = useForm({ resolver: yupResolver(esquema) });
  const [cached, setCached] = useState(false);
  let [fechaPedido] = useState("");
  let [fechaEntrega] = useState("");
  const history = useHistory();

  // Mostrar clientes en dropdown
  const [opcionesProducto] = useState([]);
  const [opcionesTipoEntrega] = useState([]);

  const routeContext = useContext(RouteContext);
  const { rutaActual } = routeContext;

  const nuevosCambios = () => { setCached(true); };
  const descartar = () => { cambiosNoGuardados(); };
  const toggle = () => { setModal((prevState) => !prevState); history.push("/lista/pedidos"); };

  // Convierte el arreglo de clientes en un arreglo entendible para la librería react-select
  useEffect(() => {
    const realizarPeticiones = () => {
      for (const producto of productos) {
        opcionesProducto.push({ value: producto.id, label: producto.nombreProducto });
      }
      for (const tipoEntrega of tiposEntrega) {
        opcionesTipoEntrega.push({ value: tipoEntrega.id, label: tipoEntrega.nombreTipoEntrega });
      }
    };
    realizarPeticiones();
  }, [opcionesProducto, opcionesTipoEntrega, productos, tiposEntrega]);

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

  // Función para agregar / actualizar un pedido
  const guardar = async (data) => {
    setCached(false);

    // Validaciones de datos antes de enviar al endpoint
    const { fechaPedido, fechaEntrega, detallesPedido } = data;
    const repetidos = [...new Set(detallesPedido.map((x) => x.producto))];
    if (repetidos.length !== detallesPedido.length) { errorProductos(); return; }
    if (moment(fechaPedido).isAfter(fechaEntrega, 'days')) { errorFechas(); return; }

    // Actualizar o Agregar un pedido
    if (pedido.id) {
      const pedidoModificado = {
        id: 0,
        fechaPedido: "",
        fechaEntrega: "",
        direccion: "",
        tipoEntregaId: 0,
        usuarioId: 0,
        detallesPedido: [],
      };

      // Almacenar la información del formulario
      pedidoModificado.id = pedido.id;
      pedidoModificado.fechaPedido = moment(data.fechaPedido).format("DD-MM-YYYY");
      pedidoModificado.fechaEntrega = moment(data.fechaEntrega).format("DD-MM-YYYY");
      pedidoModificado.direccion = data.direccion;
      pedidoModificado.tipoEntregaId = data.tipoEntrega.value;
      pedidoModificado.usuarioId = data.cliente.value;
      for (const detalle of data.detallesPedido) {
        pedidoModificado.detallesPedido.push({
          productoId: detalle.producto.value,
          cantidad: detalle.cantidad,
        });
      }

      // Validaciones de datos antes de enviar al endpoint
      const { fechaPedido, fechaEntrega, detallesPedido } = pedidoModificado;
      const repetidos = [...new Set(detallesPedido.map((x) => x.productoId))];
      if (repetidos.length !== detallesPedido.length) { errorProductos(); return; }
      if (moment(fechaPedido).isAfter(fechaEntrega, 'days')) { errorFechas(); return; }

      // Agregar su regitro a la base de datos
      try {
        await Axios.patch("/api/pedidos", pedidoModificado);
        actualizarPedido();
      } catch {
        errorGenerico();
      }
  
    } else {
      const pedidoModificado = {
        fechaPedido: "",
        fechaEntrega: "",
        direccion: "",
        tipoEntregaId: 0,
        usuarioId: 0,
        detallesPedido: [],
      };

      // Almacenar la información del formulario
      pedidoModificado.fechaPedido = moment(data.fechaPedido).format("DD-MM-YYYY");
      pedidoModificado.fechaEntrega = moment(data.fechaEntrega).format("DD-MM-YYYY");
      pedidoModificado.direccion = data.direccion;
      pedidoModificado.tipoEntregaId = data.tipoEntrega.value;
      pedidoModificado.usuarioId = data.cliente.value;
      for (const detalle of data.detallesPedido) {
        pedidoModificado.detallesPedido.push({
          productoId: detalle.producto.value,
          cantidad: detalle.cantidad,
        });
      }

      // Agregar su regitro a la base de datos
      try {
        await Axios.post("/api/pedidos", pedidoModificado);
        agregarPedido();
      } catch {
        errorGenerico();
      }
    }
  };

  const agregarPedido = () => {
    rutaActual("/lista/pedidos");
    let timerInterval;
    Swal.fire({
      icon: "success",
      title: "Pedido agregado con éxito",
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

  const actualizarPedido = () => {
    rutaActual("/lista/pedidos");
    let timerInterval;
    Swal.fire({
      icon: "success",
      title: "Pedido actualizado con éxito",
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

  const errorProductos = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un Error",
      text: "Se seleccionó en más de una ocasión un mismo producto",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  const errorFechas = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un Error",
      text: "La fecha del pedido no puede suceder luego de la fecha de entrega",
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  if (pedido.fechaPedido) {
    const fechaFormateada = pedido.fechaPedido.replace(/(\d+[/])(\d+[/])/, "$2$1");
    fechaPedido = new Date(fechaFormateada);
  }
  if (pedido.fechaEntrega) {
    const fechaFormateada = pedido.fechaEntrega.replace(/(\d+[/])(\d+[/])/, "$2$1");
    fechaEntrega = new Date(fechaFormateada);
  }
  if (pedido.id) {
    if (!pedido.usuario) { pedido.usuario = null; }
  }

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
            <h3 className="modal__title text-uppercase">Ver Pedido</h3>
          ) : Object.keys(pedido).length !== 0 ? (
            <h3 className="modal__title text-uppercase">Editar Pedido</h3>
          ) : (
            <h3 className="modal__title text-uppercase">Agregar Pedido</h3>
          )}
        </div>

        {/* Body */}
        <div className="modal__body">
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit(guardar)} className="form form--horizontal">
                
                {/* Columna Izquierda */}
                <Col md={6}>
                  <h4 className="text-center">Información Pedido</h4>
                  <hr />

                  {/* Fecha pedido */}
                  <div className="form__form-group mt-1">
                    <span className="form__form-group-label">Fecha Pedido</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {pedido.fechaPedido}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <div className="date-picker">
                            <Controller
                              control={control}
                              name="fechaPedido"
                              defaultValue={pedido.fechaPedido ? fechaPedido : ""}
                              render={({ field }) => (
                                <DatePicker
                                  placeholderText="Fecha del pedido"
                                  className={`${errors.fechaPedido ? "danger" : ""}`}
                                  onKeyDown={nuevosCambios}
                                  onChangeRaw={nuevosCambios}
                                  onChange={(fecha) => field.onChange(fecha)}
                                  selected={field.value}
                                  dateFormat="dd-MM-yyyy"
                                  locale={es}
                                  isClearable
                                />
                              )}
                            />
                          </div>
                          {errors.fechaPedido && (
                            <span className="form__form-group-error">
                              {errors.fechaPedido?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fecha entrega */}
                  <div className="form__form-group mt-1">
                    <span className="form__form-group-label">Fecha Entrega</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {pedido.fechaEntrega}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <div className="date-picker">
                            <Controller
                              control={control}
                              name="fechaEntrega"
                              defaultValue={pedido.fechaEntrega ? fechaEntrega : ""}
                              render={({ field }) => (
                                <DatePicker
                                  placeholderText="Fecha de entrega"
                                  className={`${errors.fechaEntrega ? "danger" : ""}`}
                                  onKeyDown={nuevosCambios}
                                  onChangeRaw={nuevosCambios}
                                  onChange={(fecha) => field.onChange(fecha)}
                                  selected={field.value}
                                  dateFormat="dd-MM-yyyy"
                                  locale={es}
                                  isClearable
                                />
                              )}
                            />
                          </div>
                          {errors.fechaEntrega && (
                            <span className="form__form-group-error">
                              {errors.fechaEntrega?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <hr/>
  
                  {/* Cliente */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Cliente</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {pedido.usuario ? pedido.usuario.label : ""}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <Controller
                            control={control}
                            name="cliente"
                            defaultValue={pedido.usuario
                              ? {
                                value: pedido.usuario.value,
                                label: pedido.usuario.label,
                              } 
                              : null}
                            render={({ field }) => (
                              <Select
                                className="react-select"
                                onInputChange={nuevosCambios}
                                onChange={(canton) => field.onChange(canton)}
                                options={clientes}
                                value={field.value}
                                placeholder="Responsable del pedido"
                                classNamePrefix="react-select"
                                isClearable={true}
                              />
                            )}
                          />
                          {errors.cliente && (
                            <span className="form__form-group-error">
                              {errors.cliente?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tipo entrega */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Tipo Entrega</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {pedido.tipoEntrega.label}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <Controller
                            control={control}
                            name="tipoEntrega"
                            defaultValue={pedido.tipoEntrega}
                            render={({ field }) => (
                              <Select
                                className="react-select"
                                onInputChange={nuevosCambios}
                                onChange={(canton) => field.onChange(canton)}
                                options={opcionesTipoEntrega}
                                value={field.value}
                                placeholder="Método de entrega del pedido"
                                classNamePrefix="react-select"
                                isClearable={true}
                              />
                            )}
                          />
                          {errors.tipoEntrega && (
                            <span className="form__form-group-error">
                              {errors.tipoEntrega?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dirección del pedido */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Dirección</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {pedido.direccion}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <textarea
                            type="text"
                            name="direccion"
                            defaultValue={pedido.direccion}
                            className={`${errors.direccion ? "danger" : ""}`}
                            placeholder="Dirección de entrega del pedido"
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

                  {readonly ? (
                    <hr />
                  ) : null}

                  {/* Estado del pedido */}
                  {readonly ? (
                    <div className="form__form-group">
                      <span className="form__form-group-label">Estado</span>
                      <div className="form__form-group-field">
                        <span className="text-secondary">
                          {pedido.estado.label}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {/* Total neto */}
                  {readonly ? (
                    <div className="form__form-group">
                      <span className="form__form-group-label">Total Neto</span>
                      <div className="form__form-group-field">
                        <span className="text-secondary">
                          ₡ {pedido.totalNeto}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {/* Impuestos de IVA */}
                  {readonly ? (
                    <div className="form__form-group">
                      <span className="form__form-group-label">Impuesto IVA</span>
                      <div className="form__form-group-field">
                        <span className="text-secondary">
                          ₡ {pedido.montoIva}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {/* Impuestos de senasa */}
                  {readonly ? (
                    <div className="form__form-group">
                      <span className="form__form-group-label">Impuesto Senasa</span>
                      <div className="form__form-group-field">
                        <span className="text-secondary">
                          ₡ {pedido.montoSenasa}
                        </span>
                      </div>
                    </div>
                  ) : null}

                </Col>

                {/* Columna Derecha */}
                <Col md={6}>
                  <EditarDetallePedido 
                    setCached={setCached}
                    nuevosCambios={nuevosCambios}
                    register={register}
                    readonly={readonly}
                    productos={opcionesProducto}
                    detallesPedido={detallesPedido}
                    control={control}
                    errors={errors}
                  />
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
                        <Button color="success" onClick={descartar} outline>Cerrar</Button>
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
