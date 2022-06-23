import React, { useState, useContext } from "react";
import Axios from "../../../config/axios";
import EditarProveedor from "./EditarProveedor";
import ReactTablePagination from "../../../shared/components/table/components/ReactTablePagination";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";
import MagnifyIcon from "mdi-react/MagnifyIcon";
import { Row, Card, CardBody, Col } from "reactstrap";
import { useTable, useGlobalFilter, usePagination, useSortBy, useResizeColumns, useRowSelect } from "react-table";
import RouteContext from "../../../context/routing/routeContext";

const EstructuraTabla = ({ proveedores, proveedoresFlitrados, setProveedoresFlitrados }) => {

  const [abrirModal, setModal] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [proveedor, setProveedor] = useState({});
  const history = useHistory();

  const routeContext = useContext(RouteContext);
  const { rutaActual } = routeContext;

  // Establecer la configuracion de la tabla
  const tableConfig = { manualPageSize: [15, 30, 45] };

  const [columnas] = useState([
    {
      Header: "Nombre",
      accessor: "nombre",
      disableGlobalFilter: true,
    },
    {
      Header: "Cédula Jurídica",
      accessor: "cedulaJuridica",
      disableGlobalFilter: true,
    },
    {
      Header: "Correo Electrónico",
      accessor: "correoElectronico",
      disableGlobalFilter: true,
    },
    {
      Header: "Teléfono",
      accessor: "telefono",
      disableGlobalFilter: true,
    },
  ]);

  // Establecer las opciones de la tabla
  const tableOptions = {
    columns: columnas,
    data: proveedoresFlitrados,
    defaultColumn: {},
    isEditable: tableConfig.isEditable,
    withDragAndDrop: tableConfig.withDragAndDrop || false,
    dataLength: proveedoresFlitrados.length,
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

  // Función que retorna un proveedor de la base de datos
  const seleccionarProveedor = async (proveedorId) => {
    const proveedor = await Axios.get(`/api/proveedores/${proveedorId}`);
    return proveedor.data;
  };

  // Funcionalidad para abrir el modal versión agregar
  const agregarProveedor = () => {
    setProveedor({});
    setReadonly(false);
    setModal(true);
    history.push("/lista/proveedores?editar=true");
  };

  // Funcionalidad para abrir el modal versión ver
  const verProveedor = async (proveedorId) => {
    seleccionarProveedor(proveedorId).then((response) => {
      const proveedor = {
        id: response.proveedor[0].id,
        nombreProveedor: response.proveedor[0].nombreProveedor,
        cedulaJuridica: response.proveedor[0].cedulaJuridica,
        direccion: response.proveedor[0].direccion,
        correoElectronico: response.proveedor[0].correoElectronico,
        telefono: response.proveedor[0].telefono,
      };
      setProveedor(proveedor);
      setReadonly(true);
      setModal(true);
      history.push(`/lista/proveedores?id=${proveedor.id}`);
    });
  };

  // Funcionalidad para abrir el modal versión editar
  const editarProveedor = async (proveedorId) => {
    seleccionarProveedor(proveedorId).then((response) => {
      const proveedor = {
        id: response.proveedor[0].id,
        nombreProveedor: response.proveedor[0].nombreProveedor,
        cedulaJuridica: response.proveedor[0].cedulaJuridica,
        direccion: response.proveedor[0].direccion,
        correoElectronico: response.proveedor[0].correoElectronico,
        telefono: response.proveedor[0].telefono,
      };
      setProveedor(proveedor);
      setReadonly(false);
      setModal(true);
      history.push(`/lista/proveedores?id=${proveedor.id}&editar=true`);
    });
  };

  // Funcionalidad para eliminar un proveedor de la bd
  const eliminarProveedor = async (proveedorId) => {
    rutaActual("/lista/proveedores");
    seleccionarProveedor(proveedorId).then((response) => {
      const { nombreProveedor } = response.proveedor[0];
      let timerInterval;
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: `¿Desea eliminar al preveedor ${ nombreProveedor }?`,
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
            title: "Proveedor eliminado con éxito",
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
              await Axios.delete(`/api/proveedores/${proveedorId}`);
              history.push("/iniciar-sesion");
            },
          });
        }
      });
    });
  };

  // Flitro por nombre de proveedor
  const filtroNombre = (nombre) => {
    setProveedoresFlitrados(proveedores);
    if (!nombre) { return; }
    setProveedoresFlitrados(
      proveedores.filter((proveedor) => proveedor.nombreProveedor.normalize("NFD").replace(/[\u0300-\u036f]/g, '').match(new RegExp(nombre, "i")))
    );
  }

  const blockInvalidChar = e => !['ó', 'ú', 'í', 'é', 'á', "'", '1', '2', '3', '4','5', '6','7', '8','9', '0','Q', 'W','E', 'R','T', 'Y','U', 'I','O', 'P','Ñ', 'L','K', 'J','H', 'G','F', 'D','S', 'A','Z', 'X','C', 'V','B', 'N','M', 'q','w', 'e', 'r', 't','y', 'u','i', 'o','p', 'ñ','l', 'k','j', 'h','g', 'f','d', 's','a', 'z','x', 'c','v', 'b','n', 'm', 'Backspace', ' ', 'Ctrl', 'Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(e.key) && e.preventDefault();
  

  return (
    <Col md={12} lg={12}>
      <Card>
        <CardBody>

          {/* Parte superior tabla */}
          <div className="container">
            <div className="row">
              <div className="col-12 ml-auto">
                <button className="btn btn-success btn-small float-right" onClick={() => agregarProveedor()}>Agregar Proveedor</button>
              </div>
            </div>

            <div className="row">
              <div className="col-12 ml-auto">
                <div className="inbox__emails-control-search float-right">
                  <input type="text"placeholder="Buscar por nombre"onChange={(e) => filtroNombre(e.target.value)}  onKeyDown={blockInvalidChar}/>
                  <div className="inbox__emails-control-search-icon mr-2"> <MagnifyIcon /></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Proveedores */}
          <div className="table react-table">
            <table className={"react-table editable-table"}>
              <thead className="thead th">
                <tr className="react-table thead tr">
                  <th>Nombre</th>
                  <th>Cédula Jurídica</th>
                  <th>Correo Electrónico</th>
                  <th>Teléfono</th>
                  <th colSpan="3" style={{ textAlign: "right" }}></th>
                </tr>
              </thead>
              <tbody className="table table--bordered">
                {page.map((proveedor) => (
                  <tr key={proveedor.original.id} className="react-dnd-draggable">
                    <td>{proveedor.original.nombreProveedor}</td>
                    <td>{proveedor.original.cedulaJuridica.split('')[0]}-{proveedor.original.cedulaJuridica.split('')[1]}
                      {proveedor.original.cedulaJuridica.split('')[2]}{proveedor.original.cedulaJuridica.split('')[3]}-
                      {proveedor.original.cedulaJuridica.split('')[4]}{proveedor.original.cedulaJuridica.split('')[5]}
                      {proveedor.original.cedulaJuridica.split('')[6]}{proveedor.original.cedulaJuridica.split('')[7]}
                      {proveedor.original.cedulaJuridica.split('')[8]}{proveedor.original.cedulaJuridica.split('')[9]}</td>
                    <td>{proveedor.original.correoElectronico}</td>
                    <td>{proveedor.original.telefono.split('')[0]}{proveedor.original.telefono.split('')[1]}{proveedor.original.telefono.split('')[2]}
                      {proveedor.original.telefono.split('')[3]}-{proveedor.original.telefono.split('')[4]}{proveedor.original.telefono.split('')[5]}
                      {proveedor.original.telefono.split('')[6]}{proveedor.original.telefono.split('')[7]}</td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-success btn-sm" onClick={() => verProveedor(proveedor.original.id)}>Ver</button>
                      <button className="btn btn-warning btn-sm"onClick={() => editarProveedor(proveedor.original.id)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => eliminarProveedor(proveedor.original.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {proveedoresFlitrados.length === 0 && (
                  <tr><td className="text-center" colSpan="5">No hay proveedores.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación de la tabla */}
          {proveedoresFlitrados.length > 15 && (
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
              dataLength={proveedoresFlitrados.length}
            />
          )}

          {/* Modal Agregar / Editar Proveedor */}
          {abrirModal && (
            <EditarProveedor
              proveedores={proveedores}
              color="success"
              setModal={setModal}
              abierto={abrirModal}
              proveedor={proveedor}
              readonly={readonly}
            />
          )}

        </CardBody>
      </Card>
    </Col>
  );
};

export default EstructuraTabla;
