import React, { useState, useEffect } from "react";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import Panel from "../../../shared/components/Panel";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import moment from "moment";

const VentasMensuales = ({ ventasAgrupadas, ventasNoAgrupadas }) => {

  const [agrupadas] = useState([]);
  const [noAgrupadas] = useState([]);
  const [filtrado, setFiltrado] = useState(false);
  const [titulo, setTitulo] = useState("Año Completo");

  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [meses] = useState([
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ]);

  const { control } = useForm();
  const annioActual = new Date().getFullYear();
  moment.locale("mx");

  // Convierte el arreglo de ingrdientes en un arreglo entendible para la librería recharts
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

  // Función que filtra pedidos por mes
  const filtroMes = (mes) => {
    setFiltrado(false);
    setVentasMensuales([]);
    setTitulo("Año Completo");
    if (!mes) { return; }
    setTitulo(mes.label);
    setFiltrado(true);
    setVentasMensuales(
      noAgrupadas.filter((v) => moment(v.Fecha).format("MMMM").toUpperCase() === mes.label.toUpperCase())
    );
  };

  return (
    <Panel xl={12} lg={12} md={12} title={`Ventas Mensuales - ${titulo} ${annioActual}`} subhead={`Ganancias mostradas no cuentan con impuestos aplicados`}>

      {/* Filtro por mes */}
      <div className="form__form-group">
        <div className="form__form-group-field">
          <Controller
            control={control}
            name="mes"
            render={({ field }) => (
              <Select
                className="react-select"
                onChange={(mes) => filtroMes(mes)}
                options={meses}
                value={field.value}
                placeholder="Seleccione el mes que desea filtrar"
                classNamePrefix="react-select"
                isClearable={true}
              />
            )}
          />
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
      
      {filtrado && ventasMensuales.length
        ? (<ResponsiveContainer height={260}>
            <BarChart data={ventasMensuales} margin={{ top: 20, left: -15 }}>
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

        {filtrado && !ventasMensuales.length
          ? <p className="font-weight-bold mt-5">No hay información de ventas disponible.</p>
          : null}
        
        {!agrupadas.length
          ? <p className="font-weight-bold mt-5">No hay información de ventas disponible.</p>
          : null}

    </Panel>
  );
};

export default VentasMensuales;
