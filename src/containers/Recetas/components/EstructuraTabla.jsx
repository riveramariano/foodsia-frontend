import React, { useState, useEffect, useContext } from "react";
import EditarReceta from "./EditarReceta";
import Axios from "../../../config/axios";
import ReactTablePagination from "../../../shared/components/table/components/ReactTablePagination";
import Swal from "sweetalert2";
import Select from "react-select";
import { useHistory } from "react-router-dom";
import MagnifyIcon from "mdi-react/MagnifyIcon";
import { useForm, Controller } from "react-hook-form";
import { Row, Card, CardBody, Col, Badge } from "reactstrap";
import { useTable, useGlobalFilter, usePagination, useSortBy, useResizeColumns, useRowSelect } from "react-table";
import RouteContext from "../../../context/routing/routeContext";

const EstructuraTabla = ({ recetas, productos, tiposMascota, recetasFiltradas, setRecetasFiltradas }) => {

  const [abrirModal, setModal] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [receta, setReceta] = useState({});
  const { control } = useForm();
  const history = useHistory();
  const routeContext = useContext(RouteContext);
  const { rutaActual } = routeContext;

  // Mostrar tipos mascota en dropdown
  const [opcionesTipoMascota] = useState([]);

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
    data: recetasFiltradas,
    defaultColumn: {},
    isEditable: tableConfig.isEditable,
    withDragAndDrop: tableConfig.withDragAndDrop || false,
    dataLength: recetasFiltradas.length,
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
      for (const tipoMascota of tiposMascota) {
        opcionesTipoMascota.push({ value: tipoMascota.id, label: tipoMascota.nombreTipoMascota });
      }
    };
    realizarPeticiones();
  }, [tiposMascota, opcionesTipoMascota]);

  // Función que retorna un cliente de la base de datos
  const seleccionarReceta = async (recetaId) => {
    const receta = await Axios.get(`/api/recetas/${recetaId}`);
    return receta.data;
  };

  // Funcionalidad para abrir el modal versión agregar
  const agregarReceta = () => {
    setReceta({});
    setReadonly(false);
    setModal(true);
    history.push("/lista/recetas?editar=true");
  }

  // Funcionalidad para abrir el modal versión ver
  const verReceta = async (recetaId) => {
    seleccionarReceta(recetaId).then((response) => {
      const receta = {
        id: response.receta[0].id,
        nombreProducto: response.receta[0].nombreProducto,
        imagen: response.receta[0].imagen,
        precio: response.receta[0].precio,
        material: response.receta[0].material,
        humedad: response.receta[0].humedad,
        proteina: response.receta[0].proteina,
        grasaCruda: response.receta[0].grasaCruda,
        fibraCruda: response.receta[0].fibraCruda,
        tipoMascota: {
          value: response.receta[0].tipoMascotaId,
          label: response.receta[0].nombreTipoMascota,
        },
      };
      setReceta(receta);
      setReadonly(true);
      setModal(true);
      history.push(`/lista/recetas?id=${receta.id}`);
    });
  };

  // Funcionalidad para abrir el modal versión editar
  const editarReceta = async (recetaId) => {
    seleccionarReceta(recetaId).then((response) => {
      const receta = {
        id: response.receta[0].id,
        nombreProducto: response.receta[0].nombreProducto,
        imagen: response.receta[0].imagen,
        precio: response.receta[0].precio,
        material: response.receta[0].material,
        humedad: response.receta[0].humedad,
        proteina: response.receta[0].proteina,
        grasaCruda: response.receta[0].grasaCruda,
        fibraCruda: response.receta[0].fibraCruda,
        tipoMascota: {
          value: response.receta[0].tipoMascotaId,
          label: response.receta[0].nombreTipoMascota,
        },
      };
      setReceta(receta);
      setReadonly(false);
      setModal(true);
      history.push(`/lista/recetas?id=${receta.id}&editar=true`);
    });
  };

  // Funcionalidad para eliminar una receta de la bd
  const eliminarReceta = async (recetaId) => {
    rutaActual("/lista/recetas");
    seleccionarReceta(recetaId).then((response) => {
      const { nombreProducto } = response.receta[0];
      let timerInterval;
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: `¿Desea eliminar la receta ${nombreProducto}?`,
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
            title: "Receta eliminada con éxito",
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
              await Axios.delete(`/api/recetas/${recetaId}`);
              history.push("/iniciar-sesion");
            },
          });
        }
      });
    });
  };

    //Filtro con dropdown de tipo Mascota
  const filtroTipoMascota = (tipoMascota) => {
    setRecetasFiltradas(recetas);
    if (!tipoMascota) { return; }
    setRecetasFiltradas(
      recetas.filter((receta) => receta.nombreTipoMascota === tipoMascota.label)
    );
  }

  // Filtro por nombre de receta
  const filtroNombre = (nombre) =>{
    setRecetasFiltradas(recetas);
    if (!nombre) { return; }
    setRecetasFiltradas(
      recetas.filter((receta) => receta.nombreProducto.normalize("NFD").replace(/[\u0300-\u036f]/g, '').match(new RegExp(nombre, "i")))
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
              <button className="btn btn-success btn-small float-right mt-1" onClick={() => agregarReceta()}>
                Agregar Receta
              </button>
              </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="row">
              <div className="col-12 ml-auto">
                <div className="inbox__emails-control-search float-right">
                  <input type="text" placeholder="Buscar por nombre" onChange={(e) => filtroNombre(e.target.value)} onKeyDown={blockInvalidChar}/>
                  <div className="inbox__emails-control-search-icon mr-2"><MagnifyIcon /></div>
                </div>
              </div>
            </div>

            {/* Lista de tipo mascota */}
            <div className="row mt-3">
              <div className="col-12 ml-auto">
              <Controller
                  control={control}
                  name="tipoMascota"
                  render={({ field }) => (
                    <Select
                      className="react-select__menu border float-right"
                      onChange={(tipoMascota) => filtroTipoMascota(tipoMascota)}
                      options={opcionesTipoMascota}
                      value={field.value}
                      placeholder="Seleccione el tipo de mascota que desea filtrar"
                      classNamePrefix="react-select"
                      isClearable={true}
                    />
                  )}
                />
              </div>
            </div>

          </div>


          {/* Tabla de Recetas */}
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
                {page.map((receta) => (
                  <tr key={receta.original.id} className="react-dnd-draggable">
                    <td>{receta.original.nombreProducto}</td>
                    <td>₡ {receta.original.precio}</td>
                    {receta.original.nombreTipoMascota === "Atlético" && (
                      <td><Badge className="badge-blue">{receta.original.nombreTipoMascota}</Badge></td>
                    )}
                    {receta.original.nombreTipoMascota === "Cachorro" && (
                      <td><Badge className="badge-purple">{receta.original.nombreTipoMascota}</Badge></td>
                    )}
                    {receta.original.nombreTipoMascota === "Normal" && (
                      <td><Badge className="badge-green">{receta.original.nombreTipoMascota}</Badge></td>
                    )}
                    {receta.original.nombreTipoMascota === "Sobrepeso" && (
                      <td><Badge className="badge-red">{receta.original.nombreTipoMascota}</Badge></td>
                    )}
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-success btn-sm" onClick={() => verReceta(receta.original.id)}>Ver</button>
                      <button className="btn btn-warning btn-sm"onClick={() => editarReceta(receta.original.id)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => eliminarReceta(receta.original.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {recetasFiltradas.length === 0 && (
                  <tr><td className="text-center" colSpan="5">No hay recetas.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación de la tabla */}
          {recetasFiltradas.length > 15 && (
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
              dataLength={recetasFiltradas.length}
            />
          )}

          {/* Modal Agregar / Editar Receta */}
          {abrirModal && (
            <EditarReceta
              productos={productos}
              color="success"
              setModal={setModal}
              abierto={abrirModal}
              receta={receta}
              tiposMascota={tiposMascota}
              readonly={readonly}
            />
          )}

        </CardBody>
      </Card>
    </Col>
  );
};

export default EstructuraTabla;
