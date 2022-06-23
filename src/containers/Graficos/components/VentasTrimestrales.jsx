import React, { useState, useEffect, Fragment } from "react";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import Panel from "../../../shared/components/Panel";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import moment from "moment";
import { groupBy } from 'lodash';
import { ExcelExport, ExcelExportColumn } from "@progress/kendo-react-excel-export";

const VentasTrimestrales = ({ ventasAgrupadas, ventasNoAgrupadas }) => {
  const [agrupadas] = useState([]);
  const [noAgrupadas] = useState([]);
  const [filtrado, setFiltrado] = useState(false);
  const [titulo, setTitulo] = useState("Año Completo");

  const [ventasTrimestrales, setVentasTrimestrales] = useState([]);
  const [trimestres] = useState([
    { value: 1, label: "Primer Trimestre" },
    { value: 2, label: "Segundo Trimestre" },
    { value: 3, label: "Tercer Trimestre" },
    { value: 4, label: "Cuarto Trimestre" }
  ]);

  const { control } = useForm();
  const annioActual = new Date().getFullYear();
  moment.locale("mx");

  // Convierte el arreglo de ingredientes en un arreglo entendible para la librería recharts
  useEffect(() => {
    const realizarPeticiones1 = () => {
      if (!agrupadas.length) {
        for (const agrupada of ventasAgrupadas) {
          agrupadas.push({
            Fecha: agrupada.fechaPedido,
            Nombre: agrupada.nombreProducto,
            Unidades: agrupada.cantidad,
            Ganancias: agrupada.monto,
          });
        }
      }
    };
    const realizarPeticiones2 = () => {
      for (const agrupada of ventasNoAgrupadas) {
        noAgrupadas.push({
          Fecha: agrupada.fechaPedido,
          Nombre: agrupada.nombreProducto,
          Unidades: agrupada.cantidad,
          Ganancias: agrupada.monto,
        });
      }
    };
    realizarPeticiones1();
    realizarPeticiones2();
  }, [agrupadas, noAgrupadas, ventasAgrupadas, ventasNoAgrupadas]);

  // Agrupar los productos y sumar sus unidades y ganancias
  const agruparPorTrimestre = (ventasTrimestrales) => {
    const porProducto = groupBy(ventasTrimestrales, (v) => v.Nombre);
    let productos = [];
    for (const prop in porProducto) {
      let Fecha = "";
      let Nombre = "";
      let Ganancias = 0;
      let Unidades = 0;
      for (const venta of porProducto[prop]) {
        Fecha = venta.Fecha;
        Nombre = venta.Nombre;
        Ganancias = Ganancias + venta.Ganancias;
        Unidades = Unidades + venta.Unidades;
      }
      productos.push({
        Fecha: Fecha,
        Nombre: Nombre,
        Ganancias: Ganancias,
        Unidades: Unidades,
      });
    }
    setVentasTrimestrales(productos);
  };

  // Función que filtra pedidos por mes
  const filtroMes = (trimestre) => {
    setFiltrado(false);
    setVentasTrimestrales([]);
    setTitulo("Año Completo");
    if (!trimestre) { return; }
    setTitulo(trimestre.label);
    setFiltrado(true);

    // Filtro por trimestre
    if (trimestre.label === "Primer Trimestre") {
      agruparPorTrimestre(
        noAgrupadas.filter((v) => ["ENERO", "FEBRERO", "MARZO"].includes(moment(v.Fecha).format("MMMM").toUpperCase()))
      );
    }
    if (trimestre.label === "Segundo Trimestre") {
      agruparPorTrimestre(
        noAgrupadas.filter((v) => ["ABRIL", "MAYO", "JUNIO"].includes(moment(v.Fecha).format("MMMM").toUpperCase()))
      );
    }
    if (trimestre.label === "Tercer Trimestre") {
      agruparPorTrimestre(
        noAgrupadas.filter((v) => ["JULIO", "AGOSTO", "SEPTIEMBRE"].includes(moment(v.Fecha).format("MMMM").toUpperCase()))
      );
    }
    if (trimestre.label === "Cuarto Trimestre") {
      agruparPorTrimestre(
        noAgrupadas.filter((v) => ["OCTUBRE", "NOVIEMBRE", "DICIEMBRE"].includes(moment(v.Fecha).format("MMMM").toUpperCase()))
      );
    }
  };

  // Exportar reporte en formato excel
  const reporteExcel = React.useRef(null);
  const reporteVentasTrimestrales = () => {
    if (reporteExcel.current !== null) {
      reporteExcel.current.save();
    }
  };

  return (
    <Panel xl={12} lg={12} md={12} title={`Ventas Trimestrales - ${titulo} ${annioActual}`} subhead={`Ganancias mostradas no cuentan con impuestos aplicados`}>

      {/* Filtro por mes */}
      <div className="form__form-group">
        <div className="form__form-group-field">
          <Controller
            control={control}
            name="mes"
            render={({ field }) => (
              <Select
                className="react-select"
                onChange={(trimestre) => filtroMes(trimestre)}
                options={trimestres}
                value={field.value}
                placeholder="Seleccione el trimestre que desea filtrar"
                classNamePrefix="react-select"
                isClearable={true}
              />
            )}
          />
        </div>
      </div>

      <div className="form__form-group">
        <div className="form__form-group-field">
          {/* Reporte ventas trimestrales */}
          {!filtrado ? (
            <Fragment>
              <ExcelExport data={ventasAgrupadas} fileName={`Ventas Trimestrales - ${annioActual}.xlsx`} ref={reporteExcel}>
                <ExcelExportColumn
                  field="nombreProducto"
                  title="Nombre Producto"
                  locked={true}
                  width={200}
                />
                <ExcelExportColumn
                  field="cantidad"
                  title="Unidades Vendidas"
                  width={200}
                />
                <ExcelExportColumn
                  field="monto"
                  title="Ganancias Generadas (₡)"
                  width={200}
                />
              </ExcelExport>
              <button title="Reporte Ventas Trimestrales" className="btn btn-success btn-small float-right mt-1"
                onClick={reporteVentasTrimestrales} disabled={!ventasAgrupadas.length}>
                Reporte Ventas Trimestrales
              </button>
            </Fragment>
          ) : (
            <Fragment>
              <ExcelExport data={ventasTrimestrales} fileName={`Ventas Trimestrales - ${titulo}.xlsx`} ref={reporteExcel}>
                <ExcelExportColumn
                  field="Nombre"
                  title="Nombre Producto"
                  locked={true}
                  width={200}
                />
                <ExcelExportColumn
                  field="Unidades"
                  title="Unidades Vendidas"
                  width={200}
                />
                <ExcelExportColumn
                  field="Ganancias"
                  title="Ganancias Generadas (₡)"
                  width={200}
                />
              </ExcelExport>
              <button title="Reporte Ventas Trimestrales" className="btn btn-success btn-small float-right mt-1"
                onClick={reporteVentasTrimestrales} disabled={!ventasTrimestrales.length}>
                Reporte Ventas Trimestrales
              </button>
            </Fragment>
          )}
        </div>
      </div>

      {/* Gráfico de barras */}
      {!filtrado && agrupadas.length
        ? (<ResponsiveContainer height={260}>
            <BarChart data={agrupadas} margin={{ top: 20, left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Nombre" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#238484" />
              <Tooltip />
              <Legend
                wrapperStyle={{ position: "relative", marginTop: "20px" }}
              />
              <Bar yAxisId="left" dataKey="Unidades" fill="#8884d8" barSize={20} />
              <Bar
                yAxisId="right"
                dataKey="Ganancias"
                fill="#238484"
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>)
        : null}
      
      {filtrado && ventasTrimestrales.length
        ? (<ResponsiveContainer height={260}>
            <BarChart data={ventasTrimestrales} margin={{ top: 20, left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Nombre" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#238484" />
              <Tooltip />
              <Legend
                wrapperStyle={{ position: "relative", marginTop: "20px" }}
              />
              <Bar yAxisId="left" dataKey="Unidades" fill="#8884d8" barSize={20} />
              <Bar
                yAxisId="right"
                dataKey="Ganancias"
                fill="#238484"
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>)
        : null}

        {filtrado && !ventasTrimestrales.length
          ? <p className="font-weight-bold mt-5">No hay información de ventas disponible.</p>
          : null}
        
        {!agrupadas.length
          ? <p className="font-weight-bold mt-5">No hay información de ventas disponible.</p>
          : null}

    </Panel>
  );
};

export default VentasTrimestrales;
