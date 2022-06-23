import React, { useState, useEffect, useContext } from "react";
import EditarCliente from "./EditarCliente";
import Axios from "../../../config/axios";
import ReactTablePagination from "../../../shared/components/table/components/ReactTablePagination";
import Swal from "sweetalert2";
import Select from "react-select";
import { useHistory } from "react-router-dom";
import MagnifyIcon from "mdi-react/MagnifyIcon";
import { useForm, Controller } from "react-hook-form";
import { Card, CardBody, Col, Badge } from "reactstrap";
import { useTable, useGlobalFilter, usePagination, useSortBy, useResizeColumns, useRowSelect } from "react-table";
import RouteContext from "../../../context/routing/routeContext";
import moment from "moment";

const EstructuraTabla = ({ clientes, cantones, frecuenciaPedidos, clientesFlitrados, setClientesFlitrados }) => {
  const [abrirModal, setModal] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [cliente, setCliente] = useState({});
  const [mascotas, setMascotas] = useState([]);
  const { control } = useForm();
  const history = useHistory();

  // Mostrar cantones en dropdown
  const [opcionesCanton] = useState([]);

  const routeContext = useContext(RouteContext);
  const { rutaActual } = routeContext;

  // Establecer la configuracion de la tabla
  const tableConfig = { manualPageSize: [15, 30, 45] };

  const [columnas] = useState([
    {
      Header: "Nombre Completo",
      accessor: "nombre",
      disableGlobalFilter: true,
    },
    {
      Header: "Num. Teléfono",
      accessor: "telefono",
      disableGlobalFilter: true,
    },
    {
      Header: "Fecha Unión",
      accessor: "fechaUnion",
      disableGlobalFilter: true,
    },
    {
      Header: "Frecuencia Pedidos",
      accessor: "frecuencia",
      disableGlobalFilter: true,
    },
  ]);

  // Establecer las opciones de la tabla
  const tableOptions = {
    columns: columnas,
    data: clientesFlitrados,
    defaultColumn: {},
    isEditable: tableConfig.isEditable,
    withDragAndDrop: tableConfig.withDragAndDrop || false,
    dataLength: clientesFlitrados.length,
    autoResetPage: false,
    initialState: {
      pageIndex: 0,
      pageSize: tableConfig.manualPageSize ? tableConfig.manualPageSize[0] : 10,
    },
  };

  const {
    page,
    pageCount,
    pageOptions,
    gotoPage,
    previousPage,
    canPreviousPage,
    nextPage,
    canNextPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    tableOptions,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useResizeColumns,
    useRowSelect
  );

  // Convierte el arreglo de cantones en un arreglo entendible para la librería react-select
  useEffect(() => {
    const realizarPeticiones = () => {
      for (const canton of cantones) {
        opcionesCanton.push({ value: canton.id, label: canton.nombreCanton });
      }
    };
    realizarPeticiones();
  }, [cantones, opcionesCanton]);

  // Función que retorna un cliente de la base de datos
  const seleccionarCliente = async (clienteId) => {
    const cliente = await Axios.get(`/api/clientes/${clienteId}`);
    return cliente.data;
  };

  // Funcionalidad para abrir el modal versión agregar
  const agregarCliente = () => {
    setCliente({});
    setMascotas([]);
    setReadonly(false);
    setModal(true);
    history.push("/lista/clientes?editar=true");
  };

  // Funcionalidad para abrir el modal versión ver
  const verCliente = async (clienteId) => {
    seleccionarCliente(clienteId).then((response) => {
      const cliente = {
        id: response.cliente[0].id,
        nombreUsuario: response.cliente[0].nombreUsuario,
        primerApellido: response.cliente[0].primerApellido,
        segundoApellido: response.cliente[0].segundoApellido,
        fechaUnion: moment(response.cliente[0].fechaUnion).format("DD-MM-YYYY"),
        telefono: response.cliente[0].telefono,
        canton: {
          value: response.cliente[0].cantonId,
          label: response.cliente[0].nombreCanton,
        },
        frecuenciaPedido: {
          value: response.cliente[0].frecuenciaPedidoId,
          label: response.cliente[0].nombreFrecuenciaPedido,
        },
      };
      setCliente(cliente);
      for (const mascota of response.mascotas) {
        mascota.fechaNacimiento = moment(mascota.fechaNacimiento).format('DD-MM-YYYY')
      }
      setMascotas(response.mascotas);
      setReadonly(true);
      setModal(true);
      history.push(`/lista/clientes?id=${cliente.id}`);
    });
  };

  // Funcionalidad para abrir el modal versión editar
  const editarCliente = async (clienteId) => {
    seleccionarCliente(clienteId).then((response) => {
      const cliente = {
        id: response.cliente[0].id,
        nombreUsuario: response.cliente[0].nombreUsuario,
        primerApellido: response.cliente[0].primerApellido,
        segundoApellido: response.cliente[0].segundoApellido,
        fechaUnion: response.cliente[0].fechaUnion,
        telefono: response.cliente[0].telefono,
        canton: {
          value: response.cliente[0].cantonId,
          label: response.cliente[0].nombreCanton,
        },
        frecuenciaPedido: {
          value: response.cliente[0].frecuenciaPedidoId,
          label: response.cliente[0].nombreFrecuenciaPedido,
        },
      };
      setCliente(cliente);
      setMascotas(response.mascotas);
      setReadonly(false);
      setModal(true);
      history.push(`/lista/clientes?id=${cliente.id}&editar=true`);
    });
  };

  // Funcionalidad para eliminar un cliente de la bd
  const eliminarCliente = async (clienteId) => {
    rutaActual("/lista/clientes");
    seleccionarCliente(clienteId).then((response) => {
      const { nombreUsuario, primerApellido } = response.cliente[0];
      let timerInterval;
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: `¿Desea eliminar al cliente ${nombreUsuario} ${primerApellido}?`,
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
            title: "Cliente eliminado con éxito",
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
              await Axios.delete(`/api/clientes/${clienteId}`);
              history.push("/iniciar-sesion");
            },
          });
        }
      });
    });
  };

  // Filtrar con dropdown de Cantones
  const filtroCanton = (canton) => {
    setClientesFlitrados(clientes);
    if (!canton) { return; }
    setClientesFlitrados(
      clientes.filter((cliente) => cliente.cantonId === canton.value)
    );
  }

  // Flitro por nombre de usuario
  const filtroNombre = (nombre) => {
    setClientesFlitrados(clientes);
    if (!nombre) { return; }
    setClientesFlitrados(
      clientes.filter((cliente) => cliente.nombreUsuario.normalize("NFD").replace(/[\u0300-\u036f]/g, '').match(new RegExp(nombre, "i")))
    );
  }
  const blockInvalidChar = e => !['ó', 'ú', 'í', 'é', 'á','Q', 'W','E', 'R','T', 'Y','U', 'I','O', 'P','Ñ', 'L','K', 'J','H', 'G','F', 'D','S', 'A','Z', 'X','C', 'V','B', 'N','M', 'q','w', 'e', 'r', 't','y', 'u','i', 'o','p', 'ñ','l', 'k','j', 'h','g', 'f','d', 's','a', 'z','x', 'c','v', 'b','n', 'm', 'Backspace', ' ', 'Ctrl', 'Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(e.key) && e.preventDefault();
  
  return (
    <Col md={12} lg={12}>
      <Card>
        <CardBody>

          <div className="container">

            <div className="row">
              <div className="col-12 ml-auto">
                <button className="btn btn-success btn-small float-right" onClick={() => agregarCliente()}>
                  Agregar Cliente
                </button>
              </div>
            </div>

            <div className="row">
              <div className="col-12 ml-auto">
                <div className="inbox__emails-control-search float-right">
                  <input type="text" placeholder="Buscar por nombre de cliente" onChange={(e) => filtroNombre(e.target.value)} onKeyDown={blockInvalidChar}/>
                  <div className="inbox__emails-control-search-icon mr-2"><MagnifyIcon /></div>
                </div> 
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12 ml-auto">
                <Controller
                  control={control}
                  name="canton"
                  render={({ field }) => (
                    <Select
                      className="react-select__menu border float-right"
                      onChange={(canton) => filtroCanton(canton)}
                      options={opcionesCanton}
                      value={field.value}
                      placeholder="Filtro por cantón"
                      classNamePrefix="react-select"
                      isClearable={true}
                    />
                  )}
                />
              </div>
            </div>

          </div>

          {/* Tabla de clientes */}
          <div className="table react-table">
            <table className={"react-table editable-table"}>
              <thead className="thead th">
                <tr className="react-table thead tr">
                  <th>Nombre Completo</th>
                  <th>Núm. Teléfono</th>
                  <th>Fecha Unión</th>
                  <th>Frecuencia Pedidos</th>
                  <th colSpan="2" style={{ textAlign: "right" }}></th>
                </tr>
              </thead>
              <tbody className="table table--bordered">
                {page.map((cliente) => (
                  <tr key={cliente.original.id} className="react-dnd-draggable">
                    <td>{cliente.original.nombreUsuario} {cliente.original.primerApellido} {cliente.original.segundoApellido}</td>
                    <td>{cliente.original.telefono.split("")[0]}{cliente.original.telefono.split("")[1]}{cliente.original.telefono.split("")[2]}
                      {cliente.original.telefono.split("")[3]}-{cliente.original.telefono.split("")[4]}{cliente.original.telefono.split("")[5]}
                      {cliente.original.telefono.split("")[6]}{cliente.original.telefono.split("")[7]}</td>
                    <td>{cliente.original.fechaUnion && (moment(cliente.original.fechaUnion).format('DD-MM-YYYY'))}</td>
                    {cliente.original.nombreFrecuenciaPedido === "Semanal" && (
                      <td><Badge className="badge-green">{cliente.original.nombreFrecuenciaPedido }</Badge></td>
                    )}
                    {cliente.original.nombreFrecuenciaPedido  === "Quincenal" && (
                      <td><Badge className="badge-red">{cliente.original.nombreFrecuenciaPedido }</Badge></td> 
                    )}
                    {cliente.original.nombreFrecuenciaPedido  === "Mensual" && (
                      <td><Badge className="badge-blue">{cliente.original.nombreFrecuenciaPedido }</Badge></td>
                    )}
                    {cliente.original.nombreFrecuenciaPedido  === "Semestral" && (
                      <td><Badge className="badge-purple">{cliente.original.nombreFrecuenciaPedido }</Badge></td>
                    )}
                    {cliente.original.nombreFrecuenciaPedido  === "Indefinido" && (
                      <td><Badge>{cliente.original.nombreFrecuenciaPedido }</Badge></td>
                    )}
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-success btn-sm" onClick={() => verCliente(cliente.original.id)}>Ver</button>
                      <button className="btn btn-warning btn-sm" onClick={() => editarCliente(cliente.original.id)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => eliminarCliente(cliente.original.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {clientesFlitrados.length === 0 && (
                  <tr><td className="text-center" colSpan="5">No hay clientes.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación de la tabla */}
          {clientesFlitrados.length > 15 && (
            <ReactTablePagination
              page={page}
              gotoPage={gotoPage}
              previousPage={previousPage}
              nextPage={nextPage}
              canPreviousPage={canPreviousPage}
              canNextPage={canNextPage}
              pageOptions={pageOptions}
              pageSize={pageSize}
              pageIndex={pageIndex}
              pageCount={pageCount}
              setPageSize={setPageSize}
              manualPageSize={tableConfig.manualPageSize}
              dataLength={clientesFlitrados.length}
            />
          )}

          {/* Modal de Agregar / Editar Clientes */}
          {abrirModal && (
            <EditarCliente
              color="success"
              setModal={setModal}
              abierto={abrirModal}
              cliente={cliente}
              mascotas={mascotas}
              readonly={readonly}
              cantones={opcionesCanton}
              frecuenciaPedidos={frecuenciaPedidos}
            />
          )}
          
        </CardBody>
      </Card>
    </Col>
  );
};

export default EstructuraTabla;
