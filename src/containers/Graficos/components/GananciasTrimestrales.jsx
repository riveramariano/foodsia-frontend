import React, { Fragment } from "react";
import Panel from "../../../shared/components/Panel";

const GananciasTrimestrales = ({ data }) => {
  const { ganancias, trimeste } = data;

  return (
    <Panel md={4} lg={4} xl={4} title={ganancias > 0 ?`Ganancias totales - ${trimeste}` : `No hay Datos`} subhead={`Ganancias mostradas cuentan con impuestos aplicados`}>
      <div className="dashboard__stat dashboard__stat--budget text-mt">
        <div className="dashboard__stat-main">
          {ganancias > 0
            ? <Fragment>
                <h4 className="dashboard__stat-main-title text-mt">Fondos Recaudados</h4>
                <p className="dashboard__stat-main-number">₡{ganancias}</p>
              </Fragment>
            : <h4 className="dashboard__stat-main-title text-mt">No hay información de ventas disponible.</h4>}
        </div>
      </div>
    </Panel>
  );
};

export default GananciasTrimestrales;
