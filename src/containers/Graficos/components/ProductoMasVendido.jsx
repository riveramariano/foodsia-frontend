import React, { Fragment } from "react";
import Panel from "../../../shared/components/Panel";

const ProductoMasVendido = ({ productoMasVendido }) => {
  const current = new Date();
  current.setMonth(current.getMonth() - 1);
  const previousMonth = current.toLocaleString("es-MX", { month: "long" });

  return (
    <Panel md={4} lg={4} xl={4} title={productoMasVendido.length > 0 ?`Producto más vendido - ${previousMonth}` : `No hay Datos`}
      subhead={`Cantidad de unidades del producto más vendido del mes anterior`}>
      <div className="dashboard__stat dashboard__stat--budget">
        <div className="dashboard__stat-main">
          {productoMasVendido.length > 0 
            ? <Fragment>
                <h4 className="dashboard__stat-main-title text-mt">{productoMasVendido.length && (productoMasVendido[0].nombreProducto)}</h4>
                <p className="dashboard__stat-main-number">{productoMasVendido.length && (productoMasVendido[0].cantidad)} unidades</p>
              </Fragment> 
            : <h4 className="dashboard__stat-main-title text-mt">No hay información de productos disponible.</h4>}
        </div>
      </div>
    </Panel>
  );
};

export default ProductoMasVendido;
