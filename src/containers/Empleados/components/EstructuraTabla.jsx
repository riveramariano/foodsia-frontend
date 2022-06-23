import React, { useState, useContext } from "react";
import EditarEmpleado from "./EditarEmpleado";
import Axios from "../../../config/axios";
import ReactTablePagination from "../../../shared/components/table/components/ReactTablePagination";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";
import MagnifyIcon from "mdi-react/MagnifyIcon";
import { Card, CardBody, Col, Badge } from "reactstrap";
import { useTable, useGlobalFilter, usePagination, useSortBy, useResizeColumns, useRowSelect } from "react-table";
import RouteContext from "../../../context/routing/routeContext";
import AuthContext from "../../../context/authContext";
import { ExcelExport, ExcelExportColumn } from "@progress/kendo-react-excel-export";

const EstructuraTabla = ({ empleados, tiposUsuario, ausenciasEmpleados, empleadosFiltrados, setEmpleadosFiltrados }) => {

  const [abrirModal, setModal] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [empleado, setEmpleado] = useState({});

  const history = useHistory();
  const routeContext = useContext(RouteContext);
  const { rutaActual } = routeContext;

  // Extraer la información de autenticación
  const authContext = useContext(AuthContext);
  const { usuario } = authContext;

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
      Header: "Tipo Empleado",
      accessor: "tipoEmpleado",
      disableGlobalFilter: true,
    },
  ]);

  // Establecer las opciones de la tabla
  const tableOptions = {
    columns: columnas,
    data: empleadosFiltrados,
    defaultColumn: {},
    isEditable: tableConfig.isEditable,
    withDragAndDrop: tableConfig.withDragAndDrop || false,
    dataLength: empleadosFiltrados.length,
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

  const current = new Date();
  current.setMonth(current.getMonth());
  const mesActual = current.toLocaleString("es-MX", { month: "long" });
  const mesFormateado = mesActual[0].toUpperCase() + mesActual.slice(1);

  // Función que retorna un empleado de la base de datos
  const seleccionarEmpleado = async (empleadoId) => {
    const empleado = await Axios.get(`/api/empleados/${empleadoId}`);
    return empleado.data;
  };

  // Funcionalidad para abrir el modal versión agregar
  const agregarEmpleado = () => {
    setEmpleado({});
    setReadonly(false);
    setModal(true);
    history.push("/lista/empleados?editar=true");
  };

  // Funcionalidad para abrir el modal versión ver
  const verEmpleado = async (empleadoId) => {
    seleccionarEmpleado(empleadoId).then((response) => {
      setEmpleado(response.empleado);
      setReadonly(true);
      setModal(true);
      history.push(`/lista/empleados?id=${response.empleado.id}`);
    });
  };

  // Funcionalidad para abrir el modal versión editar
  const editarEmpleado = async (empleadoId) => {
    seleccionarEmpleado(empleadoId).then((response) => {
      setEmpleado(response.empleado);
      setReadonly(false);
      setModal(true);
      history.push(`/lista/empleados?id=${response.empleado.id}`);
    });
  };

  // Funcionalidad para eliminar un empleado de la bd
  const eliminarEmpleado = async (empleadoId) => {
    rutaActual("/lista/empleados");
    seleccionarEmpleado(empleadoId).then((response) => {
      if (usuario[0].id === empleadoId) {
        Swal.fire({
          icon: "info",
          title: "Operación no permitida",
          text: "No puede eliminar su propio usuario.",
          showCancelButton: false,
          confirmButtonColor: "#238484",
          confirmButtonText: "Confirmar",
        });
        return;
      }
      const { nombreUsuario, primerApellido } = response.empleado;
      let timerInterval;
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: `¿Desea eliminar al empleado ${nombreUsuario} ${primerApellido}?`,
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
            title: "Empleado eliminado con éxito",
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
              await Axios.delete(`/api/empleados/${empleadoId}`);
              history.push("/iniciar-sesion");
            },
          });
        }
      });
    });
  };

  // Exportar reporte en formato excel
  const reporteExcel = React.useRef(null);
  const reporteAusencias = () => {
    if (reporteExcel.current !== null) {
      reporteExcel.current.save();
    }
  };

  // Flitro por nombre de empleado
  const filtroNombre = (nombre) => {
    setEmpleadosFiltrados(empleados);
    if (!nombre) {
      return;
    }
    setEmpleadosFiltrados(
      empleados.filter((empleado) =>
        empleado.nombreUsuario
          .normalize("NFD")
          .replace(/[^\w\s]/g, "")
          .match(new RegExp(nombre, "i"))
      )
    );
  };

  return (
    <Col md={12} lg={12}>
      <Card>
        <CardBody>
          <div className="row">
            <div className="col mt-1"> 
              <ExcelExport data={ausenciasEmpleados} fileName={`Ausencias - ${mesFormateado}.xlsx`} ref={reporteExcel} >
                <ExcelExportColumn
                  field="nombreEmpleado"
                  title="Nombre Empleado"
                  locked={true}
                  width={200}
                />
                <ExcelExportColumn
                  field="ausencias"
                  title="Cantidad de Eventos de Ausencia"
                  width={230}
                />
              </ExcelExport>
              <button title="Reporte Ausencias Mensuales" className="btn btn-success btn-small float-right"  onClick={reporteAusencias} disabled={!ausenciasEmpleados.length}> Reporte Ausencias Mensuales</button>
              <div className="row">
                <div className="col-12 ml-auto">
                  <button className="btn btn-success btn-small float-right" onClick={() => agregarEmpleado()}>Agregar Empleado</button>
                </div>
              </div>

              <div className="row">
                <div className="col-12 ml-auto">
                  <div className="inbox__emails-control-search float-right">
                    <input type="text" placeholder="Buscar empleado por nombre" onChange={(e) => filtroNombre(e.target.value)}/>
                    <div className="inbox__emails-control-search-icon mr-2"><MagnifyIcon /></div>
                  </div>
                </div>
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
                  <th>Tipo Empleado</th>
                  <th colSpan="2" style={{ textAlign: "right" }}></th>
                </tr>
              </thead>
              <tbody className="table table--bordered">
                {page.map((empleado) => (
                  <tr key={empleado.original.id} className="react-dnd-draggable">
                    <td>{empleado.original.nombreUsuario} {empleado.original.primerApellido} {empleado.original.segundoApellido}</td>
                    <td>{empleado.original.telefono.split('')[0]}{empleado.original.telefono.split('')[1]}{empleado.original.telefono.split('')[2]}
                      {empleado.original.telefono.split('')[3]}-{empleado.original.telefono.split('')[4]}{empleado.original.telefono.split('')[5]}
                      {empleado.original.telefono.split('')[6]}{empleado.original.telefono.split('')[7]}</td>
                    {empleado.original.nombreTipoUsuario === "Administrador" && (
                      <td><Badge className="badge-green">{empleado.original.nombreTipoUsuario}</Badge></td>
                    )}
                    {empleado.original.nombreTipoUsuario  === "Empleado" && (
                      <td><Badge className="badge-blue">{empleado.original.nombreTipoUsuario }</Badge></td>
                    )}
                    {empleado.original.nombreTipoUsuario  === "Superadmin" && (
                      <td><Badge className="badge-red">{empleado.original.nombreTipoUsuario }</Badge></td>
                    )}
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-success btn-sm" onClick={() => verEmpleado(empleado.original.id)}>Ver</button>
                      {(empleado.original.nombreTipoUsuario !== "Superadmin" || usuario[0].nombreTipoUsuario === "Superadmin") &&
                        <button className="btn btn-warning btn-sm" onClick={() => editarEmpleado(empleado.original.id)}>Editar</button>
                      }
                      {(empleado.original.nombreTipoUsuario === "Empleado" || 
                        (empleado.original.nombreTipoUsuario === "Administrador" && usuario[0].nombreTipoUsuario === "Superadmin")) && 
                        <button className="btn btn-danger btn-sm" onClick={() => eliminarEmpleado(empleado.original.id)}>Eliminar</button>
                      }
                    </td>
                  </tr>
                ))}
                {empleadosFiltrados.length === 0 && (
                  <tr><td className="text-center" colSpan="5">No hay empleados.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación de la tabla */}
          {empleadosFiltrados.length > 15 && (
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
              dataLength={empleadosFiltrados.length}
            />
          )}

          {/* Modal de Agregar / Editar Clientes */}
          {abrirModal && (
            <EditarEmpleado
              usuario={usuario}
              empleados={empleados}
              empleado={empleado}
              tiposUsuario={tiposUsuario}
              abierto={abrirModal}
              readonly={readonly}
              setModal={setModal}
            />
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

export default EstructuraTabla;
