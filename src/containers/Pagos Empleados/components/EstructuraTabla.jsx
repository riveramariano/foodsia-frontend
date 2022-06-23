import React, { useState, useContext } from "react";
import EditarPago from "./EditarPago";
import ReactTablePagination from "../../../shared/components/table/components/ReactTablePagination";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";
import Axios from "../../../config/axios";
import { Card, CardBody, Col } from "reactstrap";
import { useTable, useGlobalFilter, usePagination, useSortBy, useResizeColumns, useRowSelect } from "react-table";
import RouteContext from "../../../context/routing/routeContext";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import moment from "moment";
import { ExcelExport, ExcelExportColumn } from "@progress/kendo-react-excel-export";

const EstructuraTabla = ({ pagoEmpleados, reportePagoEmpleados, empleados, pagoEmpleadosFiltrados, setPagoEmpleadosFiltrados }) => {

  const [abrirModal, setModal] = useState(false);
  const [pagoEmpleado, setPagoEmpleado] = useState({});
  const [readonly, setReadonly] = useState(false);

  const history = useHistory();
  const routerContext = useContext(RouteContext);
  const { rutaActual } = routerContext;
  const { control } = useForm();

  // Establecer la configuración de la tabla
  const tableConfig = { manualPageSize: [15, 30, 45] };

  const [columnas] = useState([
    {
      Header: "Nombre Completo",
      accessor: "nombre",
      disableGlobalFilter: true,
    },
    {
      Header: "Teléfono",
      accessor: "telefono",
      disableGlobalFilter: true,
    },
    {
      Header: "Fecha de Pago",
      accessor: "fechaPago",
      disableGlobalFilter: true,
    },
    {
      Header: "Pago de Empleado",
      accessor: "pagoEmpleado",
      disableGlobalFilter: true,
    },
  ]);

  // Establecer las opciones de la tabla
  const tableOptions = {
    columns: columnas,
    data: pagoEmpleadosFiltrados,
    defaultColumn: {},
    isEditable: tableConfig.isEditable,
    withDragAndDrop: tableConfig.withDragAndDrop || false,
    dataLength: pagoEmpleadosFiltrados.length,
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

  // Función que retorna un  pago empleado de la base de datos
  const seleccionarPagoEmpleado = async (pagoEmpleadoId) => {
    const pagoEmpleado = await Axios.get(
      `/api/pagoEmpleados/${pagoEmpleadoId}`
    );
    return pagoEmpleado.data;
  };

  // Funcionalidad para abrir el modal versión agregar
  const agregarPagoEmpleado = () => {
    setPagoEmpleado({});
    setReadonly(false);
    setModal(true);
    history.push("/lista/pagos-empleados?editar=true");
  };

  // Funcionalidad para abrir el modal versión ver
  const verPagoEmpleado = async (pagoEmpleadoId) => {
    seleccionarPagoEmpleado(pagoEmpleadoId).then((response) => {
      setPagoEmpleado(response.pagoEmpleado);
      setReadonly(true);
      setModal(true);
      history.push(`/lista/pagos-empleados?id=${response.pagoEmpleado.id}`);
    });
  };

  // Funcionalidad para abrir el modal versión editar
  const editarPagoEmpleado = async (pagoEmpleadoId) => {
    seleccionarPagoEmpleado(pagoEmpleadoId).then((response) => {
      setPagoEmpleado(response.pagoEmpleado);
      setReadonly(false);
      setModal(true);
      history.push(`/lista/pagos-empleados?id=${response.pagoEmpleado.id}`);
    });
  };

  // Funcionalidad para eliminar un pago empleado de la bd
  const eliminarPagoEmpleado = async (pagoEmpleadoId) => {
    rutaActual("/lista/pagos-empleados");
    let timerInterval;
    Swal.fire({
      icon: "warning",
      title: "Atención",
      text: `¿Desea eliminar este pago de empleado?`,
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
          title: "Pago eliminado con éxito",
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
            await Axios.delete(`/api/pagoEmpleados/${pagoEmpleadoId}`);
            history.push("/iniciar-sesion");
          },
        });
      }
    });
  };

  // Exportar reporte en formato excel
  const reporteExcel = React.useRef(null);
  const reportePagosEmpleados = () => {
    if (reporteExcel.current !== null) {
      reporteExcel.current.save();
    }
  };

  // Filtrar con dropdown de empleados
  const filtroNombre = (empleados) => {
    setPagoEmpleadosFiltrados(pagoEmpleados);
    if (!empleados) {
      return;
    }
    setPagoEmpleadosFiltrados(
      pagoEmpleados.filter((pedido) => pedido.usuarioId === empleados.value)
    );
  };

  return (
    <Col md={12} lg={12}>
      <Card>
        <CardBody>
          <div className="row">
            <div className="col mt-1">
              {/* Botón para descargar un reporte de Pagos */}
              <ExcelExport data={reportePagoEmpleados} fileName="Pagos Empleados Semestrales.xlsx" ref={reporteExcel} >
                <ExcelExportColumn
                  field="nombreEmpleado"
                  title="Nombre Empleado"
                  locked={true}
                  width={200}
                />
                <ExcelExportColumn
                  field="fechaPago"
                  title="Fecha Pago"
                  width={200}
                />
                <ExcelExportColumn field="monto" title="Monto" width={200} />
              </ExcelExport>
              <button
                title="Reporte Pagos Semestrales"
                className="btn btn-success btn-small float-right"
                onClick={reportePagosEmpleados}
                disabled={!reportePagoEmpleados.length}
              >
                Reporte Pagos Semestrales
              </button>
            

            
              <div className="row">
                {/* Botón para agregar un nuevo pago empleado */}
                <div className="col-12 ml-auto">
                  <button
                    className="btn btn-success btn-small float-right"
                    onClick={() => agregarPagoEmpleado()}
                  >
                    Agregar Pago
                  </button>
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
                          onChange={(empleados) => filtroNombre(empleados)}
                          options={empleados}
                          value={field.value}
                          placeholder="Seleccione el empleado que desea filtrar"
                          classNamePrefix="react-select"
                          isClearable={true}
                        />
                      )}
                    />
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Pagos Empleados */}
          <div className="table react-table">
            <table className={"react-table editable-table"}>
              <thead className="thead th">
                <tr className="react-table thead tr">
                  <th>Nombre Completo</th>
                  <th>Fecha del Pago</th>
                  <th>Pago de Empleado</th>
                  <th colSpan="2" style={{ textAlign: "right" }}></th>
                </tr>
              </thead>
              <tbody className="table table--bordered">
                {page.map((pagoEmpleados) => (
                  <tr
                    key={pagoEmpleados.original.id}
                    className="react-dnd-draggable"
                  >
                    <td>
                      {" "}
                      {pagoEmpleados.original.nombreUsuario}{" "}
                      {pagoEmpleados.original.primerApellido}{" "}
                      {pagoEmpleados.original.segundoApellido}
                    </td>
                    <td>
                      {pagoEmpleados.original.fechaPago &&
                        moment(pagoEmpleados.original.fechaPago).format(
                          "DD-MM-YYYY"
                        )}
                    </td>
                    <td>₡ {pagoEmpleados.original.monto}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          verPagoEmpleado(pagoEmpleados.original.id)
                        }
                      >
                        {" "}
                        Ver{" "}
                      </button>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() =>
                          editarPagoEmpleado(pagoEmpleados.original.id)
                        }
                      >
                        {" "}
                        Editar{" "}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          eliminarPagoEmpleado(pagoEmpleados.original.id)
                        }
                      >
                        {" "}
                        Eliminar{" "}
                      </button>
                    </td>
                  </tr>
                ))}
                {pagoEmpleadosFiltrados.length === 0 && (
                  <tr>
                    <td className="text-center" colSpan="6">
                      No hay pagos empleados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación de la tabla */}
          {pagoEmpleadosFiltrados.length > 15 && (
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
              dataLength={pagoEmpleadosFiltrados.length}
            />
          )}
          {abrirModal && (
            <EditarPago
              pagoEmpleado={pagoEmpleado}
              empleados={empleados}
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
