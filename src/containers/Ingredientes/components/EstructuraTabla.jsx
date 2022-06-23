import React, { useState, useContext, useEffect } from "react";
import Swal from "sweetalert2";
import { Row, Card, CardBody, Col, Badge } from "reactstrap";
import EditarIngrediente from "./EditarIngrediente";
import Axios from "../../../config/axios";
import { useTable, useGlobalFilter, usePagination, useSortBy, useResizeColumns, useRowSelect } from "react-table";
import ReactTablePagination from "../../../shared/components/table/components/ReactTablePagination";
import { useHistory } from "react-router-dom";
import MagnifyIcon from "mdi-react/MagnifyIcon";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import RouteContext from "../../../context/routing/routeContext";

const EstructuraTabla = ({ ingredientes, proveedores, unidades, ingredientesFlitrados, setIngredientesFlitrados }) => {

  const [abrirModal, setModal] = useState(false);
  const [ingrediente, setIngrediente] = useState({});
  const [readonly, setReadonly] = useState(false);
  const { control } = useForm();
  const history = useHistory();

  // Mostrar proveedor en dropdown
  const [opcionesProveedor] = useState([]);

  const routeContext = useContext(RouteContext);
  const { rutaActual } = routeContext;

  // Establecer la configuracion de la tabla
  const tableConfig = { manualPageSize: [15, 30, 45] };

  const [columnas] = useState([
    {
      Header: "Nombre Ingrediente",
      accessor: "nombre",
      disableGlobalFilter: true,
    },
    {
      Header: "Precio Unitario",
      accessor: "precio",
      disableGlobalFilter: true,
    },
    {
      Header: "Unidad Utilizada",
      accessor: "Unidad",
      disableGlobalFilter: true,
    },
  ]);

  // Establecer las opciones de la tabla
  const tableOptions = {
    columns: columnas,
    data: ingredientesFlitrados,
    defaultColumn: {},
    isEditable: tableConfig.isEditable,
    withDragAndDrop: tableConfig.withDragAndDrop || false,
    dataLength: ingredientesFlitrados.length,
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

  // Convierte el arreglo de proveedores en un arreglo entendible para la librería react-select
  useEffect(() => {
    const realizarPeticiones = () => {
      for (const proveedor of proveedores) {
        opcionesProveedor.push({ value: proveedor.id, label: proveedor.nombreProveedor });
      }
    };
    realizarPeticiones();
  }, [proveedores, opcionesProveedor]);

  // Función que retorna un ingrediente de la base de datos
  const seleccionarIngrediente = async (ingredienteId) => {
    const ingrediente = await Axios.get(`/api/ingredientes/${ingredienteId}`);
    return ingrediente.data;
  };

  // Funcionalidad para abrir el modal versión agregar
  const agregarEmpleado = () => {
    setIngrediente({});
    setReadonly(false);
    setModal(true);
    history.push("/lista/ingredientes?editar=true");
  };

  // Funcionalidad para abrir el modal versión ver
  const verIngrediente = async (ingredienteId) => {
    seleccionarIngrediente(ingredienteId).then((response) => {
      setIngrediente(response.ingrediente);
      setReadonly(true);
      setModal(true);
      history.push(`/lista/ingredientes?id=${response.ingrediente.id}`);
    });
  };

  // Funcionalidad para abrir el modal versión editar
  const editarIngrediente = async (ingredienteId) => {
    seleccionarIngrediente(ingredienteId).then((response) => {
      setIngrediente(response.ingrediente);
      setReadonly(false);
      setModal(true);
      history.push(`/lista/ingredientes?id=${response.ingrediente.id}&editar=true`);
    });
  };

  // Funcionalidad para eliminar un ingrediente de la bd
  const eliminarIngrediente = async (ingredienteId) => {
    rutaActual("/lista/ingredientes");
    seleccionarIngrediente(ingredienteId).then((response) => {
      const { nombreIngrediente } = response.ingrediente;
      let timerInterval;
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: `¿Desea eliminar el ingrediente ${nombreIngrediente}?`,
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
            title: "Ingrediente eliminado con éxito",
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
              await Axios.delete(`/api/ingredientes/${ingredienteId}`);
              history.push("/iniciar-sesion");
            },
          });
        }
      });
    });
  };

  // Filtrar con dropdown de Proveedores
  const filtroProveedor = (proveedor) => {
    setIngredientesFlitrados(ingredientes);
    if (!proveedor) { return; }
    setIngredientesFlitrados(
      ingredientes.filter((ingrediente) => ingrediente.proveedorId === proveedor.value)
    );
  }

  // Flitro por nombre de Ingrediente
  const filtroNombre = (nombre) => {
    setIngredientesFlitrados(ingredientes);
    if (!nombre) { return; }
    setIngredientesFlitrados(
      ingredientes.filter((ingrediente) => ingrediente.nombreIngrediente.normalize("NFD").replace(/[\u0300-\u036f]/g, '').match(new RegExp(nombre, "i")))
    );
  }

  const blockInvalidChar = e => !['ó', 'ú', 'í', 'é', 'á', "'", '1', '2', '3', '4','5', '6','7', '8','9', '0','Q', 'W','E', 'R','T', 'Y','U', 'I','O', 'P','Ñ', 'L','K', 'J','H', 'G','F', 'D','S', 'A','Z', 'X','C', 'V','B', 'N','M', 'q','w', 'e', 'r', 't','y', 'u','i', 'o','p', 'ñ','l', 'k','j', 'h','g', 'f','d', 's','a', 'z','x', 'c','v', 'b','n', 'm', 'Backspace', ' ', 'Ctrl', 'Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(e.key) && e.preventDefault();
  

  return (
    <Col md={12} lg={12}>
      <Card>
        <CardBody>
          <div className="container">
            <div className="row">
              <div className="col-12 ml-auto">
                <button
                  className="btn btn-success btn-small float-right"
                  onClick={() => agregarEmpleado()}
              >
                Agregar Ingrediente
              </button>
              </div>
            </div>

            <div className="row">
              <div className="col-12 ml-auto">
                <div className="inbox__emails-control-search float-right">
                  <input
                    type="text"
                    placeholder="Buscar por nombre de ingrediente"
                    onChange={(e) => filtroNombre(e.target.value)} onKeyDown={blockInvalidChar} />
                  <div className="inbox__emails-control-search-icon mr-2">
                    <MagnifyIcon />
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12 ml-auto">
              <Controller
                  control={control}
                  name="proveedor"
                  render={({ field }) => (
                    <Select
                      className="react-select__menu border float-right"
                      onChange={(proveedor) => filtroProveedor(proveedor)}
                      options={opcionesProveedor}
                      value={field.value}
                      placeholder="Seleccione el proveedor que desea filtrar"
                      classNamePrefix="react-select"
                      isClearable={true}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Tabla de Ingredientes */}
          <div className="table react-table">
            <table className={"react-table editable-table"}>
              <thead className="thead th">
                <tr className="react-table thead tr">
                  <th>Nombre Ingrediente</th>
                  <th>Precio Unitario</th>
                  <th>Unidad Utilizada</th>
                  <th colSpan="3" style={{ textAlign: "right" }}></th>
                </tr>
              </thead>
              <tbody className="table table--bordered">
                {page.map((ingrediente) => (
                  <tr key={ingrediente.original.id} className="react-dnd-draggable">
                    <td>{ingrediente.original.nombreIngrediente}</td>
                    <td>₡ {ingrediente.original.precioUnitario}</td>
                    {ingrediente.original.nombreUnidad === "Mililitro" && (
                      <td><Badge className="badge-blue">{ingrediente.original.nombreUnidad}</Badge></td>
                    )}
                    {ingrediente.original.nombreUnidad === "Kilogramo" && (
                      <td><Badge className="badge-purple">{ingrediente.original.nombreUnidad}</Badge></td>
                    )}
                    {ingrediente.original.nombreUnidad === "Gramo" && (
                      <td><Badge className="badge-green">{ingrediente.original.nombreUnidad}</Badge></td>
                    )}
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-success btn-sm" onClick={() => verIngrediente(ingrediente.original.id)}>Ver</button>
                      <button className="btn btn-warning btn-sm" onClick={() => editarIngrediente(ingrediente.original.id)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => eliminarIngrediente(ingrediente.original.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {ingredientesFlitrados.length === 0 && (
                  <tr><td className="text-center" colSpan="5">No hay ingredientes.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación de la tabla */}
          {ingredientesFlitrados.length > 15 && (
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
              dataLength={ingredientesFlitrados.length}
            />
          )}

          {abrirModal && (
            <EditarIngrediente
              ingredientes={ingredientes}
              ingrediente={ingrediente}
              proveedores={opcionesProveedor}
              unidades={unidades}
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
