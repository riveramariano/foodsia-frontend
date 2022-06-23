import React, { useState, useContext } from "react";
import EditarJuguete from "./EditarJuguete";
import Axios from "../../../config/axios";
import ReactTablePagination from "../../../shared/components/table/components/ReactTablePagination";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";
import MagnifyIcon from "mdi-react/MagnifyIcon";
import { Card, CardBody, Col, Badge } from "reactstrap";
import { useTable, useGlobalFilter, usePagination, useSortBy, useResizeColumns, useRowSelect } from "react-table";
import RouteContext from "../../../context/routing/routeContext";

const EstructuraTabla = ({ juguetes, tiposMascota, juguetesFlitrados, setJuguetesFlitrados }) => {

  const [abrirModal, setModal] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [juguete, setJuguete] = useState({});
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
      Header: "Precio",
      accessor: "precio",
      disableGlobalFilter: true,
    },
    {
      Header: "Tipo Mascota",
      accessor: "tipoMascota",
      disableGlobalFilter: true,
    },
  ]);

  // Establecer las opciones de la tabla
  const tableOptions = {
    columns: columnas,
    data: juguetesFlitrados,
    defaultColumn: {},
    isEditable: tableConfig.isEditable,
    withDragAndDrop: tableConfig.withDragAndDrop || false,
    dataLength: juguetesFlitrados.length,
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

  // Función que retorna un empleado
  const seleccionarJuguete = async (jugueteId) => {
    const juguete = await Axios.get(`/api/juguetes/${jugueteId}`);
    return juguete.data;
  };

  // Funcionalidad para abrir el modal versión agregar
  const agregarJuguete = () => {
    setJuguete({});
    setReadonly(false);
    setModal(true);
    history.push("/lista/juguetes?editar=true");
  };

  // Funcionalidad para abrir el modal versión ver
  const verJuguete = async (jugueteId) => {
    seleccionarJuguete(jugueteId).then((response) => {
      const juguete = {
        id: response.juguete[0].id,
        nombreProducto: response.juguete[0].nombreProducto,
        imagen: response.juguete[0].imagen,
        precio: response.juguete[0].precio,
        material: response.juguete[0].material,
        tipoMascota: {
          value: response.juguete[0].tipoMascotaId,
          label: response.juguete[0].nombreTipoMascota,
        },
      };
      setJuguete(juguete);
      setReadonly(true);
      setModal(true);
      history.push(`/lista/juguetes?id=${juguete.id}`);
    });
  };

  // Funcionalidad para abrir el modal versión editar
  const editarJuguete = async (jugueteId) => {
    seleccionarJuguete(jugueteId).then((response) => {
      const juguete = {
        id: response.juguete[0].id,
        nombreProducto: response.juguete[0].nombreProducto,
        imagen: response.juguete[0].imagen,
        precio: response.juguete[0].precio,
        material: response.juguete[0].material,
        tipoMascota: {
          value: response.juguete[0].tipoMascotaId,
          label: response.juguete[0].nombreTipoMascota,
        },
      };
      setJuguete(juguete);
      setReadonly(false);
      setModal(true);
      history.push(`/lista/juguetes?id=${juguete.id}&editar=true`);
    });
  };

  const eliminarJuguete = (jugueteId) => {
    rutaActual("/lista/juguetes");
    seleccionarJuguete(jugueteId).then((response) => {
      const { nombreProducto } = response.juguete[0];
      let timerInterval;
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: `¿Desea eliminar el juguete ${nombreProducto}?`,
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
            title: "Juguete eliminado con éxito",
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
              await Axios.delete(`/api/juguetes/${jugueteId}`);
              history.push("/iniciar-sesion");
            },
          });
        }
      });
    });
  };

  // Filtro por nombre del juguete
  const filtroNombre = (nombre) => {
    setJuguetesFlitrados(juguetes);
    if (!nombre) { return; }
    setJuguetesFlitrados(
      juguetes.filter((juguete) => juguete.nombreProducto.normalize("NFD").replace(/[\u0300-\u036f]/g, '').match(new RegExp(nombre, "i")))
    );
  };

  const blockInvalidChar = e => !['ó', 'ú', 'í', 'é', 'á', "'", '1', '2', '3', '4','5', '6','7', '8','9', '0','Q', 'W','E', 'R','T', 'Y','U', 'I','O', 'P','Ñ', 'L','K', 'J','H', 'G','F', 'D','S', 'A','Z', 'X','C', 'V','B', 'N','M', 'q','w', 'e', 'r', 't','y', 'u','i', 'o','p', 'ñ','l', 'k','j', 'h','g', 'f','d', 's','a', 'z','x', 'c','v', 'b','n', 'm', 'Backspace', ' ', 'Ctrl', 'Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(e.key) && e.preventDefault();

  return (
    <Col md={12} lg={12}>
      <Card>
        <CardBody>
          {/* Parte superior tabla */}
          <div className="container">
            <div className="row">
              <div className="col-12 ml-auto">
                <button className="btn btn-success btn-small float-right" onClick={() => agregarJuguete()} >
                  Agregar Juguete
                </button>
              </div>
            </div>

            <div className="row">
              <div className="col-12 ml-auto">
                <div className="inbox__emails-control-search float-right">
                    <input type="text"placeholder="Buscar por nombre de juguete"onChange={(e) => filtroNombre(e.target.value)} onKeyDown={blockInvalidChar}/>
                  <div className="inbox__emails-control-search-icon mr-2"> <MagnifyIcon /></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Juguetes */}
          <div className="table react-table">
            <table className={"react-table editable-table"}>
              <thead className="thead th">
                <tr className="react-table thead tr">
                  <th>Nombre </th>
                  <th>Precio</th>
                  <th>Tipos Mascota</th>
                  <th colSpan="3" style={{ textAlign: "right" }}></th>
                </tr>
              </thead>
              <tbody className="table table--bordered">
                {page.map((juguete) => (
                  <tr key={juguete.original.id} className="react-dnd-draggable">
                    <td>{juguete.original.nombreProducto}</td>
                    <td>₡ {juguete.original.precio}</td>
                    {juguete.original.nombreTipoMascota === "Grande" && (
                      <td><Badge className="badge-blue">{juguete.original.nombreTipoMascota}</Badge></td>
                    )}
                    {juguete.original.nombreTipoMascota === "Mediano" && (
                      <td><Badge className="badge-green">{juguete.original.nombreTipoMascota}</Badge></td>
                    )}
                    {juguete.original.nombreTipoMascota === "Pequeño" && (
                      <td><Badge className="badge-purple">{juguete.original.nombreTipoMascota}</Badge></td>
                    )}
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-success btn-sm" onClick={() => verJuguete(juguete.original.id)}>Ver</button>
                      <button className="btn btn-warning btn-sm"onClick={() => editarJuguete(juguete.original.id)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => eliminarJuguete(juguete.original.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {juguetesFlitrados.length === 0 && (
                  <tr><td className="text-center" colSpan="5">No hay juguetes.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación de la tabla */}
          {juguetesFlitrados.length > 15 && (
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
              dataLength={juguetesFlitrados.length}
            />
          )}

          {/* Modal Agregar / Editar Juguete */}
          {abrirModal && (
            <EditarJuguete
              juguetes={juguetes}
              color="success"
              readonly={readonly}
              setModal={setModal}
              abierto={abrirModal}
              juguete={juguete}
              tiposMascota={tiposMascota}
            />
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

export default EstructuraTabla;
