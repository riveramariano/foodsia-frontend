import React, { Fragment, useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Select from "react-select";
import Panel from "../../../shared/components/Panel";
import { useForm, Controller } from "react-hook-form";
import { ExcelExport, ExcelExportColumn } from "@progress/kendo-react-excel-export";

const AumentoPrecioIngredientes = ({ aumentoPrecio, aumentoPrecioReporte }) => {

  let [mensaje, setMensaje] = useState(true);
  // eslint-disable-next-line no-unused-vars
  let [ingredientesFiltrados, setIngredientesFiltrados] = useState([]);
  const [identificadores, setIdentificadores] = useState([]);
  const [ingredientesOpciones] = useState([]);
  const { control } = useForm();

  // Convierte el arreglo de ingrdientes en un arreglo entendible para la librería recharts
  useEffect(() => {
    const realizarPeticiones = () => {
      for (const ingrediente of aumentoPrecio) {
        ingredientesOpciones.push({ value: ingrediente.id, label: ingrediente.Nombre });
      }
    };
    realizarPeticiones();
  }, [aumentoPrecio, ingredientesOpciones]);

  const filtroIngrediente = (data) => {
    // Si existe un ingrediente seleccionado no mostrar el mensaje
    if (!data.length) { setMensaje(true); }
    if (data.length) { setMensaje(false); }
    
    // Insertar en un arreglo los id de los ingredientes seleccionados
    setIdentificadores([]);
    setIngredientesFiltrados([]);
    for (const ingrediente of data) { identificadores.push(ingrediente.value); }
    setIngredientesFiltrados(aumentoPrecioReporte.filter((aumento) => identificadores.includes(aumento.id)));

    // Mostrar condicionalmente ese elemento
    for (const ingrediente of aumentoPrecio) {
      identificadores.includes(ingrediente.id) 
        ? ingrediente.mostrar = true
        : ingrediente.mostrar = false;
    }
  }

  // Exportar reporte en formato excel
  const reporteExcel = React.useRef(null);
  const reporteAumentoPrecio = () => {
    if (reporteExcel.current !== null) {
      reporteExcel.current.save();
    }
  };

  return (
    <Panel lg={12} xl={12} md={12} title={"Historial de Aumento del precio de los ingredientes"} subhead={`Se muestra un gráfico líneal por ingrediente`}>
  
      {/* Filtro por ingrediente y botón de reportes */}
      <div className="form__form-group">
        <div className="form__form-group-field">
          <Controller
            control={control}
            name="mes"
            render={({ field }) => (
              <Select
                isMulti
                className="react-select"
                onChange={(ingrediente) => filtroIngrediente(ingrediente)}
                options={ingredientesOpciones}
                value={field.value}
                placeholder="Seleccione los ingredientes por los que desea filtrar"
                classNamePrefix="react-select"
                isClearable={true}
              />
            )}
          />
        </div>
      </div>

      <div className="form__form-group">
        <div className="form__form-group-field">
          {/* Botón para descargar un reporte de precios */}
          <ExcelExport data={aumentoPrecioReporte} fileName="Historial Aumento Precio Ingrediente.xlsx" ref={reporteExcel}>
            <ExcelExportColumn
              field="nombreIngrediente"
              title="Nombre Ingrediente"
              locked={true}
              width={250}
            />
            <ExcelExportColumn
              field="fechaAumento"
              title="Fecha Aumento"
              width={200}
            />
            <ExcelExportColumn
              field="montoActual"
              title="Precio Actual"
              width={200}
            />
          </ExcelExport>
          <button title="Reporte Aumento Precio" className="btn btn-success btn-small" onClick={reporteAumentoPrecio}
            disabled={!aumentoPrecioReporte.length}>
            Reporte Aumento Precio
          </button>
        </div>
      </div>

      {/* Gráficos de línea del tiempo por ingrediente */}
      {aumentoPrecio.map((ingrediente, index) => (
        <Fragment key={ingrediente.id}>
          {ingrediente.mostrar && (
            <Fragment key={ingrediente.id}>
                <h5 className="text-uppercase mt-4 mb-4 font-weight-bold">Historial aumento precio - {ingrediente.Nombre}</h5>
                <ResponsiveContainer height={250} className="dashboard__active-users-chart">
                  <LineChart data={ingrediente.aumentos} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Fecha" tick={{ fill: 'black' }} dy={10} />
                    <YAxis tick={{ fill: 'black' }} />
                    <Tooltip />
                    <Line type="linear" dataKey="Precio" stroke="#238484" activeDot={{ r: 8 }}/>
                  </LineChart>
                </ResponsiveContainer>
              </Fragment>
            )
          }
        </Fragment>
      ))}

      {mensaje && (<p className="font-weight-bold">Seleccione un ingrediente para visualizar su gráfico.</p>)}
  
    </Panel>
  );
};

export default AumentoPrecioIngredientes;
