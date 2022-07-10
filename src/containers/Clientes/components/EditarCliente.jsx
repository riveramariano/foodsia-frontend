import React, { Fragment, useState, useEffect, useContext } from "react";
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
import EditarMascota from "./EditarMascota";
import RouteContext from "../../../context/routing/routeContext";

// Esquema de validación del formulario de cliente
const esquema = yup.object().shape({
  nombre: yup.string().max(30, "El máximo de caracteres es 30 *").required("Campo obligatorio *"),
  primerApellido: yup.string().max(30, "El máximo de caracteres es 30 *").required("Campo obligatorio *"),
  segundoApellido: yup.string().optional(),
  telefono: yup.string().matches("^[2-8]{1}[0-9]{7}$", 'El número de teléfono no es valido')
  .min(8, "Debe tener 8 caracteres obligatoriamente *").max(8, "El número ingresado no es válido *").required(),
  fechaUnion: yup.string().nullable().required("Campo obligatorio *"),
  canton: yup.object().nullable().required("Campo obligatorio *"),
  frecuencia: yup.object().nullable().required("Campo obligatorio *"),
  mascotas: yup.array().of(
    yup.object().shape({
      nombreMascota: yup.string().max(30, "El máximo de caracteres es 30 *").required("Campo obligatorio *"),
      fechaNacimiento: yup.string().nullable().required("Campo obligatorio *"),
      padecimientos: yup.string().optional(),
    })
  ),
}).required();

const ModalComponent = ({ color, setModal, abierto, cliente, mascotas, readonly, cantones, frecuenciaPedidos }) => {

  const { register, handleSubmit, formState: { errors }, control } = useForm({ resolver: yupResolver(esquema) });
  const [cached, setCached] = useState(false);
  const [opcionesFrecuencia] = useState([]);
  let [fechaUnion] = useState("");
  const history = useHistory();

  const routeContext = useContext(RouteContext);
  const { rutaActual  } = routeContext;

  // Convierte el arreglo de cantones y frecuencias en arreglos entendibles para la librería react-select
  useEffect(() => {
    const realizarPeticiones = () => {
      for (const frecuencia of frecuenciaPedidos) {
        opcionesFrecuencia.push({ value: frecuencia.id, label: frecuencia.nombreFrecuenciaPedido }); 
      }
    }
    realizarPeticiones();
  }, [frecuenciaPedidos, opcionesFrecuencia]);

  const nuevosCambios = () => { setCached(true); };
  const descartar = () => { cambiosNoGuardados(); };
  const toggle = () => { setModal((prevState) => !prevState); history.push("/lista/clientes"); }; 

  // Función para agregar / actualizar un cliente
  const guardar = async (data) => {
    setCached(false);

    // Validaciones de datos antes de enviar al endpoint
    const { segundoApellido } = data;
    if (segundoApellido && segundoApellido.length > 30) { errorLongitudAExcedida(); return; }
    for (const mascota of data.mascotas) {
      if (mascota.padecimientos && mascota.padecimientos.length > 150) { errorLongitudPExcedida(); return; }  
    }

    // Actualizar o Agregar un cliente
    if (cliente.id) {
      const clienteModificado = {
        id: 0,
        nombre: "",
        primerApellido: "",
        segundoApellido: "",
        fechaUnion: "",
        telefono: "",
        cantonId: 0,
        frecuenciaPedidoId: 0,
        mascotas: [],
      };

      // Almacenar la información del formulario
      clienteModificado.id = cliente.id;
      clienteModificado.nombre = data.nombre;
      clienteModificado.primerApellido = data.primerApellido;
      clienteModificado.segundoApellido = data.segundoApellido;
      clienteModificado.fechaUnion = moment(data.fechaUnion).format("DD-MM-YYYY");
      clienteModificado.telefono = data.telefono;
      clienteModificado.cantonId = data.canton.value;
      clienteModificado.frecuenciaPedidoId = data.frecuencia ? data.frecuencia.value : 5;
      for (const mascota of data.mascotas) {
        clienteModificado.mascotas.push({
          nombreMascota: mascota.nombreMascota,
          fechaNacimiento: moment(mascota.fechaNacimiento).format("DD-MM-YYYY"),
          padecimientos: mascota.padecimientos,
          usuarioId: cliente.id,
        });
      }

      // Actualizar su información
      try {
        await Axios.patch("/api/clientes", clienteModificado);
        actualizarCliente();
      } catch {
        console.log("Hubo un Error");
      }

    } else {
      const clienteModificado = {
        nombre: "",
        primerApellido: "",
        segundoApellido: "",
        fechaUnion: "",
        telefono: "",
        cantonId: 0,
        frecuenciaPedidoId: 0,
        mascotas: [],
      };

      // Almacenar la información del formulario
      clienteModificado.nombre = data.nombre;
      clienteModificado.primerApellido = data.primerApellido;
      clienteModificado.segundoApellido = data.segundoApellido;
      clienteModificado.fechaUnion = moment(data.fechaUnion).format("DD-MM-YYYY");
      clienteModificado.telefono = data.telefono;
      clienteModificado.cantonId = data.canton.value;
      clienteModificado.frecuenciaPedidoId = data.frecuencia ? data.frecuencia.value : 5;
      for (const mascota of data.mascotas) {
        clienteModificado.mascotas.push({
          nombreMascota: mascota.nombreMascota,
          fechaNacimiento: moment(mascota.fechaNacimiento).format("DD-MM-YYYY"),
          padecimientos: mascota.padecimientos,
        });
      }

      // Agregar su regitro a la base de datos
      try {
        await Axios.post("/api/clientes", clienteModificado);
        agregarCliente();
      } catch {
        console.log("Hubo un Error");
      }
    }
  };

  const agregarCliente = () => {
    rutaActual("/lista/clientes");
    let timerInterval;
    Swal.fire({
      icon: "success",
      title: "Cliente agregado con éxito",
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

  const actualizarCliente = () => {
    rutaActual("/lista/clientes");
    let timerInterval;
    Swal.fire({
      icon: "success",
      title: "Cliente actualizado con éxito",
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

  const errorLongitudAExcedida = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un error",
      text: `Límite excedido, el máximo de caracteres permitidos para el segundo apellido es de 30.`,
      showCancelButton: false,
      confirmButtonColor: "#238484",
      confirmButtonText: "Confirmar",
    });
  };

  const errorLongitudPExcedida = () => {
    Swal.fire({
      icon: "error",
      title: "Hubo un error",
      text: `Límite excedido, el máximo de caracteres permitidos para los padecimientos es de 150.`,
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
  };

  if (cliente.fechaUnion) {
    const fechaFormateada = cliente.fechaUnion.replace(/(\d+[/])(\d+[/])/, "$2$1");
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
            <h3 className="modal__title text-uppercase">Ver Cliente</h3>
          ) : Object.keys(cliente).length !== 0 ? (
            <h3 className="modal__title text-uppercase">Editar Cliente</h3>
          ) : (
            <h3 className="modal__title text-uppercase">Agregar Cliente</h3>
          )}
        </div>

        {/* Body */}
        <div className="modal__body">
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit(guardar)} className="form form--horizontal">

                {/* Columna izquierda */}
                <Col md={5}>
                  <h4 className="text-center">Información Personal</h4>
                  <hr />

                  {/* Nombre */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Nombre</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">{cliente.nombreUsuario}</span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="text"
                            name="nombre"
                            defaultValue={cliente.nombreUsuario}
                            className={`${errors.nombre ? "danger" : ""}`}
                            placeholder="Nombre del cliente"
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
                          {cliente.primerApellido}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="text"
                            name="primerApellido"
                            defaultValue={cliente.primerApellido}
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
                          {cliente.segundoApellido}
                        </span>
                      ) : (
                        <input
                          type="text"
                          name="segundoApellido"
                          defaultValue={cliente.segundoApellido}
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
                          {cliente.fechaUnion}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <div className="date-picker">
                            <Controller
                              control={control}
                              name="fechaUnion"
                              defaultValue={cliente.fechaUnion ? fechaUnion : ""}
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
                          {cliente.telefono.split('')[0]}{cliente.telefono.split('')[1]}{cliente.telefono.split('')[2]}
                          {cliente.telefono.split('')[3]}-{cliente.telefono.split('')[4]}{cliente.telefono.split('')[5]}
                          {cliente.telefono.split('')[6]}{cliente.telefono.split('')[7]}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <input
                            type="number"
                            name="telefono"
                            defaultValue={cliente.telefono}
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

                  {/* Cantón */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Cantón</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {cliente.canton.label}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <Controller
                            control={control}
                            name="canton"
                            defaultValue={cliente.canton}
                            render={({ field }) => (
                              <Select
                                className="react-select"
                                onInputChange={nuevosCambios}
                                onChange={(canton) => field.onChange(canton)}
                                options={cantones}
                                value={field.value}
                                placeholder="Cantón donde vive"
                                classNamePrefix="react-select"
                                isClearable={true}
                              />
                            )}
                          />
                          {errors.canton && (
                            <span className="form__form-group-error">
                              {errors.canton?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Frecuencia de pedido */}
                  <div className="form__form-group">
                    <span className="form__form-group-label">Frecuencia</span>
                    <div className="form__form-group-field">
                      {readonly ? (
                        <span className="text-secondary">
                          {cliente.frecuenciaPedido.label}
                        </span>
                      ) : (
                        <div className="form__form-group-input-wrap">
                          <Controller
                            control={control}
                            name="frecuencia"
                            defaultValue={cliente.frecuenciaPedido}
                            render={({ field }) => (
                              <Select
                                onInputChange={nuevosCambios}
                                onChange={(frecuencia) => field.onChange(frecuencia)}
                                defaultValue={cliente.frecuencia}
                                options={opcionesFrecuencia}
                                value={field.value}
                                className="react-select"
                                placeholder="Frecuencia de pedidos"
                                classNamePrefix="react-select"
                                isClearable={true}
                              />
                            )}
                          />
                          {errors.frecuencia && (
                            <span className="form__form-group-error">
                              {errors.frecuencia?.message}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Col>

                {/* Columna derecha */}
                <Col md={7}>
                  <EditarMascota
                    setCached={setCached}
                    nuevosCambios={nuevosCambios}
                    register={register}
                    readonly={readonly}
                    mascotas={mascotas}
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
