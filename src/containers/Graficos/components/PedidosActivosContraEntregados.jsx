import React, { useState } from "react";
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Panel from "../../../shared/components/Panel";

const style = (dir) => {
  return {
    left: 0,
    width: 150,
    lineHeight: "24px",
    position: "absolute",
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

const ProductosVendidosContraEntregados = ({ dir, pedidosActivosContraEntregados}) => {
  const [coordinates, setCoordinate] = useState({ x: 0, y: 0 });

  const onMouseMove = (e) => {
    if (e.tooltipPosition) {
      setCoordinate({
        x: dir === "ltr" ? e.tooltipPosition.x : e.tooltipPosition.x / 10,
        y: e.tooltipPosition.y,
      });
    }
  };

  const nombreMes = new Date().toLocaleString("es-MX", { month: "long" });

  return (
    <Panel lg={6} xl={6} md={6} xs={6} title={`Pedidos activos contra entregados - ${nombreMes}`} 
      subhead={`Únicamente se muestra la información correspondiente al mes actual`}>

      {/* Mostrar información del grafico */}
      {pedidosActivosContraEntregados.length > 0 
        ? (<ResponsiveContainer className="dashboard__chart-pie dashboard__chart-pie--commerce" height={360}>
            <PieChart className="dashboard__chart-pie-container">
              <Tooltip position={coordinates} />
              <Pie
                data={pedidosActivosContraEntregados}
                dataKey="value"
                cy={180}
                innerRadius={110}
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
        ) : <p className="text-center font-weight-bold">No se han realizado pedidos.</p> }
  
    </Panel>
  );
};

export default ProductosVendidosContraEntregados;
