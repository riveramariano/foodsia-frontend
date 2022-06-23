import React, { useState } from "react";
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Panel from "../../../shared/components/Panel";

const style = (dir) => {
  return {
    left: 0,
    width: 150,
    lineHeight: "15px",
    position: "absolute",
    fontSize: "12px"
  };
};

const renderLegend = ({ payload }) => (
  <ul className="dashboard__chart-legend">
    {payload.map((entry, index) => (
      <li key={index}>
        <span style={{ backgroundColor: entry.color }} />
        {entry.value}
      </li>
    ))}
  </ul>
);

const ProductosMasVendidos = ({ topCincoProductosVendidos }) => {

  const [dir] = useState("ltr");
  const [coordinates, setCoordinate] = useState({ x: 0, y: 0 });
  
  // Obtiene las coordenadas del mouse y muestra la información del grafico
  const onMouseMove = (e) => {
    if (e.tooltipPosition) {
      setCoordinate({
        x: dir === "ltr" ? e.tooltipPosition.x : e.tooltipPosition.x / 10,
        y: e.tooltipPosition.y,
      });
    }
  };

  // Obtiene el mes anterior del mes actual
  const nombreMes = new Date( new Date().getFullYear(), new Date().getMonth() - 1, 1 ).toLocaleString('es-ES', { month: 'long' });

  return (
    <Panel lg={6} xl={6} md={6} xs={6} title={`Top 5 productos más vendidos - ${nombreMes}`} subhead={`Ganancias mostradas no cuentan con impuestos aplicados`}>

      {/* Mosrar información del grafico */}
      {topCincoProductosVendidos.length > 0 
        ? (<ResponsiveContainer className="dashboard__chart-pie dashboard__chart-pie--commerce" height={450}>
            <PieChart className="dashboard__chart-pie-container">
              <Tooltip position={coordinates} />
              <Pie
                data={topCincoProductosVendidos}
                dataKey="value"
                cy={180}
                innerRadius={105}
                outerRadius={140}
                label
                onMouseMove={onMouseMove}
              />
              <Legend
                layout="vertical"
                verticalAlign="bottom"
                wrapperStyle={style(dir)}
                content={renderLegend}
              />
            </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center font-weight-bold">No hay información de ventas disponible.</p> }

    </Panel>
  );
};

export default ProductosMasVendidos;
