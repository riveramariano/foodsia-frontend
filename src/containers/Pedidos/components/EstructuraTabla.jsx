import React, { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import Axios from "../../../config/axios";
import { Card, CardBody, Col, Badge } from "reactstrap";
import EditarPedido from "./EditarPedido";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import { useTable, useGlobalFilter, usePagination, useSortBy, useResizeColumns, useRowSelect } from "react-table";
import ReactTablePagination from "../../../shared/components/table/components/ReactTablePagination";
import { useForm, Controller } from "react-hook-form";
import RouteContext from "../../../context/routing/routeContext";
import moment from "moment";

const EstructuraTabla = ({ pedidos, pedidosFiltrados, setPedidosFiltrados, clientes, productos, tiposEntrega }) => {

  const [abrirModal, setModal] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [pedido, setPedido] = useState({});
  const [detallesPedido, setDetallesPedido] = useState([]);
  const { control } = useForm();
  const history = useHistory();

  // Mostrar clientes en dropdown
  const [opcionesCliente] = useState([]);

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
    data: pedidosFiltrados,
    defaultColumn: {},
    isEditable: tableConfig.isEditable,
    withDragAndDrop: tableConfig.withDragAndDrop || false,
    dataLength: pedidosFiltrados.length,
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

  // Convierte el arreglo de clientes en un arreglo entendible para la librería react-select
  useEffect(() => {
    const realizarPeticiones = () => {
      for (const cliente of clientes) {
        opcionesCliente.push({ value: cliente.id, label: `${cliente.nombreUsuario} ${cliente.primerApellido} ${cliente.segundoApellido}` });
      }
    };
    realizarPeticiones();
  }, [clientes, opcionesCliente]);

  // Función que retorna un pedido de la base de datos
  const seleccionarPedido = async (pedidoId) => {
    const pedido = await Axios.get(`/api/pedidos/${pedidoId}`);
    return pedido.data;
  };

  // Funcionalidad para abrir el modal versión agregar
  const agregarPedido = () => {
    setPedido({});
    setDetallesPedido([]);
    setReadonly(false);
    setModal(true);
    history.push("/lista/pedidos?editar=true");
  };

  // Funcionalidad para abrir el modal versión ver
  const verPedido = async (pedidoId) => {
    seleccionarPedido(pedidoId).then((response) => {
      const pedido = {
        id: response.pedido[0].id,
        fechaPedido: moment(response.pedido[0].fechaPedido).format('DD-MM-YYYY'),
        fechaEntrega: moment(response.pedido[0].fechaEntrega).format('DD-MM-YYYY'),
        direccion: response.pedido[0].direccion,
        totalNeto: response.pedido[0].totalNeto,
        montoIva: response.pedido[0].montoIva,
        montoSenasa: response.pedido[0].montoSenasa,
        estado: {
          value: response.pedido[0].estadoId,
          label: response.pedido[0].nombreEstado,
        },
        tipoEntrega: {
          value: response.pedido[0].tipoEntregaId,
          label: response.pedido[0].nombreTipoEntrega,
        },
        usuario: {
          value: response.pedido[0].usuarioId,
          label: `${response.pedido[0].nombreUsuario} ${response.pedido[0].primerApellido} ${response.pedido[0].segundoApellido}`,
        },
      };
      setPedido(pedido);
      setDetallesPedido(response.detallesPedido);
      setReadonly(true);
      setModal(true);
      history.push(`/lista/pedidos?id=${pedido.id}`);
    });
  };

  // Funcionalidad para abrir el modal versión editar
  const editarPedido = async (pedidoId) => {
    seleccionarPedido(pedidoId).then((response) => {
      const pedido = {
        id: response.pedido[0].id,
        fechaPedido: response.pedido[0].fechaPedido,
        fechaEntrega: response.pedido[0].fechaEntrega,
        direccion: response.pedido[0].direccion,
        totalNeto: response.pedido[0].totalNeto,
        montoIva: response.pedido[0].montoIva,
        montoSenasa: response.pedido[0].montoSenasa,
        estado: {
          value: response.pedido[0].estadoId,
          label: response.pedido[0].nombreEstado,
        },
        tipoEntrega: {
          value: response.pedido[0].tipoEntregaId,
          label: response.pedido[0].nombreTipoEntrega,
        },
        usuario: {
          value: response.pedido[0].usuarioId,
          label: `${response.pedido[0].nombreUsuario} ${response.pedido[0].primerApellido} ${response.pedido[0].segundoApellido}`,
        },
      };
      setPedido(pedido);
      setDetallesPedido(response.detallesPedido);
      setReadonly(false);
      setModal(true);
      history.push(`/lista/pedidos?id=${pedido.id}&editar=true`);
    });
  };

  // Funcionalidad para eliminar un pedido de la bd
  const eliminarPedido = async (pedidoId) => {
    rutaActual("/lista/pedidos");
    let timerInterval;
    Swal.fire({
      icon: "warning",
      title: "Atención",
      text: `¿Desea eliminar este pedido?`,
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
          title: "Pedido eliminado con éxito",
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
            await Axios.delete(`/api/pedidos/${pedidoId}`);
            history.push("/iniciar-sesion");
          },
        });
      }
    });
  };

  // Filtrar con dropdown de clientes
  const filtroCliente = (cliente) => {
    setPedidosFiltrados(pedidos);
    if (!cliente) { return; }
    setPedidosFiltrados(
      pedidos.filter((pedido) => pedido.usuarioId === cliente.value)
    );
  }

  return (
    <Col md={12} lg={12}>
      <Card>
        <CardBody>
          <div className="container">
            <div className="row">
              <div className="col-12 ml-auto">
                <button
                  className="btn btn-success btn-small float-right"
                  onClick={() => agregarPedido()}>Agregar Pedido</button>
              </div>
            </div>

            <div className="row">
              <div className="col-12 ml-auto">
              <Controller
                  control={control}
                  name="canton"
                  render={({ field }) => (
                    <Select
                      className="react-select__menu border float-right"
                      onChange={(cliente) => filtroCliente(cliente)}
                      options={opcionesCliente}
                      value={field.value}
                      placeholder="Seleccione el cliente que desea filtrar"
                      classNamePrefix="react-select"
                      isClearable={true}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Tabla de pedidos */}
          <div className="table react-table">
            <table className={"react-table editable-table"}>
              <thead className="thead th">
                <tr className="react-table thead tr">
                  <th>Fecha Pedido</th>
                  <th>Fecha Entrega</th>
                  <th>Total Neto</th>
                  <th>Tipo Entrega</th>
                  <th>Estado</th>
                  <th colSpan="2" style={{ textAlign: "right" }}></th>
                </tr>
              </thead>
              <tbody className="table table--bordered">
                {page.map((pedido) => (
                  <tr key={pedido.original.id} className="react-dnd-draggable">
                    <td>{pedido.original.fechaPedido ? moment(pedido.original.fechaPedido).format('DD-MM-YYYY') : null}</td>
                    <td>{pedido.original.fechaEntrega ? moment(pedido.original.fechaEntrega).format('DD-MM-YYYY') : null}</td>
                    <td>₡ {pedido.original.totalNeto}</td>
                    {pedido.original.nombreTipoEntrega === "Enviar" && (
                      <td><Badge className="badge-green">{pedido.original.nombreTipoEntrega}</Badge></td>
                    )}
                    {pedido.original.nombreTipoEntrega  === "Recoger" && (
                      <td><Badge className="badge-purple">{pedido.original.nombreTipoEntrega}</Badge></td>
                    )}
                    {pedido.original.nombreEstado === "Activo" && (
                      <td><Badge className="badge-blue">{pedido.original.nombreEstado}</Badge></td>
                    )}
                    {pedido.original.nombreEstado  === "Entregado" && (
                      <td><Badge className="badge-red">{pedido.original.nombreEstado}</Badge></td>
                    )}
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-success btn-sm" onClick={() => verPedido(pedido.original.id)}>Ver</button>
                      <button className="btn btn-warning btn-sm" onClick={() => editarPedido(pedido.original.id)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => eliminarPedido(pedido.original.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {pedidosFiltrados.length === 0 && (
                  <tr><td className="text-center" colSpan="6">No hay pedidos.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación de la tabla */}
          {pedidosFiltrados.length > 15 && (
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
              dataLength={pedidosFiltrados.length}
            />
          )}

          {/* Modal de Agregar / Editar Clientes */}
          {abrirModal && (
            <EditarPedido
              setModal={setModal}
              abierto={abrirModal}
              pedido={pedido}
              detallesPedido={detallesPedido}
              clientes={opcionesCliente}
              productos={productos}
              tiposEntrega={tiposEntrega}
              readonly={readonly}
            />
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

export default EstructuraTabla;
